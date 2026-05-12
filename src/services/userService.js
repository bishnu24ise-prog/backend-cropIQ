const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (name, email, password) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error('User already exists');

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  return user;
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

module.exports = { registerUser, findUserByEmail };