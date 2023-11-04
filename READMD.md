# Node.js 교과서 실습 프로젝트

[Node.js 교과서(개정 3판)](https://product.kyobobook.co.kr/detail/S000200437346)로 공부하면서 실습한 프로젝트들을 monorepo 구조로 정리했습니다.

## 기술스택

- 서버 - express
- 템플릿 엔진 - nunjucks
- DB - mysql, mongoDB
- ORM - sequelize, mongoose
- 인증 - passport
- 소켓통신 - socket.io
- 단위 테스트 - jest
- 통합 테스트 - supertest
- 부하 테스트 - artillery

## 프로젝트

### nodebird

로그인/로그아웃, 게시물 업로드, 댓글 작성, 해시태그 검색, 팔로잉 등의 기능들을 지원하는 SNS 웹앱입니다.

### nodebird-api

nodebird와 db를 공유하여 게시글, 해시태그, 사용자 정보를 JSON 형식으로 제공하는 API 서버입니다. 인증수단으로 JWT 토큰을 사용합니다.

### nodecat

nodebird-api 서비스를 이용하는 클라이언트 웹 서버입니다.

### gif-chat

웹 소켓 기반 실시간 양방향 채팅을 제공하는 서버입니다.

### node-cli

node 기반 cli 명령어를 제공하는 패키지입니다.
