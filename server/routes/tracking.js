// routes/tracking.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');

// Update technician location
router.post('/location', protect, authorize('technician'), async (req, res) => {
  try {
    const { bookingId, lat, lng } = req.body;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (booking.technician.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }
    
    // Emit location update via Socket.io
    const io = req.app.get('io');
    io.to(`booking-${bookingId}`).emit('location-update', {
      lat,
      lng,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get technician location for a booking
router.get('/booking/:bookingId', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized to view this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }
    
    // For demo purposes, return mock location
    // In production, you would store and retrieve actual location data
    res.json({
      success: true,
      data: {
        bookingId: booking._id,
        technicianId: booking.technician,
        location: {
          lat: 28.6139 + (Math.random() * 0.1 - 0.05), // Delhi coordinates with some randomness
          lng: 77.2090 + (Math.random() * 0.1 - 0.05),
          lastUpdated: new Date()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
