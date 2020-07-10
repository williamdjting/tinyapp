function getUserByEmail(email, users) {
  for (let user in users) {
    console.log("getUserByEmail", users[user]);
    if (users[user].email === email) {
      console.log(user[user]);
      return users[user];
    }
  }
}

module.exports = { getUserByEmail }