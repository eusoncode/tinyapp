// Set up basic web server using express
const express = require('express');
const app = express();
const PORT = 8080; // Define default port 8080
app.use(express.urlencoded({ extended: true })); // use middleware to convert data to human readable form

// Set up cookie-parser API
const cookieParser = require('cookie-parser')
app.use(cookieParser())

// set view engine to EJS
app.set('view engine', 'ejs');

// Create a url database to store  and access short and long url for the app
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Create a string of 6 random alphanumeric characters that will be used as short URL
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

// Get Routes

// Routes to the index template when /urls is called
app.get("/urls", (req, res) => {
  console.log(req.cookies);
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['name']
  };
  res.render("urls_index", templateVars);
});

// Route to the new url template
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Route to the show template
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

// Route to redirect the short URL to the long URL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (!shortURL) { //If use inputs short URL shorter than 6 characters
    res.send(`Oops! The ${shortURL} id you requested does not exist`);
  }
  res.redirect(longURL);
});

// POST Routes

// Route for creating new url
app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  console.log(urlDatabase);
});

// Route for updating stored url
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.submit;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

// Route for delete a url
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Route for handling user login and registering in cookies and redirecting to home /urls page
app.post('/login', (req, res) => {
  const loginName = req.body.username;
  res.cookie('name', loginName);
  res.redirect('/urls')
});

// Listening on PORT 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});