const express = require("express");
const { check } = require("express-validator");

/* using express.Router */
const router = express.Router();
/* error model */
const HttpError = require("../models/http-error");
/* controllers */
const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
} = require("../controllers/places-controllers");
// Middleware para recuperar arquivos com multer
const fileUpload = require("../middleware/file-upload");

router.get("/:pid", getPlaceById);

router.get("/user/:uid", getPlacesByUserId);

/* we are not limited to one middleware, and they will be executed from left to right */
router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("adress").not().isEmpty(),
    check("creator").not().isEmpty(),
  ],
  createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  updatePlace
);

/* DÚVIDA, O QUE SE VALIDA AQUI? */
router.delete("/:pid", deletePlace);

module.exports = router;
