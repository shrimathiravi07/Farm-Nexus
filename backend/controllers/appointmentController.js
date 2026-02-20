const Appointment = require('../models/Appointment');
const Slot = require('../models/Slot');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private/Farmer
const bookAppointment = async (req, res) => {
    try {
        const { equipment, slot, notes } = req.body;

        const slotDoc = await Slot.findById(slot).populate('equipment');
        if (!slotDoc) return res.status(404).json({ message: 'Slot not found' });
        if (slotDoc.isBooked) return res.status(400).json({ message: 'Slot already booked' });

        // Calculate cost (simple hourly difference)
        const [sh, sm] = slotDoc.startTime.split(':').map(Number);
        const [eh, em] = slotDoc.endTime.split(':').map(Number);
        const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;
        const totalCost = hours * (slotDoc.equipment.pricePerHour || 0);

        const appointment = await Appointment.create({
            farmer: req.user._id,
            equipment,
            slot,
            notes,
            totalCost,
        });

        slotDoc.isBooked = true;
        await slotDoc.save();

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get appointments for current farmer
// @route   GET /api/appointments/my
// @access  Private/Farmer
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ farmer: req.user._id })
            .populate('equipment', 'name pricePerHour')
            .populate('slot', 'date startTime endTime');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/appointments
// @access  Private/Admin
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('farmer', 'name email')
            .populate('equipment', 'name')
            .populate('slot', 'date startTime endTime');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private/Provider or Admin
const updateAppointmentStatus = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        appointment.status = req.body.status || appointment.status;
        const updated = await appointment.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel an appointment
// @route   DELETE /api/appointments/:id
// @access  Private/Farmer
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (appointment.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
        }

        // Free up the slot
        await Slot.findByIdAndUpdate(appointment.slot, { isBooked: false });

        appointment.status = 'cancelled';
        await appointment.save();
        res.json({ message: 'Appointment cancelled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get appointments for a provider's equipment
// @route   GET /api/appointments/provider
// @access  Private/Provider
const getProviderAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate({
                path: 'equipment',
                match: { provider: req.user._id },
                select: 'name provider'
            })
            .populate('farmer', 'name phone')
            .populate('slot', 'date startTime endTime');

        // Filter out appointments where equipment match failed (not owned by provider)
        const providerAppointments = appointments.filter(a => a.equipment !== null);

        res.json(providerAppointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    bookAppointment,
    getMyAppointments,
    getAllAppointments,
    getProviderAppointments,
    updateAppointmentStatus,
    cancelAppointment,
};
