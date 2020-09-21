const express = require('express')
const router = express.Router()
const User = require('../models/User').model
const usersStatusList = require('../models/User').statusList
const bcrypt = require('bcryptjs')
const validatorList = require('../utils/validators')
const { validationResult } = require('express-validator')
const authMiddleware = require('../middleware/auth')
const nodemailer = require('nodemailer')
const config = require('config')


/* */ 

/*
    name: testmailer2000@mail.ru
    pas: mailer444test
    testmailer90@mail.ru
    supertest1
    kur4atoff1@yandex.ru
    Kura123z

    bartestnode@gmail.com
    tester1Z

    outh ***
    NodeBlog
    gmail_client
    804241266464-m3gn60gd2r27jmerbu4nif0um86gv59f.apps.googleusercontent.com 
*/
const transporter = nodemailer.createTransport({
    pool: true,
    service: 'Gmail',
    auth: {
        type: 'OAuth2',
        user: 'bartestnode@gmail.com', // generated ethereal user
        refreshToken: '1//04WXoGMIY1BwhCgYIARAAGAQSNwF-L9IrorqXZ8rBlwusuGurck4BP5bG1kMrQKGkgnD-wI9RA-vXkm3bcujEALSO-rqeNlxMK_I',
        clientId: '804241266464-m3gn60gd2r27jmerbu4nif0um86gv59f.apps.googleusercontent.com',
        clientSecret: '5JAbHeNjmxq_ZYe_EY0cpeN-',
        accessUrl: 'https://oauth2.googleapis.com/token'
    }
},{
    from: 'Node Blog <bartestnode@gmail.com>'
});

/* */


router.get('/login', async (req, res) => {
    res.render('authPage', {
        isAuthPage: true,
        title: 'Логин',
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError'),
        inputsData: {
            emailL: req.flash('emailL'),
            passwordL: req.flash('passwordL'),
            email: req.flash('email'),
            password: req.flash('password'),
            passwordr: req.flash('passwordr'),
            name: req.flash('name')
        }
    })
})

router.post('/login', validatorList.loginValidator, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('loginError', errors.array()[0].msg)
            req.flash('emailL', req.body.email)
            req.flash('passwordL', req.body.password)

            return res.status(422).redirect('/auth/login#logintab')
        }

        const body = req.body
        const candidate = await User.findOne({
            email: body.email
        })
        if (candidate) {
            const passwordSame = await bcrypt.compare(body.password, candidate.password)
            if (!passwordSame) {
                req.flash('loginError', 'Email или пароль неверны')
                res.redirect('/auth/login#logintab')
            } else {
                req.session.isAuth = true
                req.session.user = candidate    
                if(req.body.remember == 'rememberme'){
                    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7
                }            
                
                req.session.save((err) => {
                    if (err) throw err

                    res.redirect('/')
                })
            }
        } else {
            req.flash('loginError', 'Email или пароль неверны')
            res.redirect('/auth/login#logintab')
        }

    } catch (error) {
        console.log(error);
    }
})

router.post('/register', validatorList.registerValidator, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        req.flash('registerError', errors.array()[0].msg)

        req.flash('email', req.body.email)
        req.flash('password', req.body.password)
        req.flash('passwordr', req.body.passwordr)
        req.flash('name', req.body.name)

        return res.status(422).redirect('/auth/login#registertab')
    }

    try {
        const user = new User({
            email: req.body.email,
            name: req.body.name,
            password: await bcrypt.hash(req.body.password, 12),
            status: usersStatusList.USER
        })

        req.flash('emailL', req.body.email)
        req.flash('passwordL', req.body.password)
        
        // await transporter.sendMail({
        //     to: req.body.email,
        //     from: 'Node Blog <bartestnode@gmail.com>',
        //     subject: '[nospam] Спасибо за регистрацию',
        //     text: 'Спасибо за регистарцию! На нашем блоге вы сможете найти много полезного контента об it, а также вit в наше активное сообщество и писать интересные статьи',
        //     html: `
        //         <h2>Зравствуйте!</h2>
        //         <p>Спасибо за регистарцию!</p>
        //         <p>На нашем блоге вы сможете найти много полезного контента об it, а также вit в наше активное сообщество и писать интересные статьи'</p>
        //         <hr>
        //             <br>
        //             <p>Ссылка: <a href="${config.get('BASE_URL')}/">На главную</a></p>
        //             <br>
        //         <hr>
        //         <p>С увжением, ваш courses shop</p>
        //     `
        // })
        res.render('authPage', {
            isAuthPage: true,
            title: 'Логин',
            inputsData: {
                emailL: req.flash('emailL'),
                passwordL: req.flash('passwordL')
            }
        })
        await user.save()
        
    } catch (error) {
        console.log(error);
    }
})

router.get('/logout', authMiddleware, (req, res)=>{
    req.session.destroy((err)=>{
        if(err) throw new Error(`Ошибка в logout: ${err.toString()}`)

        res.status(302).redirect('/')
    })
})

module.exports = router