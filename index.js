const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const port = process.env.PORT || 8080;

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use("/api/ajio", require("./ajio/router"));
app.use("/api/amazon", require("./amazon/router"));
app.use("/api/flipkart", require("./flipakrt/router"));
app.use("/api/myntra", require("./myntra/router"));
app.use("/api/tata", require("./tatacliq/router"));
app.use("/api/snapdeal", require("./snapdeal/router"));

app.listen(port, () => {
  console.log(`Server Running at ${port}`);
});
