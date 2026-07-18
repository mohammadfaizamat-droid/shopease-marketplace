const express = require('express');
const router = express.Router();
const ownerModel = require("../models/owners-model");
const userModel = require("../models/user-model");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

if(process.env.NODE_ENV === "development"){
    router.post("/create", async function(req, res){
    let owners = await ownerModel.find();
    if(owners.length > 0){
        return res
            .status(502)
            .send("Yoy don't have permission to create a new owner");
    }

    let { fullname, email, password } = req.body;

bcrypt.genSalt(10, function (err, salt) {

    bcrypt.hash(password, salt, async function (err, hash) {

        let createdOwner = await ownerModel.create({
            fullname,
            email,
            password: hash,
        });

        res.status(201).send(createdOwner);

    });

});

 });
}

router.get("/login", function (req, res) {
    let error = req.flash("error");

    res.render("owner-login", {
        error,
        loggedin: false,
        title: "Super Admin Login"
    });
});

router.post("/login", async function (req, res) {
    try {
        let { email, password } = req.body;

        let owner = await ownerModel.findOne({ email });

        if (!owner) {
            req.flash("error", "Invalid Email or Password");
            return res.redirect("/owners/login");
        }

        bcrypt.compare(password, owner.password, function (err, result) {

            if (!result) {
                req.flash("error", "Invalid Email or Password");
                return res.redirect("/owners/login");
            }

            let token = jwt.sign(
                {
                    email: owner.email,
                    id: owner._id,
                    role: "owner"
                },
                process.env.JWT_KEY
            );

            res.cookie("ownerToken", token, {
                httpOnly: true
            });

            res.redirect("/owners/admin");

        });

    } catch (err) {
        res.send(err.message);
    }
});

router.get("/admin", isOwnerLoggedIn, async function (req, res) {

    let success = req.flash("success");

    let pendingUsers = await userModel.find({
        sellerRequest: "pending"
    });

    res.render("createproduct", {
        success,
        pendingUsers,
        owner: req.owner,
        title: "Admin Dashboard"
    });

});

router.get("/approve/:id", async (req, res) => {

    await userModel.findByIdAndUpdate(req.params.id, {
        role: "seller",
        sellerRequest: "approved"
    });

    req.flash("success", "Seller approved successfully.");

    res.redirect("/owners/admin");

});

router.get("/reject/:id", async (req, res) => {

    await userModel.findByIdAndUpdate(req.params.id, {
        sellerRequest: "rejected"
    });

    req.flash("success", "Seller request rejected.");

    res.redirect("/owners/admin");

});


module.exports = router;