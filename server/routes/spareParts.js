const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const SparePart = require('../models/SparePart');

// Get all spare parts with filters
router.get('/', async (req, res) => {
  try {
    const query = { isActive: true };
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by brand compatibility
    if (req.query.brand) {
      query['compatibility.brand'] = req.query.brand;
    }
    
    // Filter by year compatibility
    if (req.query.year) {
      const year = parseInt(req.query.year);
      query.$or = [
        { 'compatibility.yearFrom': { $lte: year }, 'compatibility.yearTo': { $gte: year } },
        { 'compatibility.yearFrom': { $exists: false } }
      ];
    }
    
    // Filter by model compatibility
    if (req.query.model) {
      query['compatibility.models'] = req.query.model;
    }
    
    const spareParts = await SparePart.find(query).populate('category', 'name slug');
    
    res.json({
      success: true,
      count: spareParts.length,
      data: spareParts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single spare part
router.get('/:id', async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id).populate('category');
    if (!sparePart) {
      return res.status(404).json({
        success: false,
        message: 'Spare part not found'
      });
    }
    res.json({
      success: true,
      data: sparePart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create spare part (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const sparePart = await SparePart.create(req.body);
    res.status(201).json({
      success: true,
      data: sparePart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update spare part (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const sparePart = await SparePart.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!sparePart) {
      return res.status(404).json({
        success: false,
        message: 'Spare part not found'
      });
    }
    res.json({
      success: true,
      data: sparePart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete spare part (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const sparePart = await SparePart.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!sparePart) {
      return res.status(404).json({
        success: false,
        message: 'Spare part not found'
      });
    }
    res.json({
      success: true,
      message: 'Spare part deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;