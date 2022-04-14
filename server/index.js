const express = require('express');
const app = express();
const mongoose = require('mongoose');
const FormModel = require('./models/Forms');

const cors = require('cors');

app.use(express.json());
app.use(cors());

mongoose.connect(
  'mongodb+srv://Admin:Admin123@cluster0.eqq9r.mongodb.net/praktyki?retryWrites=true&w=majority',
);

app.get('/getForms', (req, res) => {
  FormModel.find({}, (err, result) => {
    if (err) {
      res.json(err);
    } else {
      res.json(result);
    }
  });
});

app.get('/getForms/:id', (req, res) => {
  FormModel.find({ _id: req.params.id }, (err, result) => {
    if (err) {
      res.json(err);
    } else {
      res.json(result);
    }
  });
});

app.post('/updateForm/:id', (req, res) => {
  console.log(req.body);
  FormModel.updateOne({ _id: req.params.id }, { $set: { note: req.body.note } }, (err, result) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(result);
      console.log(result);
    }
  });
});

app.post('/createForm', async (req, res) => {
  const form = req.body;
  const newUser = new FormModel(form);
  await newUser.save();

  res.json(form);
});

app.listen(3001, () => {
  console.log('SERVER RUNS PERFECTLY!');
});
