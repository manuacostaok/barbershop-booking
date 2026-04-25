const express = require("express");
const router = express.Router();
const {
  createAppointment,
} = require("../controllers/appointmentController");

router.post("/", createAppointment);

const { getAvailability } = require("../controllers/appointmentController");

router.get("/availability", getAvailability);


module.exports = router;