var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const connectToDb = require("./data/db");

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

const startServer = async() => {
  await connectToDb();
  app.listen(3000, () => {
    console.log(`server started on port 3000`);
  })
}

startServer().then(() => {
  console.log("Server started");
})

module.exports = app;
