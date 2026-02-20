const Slot = require('../models/Slot');

// @desc    Get all available slots for a piece of equipment
// @route   GET /api/slots/:equipmentId
// @access  Public
const getSlotsByEquipment = async (req, res) => {
    try {
        const slots = await Slot.find({
            equipment: req.params.equipmentId,
            isBooked: false,
        }).populate('provider', 'name email');
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get slots managed by current provider
// @route   GET /api/slots/my
// @access  Private/Provider
const getMySlots = async (req, res) => {
    try {
        const slots = await Slot.find({ provider: req.user._id }).populate('equipment', 'name');
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new slot
// @route   POST /api/slots
// @access  Private/Provider
const createSlot = async (req, res) => {
    try {
        const { equipment, date, startTime, endTime } = req.body;
        const slot = await Slot.create({
            equipment,
            provider: req.user._id,
            date,
            startTime,
            endTime,
        });
        res.status(201).json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a slot
// @route   PUT /api/slots/:id
// @access  Private/Provider
const updateSlot = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        if (slot.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this slot' });
        }

        Object.assign(slot, req.body);
        const updated = await slot.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a slot
// @route   DELETE /api/slots/:id
// @access  Private/Provider
const deleteSlot = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        if (slot.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this slot' });
        }

        await slot.deleteOne();
        res.json({ message: 'Slot removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSlotsByEquipment, getMySlots, createSlot, updateSlot, deleteSlot };
