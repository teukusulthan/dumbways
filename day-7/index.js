import express from "express";

const app = express();
const port = 3000;

app.set("view engine", "hbs");
app.set("views", "src/views");
app.use("/assets", express.static("src/assets"));

app.get("/home", (req, res) => {
  res.render("index");
});

app.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});
