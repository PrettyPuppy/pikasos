const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const path = require('path');
const range = require('express-range');
const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(range());

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://www.paypal.com', 'https://www.sandbox.paypal.com', 'https://accounts.google.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://rsms.me/inter/inter.css'],
      imgSrc: ["'self'", 'https://www.paypalobjects.com', 'https://lh3.googleusercontent.com', 'data:'], // Allow data: URLs
      connectSrc: ["'self'", 'https://www.paypal.com', 'https://www.sandbox.paypal.com'],
      frameSrc: ["'self'", 'https://www.sandbox.paypal.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      mediaSrc: ["'self'", 'https://imaginea.nyc3.digitaloceanspaces.com'],
    },
  })
);

app.use(helmet());

// parse json request body
app.use(express.json({ limit: '10mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

app.use(cors());

app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// app.use('/', (req, res) => {
//   res.send('Hello world');
//   // res.render('index.html')
//   // res.sendFile(path.join('index.html'));
//   // res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
// });

// if (config.env === 'production') {
//   app.use(express.static(path.join(__dirname, 'dist')));
//   // serve static files from the React build folder
//   app.get('/*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/dist/index.html'));
//   });
// }

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
