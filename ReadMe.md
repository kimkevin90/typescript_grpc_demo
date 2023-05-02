### 실습
1. Unary RPC (단일 요청-응답 패턴)
- 클라이언트가 서버에게 단일 요청 메시지를 보내고, 서버는 이에 대한 단일 응답 메시지를 보내는 방식입니다.
2. Server Streaming RPC (서버 스트리밍 패턴)
- 클라이언트가 서버에게 단일 요청 메시지를 보내고, 서버는 이에 대한 여러 개의 응답 메시지를 스트리밍하여 보내는 방식입니다.
3. Client Streaming RPC (클라이언트 스트리밍 패턴)
- 클라이언트가 여러 개의 요청 메시지를 스트리밍하여 보내고, 서버는 이에 대한 단일 응답 메시지를 보내는 방식입니다.
4. Bidirectional Streaming RPC (양방향 스트리밍 패턴)
- 클라이언트와 서버가 각각 스트리밍을 통해 여러 개의 메시지를 주고받을 수 있는 방식입니다.

### 기타
proto-gen.sh
- proto-loader-gen-types 패키지를 사용하여 gRPC 프로토콜 버퍼 파일(.proto)을 TypeScript 인터페이스 파일로 변환하는 역할을 합니다.
yarn proto-loader-gen-types 명령어를 통해 proto-loader-gen-types 패키지를 실행하며, 이 때 --grpcLib 옵션으로 @grpc/grpc-js를 지정하여 gRPC 클라이언트를 위한 라이브러리로 grpc-js를 사용하도록 설정합니다. --outDir 옵션으로는 변환된 TypeScript 인터페이스 파일을 저장할 디렉토리를 지정하며, 여기서는 proto/ 디렉토리에 저장하도록 설정합니다. 마지막으로 proto/*.proto로 지정하여 해당 디렉토리에 있는 모든 .proto 파일을 대상으로 변환 작업을 수행합니다.