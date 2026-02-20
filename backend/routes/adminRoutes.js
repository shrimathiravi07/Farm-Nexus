const router = require("express").Router();
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Slot = require("../models/Slot");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ✅ Admin view all users
router.get("/users", protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json(err.message);
    }
});


// ✅ Admin view all appointments
router.get("/appointments", protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const data = await Appointment.find()
            .populate("farmer", "name email")
            .populate("equipment", "name")
            .populate({
                path: "slot",
                populate: "equipment"
            });

        res.json(data);
    } catch (err) {
        res.status(500).json(err.message);
    }
});


// ✅ Admin analytics
router.get("/stats", protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.countDocuments();
        const bookings = await Appointment.countDocuments();
        const slots = await Slot.countDocuments();

        res.json({ users, bookings, slots });
    } catch (err) {
        res.status(500).json(err.message);
    }
});

module.exports = router;
