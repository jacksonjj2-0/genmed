const express = require("express");
const app = express();
const port = 4000;

const scrapers = require("./scrapers");

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // disabled for security on local
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json({ extended: false }));

app.use("/payment", require("./payment"));

app.get("/medicine", async (req, res) => {
  res.send({
    name: "Paracetamol",
    price: 10,
  });
});

app.post("/medicine", async (req, res) => {
  console.log(req.body);
  // scrape
  const med = await scrapers.scrapeMed(req.body.name);
  res.send(med);
});

app.listen(port, () => {
  console.log(`GenMed listening on port ${port}`);
});
