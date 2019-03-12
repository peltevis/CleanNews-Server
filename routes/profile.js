function showProfile(req, res){
    res.render("profile", {user: req.session.userId});
}

module.exports = {profile: showProfile};