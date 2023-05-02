import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './proto/random';
import { RandomHandlers } from './proto/randomPackage/Random';
import { TodoResponse } from './proto/randomPackage/TodoResponse';
import { TodoRequest } from './proto/randomPackage/TodoRequest';
import { ChatRequest } from './proto/randomPackage/ChatRequest';
import { ChatResponse } from './proto/randomPackage/ChatResponse';

const PORT = 8082;
const PROTO_FILE = './proto/random.proto';

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE));
const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType;
const { randomPackage } = grpcObj;


const todoList: TodoResponse = { todos: [] };
const callObjByUsername = new Map<string, grpc.ServerDuplexStream<ChatRequest, ChatResponse>>();

function getServer() {
  const server = new grpc.Server();
  server.addService(randomPackage.Random.service, {
    PingPong: (req, res) => {
      console.log('req : ', req.request);
      res(null, { message: 'Pong' });
    },
    // Client Stream
    RandomNumbers: (call) => {
      const { maxVal = 10 } = call.request;
      console.log('RandomNumbers server maxVal :', maxVal);

      let runCount = 0;
      const id = setInterval(() => {
        runCount = ++runCount;
        call.write({ num: Math.floor(Math.random() * maxVal) });
        if (runCount >= 10) {
          clearInterval(id);
          // end communication with client
          call.end();
        }
      }, 500);
    },
    // Server Stream
    // repeated으로 인해 지난 client 요청도 보냄
    TodoList: (call, callBack) => {
      call.on('data', (chunk: TodoRequest) => {
        console.log('TodoList server chunk :', chunk);
        todoList.todos?.push(chunk);
      });

      call.on('end', () => {
        callBack(null, { todos: todoList.todos });
      });
    },
    // Bidirectional Streaming
    Chat: (call) => {
      call.on('data', (req) => {
        const username = call.metadata.get('username')[0] as string;
        const msg = req.message;
        console.log('username : ', username);
        console.log('req.message : ', req.message);


        for (const [user, usersCall] of callObjByUsername) {
          if (username !== user) {
            usersCall.write({
              username,
              message: msg,
            });
          }
        }

        if (callObjByUsername.get(username) === undefined) {
          callObjByUsername.set(username, call);
        }
      });

      call.on('end', () => {
        const username = call.metadata.get('username')[0] as string;
        callObjByUsername.delete(username);
        for (const [user, usersCall] of callObjByUsername) {
          usersCall.write({
            username,
            message: 'Has Left the Chat!',
          });
        }
        console.log(`${username} is ending their chat session`);

        call.write({
          username: 'Server',
          message: `See you later ${username}`,
        });

        call.end();
      });
    },

  }as RandomHandlers);

  return server;
}

function main() {
  const server = getServer();
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`server is running :  ${port}`);
      server.start();
    });
}

main();
