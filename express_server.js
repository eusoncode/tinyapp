// Set up basic web server using express
const express = require('express');
const app = express();
const PORT = 8080; // Define default port 8080
app.use(express.urlencoded({ extended: true })); // use middleware to convert data to human readable form

// Set up cookie-parser API
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// set view engine to EJS
app.set('view engine', 'ejs');

// Create a url database to store  and access short and long url for the app
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "gh456k",
  },
  l9sm5x: {
    longURL: "https://www.google.ca",
    userID: "fsd3f5",
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "z5gds7",
  },
};

// Create a user database
const users = {
  gh456k: {
    id: "gh456k",
    email: "pinchname@example.com",
    password: "purple-monkey-dinosaur",
  },
  fsd3f5: {
    id: "fsd3f5",
    email: "pimdoz@example.com",
    password: "dishwasher-funk",
  },
  z5gds7: {
    id: "z5gds7",
    email: "dinye@gmail.com",
    password: "ilovedaddy",
  }
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

// Get Routes // ------------------------------------------------------------------------ GET ROUTE

// Routes to the index template when /urls is called
app.get("/urls", (req, res) => {
  const idFromCookie = req.cookies.user_id;

  if (!idFromCookie) { // return a relevant error message if id does not exist
    return res.status(403).send("😒😒😒😒You are not Logged in!!! Log in to use the TinyApp....");
  }

  const urlsForUser = (idFromCookie) => { //Function for hecking if email and password already exists
    const userURLs = {};
    for (const key in urlDatabase) {
      if (urlDatabase[key].userID === idFromCookie) {
        userURLs[key] = urlDatabase[key];
      }
    }
    return userURLs;
  };

  const userURLPage = urlsForUser(idFromCookie);

  const templateVars = {
    urls: userURLPage,
    user: users[idFromCookie],
  };
  
  res.render("urls_index", templateVars);
});

// Route to the new url template
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  if (!req.cookies.user_id) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

// Route to new user registration
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  if (req.cookies.user_id) {
    res.redirect('/urls');
  }
  res.render("urls_registration", templateVars);
});

// Route to user login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  if (req.cookies.user_id) {
    res.redirect('/urls');
  }
  res.render("urls_login", templateVars);
});

// Route to the show template
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  if (!shortURL) { // return a relevant error message if id does not exist
    return res.status(403).send("😒😒😒😒You are not Logged in!!! Log in to use the TinyApp....");
  }
  if (urlDatabase[shortURL].userID !== req.cookies.user_id) {  // return a relevant error message if user does not own url
    return res.send("Oops!! 😒😒😒😒 Url does not exist in your account. Please login to your account!");
  }

  if (!urlDatabase[shortURL]) {  // return a relevant error message if user is not logged in
    return res.send("Oops!! 😒😒😒😒 The short Url does not exist in your account. Please login to your account!");
  }

  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

// Route to redirect the short URL to the long URL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;

  if (!shortURL) { // return a relevant error message if id does not exist
    return res.status(403).send("😒😒😒😒You are not Logged in!!! Log in to use the TinyApp....");
  }

  if (urlDatabase[shortURL].userID !== req.cookies.user_id) {  // return a relevant error message if user does not own url
    return res.send("Oops!! 😒😒😒😒 Url does not exist in your account. Please login to your account!");
  }

  if (!urlDatabase[shortURL]) { // return a relevant error message if user is not logged in
    return res.send("Oops!! 😒😒😒😒 The short Url does not exist in your account. Please login to your account!");
  }
  
  res.redirect(longURL);
});

// POST Routes  ------------------------------------------------------------------------------------ POST ROUTE

// Route for creating new url
app.post("/urls", (req, res) => {  // return a relevant error message if id does not exist
  if (!req.cookies.user_id) { // return a relevant error message if id does not exist
    return res.status(403).send("😒😒😒😒You are not Logged in!!! Log in to use the TinyApp....");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  // Adding a new property to the urlDatabase object
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.cookies.user_id
  };
  
  res.redirect(`/urls/${shortURL}`);
});

// Route for updating stored url
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.submit;
  
  if (!shortURL) {
    return res.status(403).send("😒😒😒😒You are not Logged in!!! Log in to use the TinyApp....");
  }

  if (urlDatabase[shortURL].userID !== req.cookies.user_id) {
    return res.send("Oops!! 😒😒😒😒 Url does not exist in your account. Please login to your account!");
  }

  if (!urlDatabase[shortURL]) {
    return res.send("Oops!! 😒😒😒😒 The short Url does not exist in your account. Please login to your account!");
  }

  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

// Route for delete a url
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;

  if (!shortURL) { // return a relevant error message if id does not exist
    return res.status(403).send("😒😒😒😒You are not Logged in!!! Log in to use the TinyApp....");
  }

  if (urlDatabase[shortURL].userID !== req.cookies.user_id) { // return a relevant error message if user does not own url
    return res.send("Oops!! 😒😒😒😒 Url does not exist in your account. Please login to your account!");
  }

  if (!urlDatabase[shortURL]) { // return a relevant error message if user is not logged in
    return res.send("Oops!! 😒😒😒😒 The short Url does not exist in your account. Please login to your account!");
  }
  
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Route for handling user login and redirecting to home /urls page
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const getUserByEmailAndPassword = (email, password) => { //Function for hecking if email and password already exists
    for (const key in users) {
      if (users[key].email === email && users[key].password === password) {
        return users[key];
      }
    }
    return null;
  };

  const userFound = getUserByEmailAndPassword(email, password); //Check if user email exists
  if (!userFound) {
    return res.status(403).send("😒😒😒😒Email or Password is not correct!.... Please enter a valid email and password");
  }

  res.cookie('user_id', userFound.id);
  res.redirect('/urls');
});

// Route for registering a user
app.post('/register', (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) { // if email or password is empty, request for them
    return res.status(400).send("Please enter an email and password");
  }

  const getUserByEmail = (email) => { //Function for hecking if email already exists
    for (const key in users) {
      if (users[key].email === email) {
        return users[key];
      }
    }
    return null;
  };


  const userFound = getUserByEmail(email); //Check if user email exists
  if (userFound) {
    return res.status(400).send("User already exists");
  }

  users[user_id] = { //Register the user to the database
    id: user_id,
    email: email,
    password: password
  };
    
  res.cookie('user_id', user_id);
  res.redirect('/urls');
});

// Route for handling user logout and clearing of cookies and redirecting to home /urls page
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// Listening on PORT 8080  -------------------------------------------------------------------------- LISTENING
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});