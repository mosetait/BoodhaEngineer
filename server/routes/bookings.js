const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');

// Get all bookings (Admin gets all, users get their own)
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user.id };
    
    // Add status filter if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('service', 'name price')
      .populate('appliance.category', 'name')
      .populate('technician', 'name phone')
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('service')
      .populate('appliance.category')
      .populate('technician', 'name phone');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create booking
router.post('/', protect, async (req, res) => {
  try {
    req.body.user = req.user.id;
    const booking = await Booking.create(req.body);
    
    // Populate service details for email
    await booking.populate('service');
    
    // Send confirmation email
    const { sendEmail } = require('../config/nodemailer');
    const { generateBookingConfirmationEmail } = require('../utils/emailTemplates');
    
    const emailContent = generateBookingConfirmationEmail(booking, req.user, booking.service);
    await sendEmail({
      to: req.user.email,
      ...emailContent
    });
    
    // Emit real-time notification
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('booking-created', {
      bookingId: booking._id,
      message: 'Your booking has been created successfully!'
    });
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update booking status (Admin only)
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, technician } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        technician,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('user service');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Send status update email
    const { sendEmail } = require('../config/nodemailer');
    const { generateStatusUpdateEmail } = require('../utils/emailTemplates');
    
    const emailContent = generateStatusUpdateEmail('booking', booking, booking.user, status);
    await sendEmail({
      to: booking.user.email,
      ...emailContent
    });
    
    // Emit real-time status update
    const io = req.app.get('io');
    io.to(`booking-${booking._id}`).emit('status-update', {
      status,
      technician,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Cancel booking
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled'
      });
    }
    
    booking.status = 'cancelled';
    booking.updatedAt = Date.now();
    await booking.save();
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add rating to booking
router.post('/:id/rating', protect, async (req, res) => {
  try {
    const { score, review } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check ownership
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this booking'
      });
    }
    
    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings'
      });
    }
    
    booking.rating = {
      score,
      review,
      reviewDate: Date.now()
    };
    await booking.save();
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
