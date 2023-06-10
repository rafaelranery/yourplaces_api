const uuid = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require("../models/http-error")

let DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Rafael Nery 1',
    password: '123456789',
    email: 'rafael@gmail.com',
    isLogged: false
  },
  {
    id: 'u2',
    name: 'Rafael Nery 2',
    password: '123456789',
    email: 'rapizo@gmail.com',
    isLogged: false
  },
  {
    id: 'u3',
    name: 'Rafael Nery 3',
    password: '123456789',
    email: 'nery@gmail.com',
    isLogged: false
  },
]


const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS })
}

const getAllLoggedUsers = (req, res, next) => {
  const DUMMY_LOGGED_USERS = DUMMY_USERS.filter(u => u.isLogged === true)

  if (DUMMY_LOGGED_USERS.length === 0) {
    throw new HttpError('No logged user found.', 404)
  }

  res.status(200).json({ users: DUMMY_LOGGED_USERS })
}

const signup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError('Invalid input, please check your data.', 422)
  }

  const { email, password, name } = req.body;

  if (DUMMY_USERS.find(u => u.email === email)) {
    throw new HttpError('This email already has an account, unable to create account.', 432)
  }

  if (!email || !password || !name) {
    throw new HttpError('For creating an account you need valids email, name and password.', 401)
  }

  const newUser = {
    id: uuid.v4(),
    email,
    password,
    name,
    isLogged: true
  }

  DUMMY_USERS.push(newUser);

  res.status(201).json({ message: "Your account was created and you're already logged in.", user: DUMMY_USERS.find(u => u.id === newUser.id) })
}

const login = (req, res, next) => {

  const { email, password } = req.body;

  const user = DUMMY_USERS.find(u => u.email === email); // verificação de email

  if (!user || user.password !== password) {
    throw new HttpError('User credentials not found, please enter a valid email and password.', 401)
  }

  if (user.email === email && user.password === password) {
    DUMMY_USERS = DUMMY_USERS.map(u => {
      if (u.id === user.id) {
        return {
          ...user,
          isLogged: true
        }
      }
      return u;
    })
  }

  res.status(200).json({ message: "You're logged in!", user: DUMMY_USERS.find(u => u.id === user.id) })
}

exports.getUsers = getUsers
exports.getAllLoggedUsers = getAllLoggedUsers
exports.signup = signup
exports.login = login