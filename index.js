const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const shortid = require('shortid');
const app = express();
const port = 3000;

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.run('CREATE TABLE IF NOT EXISTS urls (id TEXT PRIMARY KEY, original_url TEXT)', (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
  }
});

app.get('/create', (req, res) => {
  const originalUrl = req.query.url;

  if (!originalUrl) {
    return res.status(400).send('URL is required.');
  }

  const shortUrl = shortid.generate(); 

  db.run('INSERT INTO urls (id, original_url) VALUES (?, ?)', [shortUrl, originalUrl], (err) => {
    if (err) {
      return res.status(500).send('Error saving URL.');
    }
   
    res.send(`Shortened URL: http://localhost:${port}/${shortUrl}`);
  });
});

app.get('/:shortId', (req, res) => {
  const shortId = req.params.shortId;

  db.get('SELECT original_url FROM urls WHERE id = ?', [shortId], (err, row) => {
    if (err) {
      return res.status(500).send('Error retrieving URL.');
    }

    if (!row) {
      return res.status(404).send('Short URL not found.');
    }

    res.redirect(row.original_url);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});