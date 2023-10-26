const express = require("express");
const ExpressError = require("../expressError")
const Book = require("../models/book");
const jsonschema = require("jsonschema");
const bookCreateSchema = require("../schemas/bookCreateSchema")
const bookUpdateSchema = require("../schemas/bookUpdateSchema.json")

const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookCreateSchema);
    if (!result.valid) {
      const listOfErrors = result.errors.map(error => error.stack);
      return next({
                status: 400,
                error: listOfErrors
              });
    }
    const data = req.body;
    const book = await Book.create(data);
    return res.status(201).json(book);
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookUpdateSchema);
    if (!result.valid) {
      const listOfErrors = result.errors.map(error => error.stack);
      return next({
                status: 400,
                error: listOfErrors
              });
    }
    const data = req.body;
    const book = await Book.update(req.params.isbn, data);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
