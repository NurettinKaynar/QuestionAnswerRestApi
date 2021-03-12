const express = require("express");
const dotenv = require("dotenv");
const routers = require("./routers/index");
const connectDatabase = require("./helpers/database/connectDatabase");
const customErrorHandler = require("./middlewares/errors/customErrorHandler");
const path = require("path");
//Environment Variable
dotenv.config({
  path: "./config/env/config.env",
});
const app = express();
//Express body middleware
app.use(express.json())
const PORT = process.env.PORT;

//MongoDB Connection
connectDatabase();

//Routers Middleware
app.use("/api", routers);
//Error Handler

app.use(customErrorHandler);

//Static Files

app.use(express.static(path.join(__dirname, "public")))
app.listen(PORT, () => {
  console.log(
    `Uygulama ${PORT} portunda :${process.env.NODE_ENV} ortamında çalışıyor.`
  );
});
