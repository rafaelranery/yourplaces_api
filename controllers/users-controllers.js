const { validationResult } = require('express-validator')

const User = require('../models/user')

const HttpError = require("../models/http-error")

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch(err) {
    return next(new HttpError('Something went wrong, could not retrieve users', 500))
  }

  res.status(200).json({ users: users.map(user => user.toObject({ getters: true })) })
}

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid input, please check your data.', 422)) 
  }

  const { email, password, name } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again later.', 500)
    return next(error);
  }

  if(existingUser) {
    return next(new HttpError('There already is an account registered with this email.', 422))
  }

  if (!email || !password || !name) {
    return next(new HttpError('For creating an account you need valids email, name and password.', 401)) 
  }

  const newUser = new User({
    email,
    password,
    name,
    image: 'url image',
    places: []
  })

  try {
    await newUser.save()
  } catch (err) {
    const error = new HttpError('Something went wrong, could not create user.', 500)
    return next(error)
  }

  res.status(201).json({ message: "Your account was created and you're already logged in.", user: newUser.toObject({getters: true}) })
}

const login = async (req, res, next) => {

  const { email, password } = req.body;

  let existingUser; // email validation
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later.', 500)
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid credentials, could not log in.', 401);
    return next(error);
  }

  res.status(200).json({ message: "You're logged in!", user: existingUser.toObject({ getters: true}) })
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login