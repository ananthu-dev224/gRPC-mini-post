const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const userDb = require('./model/userSchema')
const db = require('./model/connect')

const PROTO_PATH = '../proto/auth.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {})
const authProto = grpc.loadPackageDefinition(packageDefinition).auth

async function GetUser(call, callback) {
    try {
        const { userId } = call.request;
        const userData = await userDb.findOne({ _id: userId })
        if (userData) {
            callback(null, { userId: userId, username: userData.username, email: userData.email, status: "success" })
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                message: 'User not found',
            })
        }
    } catch (err) {
        callback({
            code: grpc.status.INTERNAL,
            message: err.message,
        });
    }
}


function main() {
    const grpcServer = new grpc.Server()
    grpcServer.addService(authProto.AuthService.service, { GetUser })
    grpcServer.bindAsync('127.0.0.1:50051',grpc.ServerCredentials.createInsecure(),(err, port) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('Auth gRPC server running at 127.0.0.1:50051');
      });
}


main()
db()