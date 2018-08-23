module.exports = function(sequelize, DataTypes) {
  var Portfolio = sequelize.define("Portfolio", {
    stock_quantity: DataTypes.INTEGER,
    buy_price: DataTypes.DECIMAL(10,4)
  });

  Portfolio.associate = function(models) {
    // We're saying that a Post should belong to an Author
    // A Post can't be created without an Author due to the foreign key constraint
    Portfolio.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
      }
    });

    Portfolio.belongsTo(models.Company, {
      foreignKey: {
        allowNull: false
      }
    });
  };

return Portfolio;
};
