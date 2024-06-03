const express = require('express')
const app = express()
const cors = require('cors')

const db = require('./model/connect')
const commentDb = require('./model/comment')

const grpc = require('@grpc/grpc-js')
const protoloader = require('@grpc/proto-loader')

const PORT = 4003

const AUTH_PROTO_PATH = '../proto/auth.proto'
const authPackageDefinition = protoloader.loadSync(AUTH_PROTO_PATH, {})
const authProto = grpc.loadPackageDefinition(authPackageDefinition).auth;
const authClient = new authProto.AuthService('localhost:50051', grpc.credentials.createInsecure())

db()
app.use(express.json())
app.use(cors())

app.post('/add', async (req, res) => { //add comment to post
    try {
        const { content, userId , postId} = req.body;
        authClient.GetUser({ userId }, async (err, response) => {
            if (err) {
                return res.status(500).send(err)
            }
            const { username } = response
            const newComment = new commentDb({
                postId: postId,
                userId: userId,
                username: username,
                content: content
            })
            const savedComment = await newComment.save()
            res.json({ status: 'success', savedComment })
        })
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
})

app.get('/:id', async (req, res) => { //retrieving comments of post
    try {
        const postId = req.params.id;
        const postComments = await commentDb.find({ postId: postId })
        res.json({ status: 'success', postComments })
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
})


app.listen(PORT, () => {
    console.log(`comment http server at http://127.0.0.1:${PORT}`)
})