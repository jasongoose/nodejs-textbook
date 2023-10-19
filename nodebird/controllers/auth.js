const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

exports.join = async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({
      where: {
        email,
      },
    });
    if (exUser) {
      res.redirect("/join?error=exist");
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.login = (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      next(authError);
      return;
    }
    if (!user) {
      res.redirect(`/?loginErrors=${info.message}`);
      return;
    }
    req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        next(loginError);
        return;
      }
      res.redirect("/");
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
};
