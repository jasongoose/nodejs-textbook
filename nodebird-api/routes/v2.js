const express = require("express");
const cors = require("cors");

const {
  verifyToken,
  apiLimiter,
  corsWhenDomainMatches,
} = require("../middlewares");

const {
  createToken,
  tokenTest,
  getMyPosts,
  getPostsByHashTag,
} = require("../controllers/v2");

const router = express.Router();

router.use(corsWhenDomainMatches);

router.post("/token", apiLimiter, createToken);
router.get("/test", apiLimiter, verifyToken, tokenTest);
router.get("/posts/my", apiLimiter, verifyToken, getMyPosts);
router.get("/posts/hashtag/:title", apiLimiter, verifyToken, getPostsByHashTag);

module.exports = router;
