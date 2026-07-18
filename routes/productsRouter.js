const express = require("express");
const router = express.Router();

const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isLoggedin = require("../middlewares/isLoggedin");

router.post(
    "/create",
    isLoggedin,
    upload.single("image"),
    async function (req, res) {
        try {

            // Sirf seller hi product create kar sakta hai
            if (req.user.role !== "seller") {
                req.flash("error", "Only sellers can create products.");
                return res.redirect("/users/account");
            }

            let {
                name,
                price,
                discount,
                bgcolor,
                panelcolor,
                textcolor,
            } = req.body;

            let product = await productModel.create({
                image: req.file.buffer,
                name,
                price,
                discount,
                bgcolor,
                panelcolor,
                textcolor,

                // Seller ki ID save hogi
                seller: req.user._id,
            });

            req.flash("success", "Product created successfully.");
            res.redirect("/seller/dashboard");

        } catch (err) {
            res.send(err.message);
        }
    }
);

module.exports = router;