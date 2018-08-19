module.exports = function(sequelize, DataTypes) {
  var Company = sequelize.define("Company", {
    company: DataTypes.STRING,
    date: DataTypes.DATE,
    day: DataTypes.INTEGER,
    close: DataTypes.FLOAT
  });

  Company.associate = function(models) {
    
    Company.hasMany(models.Portfolio, {
      onDelete: "cascade"
    });

  };

  return Company;
};
