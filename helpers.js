//takes in the email and compares it with the emails in the users database to see if there is a match, if so pull the user object from users database with that email, otherwise return undefined
function getUserByEmail(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    } 
  }
  return undefined;
}

//looks into the newUrl database and comapares if the current ID passed in matches any of the userID in the newUrldatabase, if so, assign this new ID's object to the existing ID in newUrl Database

finds only the urls that belong to this users' id
function urlsForUser(id, newUrlDatabase) {
  let newObj = {};
  for (let shortURL in newUrlDatabase) {
    if (id === newUrlDatabase[shortURL].userID) {
      newObj[shortURL] = newUrlDatabase[shortURL];
    }
  }
  return newObj;
}

// generates a random string for creating unique ID's with
function generateRandomString() {
  shortURL = (Math.random().toString(36).substring(7));
  return shortURL;
}


//exports functions to other files
module.exports = { getUserByEmail, urlsForUser, generateRandomString }

