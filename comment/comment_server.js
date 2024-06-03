const grpc = require('@grpc/grpc-js')
const protoloader = require('@grpc/proto-loader')

const db = require('./model/connect')
const commentDb = require('./model/comment')

const COMMENT_PROTO_PATH = '../proto/comment.proto';
const protoDefinition = protoloader.loadSync(COMMENT_PROTO_PATH, {
    keepCase: true, // Maintain the case of field names as defined in the .proto file
    longs: String, // Treat 64-bit integers as strings
    enums: String, // Treat enum values as their string names
    defaults: true, // Include fields with default values
    oneofs: true // Represent `oneof` fields as a single object
})
const commentProto = grpc.loadPackageDefinition(protoDefinition).comment;

async function GetCommentByUserId(call, callback) { //retrieving all posts by a username
    try {
        const { userId } = call.request;
        const commentData = await commentDb.find({ userId: userId })
        if (commentData) {
            callback(null, { commentData: commentData, status: "success" })
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                message: 'comments not found',
            })
        }

    } catch (error) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message
        })
    }
}

function main() {
    const grpcServer = new grpc.Server()
    grpcServer.addService(commentProto.CommentService.service, { GetCommentByUserId })
    grpcServer.bindAsync('127.0.0.1:50053', grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Comment gRPC server running at 127.0.0.1:50052');
    })
}

main()
db()