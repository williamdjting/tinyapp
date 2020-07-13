/*
Let's populate our helpersTest.js with our first test! What should our first test be? 
Let's think about what our getUserByEmail function does. 
When we pass in an email that exists in our users database, 
we expect our function to return the user object that contains that email. 
Let's write a test to make sure our function does that. */


const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    console.log("user1", user);
    console.log("userID", user.id);
    assert.equal(user.id, expectedOutput, "emails match");
  });
  it('if email is not find, show undefined', function() {
    const user = getUserByEmail("user3@example.com", users)
    const expectedOutput = undefined;
    // Write your assert statement here
    console.log("user2", user);

    assert.equal(user, expectedOutput, "emails match");
  });
});

// const users = {
//   "aJ48lW": {
//     id: "aJ48lW", 
//     email: "william@gmail.com", 
//     password: "menintrees"
//   },
//   "aJa4l2": {
//     id: "aJa4l2", 
//     email: "tommy@gmail.com", 
//     password: "eatdinner"
//   }
// };


// describe('getUserByEmail', function() {
//   it('should return a user with valid email', function() {
//     const user = getUserByEmail("william@gmail.com", users)
//     const expectedOutput = "userRandomID";
//     // Write your assert statement here
//     assert.equal(user, "william@gmail.com", "emails match");
//   });
// });
