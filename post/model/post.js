const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    username: String,
    content: String,
    email: String,
    created_at: {
        type:String,
        default: () => new Date().toISOString()
    }
})

const postModel = mongoose.model('post',postSchema)
module.exports = postModel;