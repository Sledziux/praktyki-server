const mongoose = require("mongoose");

const connectToDB = () => {
  mongoose.connect(
    "mongodb+srv://Admin:Admin123@cluster0.eqq9r.mongodb.net/praktyki?retryWrites=true&w=majority"
  );
};

module.exports = connectToDB;
