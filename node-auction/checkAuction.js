const { scheduleJob } = require("node-schedule");
const { Op } = require("sequelize");
const { Good, Auction, User, sequelize } = require("./models");

module.exports = async () => {
  console.log("checkAuction");
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const targets = await Good.findAll({
      where: {
        SoldId: null,
        createdAt: {
          [Op.lte]: yesterday,
        },
      },
    });
    targets.forEach(async (good) => {
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
    const ongoing = await Good.findAll({
      where: {
        SoldId: null,
        createdAt: {
          [Op.gte]: yesterday,
        },
      },
    });
    ongoing.forEach((good) => {
      const end = new Date(good.createdAt);
      end.setDate(end.getDate() + 1);
      const job = scheduleJob(end, async () => {
        const t = await sequelize.transaction();
        try {
          const success = await Auction.findOne({
            where: {
              GoodId: good.id,
            },
            order: [["bid", "DESC"]],
            transaction: t,
          });
          await good.setSold(success.UserId, { transaction: t });
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
        console.error(err);
      });
      job.on("success", () => {
        console.log("스케줄링 성공");
      });
    });
  } catch (err) {
    console.error(err);
  }
};
