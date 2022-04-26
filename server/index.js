const express = require("express");
const cors = require("cors");
const connectToDB = require("./config/db");

const forms = require("./api/forms");
const pdfs = require("./api/pdf");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/forms", forms);
app.use("/api/pdf", pdfs);

connectToDB();

app.get("/", (req, res) => res.send("Hello world!"));

app.listen(3001, () => {
  console.log("SERVER RUNS PERFECTLY!");
});
