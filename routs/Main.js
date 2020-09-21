const {Router} = require('express')
const router = Router()

router.get('/', async (req, res)=>{

    res.render('mainPage', {
        title: 'Главная',
        isMain: true,
        isArticleCreated: req.flash('isArticleCreated'),
        isArticleEdited: req.flash('isArticleEdited'),
        isPostDeleted: req.flash('isPostDeleted')
    })
})

module.exports = router