module.exports = function(req, res, next) {

    if(req.user.role !== "seller"){
        req.flash("error", "You are not a seller.");
        return res.redirect("/account");
    }

    next();

}