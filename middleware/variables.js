module.exports = function(req, res, next){
    res.locals.isAuth = req.session.isAuth
    res.locals.csrf = req.csrfToken()
    if(req.session.user){
        res.locals.photoAvatar = req.user.photoName
    }
    
    
    next()
}