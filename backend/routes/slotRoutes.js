const router = require("express").Router();
const Slot = require("../models/Slot");
const { protect } = require("../middleware/authMiddleware");


// ✅ Get provider's own slots
router.get("/my", protect, async (req, res) => {
    try {
        const slots = await Slot.find({ provider: req.user.id }).populate("equipment", "name");
        res.json(slots);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ✅ Get available slots for a specific equipment (used by bookAppointment.js)
router.get("/equipment/:equipmentId", async (req, res) => {
    try {
        const slots = await Slot.find({
            equipment: req.params.equipmentId,
            isBooked: false,
        }).populate("provider", "name email");
        res.json(slots);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ✅ Get all slots (public view)
router.get("/", async (req, res) => {
    try {
        const slots = await Slot.find().populate("equipment").populate("provider", "name email");
        res.json(slots);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ✅ Create slot (provider only)
router.post("/", protect, async (req, res) => {
    try {
        const slot = new Slot({
            ...req.body,
            provider: req.user.id
        });
        await slot.save();
        res.status(201).json(slot);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ✅ Delete slot (provider only)
router.delete("/:id", protect, async (req, res) => {
    try {
        await Slot.findByIdAndDelete(req.params.id);
        res.json({ message: "Slot deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
