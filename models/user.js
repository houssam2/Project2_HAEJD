module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    // Giving the User model a name of type STRING
    username: DataTypes.STRING,
    password:DataTypes.STRING
  });

  User.associate = function(models) {
    // Associating User with Portfolio
    // When an User is deleted, also delete any associated 
    User.hasMany(models.Portfolio, {
      onDelete: "cascade"
    });
  };

  return User;
};
