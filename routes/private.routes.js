const express = require("express");
const router = express.Router();

router.get("/profile", (req, res) => {
  res.render("user-profile", { user: req.session.currentUser });
});

module.exports = router;
