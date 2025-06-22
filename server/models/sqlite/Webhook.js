const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Webhook = sequelize.define('Webhook', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // A10:2021 - SSRF: No URL validation
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    events: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    secret: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
      allowNull: false
    },
    // A04:2021 - Insecure Design: Store response data
    lastResponse: DataTypes.JSON,
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true
  });

  return Webhook;
};