const SocketIO = require("socket.io");
const { removeRoom } = require("./services");

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, {
    path: "/socket.io",
  });

  app.set("io", io);

  const room = io.of("/room"); // 소켓에 namespace 부여
  const chat = io.of("/chat");

  chat.use(wrap(sessionMiddleware));

  room.on("connection", (socket) => {
    console.log(`socket::${socket.id} room 네임스페이스에 접속`);
    socket.on("disconnect", () => {
      console.log(`socket::${socket.id} room 네임스페이스 접속 해제`);
    });
  });

  chat.on("connection", (socket) => {
    console.log(`socket::${socket.id} chat 네임스페이스에 접속`);
    socket.on("join", (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit("join", {
        user: "system",
        chat: `${socket.request.session.color}님이 입장하셨습니다.`,
      });
    });
    socket.on("disconnect", async () => {
      console.log(`socket::${socket.id} chat 네임스페이스 접속 해제`);
      const { referer } = socket.request.headers;
      const roomId = new URL(referer).pathname.split("/").at(-1);
      const userCount = chat.adapter.rooms.get(roomId)?.size ?? 0;
      if (userCount === 0) {
        try {
          await removeRoom(roomId);
          room.emit("removeRoom", roomId);
          console.log("방 제거 요청 성공");
        } catch (err) {
          console.log("방 제거 요청 실패");
          console.error(err);
        }
      } else {
        socket.to(roomId).emit("exit", {
          user: "system",
          chat: `${socket.request.session.color}님이 퇴장하셨습니다.`,
        });
      }
    });
  });
};
