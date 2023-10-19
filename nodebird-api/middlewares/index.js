const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { Domain } = require("../models");

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인 필요");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    const message = encodeURIComponent("로그인한 상태입니다.");
    res.redirect(`/?error=${message}`);
  } else {
    next();
  }
};

exports.verifyToken = (req, res, next) => {
  try {
    res.locals.decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.status(419).json({
        code: 419,
        message: "토큰이 만료되었습니다.",
      });
      return;
    }
    res.status(401).json({
      code: 401,
      message: "유효하지 않은 토큰입니다.",
    });
  }
};

exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode,
      message: "1분에 한번만 요청할 수 있습니다.",
    });
  },
});

exports.deprecated = (req, res) => {
  res.status(410).json({
    code: 410,
    message: "새로운 버전이 나왔습니다. 새로운 버전을 사용하세요.",
  });
};

exports.corsWhenDomainMatches = async (req, res, next) => {
  const domain = await Domain.findOne({
    where: {
      host: new URL(req.get("Origin")).host,
    },
  });
  if (domain) {
    cors({
      origin: req.get("Origin"),
      credentials: true,
    })(req, res, next);
  } else {
    next();
  }
};
