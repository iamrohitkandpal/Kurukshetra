const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Feedback = sequelize.define('Feedback', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      // A03:2021 - Injection: Store raw user input
      set(value) {
        this.setDataValue('content', value);
        // A03:2021 - Injection: Store raw HTML
        this.setDataValue('html', value);
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    html: {
      type: DataTypes.TEXT,
      // A03:2021 - Injection: No sanitization
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  return Feedback;
};