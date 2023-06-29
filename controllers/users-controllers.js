const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')

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

  let hashedPassword;
  try {
    hashedPassword = bcrypt.hash(password, 12)
  } catch(err) {
    const error = new HttpError("Signing up failed, please try again later", 500)
    return next(error)
  }

  const newUser = new User({
    email,
    password: hashedPassword,
    name,
    image: req.file.path, // assim, utilizamos a prop file adicionada pelo multer, e adicionamos seu path no servidor (a url seda adicionada no front end);
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

  const { email, password } = req.body; // extração das propriedades presentes no corpo do JSON.

  let existingUser; // email validation
  try {
    existingUser = await User.findOne({ email: email }) // tentativa de busca do usuário na db a partir do email.
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later.', 500)
    return next(error); // erro em caso da busca não poder ser realizada
  }

  if (!existingUser || existingUser.password !== password) { // (1) Há usuário? (2) A senha é igual?. Não ou não => error.
    const error = new HttpError('Invalid credentials, could not log in.', 401);
    return next(error);
  }

  res.status(200).json({ message: "You're logged in!", user: existingUser.toObject({ getters: true}) })
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login