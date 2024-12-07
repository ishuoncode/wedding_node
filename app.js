const express = require('express');

const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const passport =require("./utils/passport");
const AuthRoutes = require("./router/authRoutes");
const UserRoutes = require('./router/userRoutes');
const DecorRoutes = require('./router/decorRoutes');
const BanquetRoutes = require('./router/banquetRoutes');
const PhotographerRoutes = require('./router/photographerRoutes');
const SellerRoutes = require('./router/sellerRoutes');
const CatererRoutes = require('./router/catererRoutes');
const AdminRatingRoutes = require('./router/adminRatingRoutes');
const AppointmentRoutes = require('./router/appointmentRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Create an instance of an Express application
const app = express();

// app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  app.use(cookieParser('secret'));
  app.use(express.json());
  passport(app);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(helmet());
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
app.use(mongoSanitize());
app.use(xss());
app.use(compression());
const limiter = rateLimit({
    max: 300,
    windowMs: 60 * 20 * 1000,
    message: 'Too many requests from this IP address, Please try again after 20 minutes!',
  });
  app.use('/api', limiter);
  app.use(cors({ credentials: true, origin: true }));  
  
app.use('/api/auth',AuthRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/decor', DecorRoutes);
app.use('/api/banquet', BanquetRoutes);
app.use('/api/photographer', PhotographerRoutes);
app.use('/api/seller', SellerRoutes);
app.use('/api/caterer', CatererRoutes);
app.use('/api/adminRating', AdminRatingRoutes);
app.use('/api/appointment', AppointmentRoutes);


app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });
  
  app.use(globalErrorHandler);

module.exports = app;