const mongoose = require('mongoose')

const connectDb = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1/gRPC-post')
        console.log('Post Db connected...')
    } catch (error) {
        console.log('Error in connecting Post Db',error.message)
    }
}

module.exports = connectDb;