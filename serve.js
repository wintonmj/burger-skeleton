// Inspired by https://gist.github.com/icebob/0dda386fceb8e14b91d84d057fac676f
"use strict";

// Generate webpack config with CLI service
const webpackConfig = require("@vue/cli-service/webpack.config.js");

// Create express app
const express = require("express");
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Configure webpack as middleware
const webpack = require("webpack");

webpackConfig.entry.app.unshift('webpack-hot-middleware/client');
const compiler = webpack(webpackConfig);
const devMiddleware = require('webpack-dev-middleware'); // eslint-disable-line
app.use(devMiddleware(compiler, {
  noInfo: false,
  publicPath: webpackConfig.output.publicPath,
  headers: { "Access-Control-Allow-Origin": "*" },
  stats: { colors: true }
}));

const hotMiddleware = require('webpack-hot-middleware'); // eslint-disable-line
app.use(hotMiddleware(compiler, {
  log: console.log
}));

// Read in the "class" to store all our data on the server side
// If you need to change how data is handled, check the dataHandler.js file!
const Data = require("./dataHandler.js");

var data = new Data();
data.initializeData();

io.on('connection', function (socket) {
  let uiLang = "en";

  // Send list of orders and text labels when a client connects
  socket.on('pageLoaded', function () {
    socket.emit('initialize', {
      orders: data.getAllOrders(),
      uiLabels: data.getUILabels(uiLang),
      ingredients: data.getIngredients(),
      notDone: data.getNotDone(),
      isDone: data.getIsDone()

    });
  });

  // When someone orders something
  socket.on('order', function (order) {
    var orderIdAndName = data.addOrder(order);
    // send updated info to all connected clients, note the use of io instead of socket
    socket.emit('orderNumber', orderIdAndName);
    io.emit('currentQueue', {
      orders: data.getAllOrders(),
      ingredients: data.getIngredients(),
      notDone: data.getNotDone(),
      isDone: data.getIsDone()
    });
  });
  // send UI labels in the chosen language
  socket.on('switchLang', function (lang) {
    uiLang=lang;
    socket.emit('switchLang', data.getUILabels(lang));
  });
  // when order is marked as done, send updated queue to all connected clients
  socket.on('orderDone', function (orderId) {
    data.markOrderDone(orderId);
    io.emit('currentQueue', { orders: data.getAllOrders(), notDone: data.getNotDone(), isDone: data.getIsDone() });
  });

  socket.on('itemDone', function (orderId, category) {
    data.markItemDone(orderId, category);
    io.emit('currentQueue', { orders: data.getAllOrders(), notDone: data.getNotDone(), isDone: data.getIsDone() });
  });

  socket.on('orderStarted', function (orderId) {
    data.markOrderStarted(orderId);
    io.emit('currentQueue', { orders: data.getAllOrders(), notDone: data.getNotDone(), isDone: data.getIsDone() });
  });

  socket.on('orderNotStarted', function (orderId) {
    data.markOrderNotStarted(orderId);
    io.emit('currentQueue', { orders: data.getAllOrders(), notDone: data.getNotDone(), isDone: data.getIsDone() });
  });

  socket.on('updateStock', function (item, saldo) {
    data.changeStock(item, saldo);
    io.emit('currentQueue', { ingredients: data.getIngredients() });
  });

  socket.on('popup', function (data) {
    console.log(data.data);
    console.log(data.counter);
    io.emit('openPopup', {data: data.data, counter: data.counter, cart: data.cart})
  });

  socket.on('incrementCounterDrinks', function (data) {
    io.emit('incrementCounterDrinks', {data: data.data})
  });

  socket.on('incrementCounterSides', function (data) {
    io.emit('incrementCounterSides', {data: data.data})
  });

  socket.on('incrementCounterPremadeBurgers', function (data) {
    io.emit('incrementCounterPremadeBurgers', {data: data.data})
  });

  socket.on('decrementCounterDrinks', function (data) {
    io.emit('decrementCounterDrinks', {data: data.data})
  });

  socket.on('decrementCounterSides', function (data) {
    io.emit('decrementCounterSides', {data: data.data})
  });

  socket.on('decrementCounterPremadeBurgers', function (data) {
    io.emit('decrementCounterPremadeBurgers', {data: data.data})
  });

});

const port = 8080;
http.listen(port, function () {
  console.log("Developer server running on http://localhost:" + port);
});
