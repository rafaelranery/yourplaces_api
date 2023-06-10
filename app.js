const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require('./models/http-error');

const app = express();

/* adding middleware for parsing body for post */
app.use(bodyParser.json())

/* using the routes defined externally as middleware */
app.use('/api/places', placesRoutes)

app.use('/api/users', usersRoutes)

/* middleware for treating unfounded routes */
app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404);
})

/* using express default error handler */
app.use((error, req, res, next) => {
  // we foward in case we already sent a response
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || 'Sorry... An unkown ocurred.' });
})

app.listen(5000);