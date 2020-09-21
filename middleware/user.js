const User = require('../models/User').model
module.exports = async function(req, res, next){
    if(!req.session.user){
        return next()
    }
    const user = await User.findById(req.session.user._id.toString())
    req.user = user

    next()
}