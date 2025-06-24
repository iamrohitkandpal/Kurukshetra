const path = require('path');

module.exports = (sequelize) => {
  const models = {
    User: require(path.join(__dirname, 'User'))(sequelize),
    Product: require(path.join(__dirname, 'Product'))(sequelize),
    Feedback: require(path.join(__dirname, 'Feedback'))(sequelize),
    Webhook: require(path.join(__dirname, 'Webhook'))(sequelize),
    Progress: require(path.join(__dirname, 'Progress'))(sequelize),
    AuditLog: require(path.join(__dirname, 'AuditLog'))(sequelize)
  };

  Object.values(models).forEach(model => {
    if (model.associate) {
      model.associate(models);
    }
  });

  return models;
};