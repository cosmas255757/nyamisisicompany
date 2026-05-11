const userModel = require('../models/userModel');

async function getUsers(req, res) {
  try {
    const search = req.query.search || '';
    const users = await userModel.getUsers(search);
    res.json({ users });
  } catch (err) {
    console.error('User error', err);
    res.status(500).json({ error: 'Unable to load users' });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, phone, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const newUser = await userModel.createUser({ name, email, phone, role });
    res.status(201).json({ user: newUser });
  } catch (err) {
    console.error('Create user error', err);
    res.status(500).json({ error: 'Unable to create user' });
  }
}

module.exports = {
  getUsers,
  createUser
};
