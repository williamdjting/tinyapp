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

// const users = {
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//   "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   }
// };

module.exports = { getUserByEmail }

