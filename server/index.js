const express = require("express");
const app = express();
const mongoose = require("mongoose");
const FormModel = require("./models/Forms");
const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const cors = require("cors");
var nodemailer = require("nodemailer");

app.use(express.json());
app.use(cors());
console.log(process.env);
const userData = {
  login: "",
  password: "",
};

async function sendMail(name) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: userData.login, // generated ethereal user
      pass: userData.password, // generated ethereal password
    },
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from: "sledziuxjp@gmail.com", // sender address
    to: "d.sledz2bg@gmail.com, sledziuxjp@gmail.com",
    subject: "Hello ✔", // Subject line
    text: `Dzień dobry ${name}, \n\nDziękujemy za wypełnienie briefu. Pomoże nam w lepszym zrozumieniu czego dokładnie oczekujesz od swojej nowej strony internetowej / sklepu internetowego. Postaramy się w ciągu najbliższych 48 godzin roboczych odpowiedzieć z orientacyjną wyceną lub skontaktujemy się, aby doprecyzować niektóre elementy, gdyby były dla Nas niezrozumiałe.\n\nW załączniku przesyłamy kopię wypełnionego briefu jako potwierdzenie wypełnienia całego procesu - podczas rozmowy telefonicznej / mailowej będziemy na nim bazować i go rozbudowywać. \n\nPozdrawiamy, Zespół WBShop.pl`, // plain text body
    html: "", // html body
    attachments: [
      {
        filename: "brief.pdf",
        path: "./brief.pdf",
        contentType: "application/pdf",
      },
    ],
  });
}
console.log(process.env);
mongoose.connect(process.env.MONGODB_URL);

app.get("/getForms", (req, res) => {
  FormModel.find({}, (err, result) => {
    if (err) {
      res.json(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/getForms/:id", (req, res) => {
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

app.get("/getPDF/:id", (req, res) => {
  FormModel.find({ _id: req.params.id }, (err, result) => {
    if (err) {
      res.json(err);
    } else {
      const filename = result[0]?.object["Imię i nazwisko"]
        .normalize("NFKD")
        .replace(/[^\w\s.-_\/]/g, "");

      const doc = new PDFDocument({ bufferPages: true });
      const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-disposition": `attachment;filename=${filename}.pdf`,
      });

      doc.image("wb-logo.png", 500, 10, { scale: 0.2 });

      doc.on("data", (chunk) => stream.write(chunk));
      doc.on("end", () => stream.end());

      doc.font("Roboto-Medium.ttf");

      const text = Object.keys(result[0].object).map((key) => {
        if (key === "type") {
          return ["Typ", result[0].object[key]];
        }

        if (typeof result[0].object[key] === "object") {
          let str = "";

          result[0].object[key].forEach((element) => {
            str += element + ", ";
          });
          return [key, str];
        }
        return [key, result[0].object[key]];
      });

      doc.fontSize(20).text("Umowa o stworzenie: " + result[0].object.type);
      doc.text("\n");
      doc.text("\n");
      const table = {
        title: "",
        subtitle: result[0].object["Imię i Nazwisko"],
        headers: ["Pytanie", "Odpowiedź"],
        rows: text,
      };

      doc.table(table, {
        width: 500,
        prepareHeader: () => doc.font("Roboto-Medium.ttf").fontSize(10),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          doc.font("Roboto-Medium.ttf").fontSize(8);
          indexColumn === 0 && doc.addBackground(rectRow, "blue", 0.15);
        },
      });

      doc.pipe(fs.createWriteStream("brief.pdf"));

      doc.end();

      console.log("Imie i nazwisko:", result[0].object["Imię i nazwisko"]);

      sendMail(result[0].object["Imię i nazwisko"]);
    }
  });
});

app.post("/updateForm/:id", (req, res) => {
  console.log(req.body);
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

app.post("/createForm", async (req, res) => {
  const form = req.body;

  const newUser = new FormModel(form);
  await newUser.save();

  res.json(form);
});

app.listen(3001, () => {
  console.log("SERVER RUNS PERFECTLY!");
});
