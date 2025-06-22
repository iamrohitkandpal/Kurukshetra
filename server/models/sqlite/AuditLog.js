const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
      allowNull: false
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // A09:2021 - Store sensitive request data
    requestData: {
      type: DataTypes.JSON,
      allowNull: false
    },
    // A09:2021 - Store sensitive response data
    responseData: DataTypes.JSON,
    // A09:2021 - Store user credentials and tokens
    sessionData: DataTypes.JSON,
    // A09:2021 - Store raw error details
    error: DataTypes.JSON,
    userAgent: DataTypes.STRING,
    ip: DataTypes.STRING,
    path: DataTypes.STRING,
    method: DataTypes.STRING,
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: false
  });

  return AuditLog;
};