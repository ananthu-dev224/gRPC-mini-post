const mongoose = require('mongoose')

const connectDb = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1/gRPC-comment')
        console.log('Comment Db connected...')
    } catch (error) {
        console.log('Error in connecting Comment Db',error.message)
    }
}

module.exports = connectDb;