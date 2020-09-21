const express = require('express')
const config = require('config')
const app = express()
const mainRouter = require('./routs/Main')
const exphbs = require('express-handlebars')
const hbs = require('handlebars')
const path = require('path')
const mongoose = require('mongoose')
const authRouter = require('./routs/Auth')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const cserf = require('csurf')
const flash = require('connect-flash')
const varialesMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const middleware404 = require('./middleware/error')
const userRouter = require('./routs/User')
const fileMiddleware = require('./middleware/file')
const articleRouter = require('./routs/Article')

// ----------------------------------------------------------
const hbsConfig = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbs.helpers')
})
app.engine('hbs', hbsConfig.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))


const store = new MongoStore({
    collection: 'sessions',
    uri: config.get('MONGOURI')
})
app.use(session({
    store,
    resave: false,
    saveUninitialized: false,
    secret: config.get('sessionSecret'),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}))
app.use('/user', fileMiddleware.fields([
    {name: 'profilePhotoFile', maxCount: 1}
]))
app.use('/article', fileMiddleware.any())
app.use(cserf())
app.use(flash())
app.use(userMiddleware)
app.use(varialesMiddleware)
app.use((req, res, next)=>{
    req.mainDirPath = __dirname
    next()
})
// ----------------------------------------------------------





app.use('/', mainRouter)
app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/article', articleRouter)


app.use(middleware404)

async function start(){
    try {
        await mongoose.connect(config.get('MONGOURI'), {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
          useFindAndModify: false
        });
    } catch (e) {
        console.log(e);
    }
}
start()

app.listen(config.get('PORT'), ()=>{
    console.log(`server listen on PORT: ${config.get('PORT')}`);
})