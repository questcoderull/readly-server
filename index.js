const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Readly is reading and writing blogs");
});

app.listen(port, () => {
  console.log("Radly is running on port : ", port);
});
