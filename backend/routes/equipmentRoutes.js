const router = require("express").Router();
const Equipment = require("../models/Equipment");
const { protect } = require("../middleware/authMiddleware");

// ✅ Get provider's own equipments (must be before /:id route)
router.get("/my", protect, async (req, res) => {
    try {
        const equipments = await Equipment.find({ provider: req.user.id });
        res.json(equipments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ Get all equipments (public)
router.get("/", async (req, res) => {
    try {
        const equipments = await Equipment.find().populate("provider", "name email");
        res.json(equipments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ Get single equipment by ID
router.get("/:id", async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id).populate("provider", "name email phone");
        if (!equipment) return res.status(404).json({ message: "Equipment not found" });
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ Add equipment
router.post("/", protect, async (req, res) => {
    try {
        const equipment = new Equipment({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            pricePerHour: req.body.pricePerHour,
            imageUrl: req.body.imageUrl,
            provider: req.user.id
        });

        await equipment.save();
        res.status(201).json(equipment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ Delete equipment
router.delete("/:id", protect, async (req, res) => {
    try {
        await Equipment.findByIdAndDelete(req.params.id);
        res.json({ message: "Equipment deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
