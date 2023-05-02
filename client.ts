import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import readline from 'readline';
import { ProtoGrpcType } from './proto/random';

const PORT = 8082;
const PROTO_FILE = './proto/random.proto';

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE));
const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType;

const client = new grpcObj.randomPackage.Random(
  `0.0.0.0:${PORT}`, grpc.credentials.createInsecure(),
);

const onClientReady = () => {
  client.PingPong({ message: 'Ping' }, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log('PingPong result : ', result);
  });

  const streamRandomNumber = client.RandomNumbers({ maxVal: 85 });
  streamRandomNumber.on('data', (chunk) => {
    console.log('RandomNumbers chunk', chunk);
  });
  streamRandomNumber.on('end', () => {
    console.log('communication ended');
  });

  const stream = client.TodoList((err, result) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log(result);
  });

  stream.write({ todo: 'walk', status: 'wating' });
  stream.write({ todo: 'walk1', status: 'wating1' });
  stream.write({ todo: 'walk2', status: 'wating2' });
  stream.end();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const username = process.argv[2];
  if (!username) console.error("No username, can't join chat"), process.exit();


  const metadata = new grpc.Metadata();
  metadata.set('username', username);
  const call = client.Chat(metadata);

  call.write({
    message: 'register',
  });

  call.on('data', (chunk) => {
    console.log(`${chunk.username} ==> ${chunk.message}`);
  });

  rl.on('line', (line) => {
    if (line === 'quit') {
      call.end();
    } else {
      call.write({
        message: line,
      });
    }
  });
};

const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5);
client.waitForReady(deadline, (err) => {
  if (err) {
    console.error(err);
    return;
  }

  onClientReady();
});
