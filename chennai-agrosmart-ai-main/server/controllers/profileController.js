const User = require('../models/User');

/**
 * @route   GET /api/profile
 * @desc    Get user profile and farming settings
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
};

/**
 * @route   PUT /api/profile
 * @desc    Update user profile & farming preferences
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, preferredLanguage, location, defaultCrop } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Farmer account not found.' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (location) user.location = location;
    if (defaultCrop) user.defaultCrop = defaultCrop;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully in MongoDB.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
        location: user.location,
        defaultCrop: user.defaultCrop,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
