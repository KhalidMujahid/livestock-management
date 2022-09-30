const { connect } = require("mongoose");

connect("mongodb://localhost/Livestock")
  .then(() => console.log("DB connected"))
  .catch((error) => console.log(error));
