const { Schema, model } = require('mongoose')

const deletedPostSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    initiator: {
        type: String,
        required: true,
        enum: ['a', 'u']
    }
}, {
    versionKey: false
})

module.exports = model('deletedPost', deletedPostSchema)