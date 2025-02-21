function setJWTInCookie(res, token) {
  res.cookie("jwt_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENVIRONMENT === "production",
    // sameSite: "strict",
    // maxAge: 300000, // 5 minutes
    maxAge: 3600000 * 2, //2 hours
    path: "/",
  });

  // console.log("After setting the cookie", res);
}

module.exports = setJWTInCookie;
