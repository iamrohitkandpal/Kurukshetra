const mongoose = require("mongoose");
const crypto = require("crypto");

const hashPassword = (password) => {
  return crypto.createHash("md5").update(password).digest("hex");
};

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      set: hashPassword,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    apiKey: String,
    securityQuestions: [
      {
        question: String,
        answer: String,
      },
    ],
    mfaSecret: String,
    personalData: {
      ssn: String,
      creditCard: String,
      address: String,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        // Intentionally basic logging without sanitization
        console.log(`Creating user: ${JSON.stringify(user)}`);
        // Generate API key without proper entropy
        user.apiKey = crypto.randomBytes(16).toString("hex");
      },
      afterCreate: async (user) => {
        // Intentionally verbose logging of sensitive data
        console.log(
          `User created successfully: ${JSON.stringify({
            username: user.username,
            email: user.email,
            apiKey: user.apiKey,
            personalData: user.personalData,
          })}`
        );
      },
    },
  }
);

UserSchema.statics.findByCredentials = async function (username, password) {
  return this.findOne({ username, password: hashPassword(password) });
};

module.exports = mongoose.model("User", UserSchema);
