const router = require("express").Router();
const {
    bookAppointment,
    getMyAppointments,
    getAllAppointments,
    getProviderAppointments,
    updateAppointmentStatus,
    cancelAppointment
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");

// ✅ Farmer Routes
router.post("/", protect, bookAppointment);
router.get("/my", protect, getMyAppointments);

// ✅ Provider Routes
router.get("/provider", protect, getProviderAppointments);

// ✅ Mixed/Admin Routes
router.get("/", protect, getAllAppointments);
router.put("/:id", protect, updateAppointmentStatus);
router.delete("/:id", protect, cancelAppointment);

module.exports = router;
