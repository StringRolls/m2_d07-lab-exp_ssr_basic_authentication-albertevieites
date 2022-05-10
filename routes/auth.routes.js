// routes/auth.routes.js

const { Router } = require("express");
const router = new Router();
const res = require("express/lib/response");

const bcrypt = require("bcrypt");
const saltRounds = 5;

const User = require("../models/User.model");

const isNotLoggedIn = require("../middlewares/isNotLoggedIn");


// GET route ==> to display the signup form to users
router.get("/signup", isNotLoggedIn, (req, res) => {
  res.render("auth/signup");
});

router
  .route("/signup", isNotLoggedIn)
  .get((req, res) => res.render("auth/signup"))
  // POST route ==> to process form data
  .post((req, res, next) => {
    // console.log("The form data: ", req.body);

    const { username, email, password } = req.body;

    bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        return User.create({
          // username: username
          username,
          email,
          // passwordHash => this is the key from the User model
          //     ^
          //     |            |--> this is placeholder (how we named returning value from the previous method (.hash()))
          passwordHash: hashedPassword,
        });
      })
      .then((userFromDB) => {
        // console.log("Newly created user is: ", userFromDB);
        res.redirect("/");
      })
      .catch((error) => next(error));
  });

router
  .route("/login")
  .get((req, res) => res.render("auth/login"))
  .post((req, res) => {
    const { email, password } = req.body;

    User.findOne({ email })
      .then((user) => {
        if (!user) {
          res.render("auth/login", { errorMessage: "Wrong credentials!" });
          return;
        } else {
          if (bcrypt.compareSync(password, user.passwordHash)) {
            req.session.currentUser = user;
            res.redirect("/"); // redirect to wherever you want
            return;
          } else {
            res.render("auth/login", { errorMessage: "Wrong credentials!" });
          }
        }
      })
      .catch((err) => console.log(err));
  });

router.get("/userProfile", (req, res) => res.render("users/user-profile"));

router.get("/main", (req, res) => {
  const id = req.session.currentUserId;
  User.findById(id)
    .then((user) => {
      res.render("main", user);
    })
    .catch((err) => console.log(err));
});

router.get("/private", (req, res) => {
  const id = req.session.currentUserId;
  User.findById(id)
    .then((user) => {
      res.render("private", user);
    })
    .catch((err) => console.log(err));
});

module.exports = router;
