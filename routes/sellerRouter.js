const express = require("express");
const router = express.Router();
const productModel = require("../models/product-model");

const isLoggedin = require("../middlewares/isLoggedin");
const isSeller = require("../middlewares/isSeller");

router.get("/dashboard", isLoggedin, isSeller, async (req, res) => {

    const totalProducts = await productModel.countDocuments({
        seller: req.user._id
    });

    res.render("sellerDashboard", {
        user: req.user,
        totalProducts
    });

});

router.get("/products", isLoggedin, isSeller, async (req, res) => {

    const products = await productModel.find({
        seller: req.user._id
    });

    res.render("sellerProducts", {
        user: req.user,
        products
    });

});

router.get("/edit/:id", isLoggedin, isSeller, async (req, res) => {

    const product = await productModel.findOne({
        _id: req.params.id,
        seller: req.user._id
    });

    if (!product) {
        req.flash("error", "Product not found.");
        return res.redirect("/seller/products");
    }

    res.render("editProduct", {
        user: req.user,
        product,
        title: "Edit Product"
    });

});

router.get("/delete/:id", isLoggedin, isSeller, async (req, res) => {

    const product = await productModel.findOneAndDelete({
        _id: req.params.id,
        seller: req.user._id
    });

    if (!product) {
        req.flash("error", "Product not found.");
        return res.redirect("/seller/products");
    }

    req.flash("success", "Product deleted successfully.");

    res.redirect("/seller/products");

});

module.exports = router;