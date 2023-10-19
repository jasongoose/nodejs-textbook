const jwt = require("jsonwebtoken");
const { Domain, User, Post, Hashtag } = require("../models");

exports.createToken = async (req, res) => {
  const { clientSecret } = req.body;
  try {
    const domain = await Domain.findOne({
      where: {
        clientSecret,
      },
      include: {
        model: User,
        attribute: ["nick", "id"],
      },
    });
    if (!domain) {
      res.status(401).json({
        code: 401,
        message: "등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요.",
      });
      return;
    }
    const token = jwt.sign(
      {
        id: domain.User.id,
        nick: domain.User.nick,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30m",
        issuer: "nodebird",
      }
    );
    res.json({
      code: 200,
      message: "토큰이 발급되었습니다.",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: "서버 에러",
    });
  }
};

exports.tokenTest = (req, res) => {
  res.json(res.locals.decoded);
};

exports.getMyPosts = (req, res) => {
  Post.findAll({
    where: {
      UserId: res.locals.decoded.id,
    },
  })
    .then((posts) => {
      console.log(posts);
      res.json({
        code: 200,
        payload: posts,
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: "서버 에러",
      });
    });
};

exports.getPostsByHashTag = async (req, res) => {
  try {
    const hashtag = await Hashtag.findOne({
      where: {
        title: req.params.title,
      },
    });
    if (!hashtag) {
      return res.status(404).json({
        code: 404,
        message: "검색결과가 없습니다.",
      });
    }
    const posts = await hashtag.getPosts();
    return res.json({
      code: 200,
      payload: posts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "서버 에러",
    });
  }
};
