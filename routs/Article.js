const { Router } = require('express')
const router = Router()
const Article = require('../models/Article')
const helpFunctions = require('../utils/functions')
const fs = require('fs')
const path = require('path')
const userAccessList = require('../models/User').statusList
const authMiddleware = require('../middleware/auth')
const DeletedPost = require('../models/DeletedPost')


// Работа над постами
// 

router.get('/create', (req, res) => {
    res.render('createArticle', {
        title: 'Создание поста',
        isAddArticle: true,
        createError: req.flash('articleCreateError')
    })
})

router.post('/create', authMiddleware, async (req, res) => {
    try {
        if (!req.body.postname || req.body.postname.length < 6) {
            req.flash('articleCreateError', 'Нет названия поста')
            res.redirect('/article/create')
        }

        const fileContents = req.files.filter(file => {
            const partsName = file.fieldname.split('/')
            return partsName[1]
        }).map(item => {
            return {
                content: item.filename,
                order: item.fieldname.split('/')[1],
                typeContent: 'img'
            }
        })
        const textContents = Object.entries(req.body).filter((item) => {
            return item[0].startsWith('text')
        }).map(item => {
            return {
                content: helpFunctions.escapeHtml(item[1]),
                order: item[0].split('/')[1],
                typeContent: 'text'
            }
        })
        const generalContents = fileContents.concat(textContents)
        generalContents.sort((l, r) => l.order - r.order)

        const tags = helpFunctions.escapeHtml(req.body.tags).toUpperCase().split('*')
        const author = req.session.user._id
        const postname = helpFunctions.escapeHtml(req.body.postname)


        const article = new Article({
            name: postname,
            mainPhoto: req.files[0] && req.files[0].fieldname == 'postPhoto' ? req.files[0].filename : undefined,
            author,
            contents: generalContents,
            tags
        })

        req.flash('isArticleCreated', 'Статья создана')
        res.redirect('/')
        await article.save()
    } catch (error) {
        console.log('/create*Post', error);
        res.redirect('/')
    }
})

router.get('/edit/:id', authMiddleware, async (req, res) => {
    try {

        if (req.params.id) {
            let postFinded = await Article.findById(req.params.id.toString()).populate('author comments.commentsAuthor')
            if (postFinded) {
                postFinded = postFinded._doc
                res.render('editArticle', {
                    title: 'Редактирование поста',
                    isAddArticle: true,
                    post: postFinded,
                    tags: postFinded.tags.join('*')
                })
            } else {
                res.render('postNotFoundPage', {
                    title: 'Пост не найден'
                })
            }
        } else {
            res.render('postNotFoundPage', {
                title: 'Пост не найден'
            })
        }
    } catch (error) {
        console.log('/edit/:id*get', error);
    }
})

router.post('/edit/:id', authMiddleware, async (req, res) => {
    try {
        if (!req.body.postname || req.body.postname.length < 6) {
            req.flash('articleCreateError', 'Нет названия поста')
            return res.redirect('/article/create')
        }

        if (!req.params.id) {
            return res.render('postNotFoundPage', {
                title: 'Пост не найден'
            })
        }

        let postFinded = await Article.findById(req.params.id.toString()).populate('author comments.commentsAuthor')

        if (!postFinded) {
            return res.render('postNotFoundPage', {
                title: 'Пост не найден'
            })
        }

        // postFinded.contents.filter( part => part.typeContent == 'img').forEach(el => {
        //     
        // });


        const fileContents = req.files.filter(file => {
            const partsName = file.fieldname.split('/')
            return partsName[1]
        }).map(item => {
            return {
                content: item.filename,
                order: item.fieldname.split('/')[1],
                typeContent: 'img'
            }
        })

        const prevImagesName = []
        const acceptedContents = Object.entries(req.body).filter((item) => {
            return item[0].startsWith('imgI')
        }).map(item => {
            let order = item[0].split('/')[1]
            let content = item[1]
            prevImagesName.push(content)
            // let prevStateParts = postFinded.contents.find((e)=> e.order == order)

            if (req.files.find(el => el.fieldname == 'img/' + order)) {
                fs.unlink(path.join(req.mainDirPath, 'images', content), (err) => {
                    // if(err) throw new Error('/edit/:id*Post Error on fs unlink' + err.toString())
                })
            } else {
                fileContents.push({
                    content: content,
                    order: order,
                    typeContent: 'img'
                })
            }
        })

        postFinded.contents.forEach(el => {
            if (el.typeContent == 'img') {
                if (!prevImagesName.includes(el.content)) {
                    fs.unlink(path.join(req.mainDirPath, 'images', el.content), (err) => {
                        // if(err) throw new Error('/edit/:id*Post Error on fs unlink' + err.toString())
                    })
                }
            }
        });

        const textContents = Object.entries(req.body).filter((item) => {
            return item[0].startsWith('text')
        }).map(item => {
            return {
                content: helpFunctions.escapeHtml(item[1]),
                order: item[0].split('/')[1],
                typeContent: 'text'
            }
        })
        const generalContents = fileContents.concat(textContents)
        generalContents.sort((l, r) => l.order - r.order)

        const tags = helpFunctions.escapeHtml(req.body.tags).toUpperCase().split('*')
        const author = req.session.user._id
        const postname = helpFunctions.escapeHtml(req.body.postname)


        postFinded.name = postname
        if (req.files[0] && req.files[0].fieldname == 'postPhoto') {
            if (postFinded.mainPhoto != 'img1.jpg') {
                fs.unlink(path.join(req.mainDirPath, 'images', postFinded.mainPhoto), (err) => {
                    if (err) throw new Error('/edit/:id*Post Error on fs unlink' + err.toString())
                })
            }
            postFinded.mainPhoto = req.files[0].filename
        }
        postFinded.tags = tags
        postFinded.contents = generalContents

        req.flash('isArticleEdited', 'Статья отредактирована')
        res.redirect('/')
        await postFinded.save()
    } catch (error) {
        console.log('/edit/:id*Post', error);
        res.redirect('/')
    }

})


router.post('/comment/:page', authMiddleware, async (req, res) => {
    try {
        if (req.params.page) {
            const post = await Article.findById(req.params.page).populate('author comments.commentsAuthor')

            if (post) {
                let isAuthor = post.author._id.toString() == req.user._id.toString()

                if (!req.body.comment || req.body.comment.length > 1000 || req.body.comment.length < 6) {
                    return res.render('viewPage', {
                        title: 'Статья',
                        post: post._doc,
                        isAuthor: isAuthor,
                        addCommentError: 'Коментарий не по формату'
                    })
                }

                post.comments.push(
                    {
                        content: helpFunctions.escapeHtml(req.body.comment),
                        commentsAuthor: req.user._id.toString()
                    }
                )

                await post.save()
                await post.populate('comments.commentsAuthor').execPopulate()
                return res.render('viewPage', {
                    title: 'Статья',
                    post: post._doc,
                    isAuthor: isAuthor
                })
            } else {
                return res.render('postNotFoundPage', {
                    title: 'Пост не найден'
                })
            }

        } else {
            return res.render('postNotFoundPage', {
                title: 'Пост не найден'
            })
        }
    } catch (error) {
        console.log('/article/comment/:page*post', error);
        return res.redirect('/')
    }
})

router.post('/delete', authMiddleware, async (req, res) => {
    try {
        const postId = req.body.id
        const post = await Article.findById(postId).populate('author comments.commentsAuthor')
        const isAdmin = req.user.status & userAccessList.ADMIN

        if(post){
            if(post.author._id == req.user._id || isAdmin){
                if(post.mainPhoto != 'img1.jpg'){
                    fs.unlink(path.join(req.mainDirPath, 'images', post.mainPhoto), (err)=>{

                    })
                }
                post.contents.forEach( part => {
                    if(part.typeContent == 'img'){
                        fs.unlink(path.join(req.mainDirPath, 'images', part.content), (err)=>{

                        })
                    }
                })
                const deletedPost = new DeletedPost({
                    name: post.name, 
                    author: post.author._id.toString(),
                    initiator: isAdmin? 'a' : 'u'
                })
                await deletedPost.save()
                await post.remove()

                req.flash('isPostDeleted', 'Пост удалён')

                return res.redirect('/')
            }else{
                return res.redirect('/')
            }
        }else{
            return res.redirect('/')
        }

        return res.redirect('/')
    } catch (error) {
        console.log('/article/delete*post', error);
    }

})

// Работа над постами
// 

// Поиск
// 

// Поиск и пагинация
router.get('/search', async (req, res) => {
    const limit = isNaN(req.query.limit) ? 0 : +req.query.limit
    let posts
    const search = req.query.searchtext ? req.query.searchtext.toUpperCase() : ''
    let tagsSearch = []


    const postsOnPage = 10
    let postsCount

    for (let tag of search.matchAll(/\[(.*?)\]/gi)) {
        tagsSearch.push(tag[1])
    }


    if (search) {
        if (tagsSearch.length > 0) {
            posts = await Article.find({
                tags: { $all: tagsSearch }
            }).populate('author comments.commentsAuthor')
        } else {
            posts = await Article.find({
                name: new RegExp('.*' + search + '.*', 'i')
            }).populate('author comments.commentsAuthor')
        }
    } else {
        posts = await Article.find().populate('author comments.commentsAuthor')
    }

    postsCount = posts.length
    posts = posts.slice(limit * postsOnPage, (limit + 1) * postsOnPage)

    res.render('serchPage', {
        title: 'Статьи',
        isArticle: true,
        posts: posts,
        search,
        postsCount,
        postsOnPage,
        limit
    })
})


router.get('/view/:page', async (req, res) => {
    try {
        if (req.params.page) {
            const post = await Article.findById(req.params.page).populate('author comments.commentsAuthor')
            //  comments.commentsAuthor
            if (post) {
                let userId = req.user ? req.user._id : 'Nothing'
                let isAuthor = post.author._id.toString() == userId
                let isAdmin = req.user.status & userAccessList.ADMIN

                res.render('viewPage', {
                    title: 'Статья',
                    post: post._doc,
                    isAuthor: isAuthor,
                    isAdmin
                })
            } else {
                res.render('postNotFoundPage', {
                    title: 'Пост не найден'
                })
            }

        } else {
            res.render('postNotFoundPage', {
                title: 'Пост не найден'
            })
        }
    } catch (error) {
        console.log('/view/:page*get', error);
        res.redirect('/')
    }
})

// Поиск
// 

module.exports = router