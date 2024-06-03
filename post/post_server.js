const grpc = require('@grpc/grpc-js')
const protoloader = require('@grpc/proto-loader')

const db = require('./model/connect')
const postDb = require('./model/post')

const POST_PROTO_PATH = '../proto/post.proto'
const packageDefinition = protoloader.loadSync(POST_PROTO_PATH, {
    keepCase: true, // Maintain the case of field names as defined in the .proto file
    longs: String, // Treat 64-bit integers as strings
    enums: String, // Treat enum values as their string names
    defaults: true, // Include fields with default values
    oneofs: true // Represent `oneof` fields as a single object
});
const postProto = grpc.loadPackageDefinition(packageDefinition).post;

async function GetPost(call, callback) { //retrieving all posts by a username
    try {
        const { username } = call.request;
        const postData = await postDb.find({ username: username })
        if (postData) {
            callback(null, { postData: postData, status: "success" })
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                message: 'post not found',
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
    grpcServer.addService(postProto.PostService.service, { GetPost })
    grpcServer.bindAsync('127.0.0.1:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Post gRPC server running at 127.0.0.1:50052');
    })
}

main()
db()