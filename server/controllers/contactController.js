const Contact = require('../models/Contact');

exports.getContacts = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex }
      ];
    }

    const contacts = await Contact.find(filter).sort({ isFavorite: -1, name: 1 });
    res.json({ success: true, data: contacts });
  } catch (err) {
    next(err);
  }
};

exports.createContact = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const contact = await Contact.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

exports.updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    res.json({ success: true, data: { message: 'Contact deleted' } });
  } catch (err) {
    next(err);
  }
};
