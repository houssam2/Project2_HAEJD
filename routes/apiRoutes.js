"use strict";

var db = require("../models");

module.exports = function(sequelize, app) {

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
  app.post("/api/login", function(req, res) {
    console.log(req.body);
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

  app.delete("/api/portfolio/:userid", function(req, res) {
    db.Portfolio.destroy({
      where: {
        UserId: req.params.userid
      }
    }).then(function(dbPortfolio) {
      res.json(dbPortfolio);
    });
  });

  const MAXDAY = 30;  // Test only

  // get day's data
  app.get("/api/prices/:day", function(req, res) {
    let current_day = req.params.day;
    if (current_day > MAXDAY) {
      current_day = 1000000; // Simulate end of prices. 
    }
    db.Company.findAll({
      where: {
        day: current_day
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
      UserId:         req.body.userid,
      CompanyId:      req.body.companyid,
      stock_quantity: req.body.stock_quantity,
      buy_price:      req.body.buy_price
    }).then(function(dbPortfolio) {
        res.json(dbPortfolio);
    }).catch(function(err) {
      res.json(err);
    });
  });

  //Model.update({ field: sequelize.literal('field + 2') }, { where: { id: model_id } });

  // sell 1 stock (put portfolio table)
  app.put("/api/sell", function(req, res) {
    var sell_qty =  req.body.stock_quantity;
    var literal = "stock_quantity - " + sell_qty; // "stock_quantity - 30"
    console.log(literal);
    db.Portfolio.update({
      stock_quantity: sequelize.literal(literal)
    }, {
      where: {
        id: req.body.id
      }
    }).then(function(dbPortfolio) {
      // Get new stock quantity, since the update only return number of rows updated
      console.log("************" + JSON.stringify(dbPortfolio));
      db.Portfolio.findOne({
        where: {
          id: req.body.id
        }
      }).then(function(dbGetRes) {
        // If the user sells all stocks for a particular company (quantity = 0), 
        // then delete portfolio row for that company
        if (dbGetRes.stock_quantity <= 0) {
          db.Portfolio.destroy({
            where: {
              id: dbGetRes.id
            }
          }).then(function(dbDelRes) {
            res.json(dbGetRes)
          }).catch(function(err) {
            res.json(err);
          });
        } else {
          res.json(dbGetRes);
        }
      });
    }).catch(function(err) {
        res.json(err);
      });
  });
}

