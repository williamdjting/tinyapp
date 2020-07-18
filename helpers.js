//fetches user object from user database based off email

function getUserByEmail(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    } 
  }
  return undefined;
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





module.exports = { getUserByEmail, urlsForUser, generateRandomString }

