const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
const cookieSession = require('cookie-session')


app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}))


const bcrypt = require('bcrypt');

const helper = require("./helpers.js");

const users = {
  
}

const newUrlDatabase = {
  
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.user_id), username: req.session.user_id };
  if (!(req.session.user_id)) {
    res.status(400).send("Please login or register first");
  } else {
    res.render("urls_index", templateVars);
  };
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: newUrlDatabase, username: req.session.user_id };
  if (!(req.session.user_id)) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

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

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  newUrlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id }
  if (!(req.session.user_id)) {
    res.status(400).send("Please login or register to access page");
  } else {
    res.redirect(`/u/${shortURL}`)
  }
});

app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  
  const longURL = newUrlDatabase[shortURL].longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  shortURL = req.params.shortURL;
  if (req.session.user_id === newUrlDatabase[shortURL].userID) {
    delete newUrlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

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

app.post("/logout", (req, res) => {
  req.session.user_id = null
  res.redirect(`/login`);
});

app.get("/register", (req, res) => {
  let templateVars = { urls: newUrlDatabase, username: req.session.user_id };
  if (!(req.session.user_id)) {
    res.render("urls_register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
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
    checkEmail(id, email, hashedPassword);
    req.session.user_id = id;
    res.redirect(`/urls/`);
  }
})

app.get("/login", (req, res) => {
  let templateVars = { urls: newUrlDatabase, username: req.session.user_id };
  if (!(req.session.user_id)) {
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/login");
  }
});


app.post("/login", (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const validUser = helper.getUserByEmail(email, users)
  const checker = bcrypt.compareSync(validUser.password, hashedPassword)
  if (checker) {
    req.session.user_id = validUser.id
    res.redirect(`/urls/`);
  } else {
    res.status(403).send("Sorry! You can't see that.");
  }
});

function checkEmail(id, email, password) {
  const actualUser = helper.getUserByEmail(email, users);
  const existingEmail = actualUser["email"];
  const existingPassword = actualUser["password"];
  if (!(email)) {
    return "failure";
  }
  else if (email === existingEmail) {
    if (password !== existingPassword) {
      return "failure";
    } else if (password === existingPassword) {
      return "success";
    }
  }
}

function urlsForUser(id) {
  let newObj = {};
  for (let shortURL in newUrlDatabase) {
    if (id === newUrlDatabase[shortURL].userID) {
      newObj[shortURL] = newUrlDatabase[shortURL];
    }
  }
  return newObj;
}

function generateRandomString() {
  shortURL = (Math.random().toString(36).substring(7));
  return shortURL;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); // leaving to confirm that server is up
});