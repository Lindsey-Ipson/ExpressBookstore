const { Client } = require('pg');
const { DB_URI } = require('./config');

const client = new Client(DB_URI);

async function insertFakeData() {
  try {
    await client.connect();
    console.log('Connected to the database.');

    // Insert fake book data
    await client.query(
      'INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        '1111111111',
        'https://www.example.com/book/1',
        'Author One',
        'English',
        100,
        'Publisher One',
        'Book One',
        2001,
      ]
    );

    // Insert more fake book data
    await client.query(
      'INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        '2222222222',
        'https://www.example.com/book/2',
        'Author Two',
        'French',
        200,
        'Publisher Two',
        'Book Two',
        2002,
      ]
    );

    console.log('Fake data inserted successfully.');
  } catch (error) {
    console.error('Error inserting fake data:', error);
  } finally {
    await client.end(); // Close the database connection
  }
}

// Call the function to insert fake data
insertFakeData();

