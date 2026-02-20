const router = require("express").Router();
const { registerUser, loginUser, getUserProfile, getAllUsers } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// ✅ Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ Private Routes
router.get("/profile", protect, getUserProfile);
router.get("/users", protect, getAllUsers);

module.exports = router;
