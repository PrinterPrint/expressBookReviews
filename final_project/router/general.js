const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // Import Axios for HTTP requests

//Added to git repository


const getBookList = async () => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch book list");
  }
}

public_users.get('/isbn/:isbn', async (req, res) => { // Mark the function as async
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`); // Replace with your API endpoint
    const book = response.data;
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});



public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "user successfully registered. Now you can login"})
    } else {
      return res.status(404).json({message: "User already exists."});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books, null, 4));
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here


  const isbn = req.params.isbn;
  const bookID = parseInt(isbn);

  if (!books[bookID]) {
    return res.status(404).json({message: "Book not found four ISBN: " + isbn});
  }

  res.send(books[isbn]);

  //return res.status(300).json({message: "Yet to be implemented"});
 });




// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author.toLowerCase();
  const matchingBooks = [];
  for (const bookId in books) {
    const book = books[bookId];
    const bookAuthor = book.author.toLowerCase();

    if (bookAuthor.includes(author)) {
      matchingBooks.push(book);
    }
  }
  if (matchingBooks.length === 0) {
    return res.status(404).json({ message: "No books found for author: " + req.params.author });
  }
  res.json(matchingBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here

  const title = req.params.title.toLowerCase();
  const matchingBooks = [];
  for (const bookId in books) {
    const book = books[bookId];
    const bookTitle = book.title.toLowerCase();

    if (bookTitle.includes(title)) {
      matchingBooks.push(book);
    }
  }
  if (matchingBooks.length === 0) {
    return res.status(404).json({ message: "No books found for title: " + req.params.title });
  }
  res.json(matchingBooks);
  //return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here

  const isbn = req.params.isbn;
  //const bookID = parseInt(isbn);

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found for ISBN: " + isbn});
  }
  const reviews = books[isbn].reviews || [];
  //return res.json({reviews: reviews});
  return  res.status(200).json({reviews});
  //return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
module.exports.getBookList = getBookList;
