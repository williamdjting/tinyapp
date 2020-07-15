//fetches user object from user database based off email

function getUserByEmail(email, users) {
  for (let user in users) {
    console.log("getUserByEmail1", users[user]);
    console.log("user", user);
    console.log("getUserByEMail2", users[user].email);
    if (users[user].email === email) {
      console.log("getUserByEmail3", users[user]);
      return users[user];
    } 
  }
}

module.exports = { getUserByEmail }

