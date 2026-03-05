const express = require("express");
const fs = require("fs");

const app = express();

const port = 3000;

app.use(express.json()); //?

app.use(express.static("public")); //?

const data_file = "books.json";

const readBooks = () =>{
    const data = fs.readFileSync(data_file);
    return JSON.parse(data); //converting json string to java object
};

const writeBooks = (books) =>{ //???
    fs.writeFileSync(data_file, JSON.stringify(books,null,2)); 
    //data_file is the location where the data will be WRITTEN.
    //'books' is the content that has to be written. //2 is for formatting.
};

// ADD A BOOK

app.post("/books", (req, res) => {
  const { title, author, status, description } = req.body;

  const validateBook = ({ title, author }) => {
    if (!title || !author) return "Title and Author are required";
    if (title.trim().length < 2) return "Title too short";
    return null;
  };

  const error = validateBook(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const books = readBooks();

  const duplicate = books.find(
    b =>
      b.title.trim().toLowerCase() === title.toLowerCase() &&
      b.author.trim().toLowerCase() === author.toLowerCase()
  );

  if (duplicate) {
    return res.status(400).json({
      error: "This book already exists"
    });
  }

  const newBook = {
    id: Date.now().toString(),
    title: title.trim(),
    author: author.trim(),
    status: status || "Unread",
    description: description || "",
    date: new Date().toLocaleString()
  };

  books.push(newBook);
  writeBooks(books);

  res.status(201).json(newBook);
});

//GET ALL BOOKS

app.get("/books", (req, res) => {
  let books = readBooks();

  const { status, search } = req.query;

  if (status) {
    books = books.filter(b => b.status === status);
  }

  if (search) {
    const s = search.toLowerCase();
    books = books.filter(
      b =>
        b.title.toLowerCase().includes(s) ||
        b.author.toLowerCase().includes(s)
    );
  }

  res.json(books);
});

//GET SPECIFIC BOOK BY ID

app.get("/books/:id", (req, res) => {
  const books = readBooks();
  const book = books.find(b => b.id === req.params.id);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  res.json(book);
});


//UPDATE BOOK STATUS

app.put("/books/:id/status", (req, res) => {
  const books = readBooks();
  const book = books.find(b => b.id === req.params.id);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  book.status = book.status === "Read" ? "Unread" : "Read";

  writeBooks(books);
  res.json(book);
});


//DELETE BOOK BY ID
app.delete("/books/:id", (req, res) => {
  let books = readBooks();
  const filtered = books.filter(b => b.id !== req.params.id);

  if (books.length === filtered.length) {
    return res.status(404).json({ error: "Book not found" });
  }

  writeBooks(filtered);
  res.json({ message: "Book deleted" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});



