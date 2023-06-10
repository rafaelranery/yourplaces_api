const express = require('express');
const { check } = require('express-validator');

const { getUsers, signup, login, getAllLoggedUsers } = require('../controllers/users-controllers')

const router = express.Router();

router.get('/', getUsers);

router.get('/logged', getAllLoggedUsers);

router.post('/signup', [check('email').normalizeEmail().isEmail(), check('password').isLength({min: 5}), check('name').not().isEmpty()], 
signup);

router.post('/login', login)


module.exports = router;