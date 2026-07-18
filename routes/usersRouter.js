const express = require('express');
const router = express.Router();
const userModel = require("../models/user-model");
const isLoggedin = require("../middlewares/isLoggedin");
const {registerUser, loginUser, logout} = require("../controllers/authController");


router.get("/", function(req, res){
    res.render("shop");
    
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/account", isLoggedin, (req, res) => {
    res.render("account", {
        user: req.user
    });
});

router.post("/request-seller", isLoggedin, async (req, res) => {

    await userModel.findByIdAndUpdate(req.user._id, {
        sellerRequest: "pending"
    });

    req.flash("success", "Seller request sent successfully.");
    res.redirect("/users/account");

});
router.get("/logout", logout);

module.exports = router;