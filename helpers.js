//fetches user object from user database based off email

function getUserByEmail(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    } 
  }
}

//finds only the urls that belong to this users' id
function urlsForUser(id, newUrlDatabase) {
  let newObj = {};
  for (let shortURL in newUrlDatabase) {
    if (id === newUrlDatabase[shortURL].userID) {
      newObj[shortURL] = newUrlDatabase[shortURL];
    }
  }
  return newObj;
}

// generatesRandomString id
function generateRandomString() {
  shortURL = (Math.random().toString(36).substring(7));
  return shortURL;
}

//checks if the email/password parameters that is passed in exist in the database already
function checkEmail(id, email, password, users) {
  const actualUser = getUserByEmail(email, users);
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



module.exports = { getUserByEmail, urlsForUser, generateRandomString, checkEmail }

