/* global log */
'use-strict';

const app = require('koa')();
const compress = require('koa-compress');
const router = require('koa-router')();
const logger = require('koa-logger');
const serve = require('koa-static');
const views = require('koa-views');
const io = require('socket.io').listen(app.listen(5000));

const index = require('./routes/index');

const cards = (require('./public/cards.json'));
const games = ['disgame'];
const users = [];

// global middlewares
app.use(views('views', {
  root: `${__dirname}/views`,
  default: 'jade',
}));

app.use(logger());
app.use(compress({
  threshold: 0,
}));

app.use(function*(next) {
  const start = new Date;
  yield next;
  const ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

app.use(serve(`${__dirname}/public/javascripts`));

// routes definition
router.use('/', index.routes(), index.allowedMethods());

// mount root routes
app.use(router.routes());

app.on('error', (err, ctx) => {
  log.error('server error', err, ctx);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  io.emit('games', games);
  socket.on('new user', (user) => {
    users.push(user);
    console.log(users);
    socket.broadcast.emit('user added', user);
  });
  socket.on('request cards', () => {
    io.emit('give cards', cards);
  });
  socket.on('request questions', (questions) => {
    io
  })
});
