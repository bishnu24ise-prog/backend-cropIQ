const Field = require('../models/Field');

// Add Field
const addField = async (req, res) => {
  try {
    const field = await Field.create({ ...req.body, farmer: req.user.id });
    res.status(201).json({ success: true, field });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Fields of a Farmer
const getMyFields = async (req, res) => {
  try {
    const fields = await Field.find({ farmer: req.user.id }).populate('currentCrop');
    res.status(200).json({ success: true, fields });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Field
const updateField = async (req, res) => {
  try {
    const field = await Field.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!field) return res.status(404).json({ message: 'Field not found' });
    res.status(200).json({ success: true, field });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Field
const deleteField = async (req, res) => {
  try {
    await Field.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Field deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addField, getMyFields, updateField, deleteField };