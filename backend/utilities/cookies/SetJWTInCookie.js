function setJWTInCookie(res, token) {
  res.cookie("jwt_token", token, {
    httpOny: true,
    secure: process.env.NODE_ENVIRONMENT === "production",
    // sameSite: "strict",
    // maxAge: 300000, // 5 minutes
    maxAge: 3600000, //1 hour
    path: "/",
  });
}

module.exports = setJWTInCookie;
