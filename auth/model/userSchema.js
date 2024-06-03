const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    joined: {
        type:Date,
        default:Date.now()
    }
})

const userModel = mongoose.model('user',userSchema)
module.exports = userModel;