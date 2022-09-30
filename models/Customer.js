const { model, Schema } = require("mongoose");

const CustomerSchema = new Schema(
  {
    fname: String,
    lname: String,
    phone_number: String,
    email: String,
    dog: {
      type: Schema.Types.ObjectId,
      ref: "Dog",
    },
    seller_fname: String,
    seller_lname: String,
    seller_phone_number: String,
    seller_email: String,
  },
  { timestamps: true }
);

module.exports = model("Customer", CustomerSchema);
