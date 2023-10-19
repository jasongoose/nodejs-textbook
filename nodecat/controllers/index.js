const axios = require("axios");

const axiosInst = axios.create({
  headers: {
    ORIGIN: process.env.ORIGIN,
  },
});

exports.test = async (req, res, next) => {
  try {
    if (!req.session.jwt) {
      const tokenResult = await axiosInst.post(`${process.env.API_URL}/token`, {
        clientSecret: process.env.CLIENT_SECRET,
      });
      if (tokenResult.data?.code === 200) {
        req.session.jwt = tokenResult.data.token;
      } else {
        return res.json(tokenResult.data);
      }
    }
    const result = await axiosInst.get(`${process.env.API_URL}/test`, {
      headers: {
        authorization: req.session.jwt,
      },
    });
    return res.json(result.data);
  } catch (err) {
    console.error(err);
    if (err.response?.status === 419) {
      return res.json(err.response.data);
    }
    return next(err);
  }
};

const request = async (req, api) => {
  try {
    if (!req.session.jwt) {
      const tokenResult = await axiosInst.post(`${process.env.API_URL}/token`, {
        clientSecret: process.env.CLIENT_SECRET,
      });
      req.session.jwt = tokenResult.data.token;
    }
    return await axiosInst.get(process.env.API_URL + api, {
      headers: {
        authorization: req.session.jwt,
      },
    });
  } catch (err) {
    if (err.response?.status === 419) {
      delete req.session.jwt;
      return request(req, api);
    }
    return err.response;
  }
};

exports.searchByHashtag = async (req, res) => {
  try {
    const result = await request(
      req,
      `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`
    );
    res.json(result.data);
  } catch (err) {
    if (err.code) {
      console.error(err);
      next(err);
    }
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const result = await request(req, "/posts/my");
    res.json(result.data);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.renderMain = (req, res) => {
  res.render("main", {
    key: process.env.CLIENT_SECRET,
  });
};
