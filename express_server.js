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

//sets up bcrypt hashing
const bcrypt = require('bcrypt');

//imports helper.js
const helper = require("./helpers.js");

//users object, stores the user information
const users = {

}

//database to store urls
const newUrlDatabase = {

};

app.get("/", (req, res) => {
  //redirects to register page
  res.redirect('/register');
});

//main page that shows urls
app.get("/urls", (req, res) => {
  //if user does not have cookies, advise to register
  if (!(req.session.user_id)) {
    res.status(400).send("Please login or register first");
  } else {
    let templateVars = { urls: helper.urlsForUser(req.session.user_id, newUrlDatabase), username: req.session.user_id };
    res.render("urls_index", templateVars);
  };
});

//creates new url for user
app.get("/urls/new", (req, res) => {
  //if user does not have cookies, advise to register
  if (!(req.session.user_id)) {
    res.redirect("/login");
  } else {
    let templateVars = { urls: newUrlDatabase, username: req.session.user_id };
    res.render("urls_new", templateVars);
  }
});

//checks if user has access to specific id , if not will prompt them to register
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!(req.session.user_id)) {
    res.status(400).send("Please login or register first");
    return;
  }
  const record = newUrlDatabase[shortURL];
  //find the unique ID and if it is not in database, advise user
  if (!record) {
    res.status(400).send("Record not found.");
    return
  }

  //if current userID is not same as session cookie, advise user
  if (record.userID !== req.session.user_id) {
    res.status(404).send("You don't own this ID.");
    return;
  }
  // assign new ID to the actual URL in the database
  const longURL = newUrlDatabase[shortURL].longURL
  let templateVars = { shortURL: shortURL, longURL: longURL, username: req.session.user_id };
  res.render("urls_show", templateVars);

});

//checks if individual has access to urls page if they have cookies
app.post("/urls", (req, res) => {
  //if user does not have cookies, advise to register
  if (!(req.session.user_id)) {
    res.status(400).send("Please login or register to access page");
  } else {
    //generate a random string
    const shortURL = helper.generateRandomString();
    //create new object with unique ID in database with the below parameters
    newUrlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    }
    res.redirect(`/urls/${shortURL}`);
  }
});

//goes to dynamic id link and its url
app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  const record = newUrlDatabase[shortURL];
  //find the unique ID and if it is not in database, advise user
  if (!record) {
    res.status(400).send("Record not found.");
    return
  }
  // assign new ID to the actual URL in the database
  const longURL = newUrlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//deletes the dynamic id link from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const record = newUrlDatabase[shortURL];
  //find the unique ID and if it is not in database, advise user
  if (!record) {
    res.status(400).send("Record not found.");
    //if current userID is not same as session cookie, advise user
  } else if (record.userID !== req.session.user_id) {
    res.status(404).send("You don't own this ID.");
  } else {
    // delete the ID from database
    delete newUrlDatabase[shortURL];
    res.redirect("/urls");
  }
});

//sends to the dynamic id link and its url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; //
  const longURL = req.body.longURL;
  //if user does not have cookies, advise to login
  if (!(req.session.user_id)) {
    res.status(400).send("Not logged in");
    return;
  }
  const record = newUrlDatabase[shortURL];
  //find the unique ID and if it is not in database, advise user
  if (!record) {
    res.status(400).send("Record not found.");
    return
  }
  //if current userID is not same as session cookie, advise user
  if (record.userID !== req.session.user_id) {
    res.status(404).send("You don't own this ID.");
    return;
  }
  // assign new ID to the actual URL in the database
  newUrlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls`);
});

//when logged out, set session cookie to null and redirect to login screen
app.post("/logout", (req, res) => {
  req.session.user_id = null
  res.redirect("/login");
});

//checks the registration 
app.get("/register", (req, res) => {
  //if user does not have cookies, advise to register
  if (!(req.session.user_id)) {
    let templateVars = { urls: newUrlDatabase, username: req.session.user_id };
    res.render("urls_register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//checks if the passed in information exists already for registration purposes
app.post("/register", (req, res) => {
  //finds the email of user object
  const email = req.body.email;
  //finds the password of user object
  const password = req.body.password;
  //if either parameters are empty then cannot register
  if (password === '' || email === '') {
    res.status(400).send("Please enter your email/password fields.")
    return;
  }
  //if email is already in database then tell user
  if (helper.getUserByEmail(email, users)) {
    res.status(403).send("This email is already used.")
    return;
  }
  //generates an ID for new user and an encrypted password and store into users database then assign current cookie to this new ID
  const id = helper.generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id: id, email: email, password: hashedPassword };

  req.session.user_id = id;
  res.redirect(`/urls/`);

})

//checks the login data
app.get("/login", (req, res) => {
  //if user does not have cookies, redirect to login page
  if (!(req.session.user_id)) {
    let templateVars = { urls: newUrlDatabase, username: req.session.user_id };
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//checks the login data to confirm if it is valid
app.post("/login", (req, res) => {
  //finds the email of user object
  const email = req.body.username; 
  //finds the password of user object
  const password = req.body.password; 
  //checks getUserByEmail function to see if email that is passed matches an email in database
  const validUser = helper.getUserByEmail(email, users); 
  let checker = false;

  //if there is a match, then give checker a hashed password
  if (validUser) { 
    checker = bcrypt.compareSync(password, validUser.password);
  }
  //set cookie as existing ID from user's email and redirect
  if (checker) { 
    req.session.user_id = validUser.id
    res.redirect(`/urls/`);
  } else {
    res.status(403).send("Sorry! You can't see that.");
  }
});

app.listen(PORT, () => {
  // leaving to confirm that server is up
  console.log(`Example app listening on port ${PORT}!`); 
});