const express = require("express"); //imports express module
const app = express();
const PORT = 8080; // default port 8080

//body parser for json
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//sets up ejs templates
app.set("view engine", "ejs");

//sets up encrpted cookie session
const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}))


const bcrypt = require('bcrypt'); //sets up bcrypt hashing

const helper = require("./helpers.js"); //imports helper.js

//users object, stores the user information
const users = {
  
}

//database to store urls
const newUrlDatabase = {
  
};

app.get("/", (req, res) => {
  res.redirect('/register');
});

//main page that shows urls
app.get("/urls", (req, res) => {
  let templateVars = { urls: helper.urlsForUser(req.session.user_id, newUrlDatabase), username: req.session.user_id };
  if (!(req.session.user_id)) {
    res.status(400).send("Please login or register first");
  } else {
    res.render("urls_index", templateVars);
  };
});

//creates new url for user
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: newUrlDatabase, username: req.session.user_id };
  if (!(req.session.user_id)) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//checks if user has access to specific id , if not will prompt them to register
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = newUrlDatabase[shortURL].longURL
  let templateVars = { shortURL: shortURL, longURL: longURL, username: req.session.user_id };
  if (!(req.session.user_id)) {
    res.status(400).send("Please login or register first");
  } 
  else if (longURL) {
    res.render("urls_show", templateVars);
  } else {
  res.render("urls_new", templateVars);
  }
});

//checks if individual has access to urls page if they have cookies
app.post("/urls", (req, res) => {
  const shortURL = helper.generateRandomString();
  newUrlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id }
  if (!(req.session.user_id)) {
    res.status(400).send("Please login or register to access page");
  } else {
    res.redirect('/urls');
  }
});

//goes to dynamic id link and its url
app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  
  const longURL = newUrlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//deletes the dynamic id link from database
app.post("/urls/:shortURL/delete", (req, res) => {
  shortURL = req.params.shortURL;
  if (req.session.user_id === newUrlDatabase[shortURL].userID) {
    delete newUrlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

//sends to the dynamic id link and its url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (!(req.session.user_id)) {
    res.status(400).send("Not logged in");
  } else {
    newUrlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls`);
  }
});

//logs out the user
app.post("/logout", (req, res) => {
  req.session.user_id = null
  res.redirect(`/login`);
});

//checks the registration 
app.get("/register", (req, res) => {
  let templateVars = { urls: newUrlDatabase, username: req.session.user_id };
  if (!(req.session.user_id)) {
    res.render("urls_register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//checks if the passed in information exists already for registration purposes
app.post("/register", (req, res) => {
  const id = helper.generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id: id, email: email, password: hashedPassword };
  if (!(helper.getUserByEmail(email, users))) {
    res.status(403).send("Sorry! You can't see that.")
    return;
  } else if (hashedPassword === '' || email === '') {
    res.status(400).send("Sorry! You can't see that.")
    return;
  } else {
    helper.checkEmail(id, email, hashedPassword,users);
    req.session.user_id = id;
    res.redirect(`/urls/`);
  }
})

//checks the login data
app.get("/login", (req, res) => {
  let templateVars = { urls: newUrlDatabase, username: req.session.user_id };
  if (!(req.session.user_id)) {
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/login");
  }
});

//checks the login data to confirm if it is valid
app.post("/login", (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const validUser = helper.getUserByEmail(email, users);
  let checker = false;
  if (validUser) {
    checker = bcrypt.compareSync(password, validUser.password);
  }
  if (checker) {
    req.session.user_id = validUser.id
    res.redirect(`/urls/`);
  } else {
    res.status(403).send("Sorry! You can't see that.");
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); // leaving to confirm that server is up
});