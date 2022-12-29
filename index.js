require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;
const router = require("./routers");
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());
app.use("/", router);

app.listen(PORT, () => console.log('API Running on PORT ' + PORT) )