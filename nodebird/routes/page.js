const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const {
  renderProfile,
  renderJoin,
  renderMain,
  renderHashtag,
} = require("../controllers/page");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user?.Followers?.length ?? [];
  res.locals.followingCount = req.user?.Followings?.length ?? [];
  res.locals.followingIdList = req.user?.Followings.map((f) => f.id) ?? [];
  next();
});

router.get("/profile", isLoggedIn, renderProfile);
router.get("/join", isNotLoggedIn, renderJoin);
router.get("/hashtag", renderHashtag);
router.get("/", renderMain);

module.exports = router;
