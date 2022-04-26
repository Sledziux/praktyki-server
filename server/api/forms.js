const express = require("express");
const router = express.Router();

const FormModel = require("../models/Forms");

router.get("/", (req, res) => res.send("Hello world!"));

router.get("/getForms", (req, res) => {
  FormModel.find({}, (err, result) => {
    if (err) {
      res.json(err);
    } else {
      res.json(result);
    }
  });
});

router.get("/getForms/:id", (req, res) => {
  FormModel.find({ _id: req.params.id }, (err, result) => {
    if (err) {
      res.json(err);
    } else {
      res.json({
        result,
      });
    }
  });
});

router.post("/updateForm/:id", (req, res) => {
  FormModel.updateOne(
    { _id: req.params.id },
    { $set: { note: req.body.note } },
    (err, result) => {
      if (err) {
        res.json(err);
        console.log(err);
      } else {
        res.json(result);
        console.log(result);
      }
    }
  );
});

router.post("/createForm", async (req, res) => {
  const form = req.body;

  const newUser = new FormModel(form);
  await newUser.save();

  res.json(form);
});

module.exports = router;
