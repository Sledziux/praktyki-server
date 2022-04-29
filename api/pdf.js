const express = require('express');
const router = express.Router();
const FormModel = require('../models/Forms');
const PDFDocument = require('pdfkit-table');
const fs = require('fs');
const nodemailer = require('nodemailer');

async function sendMail(name, email) {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'sledziuxjp@gmail.com',
      pass: 'R5yjh8fbxRtj',
    },
  });

  console.log(name, email);

  await transporter
    .sendMail({
      from: 'John Cena Official',
      to: email,
      subject: 'Hello ✔',
      text: `Dzień dobry ${name}, \n\nDziękujemy za wypełnienie briefu. Pomoże nam w lepszym zrozumieniu czego dokładnie oczekujesz od swojej nowej strony internetowej / sklepu internetowego. Postaramy się w ciągu najbliższych 48 godzin roboczych odpowiedzieć z orientacyjną wyceną lub skontaktujemy się, aby doprecyzować niektóre elementy, gdyby były dla Nas niezrozumiałe.\n\nW załączniku przesyłamy kopię wypełnionego briefu jako potwierdzenie wypełnienia całego procesu - podczas rozmowy telefonicznej / mailowej będziemy na nim bazować i go rozbudowywać. \n\nPozdrawiamy, Zespół WBShop.pl`, // plain text body
      html: '',
      attachments: [
        {
          filename: 'brief.pdf',
          path: './brief.pdf',
          contentType: 'application/pdf',
        },
      ],
    })
    .then((res) => console.log(res));
}

const createPDF = (result, res) => {
  const filename = result[0]?.object['Imię i nazwisko']
    .normalize('NFKD')
    .replace(/[^\w\s.-_\/]/g, '');

  const doc = new PDFDocument({ bufferPages: true });
  const stream = res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-disposition': `attachment;filename=${filename}.pdf`,
  });

  doc.image('./assets/wb-logo.png', 500, 10, { scale: 0.2 });

  doc.on('data', (chunk) => stream.write(chunk));
  doc.on('end', () => stream.end());

  doc.font('./assets/fonts/Roboto-Medium.ttf');

  const text = Object.keys(result[0].object).map((key) => {
    if (key === 'type') {
      return ['Typ', result[0].object[key]];
    }

    if (typeof result[0].object[key] === 'object') {
      let str = '';

      result[0].object[key].forEach((element) => {
        str += element + ', ';
      });
      return [key, str];
    }
    return [key, result[0].object[key]];
  });

  doc.fontSize(20).text('Umowa o stworzenie: ' + result[0].object.type);
  doc.text('\n');
  doc.text('\n');
  const table = {
    title: '',
    subtitle: result[0].object['Imię i Nazwisko'],
    headers: ['Pytanie', 'Odpowiedź'],
    rows: text,
  };

  doc.table(table, {
    width: 500,
    prepareHeader: () => doc.font('./assets/fonts/Roboto-Medium.ttf').fontSize(10),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      doc.font('./assets/fonts/Roboto-Medium.ttf').fontSize(8);
    },
  });

  doc.pipe(fs.createWriteStream('brief.pdf'));

  doc.end();
};

router.post('/sendPDF/:id', (req, res) => {
  FormModel.find({ _id: req.params.id }, (err, result) => {
    if (err) {
      res.json(err);
    } else {
      createPDF(result, res);
      sendMail(result[0].object['Imię i nazwisko'], result[0].object['Adres e-mail']);
    }
  });
});

router.get('/getPDF/:id', (req, res) => {
  FormModel.find({ _id: req.params.id }, (err, result) => {
    if (err) {
      res.json(err);
    } else {
      createPDF(result, res);
    }
  });
});

module.exports = router;
