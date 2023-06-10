const uuid = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const getCoordsForAdress = require('../util/location')

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building 1',
    description: "One of the most know sky scrapers in the world",
    location: {
      lat: 40.7484474,
      lng: -74.9871516
    },
    adress: "20 W 34th St, New York, NY 10001",
    creator: 'u1'
  },
  {
    id: 'p2',
    title: 'Empire State Building 2',
    description: "One of the most know sky scrapers in the world",
    location: {
      lat: 40.7484474,
      lng: -74.9871516
    },
    adress: "20 W 34th St, New York, NY 10001",
    creator: 'u2'
  },
  {
    id: 'p3',
    title: 'Empire State Building 3',
    description: "One of the most know sky scrapers in the world",
    location: {
      lat: 40.7484474,
      lng: -74.9871516
    },
    adress: "20 W 34th St, New York, NY 10001",
    creator: 'u1'
  },
]

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  console.log('GET Request in Places' + ' ' + placeId);

  /* finding place which has place id equal to params */
  const place = DUMMY_PLACES.find(p => p.id === placeId);

  /* error management */
  if (!place) {
    throw new HttpError('Could not find a place for the provided id.', 404);
  }

  /* sending back a response with json data */
  res.json({ place })
}

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const userPlaces = DUMMY_PLACES.filter(p => p.creator === userId)

  if (!userPlaces || userPlaces.length === 0) {
    return next(new HttpError('Could not find a places for the provided user id.', 404));
  }

  res.json({ userPlaces })

}

/* express-validator needs the validation result in the middleware so we can throw an Error*/
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  /* when working with async code, we need to use the next() method. */
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description, adress, creator } = req.body;

  let coordinates;
  /* converting the adress to coordinates */
  try {
    coordinates = await getCoordsForAdress(adress)
  } catch (error) {
    return next(error);
  }

  const createdPlace = {
    id: uuid.v4(),
    title,
    description,
    location: coordinates,
    adress,
    creator
  }

  DUMMY_PLACES.push(createdPlace);

  res.status(201).json({place: createdPlace});
}

const updatePlace = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid input, please check your data.', 422)
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  DUMMY_PLACES = DUMMY_PLACES.map(p => {
    if (p.id === placeId) {
      return {...p, title, description}
    }
    return p;
  })

  res.status(200).json(DUMMY_PLACES.find(p => p.id === placeId))
}

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;

  if (!DUMMY_PLACES.find(p => p.id === placeId)) {
    throw new HttpError('Could not find a place for that id.', 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(place => place.id !== placeId)

  res.status(200);
  res.json({message: 'Deleted place.'});
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;