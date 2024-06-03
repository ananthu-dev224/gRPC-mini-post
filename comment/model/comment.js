const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    userId: String,
    postId: String,
    username: String,
    content: String,
    created_at: {
        type:String,
        default: () => new Date().toISOString()
    }
})

const commentModel = mongoose.model('comment',commentSchema)
module.exports = commentModel;