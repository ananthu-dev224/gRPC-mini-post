const express = require('express')
const app = express()
const db = require('./model/connect')
const postDb = require('./model/post')
const cors = require('cors')
const protoloader = require('@grpc/proto-loader')
const grpc = require('@grpc/grpc-js')

const PORT = 4002
const AUTH_PROTO_PATH = '../proto/auth.proto';
const authPackageDefinition = protoloader.loadSync(AUTH_PROTO_PATH, {})
const authProto = grpc.loadPackageDefinition(authPackageDefinition).auth;

const authClient = new authProto.AuthService('localhost:50051', grpc.credentials.createInsecure())

app.use(express.json())
app.use(cors())

db()

app.get('/', async (req, res) => {
    try {
        const allPosts = await postDb.find()
        res.json({ status: 'success', allPosts })
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
})

app.get('/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const postData = await postDb.findOne({_id : postId})
        if (!postData) {
            return res.json({ status: 'failed', message: 'Post doesnt exist' })
        }
        res.json({ status: 'success', postData })
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
})

app.post('/add', async (req, res) => {
    try {
        const { content, userId } = req.body;
        authClient.GetUser({ userId }, async (err, response) => {
            if (err) {
                return res.status(500).send(err);
            }
            const { username, email } = response;
            const newPost = new postDb({
                content,
                username,
                email
            })
            const postData = await newPost.save()
            res.json({ status: 'success', postData })
        })
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
})


app.listen(PORT, () => {
    console.log(`post http server at http://127.0.0.1:${PORT}`)
})