const fs = require("fs");

const uuid = require("uuid");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAdress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  console.log("GET Request in Places" + " " + placeId);

  let place;
  try {
    /* finding place which has place id equal to params */
    place = await Place.findById(placeId); // does not catch a promise whithout exec methods
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find place.",
      500
    ); // error for request
    return next(error);
  }

  /* error management */
  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id.",
      404
    ); // error in finding place with said id
    return next(error);
  }

  /* sending back a response with json data */
  res.json({ place: place.toObject({ getters: true }) }); // getter returns also the getters for _id as id
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // getting places without populate;
  // let userPlaces;
  // try {
  //   userPlaces = await Place.find({ creator: userId })

  // } catch (err) {
  //   const error = new HttpError('Something went wrong, could not fetch places from provided user ID', 500);
  //   return next(error);
  // }
  let userPlaces;
  try {
    userPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not fetch places from provided user ID",
      500
    );
    return next(error);
  }

  if (!userPlaces || userPlaces.places.length === 0) {
    return next(
      new HttpError(
        "The user with the provided id does not have any places.",
        404
      )
    );
  }

  res.json({
    userPlaces: userPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

/* express-validator needs the validation result in the middleware so we can throw an Error*/
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  /* when working with async code, we need to use the next() method. */
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, adress, creator } = req.body;

  let coordinates;
  /* converting the adress to coordinates */
  try {
    coordinates = await getCoordsForAdress(adress);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    adress,
    location: coordinates,
    image: req.file.path,
    creator,
  });

  /* Checking if the user id provided exists, so we can add the place and set it to is account */
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }
  if (!user) {
    return next(
      new HttpError(
        "Unable to create place, we could not find user for the provided ID",
        404
      )
    );
  }
  console.log(user);

  // DUMMY_PLACES.push(createdPlace);
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess }); // method for save document in MondoDB, this returns a promise.
    user.places.push(createdPlace); // this is not regular push, but a push method provided by mongoose. In the backstage, mongo will add only the objectId to the array.
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input, please check your data.", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  // DUMMY_PLACES = DUMMY_PLACES.map(p => {
  //   if (p.id === placeId) {
  //     return { ...p, title, description }
  //   }
  //   return p;
  // })

  let updatedPlace;
  try {
    // updatedPlace = await Place.findByIdAndUpdate(placeId, {title, description})
    updatedPlace = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  updatedPlace.title = title;
  updatedPlace.description = description;

  try {
    await updatedPlace.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place",
      500
    );
    return next(error);
  }

  res
    .status(200)
    .json({ updatedPlace: updatedPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let deletedPlace;
  try {
    deletedPlace = await Place.findById(placeId).populate("creator"); //populate allow us to refer to a document stored in another collection
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place form provided id",
      500
    );
    return next(error);
  }

  if (!deletedPlace) {
    return next(new HttpError("Could not find place for given id", 404));
  }

  const imagePath = deletedPlace.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await deletedPlace.deleteOne({ session: sess }); // instead of the remove method used in the course, we used deleteOne here
    await deletedPlace.creator.places.pull(deletedPlace);
    await deletedPlace.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Something went wrong, could not remove the place.", 500)
    );
  }

  fs.unlink(imagePath, (err) => console.log(err));

  res.status(200);
  res.json({ message: "Deleted place.", place: deletedPlace.toObject() });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
