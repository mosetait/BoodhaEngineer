const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Order = require('../models/Order');
const SparePart = require('../models/SparePart');

// Get all orders (Admin gets all, users get their own)
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user.id };
    
    // Add status filter if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.sparePart', 'name price')
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.sparePart');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    
    // Calculate pricing
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const sparePart = await SparePart.findById(item.sparePart);
      if (!sparePart) {
        return res.status(404).json({
          success: false,
          message: `Spare part ${item.sparePart} not found`
        });
      }
      
      // Check stock
      if (sparePart.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${sparePart.name}`
        });
      }
      
      const itemPrice = sparePart.price.amount * item.quantity;
      subtotal += itemPrice;
      
      orderItems.push({
        sparePart: item.sparePart,
        quantity: item.quantity,
        price: sparePart.price.amount
      });
      
      // Update stock
      sparePart.stock -= item.quantity;
      await sparePart.save();
    }
    
    const shipping = subtotal > 1000 ? 0 : 100; // Free shipping above ₹1000
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;
    
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      pricing: {
        subtotal,
        shipping,
        tax,
        discount: 0,
        total
      }
    });
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update order status (Admin only)
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, tracking } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        tracking,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('user');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Send status update email
    const { sendEmail } = require('../config/nodemailer');
    const { generateStatusUpdateEmail } = require('../utils/emailTemplates');
    
    const emailContent = generateStatusUpdateEmail('order', order, order.user, status);
    await sendEmail({
      to: order.user.email,
      ...emailContent
    });
    
    // Emit real-time status update
    const io = req.app.get('io');
    io.to(`order-${order._id}`).emit('status-update', {
      status,
      tracking,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Cancel order
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.sparePart');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }
    
    // Check if order can be cancelled
    if (['delivered', 'cancelled', 'returned'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }
    
    // Restore stock
    for (const item of order.items) {
      const sparePart = await SparePart.findById(item.sparePart._id);
      sparePart.stock += item.quantity;
      await sparePart.save();
    }
    
    order.status = 'cancelled';
    order.updatedAt = Date.now();
    await order.save();
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;