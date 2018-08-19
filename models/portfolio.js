module.exports = function(sequelize, DataTypes) {
  var Portfolio = sequelize.define("Portfolio", {
    stock_quantity: DataTypes.INTEGER,
    buy_price: DataTypes.DECIMAL
  });

return Portfolio;
};
