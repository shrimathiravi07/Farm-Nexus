const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Equipment name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            trim: true,
        },
        pricePerHour: {
            type: Number,
            required: [true, 'Price per hour is required'],
            min: 0,
        },
        imageUrl: {
            type: String,
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Equipment', equipmentSchema);
