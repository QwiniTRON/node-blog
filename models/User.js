const {model, Schema} = require('mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    photoName: {
        type: String
    }
})

module.exports.statusList = {
    ADMIN: 1,
    HELPER: 2,
    USER: 4
}

module.exports.model = model('user', userSchema)