const mongoose = require("mongoose");

const MONGO_URL = `mongodb://${process.env.MONGO_ID}:${process.env.MONGO_PASSWORD}@127.0.0.1:27017/admin`;

const connect = () => {
  if (process.env.NODE_ENV !== "production") {
    mongoose.set("debug", true);
  }
  mongoose
    .connect(MONGO_URL, {
      dbName: "gifchat",
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("몽고디비 연결 성공");
    })
    .catch((err) => {
      console.error("몽고디비 연결 에러", err);
    });
  mongoose.connection.on("error", (err) => {
    console.error("몽고디비 연결 에러", err);
  });
  mongoose.connection.on("disconnected", () => {
    console.error("몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.");
    connect();
  });
};

module.exports = connect;
