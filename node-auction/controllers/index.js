const { Op } = require("sequelize");
const { Good, Auction, User, sequelize } = require("../models");
const schedule = require("node-schedule");

exports.renderMain = async (req, res, next) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const goods = await Good.findAll({
      where: {
        SoldId: null,
        createdAt: {
          [Op.gte]: yesterday,
        },
      },
    });
    res.render("main", {
      title: "NodeAuction",
      goods,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.renderJoin = (req, res, next) => {
  res.render("join", {
    title: "회원가입 - NodeAuction",
  });
};

exports.renderGood = (req, res, next) => {
  res.render("good", {
    title: "상품등록 - NodeAuction",
  });
};

exports.createGood = async (req, res, next) => {
  try {
    const { name, price } = req.body;
    const good = await Good.create({
      OwnerId: req.user.id,
      name,
      img: req.filename,
      price,
    });
    const end = new Date();
    end.setDate(end.getDate() + 1);
    const job = schedule.scheduleJob(end, async () => {
      const t = await sequelize.transaction();
      try {
        const success = await Auction.findOne({
          where: {
            GoodId: good.id,
          },
          order: [["bid", "DESC"]],
          transaction: t,
        });
        await good.setSold(success.UserId, {
          transaction: t,
        });
        await User.update(
          {
            money: sequelize.literal(`money - ${success.bid}`),
          },
          {
            where: {
              id: success.UserId,
            },
            transaction: t,
          }
        );
        await t.commit();
      } catch (err) {
        await t.rollback();
      }
    });
    job.on("error", (err) => {
      console.error("스케줄링 에러", err);
    });
    job.on("success", () => {
      console.log("스케줄링 성공");
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.renderAuction = async (req, res, next) => {
  try {
    const [good, auction] = await Promise.all([
      Good.findOne({
        where: {
          id: req.params.id,
        },
        include: {
          model: User,
          as: "Owner",
        },
      }),
      Auction.findAll({
        where: {
          GoodId: req.params.id,
        },
        include: {
          model: User,
        },
        order: [["bid", "ASC"]],
      }),
    ]);
    res.render("auction", {
      title: `${good.name} - NodeAuction`,
      good,
      auction,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.bid = async (req, res, next) => {
  try {
    const { bid, msg } = req.body;
    const good = await Good.findOne({
      where: {
        id: req.params.id,
      },
      include: {
        model: Auction,
      },
      order: [
        [
          {
            model: Auction,
          },
          "bid",
          "DESC",
        ],
      ],
    });
    if (!good) {
      return res.status(404).send("해당 상품은 존재하지 않습니다.");
    }
    if (good.price >= bid) {
      return res.status(403).send("시작 가격보다 높게 입찰해야 합니다.");
    }
    if (new Date(good.createdAt).valueOf() + 24 * 60 * 60 * 1000 < new Date()) {
      return res.status(403).send("경매가 이미 종료되었습니다.");
    }
    if (good.Auctions?.bid >= bid) {
      return res.status(403).send("이전 입찰가보다 높아야 합니다.");
    }
    const result = await Auction.create({
      bid,
      msg,
      UserId: req.user.id,
      GoodId: req.params.id,
    });
    req.app.get("io").to(req.params.id).emit("bid", {
      bid: result.bid,
      msg: result.msg,
      nick: req.user.nick,
    });
    return res.send("ok");
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

exports.renderList = async (req, res, next) => {
  try {
    const goods = await Good.findAll({
      where: {
        SoldId: req.user.id,
      },
      include: {
        model: Auction,
      },
      order: [
        [
          {
            model: Auction,
          },
          "bid",
          "DESC",
        ],
      ],
    });
    res.render("list", {
      title: "낙찰목록 - NodeAuction",
      goods,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
