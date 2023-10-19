const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");

const User = require("./user");
const Post = require("./post");
const Hashtag = require("./hashtag");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config.json")[env];

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;

// 사용하는 model들이 많아지는 경우, 자동화 방식 사용
const basename = path.basename(__filename);

// 숨김파일, index.js, .test.js를 제외한 .js 파일들
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      !file.startsWith(".") &&
      file !== basename &&
      file.endsWith(".js") &&
      !file.endsWith(".test.js")
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    console.log(file, model.name);
    db[model.name] = model;
    model.initiate(sequelize);
  });

Object.getOwnPropertyNames(db).forEach((modelName) => {
  db[modelName].associate && db[modelName].associate(db);
});

module.exports = db;
