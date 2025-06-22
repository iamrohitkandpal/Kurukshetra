const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    category: DataTypes.STRING,
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // A04:2021 - Insecure Design: No validation
    metadata: DataTypes.JSON,
    createdById: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  // A03:2021 - Injection: SQL injection vulnerable search
  Product.search = async function(query) {
    // Intentionally vulnerable to SQL injection
    const rawQuery = `
      SELECT * FROM Products 
      WHERE name LIKE '%${query}%' 
      OR description LIKE '%${query}%'
    `;
    return sequelize.query(rawQuery, { type: sequelize.QueryTypes.SELECT });
  };

  return Product;
};