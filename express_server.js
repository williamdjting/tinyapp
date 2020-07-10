const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
//const cookieParser = require('cookie-parser');
//app.use(cookieParser())
const cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}))


const bcrypt = require('bcrypt');

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

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const newUrlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJa4l2" }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  //console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(newUrlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  //console.log(req.cookies);
  let templateVars = { urls: urlsForUser(req.session.user_id), username: req.session.user_id };
  console.log("templateVars", templateVars);
  if (!(req.session.user_id)) {
    res.status(400).send("Please login or register first");
    res.render("urls_index", templateVars)
    
  } else {
    res.render("urls_index", templateVars);
  };
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: newUrlDatabase, username: req.session.user_id };
  if (!(req.session.user_id)) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);

  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = newUrlDatabase[shortURL].longURL
  let templateVars = { shortURL: shortURL, longURL: longURL, username: req.session.user_id };

  console.log("shortURL", shortURL)
  // const longURL = newUrlDatabase.shortURL.longURL;
  console.log("longURL", longURL);
  //console.log(templateVars)
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  newUrlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id }
  console.log("newUrlDatabase", newUrlDatabase);
  res.redirect(`/u/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  const longURL = newUrlDatabase[shortURL].longURL;
  console.log("longURL", longURL)
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
  //console.log(req.body)
  const longURL = req.body.longURL;
  if (!(req.session.user_id)) {
    res.status(400).send("Not logged in");
  }
  newUrlDatabase[shortURL] = longURL;
  res.redirect(`/urls/`);
});

app.post("/logout", (req, res) => {
  //res.clearCookie("user_id");
  req.session.user_id = null
  res.redirect(`/urls/`);
});

app.get("/register", (req, res) => {
  let templateVars = { urls: newUrlDatabase, username: req.session.user_id };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  //console.log(req.body)
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id: id, email: email, password: hashedPassword };
  if (!(checkUser(email))) {
    res.status(403).send("Sorry! You can't see that.")
    //console.log(users);
    return;
  }
  if (hashedPassword === '' || email === '') {
    res.status(400).send("Sorry! You can't see that.")
    //console.log(users);
    return;
  }
  checkEmail(id, email, hashedPassword);
  //console.log(users);
  
  req.session.user_id = id;
  res.redirect(`/urls/`);
})

app.get("/login", (req, res) => {
  let templateVars = { urls: newUrlDatabase, username: req.session.user_id };
  res.render("urls_login", templateVars);
});


app.post("/login", (req, res) => {
  //console.log(req.body)
  const email = req.body.username;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log("email", email);
  console.log("password", password);
  const validUser = checkUser(email)
  const checker = bcrypt.compareSync(validUser.password, hashedPassword)
  if (checker) {
    req.session.user_id = validUser.id
    res.redirect(`/urls/`);
  } else {
    res.status(403).send("Sorry! You can't see that.");
  }
});

function checkEmail(id, email, password) {
  const actualUser = checkUser(email);

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

function urlsForUser(id) { //req.cookies["user_id"]
  let newObj = {};
  for (let shortURL in newUrlDatabase) {
    if (id === newUrlDatabase[shortURL].userID) {
      newObj[shortURL] = newUrlDatabase[shortURL];
    }
  }
  console.log("newObj", newObj);
  return newObj;
}

function checkUser(email) {
  for (let user in users) {
    console.log("checkUser", users[user]);
    if (users[user].email === email) {
      return users[user];
    }
  }
}



function generateRandomString() {
  shortURL = (Math.random().toString(36).substring(7));
  //console.log(shortURL);
  return shortURL;
}


// console.log("the updated users object", users);
// console.log("newUrlDatabase", newUrlDatabase);

