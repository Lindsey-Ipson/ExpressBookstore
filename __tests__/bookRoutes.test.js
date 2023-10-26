/** Integration tests for books route */

process.env.NODE_ENV === "test"

const app = require("../app");
const request = require("supertest");
const db = require("../db");

let testBookIsbn;

beforeEach(async function () {
  const result = await db.query(`
    INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES (
        '1111',
        'https://www.example.com/book1',
        'Author One',
        'English',
        100,
        'Publisher One',
        'Book One',
        2010
    )
    RETURNING isbn`);
  testBookIsbn = result.rows[0].isbn;
});

afterEach(async function () {
  await db.query("DELETE FROM BOOKS");
});


afterAll(async function () {
  await db.end()
});

describe("GET /books", function () {
  test("Gets a list of books", async function () {
    const resp = await request(app).get(`/books`);
    const books = resp.body.books;
    expect(resp.statusCode).toEqual(200);
    expect(books).toHaveLength(1);
    expect(resp.body.books[0]).toEqual(
      {
        isbn: '1111',
        amazon_url: 'https://www.example.com/book1',
        author: 'Author One',
        language: 'English',
        pages: 100,
        publisher: 'Publisher One',
        title: 'Book One',
        year: 2010
      }
    );
  })
});

describe("GET /books/:isbn", function () {
  test("Gets a single book", async function () {
    const resp = await request(app).get(`/books/${testBookIsbn}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.book).toEqual(
      {
        isbn: '1111',
        amazon_url: 'https://www.example.com/book1',
        author: 'Author One',
        language: 'English',
        pages: 100,
        publisher: 'Publisher One',
        title: 'Book One',
        year: 2010
      }
    );
  });
  test("Responds with 404 if can't find book", async function () {
    const resp = await request(app).get(`/books/9999`);
    expect(resp.statusCode).toEqual(404);
  });
});

describe("POST /books", function () {
  test("Creates a new book", async function () {
    const data = {
      isbn: '2222',
      amazon_url: 'https://www.example.com/book2',
      author: 'Author Two',
      language: 'English',
      pages: 200,
      publisher: 'Publisher Two',
      title: 'Book Two',
      year: 2020
    };
    const resp = await request(app).post(`/books`).send(data);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual(data);
  }
  );
  test("Responds with 400 if required data is missing", async function () {   
    const data = {
      amazon_url: 'https://www.example.com/book2',
      language: 'English',
      pages: 200,
      publisher: 'Publisher Two',
      year: 2020
  }
  const resp = await request(app).post(`/books`).send(data);
  expect(resp.statusCode).toEqual(400);
  expect(resp.body.error.error).toContain('instance requires property "isbn"');
  expect(resp.body.error.error).toContain('instance requires property "author"');
  expect(resp.body.error.error).toContain('instance requires property "title"');
  });
  test("Responds with 400 if invalid data is sent", async function () {
    const data = {
      isbn: '2222',
      amazon_url: 'https://www.example.com/book2',
      author: 2222,
      language: 'English',
      pages: '200',
      publisher: 'Publisher Two',
      title: 'Book Two',
      year: 2010
    };
    const resp = await request(app).post(`/books`).send(data);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.error).toContain('instance.author is not of a type(s) string');
    expect(resp.body.error.error).toContain('instance.pages is not of a type(s) integer');
  });
});

describe("PUT /books/:id", function () {
  test("Updates a single book", async function () {
    const data = {
      amazon_url: 'https://www.example.com/book1',
      author: 'Author One Edited',
      language: 'English',
      pages: 300,
      publisher: 'Publisher One Edited',
      title: 'Book One Edited',
      year: 2011
    }
    const resp = await request(app).put(`/books/${testBookIsbn}`).send(data);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.book).toEqual({
      isbn: '1111',
      ...data
    });
  });
  test("Responds with 404 if can't find book", async function () {
    const data = {
      amazon_url: 'https://www.example.com/book1',
      author: 'Author One Edited',
      language: 'English',
      pages: 300,
      publisher: 'Publisher One Edited',
      title: 'Book One Edited',
      year: 2011
    }
    const resp = await request(app).put(`/books/9999`).send(data);
    expect(resp.statusCode).toEqual(404);
  });
  test("Responds with 400 if invalid data is sent", async function () {
    const data = {
      amazon_url: 'https://www.example.com/book1',
      author: 1111,
      language: 'English',
      pages: '100',
      publisher: 'Publisher Two Edited',
      title: 'Book Two Edited',
      year: 2011
    }
    const resp = await request(app).put(`/books/${testBookIsbn}`).send(data);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.error).toContain('instance.author is not of a type(s) string');
    expect(resp.body.error.error).toContain('instance.pages is not of a type(s) integer');
  });
});

describe("DELETE /books/:id", function () {
  test("Deletes a single book", async function () {
    const resp = await request(app).delete(`/books/${testBookIsbn}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ message: "Book deleted" });
  });
  test("Responds with 404 if can't find book", async function () {
    const resp = await request(app).delete(`/books/9999`);
    expect(resp.statusCode).toEqual(404);
  });
});
