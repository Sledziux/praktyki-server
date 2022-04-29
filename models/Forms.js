const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema({
  object: {
    type: Object,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
});

const FormModel = mongoose.model("forms", FormSchema);
module.exports = FormModel;
