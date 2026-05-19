const Contact = require('../models/Contact');
const SpotPin = require('../models/SpotPin');

exports.getFriendsLocations = async (req, res, next) => {
  try {
    const contacts = await Contact.find({ userId: req.user._id }).select('name email');
    const contactNames = contacts.map(c => c.name);

    const friendUsers = await require('../models/User').find({
      username: { $in: contactNames }
    }).select('_id username');

    const friendIds = friendUsers.map(u => u._id);

    const pins = await SpotPin.find({
      userId: { $in: friendIds },
      sharedWith: req.user._id
    }).populate('userId', 'username avatarUrl');

    const locations = pins.map(pin => ({
      user: pin.userId,
      lat: pin.lat,
      lng: pin.lng,
      label: pin.label,
      updatedAt: pin.updatedAt
    }));

    res.json({ success: true, data: locations });
  } catch (err) {
    next(err);
  }
};
