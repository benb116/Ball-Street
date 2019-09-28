const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const MarketSchema = new Schema({
  marketID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rules: { type: String, required: true },
  active: { type: Boolean, required: true },
  date: { type: Date, default: Date.now },
  resolutionDate: { type: Date, required: true },
  imageURL: { type: String },
  contracts: [{ 
    contractID: {type: String, required: true},
    contractName: { type: String, required: true },
    imageURL: { type: String },
    active: {type: Boolean, default: true},
  }],
});

module.exports = Market = mongoose.model("markets", MarketSchema);
