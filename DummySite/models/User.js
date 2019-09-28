const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  date: {type: Date, default: Date.now},
  balance: {type: Number, default: 1000},
  yesShares: [{
    contractID: {type: String, required: true},
    quantity: {type: Number, required: true},
  }],
  noShares: [{
    contractID: {type: String, required: true},
    quantity: {type: Number, required: true},
  }],
  transactionHistory: [{
    contractID: {type: String, required: true},
    yes: {type: Boolean, required: true},
    buy: {type: Boolean, required: true},
    price: {type: Number, required: true},
    quantity: {type: Number, required: true},
    date: {type: Date, required: true},
  }],
}, { strict: false });

module.exports = User = mongoose.model("users", UserSchema);
