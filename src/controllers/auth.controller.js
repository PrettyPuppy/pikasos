const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { OAuth2Client, UserRefreshClient } = require('google-auth-library');
const { authService, userService, tokenService, emailService } = require('../services');
const { User } = require('../models');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, 'postmessage');
const client = new OAuth2Client(process.env.CLIENT_ID);

const google = catchAsync(async (req, res) => {
  const { tokens } = await oAuth2Client.getToken(req.body.code);
  const verify = async () => {
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();
    const password = 'sdlkjf@gj12Fh';

    if (await User.isEmailTaken(email)) {
      console.log('Email already token.');
      const user = await userService.getUserByEmail(email);
      const token = await tokenService.generateAuthTokens(user);
      res.send({ user, token });
    } else {
      const user = await userService.createUser({ name: name, email: email, password: password, picture: picture });
      const token = await tokenService.generateAuthTokens(user);
      res.status(httpStatus.CREATED).send({ user, token });
    }
  };

  verify().catch(console.error);
});

const googleRefreshToken = catchAsync(async (req, res) => {
  const user = new UserRefreshClient(process.env.CLIENT_ID, process.env.CLIENT_SECRET, req.body.refreshToken);
  const { credentials } = await user.refreshAccessToken();
  console.log(credentials);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  google,
  googleRefreshToken,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
