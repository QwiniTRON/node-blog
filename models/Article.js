const {Schema, model} = require('mongoose')

const articleSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    mainPhoto: {
        type: String,
        default: 'img1.jpg'
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    comments: [
        {
            content: {
                type: String
            },
            commentsAuthor: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
            dateCreate: {
                type: Date,
                default: Date.now
            }
        }
    ],
    contents: [
        {
            content: String,
            order: Number,
            typeContent: String
        }
    ],
    tags: [
        String
    ]
}, {
    versionKey: false
})

module.exports = model('article', articleSchema)