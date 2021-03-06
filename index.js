require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Local imports
const UserRouter = require("./routes/user.router");
const AddressRouter = require("./routes/address.router");
const CardRouter = require("./routes/card.router");

// DB Connection
mongoose
  .connect(process.env.DB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to DB..."))
  .catch(e => console.log(e));

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/users", UserRouter);
app.use("/api/addresses", AddressRouter);
app.use("/api/cards", CardRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
