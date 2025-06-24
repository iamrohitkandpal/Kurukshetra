const { DataTypes } = require("sequelize");
const crypto = require("crypto");

// A07:2021 - Authentication Failures: Weak password hashing
const hashPassword = (password) => {
  return crypto.createHash("md5").update(password).digest("hex");
};

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      // A02:2021 - Cryptographic Failures: Weak password storage
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue("password", hashPassword(value));
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
      },
      apiKey: DataTypes.STRING,
      // A02:2021 - Cryptographic Failures: Sensitive data in plaintext
      securityQuestions: {
        type: DataTypes.JSON,
        defaultValue: [],
        // Intentionally storing security questions without encryption
        get() {
          return this.getDataValue("securityQuestions");
        },
      },
      mfaSecret: {
        type: DataTypes.STRING,
        // Intentionally storing MFA secret in plaintext
        defaultValue: null,
        get() {
          return this.getDataValue("mfaSecret");
        },
      },
      // A02:2021 - Cryptographic Failures: Sensitive data exposure
      personalData: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
    },
    {
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          // Log user creation attempt
        },
        afterCreate: async (user) => {
          // Track successful creation
        },
      },
    }
  );

  // A03:2021 - Injection: SQL injection vulnerable method
  User.findByCredentials = async function (username, password) {
    // Intentionally vulnerable to SQL injection
    const query = `
      SELECT * FROM Users 
      WHERE username = '${username}' 
      AND password = '${hashPassword(password)}'
    `;
    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
  };

  return User;
};
