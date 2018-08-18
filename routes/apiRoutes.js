var db = require("../models");

module.exports = function(app) {

  // register
  app.post("/api/register", function(req, res) {
    console.log(req.body);
    db.User.create({
      username: req.body.username,
      password: req.body.password
    }).then(function(dbUser) {
        res.json(dbUser);
    }).catch(function(err) {
      res.json(err);
    });
  });

  // login
  app.get("/api/login", function(req, res) {
    db.User.findOne({
      where: {
        username: req.body.username,
        password: req.body.password
      }
    }).then(function(dbUser) {
      res.json(dbUser);
    }).catch(function(err) {
      res.json(err);
    });
  });

  // get day's data
  app.get("/api/prices/:day", function(req, res) {
    db.Company.findAll({
      where: {
        day: req.params.day
      }
    }).then(function(dbCompany) {
        res.json(dbCompany);
    }).catch(function(err) {
      res.json(err);
    });
  });

  // buy 1 stock (put portfolio table)
  app.post("/api/buy", function(req, res) {
    console.log(req.body);
    db.Portfolio.create({
      userid:   req.body.userid,
      ticker:   req.body.ticker,
      quantity: req.body.quantity,
      day:      req.body.day
    }).then(function(dbPortfolio) {
        res.json(dbPortfolio);
    }).catch(function(err) {
      res.json(err);
    });
  });

  // sell 1 stock (put portfolio table)
  app.delete("/api/sell", function(req, res) {
    db.Portfolio.destroy({
      where: {
        ticker: req.body.ticker
      }
    }).then(function(db) {
      res.json(dbPortfolio)
    }).catch(function(err) {
      res.json(err);
    });
  });
