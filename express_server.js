const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser())

const users = {
  "123456": {
    id: "123456",
    email: "william@gmail.com",
    password: "menintrees"
  },
  "123965": {
    id: "123965",
    email: "tommy@gmail.com",
    password: "eatdinner"
  }
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  console.log(req.cookies);
  let templateVars = { urls: urlDatabase, username: req.cookies["user_id"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL, username: req.cookies["user_id"] };
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  console.log(templateVars)
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  console.log(urlDatabase);
  res.redirect(`/u/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(req.body)
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/`);
});



app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls/`);
});

app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["user_id"] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  console.log(req.body)
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[id] = { id, email, password };
  if (checkUser(email)) {
    res.status(400).send("Sorry! You can't see that.")
    console.log(users);
    return;
  }
  if (password === '' || email === '') {
    res.status(400).send("Sorry! You can't see that.")
    console.log(users);
    return;
  }
  checkEmail(id, email, password);
  console.log(users);
  res.cookie("user_id", id);
  res.redirect(`/urls/`);
})

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["user_id"] };
  res.render("urls_login", templateVars);
});


app.post("/login", (req, res) => {
  console.log(req.body)
  const id = generateRandomString();
  const email = req.body.username;
  const password = req.body.password;
  console.log("email", email);
  console.log("password", password);
  const validLogin = checkEmail(id, email, password)
  if (validLogin === "failure") {
    res.status(403).send("Sorry! You can't see that.")
  }
  if (validLogin === "success") {
    res.cookie("user_id", id)
    res.redirect(`/urls/`);
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
  console.log(shortURL);
  return shortURL;
}

