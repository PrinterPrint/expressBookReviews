const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const axios = require('axios');

let users = [];



const registerUser = async (userData) => {
  try {
    const response = await axios.post('http://localhost:5000/customer/register', userData);
    return response.data;
  } catch (error) {
    throw new Error("Failed to register user");
  }
}


const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message:"Error logging in."})
  }

  // Check if the user is registered
  if (!isValid(username)) {
    return res.status(404).json({message: "User not registered."});
  }

  if (authenticatedUser(username, password)) {
    // The payload object contains a property called data,
    // which is set to the username. This means that the username will be included in the token as part of the payload.
    // The data property is just a convention; you could name it something else if you wanted.    //
    // So, in summary, this line of code generates a JWT token with the username included in the payload,
    // which can then be used for authentication or authorization purposes.
    let accessToken = jwt.sign({
      data: username
    }, 'access', {expiresIn: 60 * 60});
    // This represents the session object associated with the current request.
    // Sessions allow you to store user data across multiple requests,
    // typically using cookies or other mechanisms to maintain stateful information.
    // By setting req.session.authorization to this object,
    // you're effectively storing the access token and username in the session object.
    // This allows you to access this information later in the request handling pipeline,
    // typically to verify the user's identity or permissions
    req.session.authorization = {accessToken, username}
    return res.status(200).send("User:" + username + " successfully logged in")
  } else {
    return res.status(208).json({message: "Invalid login. Check username and password."});
  }
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const {username} = req.session.authorization;
  const review = req.body.review;

  // Check if the book exists
  if (!books[isbn].reviews) {
    return res.status(404).json({ message: "Book not found for ISBN: " + isbn });
  }

  // Initialize reviews array if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = [];
  }

  // Check if user already reviewed the book
  const existingReviewIndex = books[isbn].reviews.findIndex(r => r.username === username);
  if (existingReviewIndex !== -1) {
    // Update existing review only if the user is the author
    if (books[isbn].reviews[existingReviewIndex].username === username) {
      books[isbn].reviews[existingReviewIndex].review = review;
      return res.status(200).json({ message: "Review updated successfully.", book: books[isbn] });
    } else {
      return res.status(403).json({ message: "You are not authorized to modify this review." });
    }
  } else {
    // Add new review
    books[isbn].reviews.push({ username, review });
    return res.status(200).json({ message: "Review added successfully.", book: books[isbn] });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  //Check if the book exists
  if(!books[isbn]) {
    return res.status(404).json({message: "Book not found for ISBN: " + isbn});
  }
  //Check if the book has reviews
  if (!books[isbn].reviews || books[isbn].reviews.length === 0) {
    return res.status(404).json({message: "No reviews found for ISBN: " + isbn});
  }
  //Filter and delete the reviews for the session username
  books[isbn].reviews = books[isbn].reviews.filter(review => review.username !== username);

  //Return updated book object with reviews
  return res.status(200).json({message: "Reviews deleted successfully.", book: books[isbn]});

})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
