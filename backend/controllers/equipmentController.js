const Equipment = require('../models/Equipment');

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Public
const getAllEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.find({ isAvailable: true }).populate('provider', 'name email');
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get equipment by provider
// @route   GET /api/equipment/my
// @access  Private/Provider
const getMyEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.find({ provider: req.user._id });
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single equipment by ID
// @route   GET /api/equipment/:id
// @access  Public
const getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id).populate('provider', 'name email phone');
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new equipment
// @route   POST /api/equipment
// @access  Private/Provider
const createEquipment = async (req, res) => {
    try {
        const { name, description, category, pricePerHour, imageUrl } = req.body;
        const equipment = await Equipment.create({
            name,
            description,
            category,
            pricePerHour,
            imageUrl,
            provider: req.user._id,
        });
        res.status(201).json(equipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private/Provider
const updateEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

        if (equipment.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this equipment' });
        }

        Object.assign(equipment, req.body);
        const updated = await equipment.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private/Provider
const deleteEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

        if (equipment.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this equipment' });
        }

        await equipment.deleteOne();
        res.json({ message: 'Equipment removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllEquipment,
    getMyEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
};
