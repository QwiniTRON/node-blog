const {Router} = require('express')
const router = Router()
const User = require('../models/User').model
const fs = require('fs')
const path = require('path')
const authMiddleware = require('../middleware/auth')
const Article = require('../models/Article')
const DeletedPost = require('../models/DeletedPost')
const validators = require('../utils/validators')
const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')

router.get('/', authMiddleware, async (req, res)=>{
    try{
        const userForRender = Object.assign({}, req.user._doc)
        const userPosts = await Article.find({
            author: req.user._id.toString()
        })
        const userDeletedPosts = await DeletedPost.find({
            author: req.user._id.toString()
        }).populate('author')
        
        res.render('mainProfile', {
            title: 'Профиль',
            user: userForRender,
            userPosts: userPosts,
            userDeletedPosts
        })
    }catch(err){
        console.log('/user/*get', err);
        res.redirect('/')
    }
})

router.get('/password', authMiddleware, async (req, res)=>{
    res.render('changePasswordPage', {
        title: 'Смена пароля',
        changePasswordError: req.flash('changePasswordError')
    })
})

router.post('/password', validators.chagnePasswordValidator, async (req, res)=>{
    const errors = validationResult(req)
    
    if(!errors.isEmpty()){
        req.flash('changePasswordError', errors.array()[0].msg)
        return res.redirect('/user/password')
    } 

    req.user.password = await bcrypt.hash(req.body.passwordNew, 12)

    res.redirect('/user/')
    await req.user.save()
})

router.get('/password/recovery', async(req, res)=>{
    
})

router.post('/edit', authMiddleware, async (req, res)=>{
    if(req.files.profilePhotoFile){
        const photoFileName = req.files.profilePhotoFile[0].filename
        if(req.user.photoName){
            fs.unlink(path.join(req.mainDirPath, 'images', req.user.photoName), (err)=>{
                if(err) throw new Error('/user/edit Error on fs unlink' + err.toString())
            })
        }
        req.user.photoName = photoFileName
        
    }
    if(req.body.name.length > 1){
        req.user.name = req.body.name
    }
    
    await req.user.save()

    res.redirect('/user')
})



router.get('/:id', async (req, res)=>{
    try{
        const userForRender = await User.findById(req.params.id.toString())
        const userPosts = await Article.find({
            author: req.params.id.toString()
        })
        const userDeletedPosts = await DeletedPost.find({
            author: req.params.id.toString()
        }).populate('author')
        
        res.render('profilePage', {
            title: 'Профиль человека',
            user: userForRender._doc,
            userPosts: userPosts,
            userDeletedPosts
        })
    }catch(err){
        console.log('/user/*get', err);
        res.redirect('/')
    }
})

module.exports = router