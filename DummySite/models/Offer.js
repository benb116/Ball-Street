const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const OfferSchema = new Schema({
  offerID: { type: String, default: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), unique: true },
  contractID: { type: String, required: true },
  offeror: { type: String, required: true },
  buy: { type: Boolean, required: true },
  yes: { type: Boolean, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  filled: { type: Boolean, default: false },
});

module.exports = Offer = mongoose.model("offers", OfferSchema);
