const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Part name is required'],
    trim: true
  },
  partNumber: {
    type: String,
    unique: true,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  compatibility: [{
    brand: String,
    models: [String],
    yearFrom: Number,
    yearTo: Number
  }],
  description: String,
  specifications: mongoose.Schema.Types.Mixed,
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  stock: {
    type: Number,
    default: 0
  },
  images: [String],
  warranty: {
    duration: Number, // in months
    description: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SparePart', sparePartSchema);