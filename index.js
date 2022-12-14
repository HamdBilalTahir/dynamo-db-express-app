const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const latLongTableRouter = require("./api/latLongTable");

app.use(express.json());
app.use("/api/latLongTable", latLongTableRouter);

app.get("/api/", (req, res) => {
  res.send(
    "<h1>Node.js CRUD API</h1> <h4>Message: Success</h4><p>Version:1.0</p>"
  );
});

app.get("/api/health", (req, res) => {
  res.send();
});

app.listen(port, () => {
  console.log("Demo app is running and listening to the port:" + port);
});
