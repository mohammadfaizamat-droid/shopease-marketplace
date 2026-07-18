const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owners-model");

module.exports = async function (req, res, next) {

    if (!req.cookies.ownerToken) {
        req.flash("error", "Please login as Super Admin");
        return res.redirect("/owners/login");
    }

    try {

        let decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);

        let owner = await ownerModel.findById(decoded.id).select("-password");

        if (!owner) {
            req.flash("error", "Owner not found");
            return res.redirect("/owners/login");
        }

        req.owner = owner;

        next();

    } catch (err) {

        req.flash("error", "Session expired");

        return res.redirect("/owners/login");

    }

};