const { User } = require('./models');
require('./db');

async function signup(username, password) {
  try {
    const existing = await User.findOne({ username });
    if (existing) return { success: false, error: "User already exists" };
    const user = new User({ username, password });
    await user.save();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function login(username, password) {
  const user = await User.findOne({ username });
  if (!user) return { success: false, error: "User not found" };

  const isMatch = await user.comparePassword(password);
  return isMatch ? { success: true } : { success: false, error: "Incorrect password" };
}

module.exports = { signup, login };
