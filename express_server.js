const express = require("express");
const app = express();
const PORT = 8081; // default port 8080

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
  "aJ48lW": {
    id: "aJ48lW",
    email: "william@gmail.com",
    password: "menintrees"
  },
  "aJa4l2": {
    id: "aJa4l2",
    email: "tommy@gmail.com",
    password: "eatdinner"
  }
}

const newUrlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJa4l2" }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(newUrlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

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
  // else if (shortURL !== longURL) {
  //   res.status(400).send("You don't own that URL");} 
  else {
    res.render("urls_new", templateVars);
  }
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  newUrlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id }
  console.log("newUrlDatabase", newUrlDatabase);
  if (!(req.session.user_id)) {
    res.status(400).send("Please login or register to access page");
  } else {
    res.redirect(`/u/${shortURL}`)
  }
});

app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  const longURL = newUrlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  shortURL = req.params.shortURL;
  console.log("shortURL - in /urls/:shortURL/delete", shortURL);
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
    newUrlDatabase[shortURL] = longURL;
    res.redirect(`/urls`);
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null
  res.redirect(`/urls/`);
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
  console.log("email", email);
  console.log("password", password);
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
  console.log("actualUser", actualUser)
  const existingEmail = actualUser["email"];
  console.log(existingEmail)
  const existingPassword = actualUser["password"];
  console.log(existingPassword)
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
  console.log("newObj", newObj);
  return newObj;
}

function generateRandomString() {
  shortURL = (Math.random().toString(36).substring(7));
  return shortURL;
}
