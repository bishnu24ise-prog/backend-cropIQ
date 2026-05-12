const Crop = require('../models/Crop');

// Add Crop
const addCrop = async (req, res) => {
  try {
    const crop = await Crop.create({ ...req.body, addedBy: req.user.id });
    res.status(201).json({ success: true, crop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Crops
const getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find().populate('addedBy', 'name email');
    res.status(200).json({ success: true, crops });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Crop
const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.status(200).json({ success: true, crop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Crop
const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.status(200).json({ success: true, crop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Crop
const deleteCrop = async (req, res) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Crop deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addCrop, getAllCrops, getCropById, updateCrop, deleteCrop };