const { model, Schema } = require("mongoose");

const DogSchema = new Schema(
  {
    name: String,
    image: String,
    height: Number,
    color: String,
    health: String,
  },
  { timestamps: true }
);

module.exports = model("Dog", DogSchema);
