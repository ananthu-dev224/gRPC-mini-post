const express = require('express')
const app = express()
const cors = require('cors');
const db = require('./model/connect')
const userDb = require('./model/userSchema')
const PORT = 4001

const grpc = require('@grpc/grpc-js')
const protoloader = require('@grpc/proto-loader')

const POST_PROTO_PATH = '../proto/post.proto';
const postPackageDefinition = protoloader.loadSync(POST_PROTO_PATH, {})
const postProto = grpc.loadPackageDefinition(postPackageDefinition).post;

const postClient = new postProto.PostService('localhost:50052', grpc.credentials.createInsecure())

const COMMENT_PROTO_PATH = '../proto/comment.proto';
const commentPackageDefinition = protoloader.loadSync(COMMENT_PROTO_PATH, {})
const commentProto = grpc.loadPackageDefinition(commentPackageDefinition).comment;

const commentClient = new commentProto.CommentService('localhost:50053', grpc.credentials.createInsecure())

app.use(express.json())
app.use(cors());

db()

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userDb.findOne({ email: email, password: password })
        if (!user) {
            return res.json({ status: 'failed', message: 'Please signup' })
        }
        res.json({ status: 'success', userId: user._id })
    } catch (error) {
        res.json({ status: 'error', message: error.message })
    }
})

app.post('/signup', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const existingName = await userDb.findOne({ username: username })
        if (existingName) {
            return res.json({ status: 'failed', message: 'Username already exists' })
        }
        const newUser = new userDb({
            email: email,
            username: username,
            password: password
        })
        newUser.save()
        res.json({ status: 'success', userId: newUser._id })
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
})

app.get('/profile/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = await userDb.findOne({ _id: userId })
        if (!userData) {
            return res.json({ status: 'failed', message: 'User not found' });
        }
        const username = userData.username;
        const userPosts = await new Promise((resolve, reject) => {
            postClient.GetPost({ username }, async (err, response) => {
                if (err) {
                    return reject(err)
                }
                resolve(response.postData)
            })
        })

        const userComments = await new Promise((resolve, reject) => {
            commentClient.GetCommentByUserId({ userId }, async (err, response) => {
                if (err) {
                    return reject(err)
                }
                resolve(response.commentData)
            })
        })

        res.json({
            status: 'success',
            user: userData,
            posts: userPosts,
            comments: userComments,
        });
    } catch (error) {
        res.json({ status: 'failed', message: error.message })
    }
})

app.listen(PORT, () => {
    console.log(`auth http server at http://127.0.0.1:${PORT}`)
})