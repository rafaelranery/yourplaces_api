const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

/* adding middleware for parsing body for post */
app.use(bodyParser.json());

// setting header attatchments to handle CORS errors
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); //the setHeader method allows to write a header for the response without sending it.
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  ); // set the allowed header on incoming requests.
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE"); // set the allowed HTTP methods on incoming requests.
  next();
});

/* using the routes defined externally as middleware */
app.use("/api/places", placesRoutes);

app.use("/api/users", usersRoutes);

/* middleware for treating unfounded routes */
app.use((req, res, next) => {
  throw new HttpError("Could not find this route", 404);
});

/* using express default error handler */
app.use((error, req, res, next) => {
  // iremos utilizar o ultimo tratamento default de erros para
  // tratar os erros de signup que necessitam que a imagem que foi enviada seja
  // então excluída do servidor.
  // O multer disponiibiliza uma outra propriedade no corpo da requisição,
  // a propriedade 'file', pela qual podemos acessar o campo do objeto que foi
  // anteriormente reconhecido como o campo que contém imagem, em users-routes.js.
  if (req.file) {
    // se chegou um error com uma requisão que contém o campo 'file', sabemos que estamos tratando das req com imagens.
    // para deletar, utilizamos um core module do Node.js, o 'fs': 'file system module'
    fs.unlink(req.file.path, (err) => {console.log(err)});
  
  }

  // we foward in case we already sent a response
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "Sorry... An unkown ocurred." });
});

/* establishing connection to database as condition to server start */
mongoose
  .connect(
    "mongodb+srv://rnrfl:s9HP0i7yYAoIJGBf@cluster0.sp4cm6j.mongodb.net/mern?retryWrites=true&w=majority"
  )
  .then(() => app.listen(5000)) // if success start server
  .catch((err) => console.log(err)); // else throw erro
