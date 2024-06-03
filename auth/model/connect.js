const mongoose = require('mongoose')

const connectDb = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1/gRPC-auth')
        console.log('Auth Db connected...')
    } catch (error) {
        console.log('Error in connecting Auth Db',error.message)
    }
}

module.exports = connectDb;