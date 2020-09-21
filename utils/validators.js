const {body} = require('express-validator')
const User = require('../models/User').model
const bcrypt = require('bcryptjs')

module.exports.registerValidator = [
    body('email').isEmail().withMessage('Введите корректный email').custom(async (value, {req})=>{
        try {
            const candidate = await User.findOne({email: value})

            if(candidate){
                return Promise.reject('Такой email уже занят')
            }
        } catch (err) {
            console.log(err);
        }
    }).normalizeEmail(),
    body('password', 'Минимальная длинна пароля от 6 символов').trim().isLength({min: 6, max: 56}).isAlphanumeric(),
    body('passwordr').custom((value, {req})=>{
        if(value != req.body.password){
            throw new Error('Пароли должны совпадать')
        }
        return true
    }),
    body('name').trim().isLength({min: 2, max: 56}).custom(async (value, {req})=>{
        try {
            const candidate = await User.findOne({
                name: value
            })

            if(candidate){
                return Promise.reject('Такой ник уже занят')
            }
        } catch (error) {
            console.log(error);
        }
    })
]

module.exports.loginValidator = [
    body('email').isEmail().withMessage('Введите email по формату'),
    body('password').isLength({min: 6, max: 56}).isAlphanumeric()
]

module.exports.chagnePasswordValidator = [
    body('passwordOld', 'Неверный пароль').isLength({min: 6, max: 56}).withMessage('Введите пароль по формату!').custom(async (value, {req})=>{
        const eqResule = await bcrypt.compare(value, req.user.password)
        if(!eqResule){
            return Promise.reject('Неверный пароль!')
        }
    }),
    body('passwordNew').isLength({min: 6, max: 56}).withMessage('Длинна нового пароля от 6 до 56 символов')
        .custom((value, {req})=>{
        if(value == req.body.passwordOld){
            throw new Error('Пароли одинаковые!')
        }else{
            return true
        }
    }).isAlphanumeric().withMessage('Пробелов быть не должно')
]