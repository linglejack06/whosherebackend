const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const connectToDb = require('./data/db');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

const startServer = async () => {
  await connectToDb();
  app.listen(3000, () => {
    console.log('server started on port 3000');
  });
};

startServer();

module.exports = app;
