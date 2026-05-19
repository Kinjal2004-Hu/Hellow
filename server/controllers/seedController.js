const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');
const Note = require('../models/Note');
const Task = require('../models/Task');
const Event = require('../models/Event');
const Bookmark = require('../models/Bookmark');
const Contact = require('../models/Contact');

const DEMO_NOTES = [
  { title: 'Welcome to Hellow', content: 'This is your first note! Hellow is your calm productivity space.', tags: ['general'], pinned: true },
  { title: 'Project Ideas', content: 'Q2 roadmap items:\n- Launch beta\n- User testing\n- Iterate on feedback', tags: ['work'] },
  { title: 'Shopping List', content: '- Coffee beans\n- Notebook\n- Desk lamp\n- USB-C hub', tags: ['personal'] },
];

const DEMO_TASKS = [
  { title: 'Set up your profile', description: 'Add a bio and avatar', status: 'completed', priority: 'medium', dueDate: new Date(Date.now() + 86400000) },
  { title: 'Create a chat room', description: 'Invite friends to collaborate', status: 'active', priority: 'high', dueDate: new Date(Date.now() + 172800000) },
  { title: 'Explore SpotSync', description: 'Share your location with friends', status: 'active', priority: 'low', dueDate: new Date(Date.now() + 604800000) },
  { title: 'Review Smart News', description: 'Check today headlines', status: 'pending', priority: 'medium', dueDate: new Date(Date.now() + 43200000) },
  { title: 'Backup drive files', description: 'Organize and backup important documents', status: 'pending', priority: 'low', dueDate: new Date(Date.now() + 1209600000) },
];

const DEMO_EVENTS = [
  { title: 'Morning standup', description: 'Daily team sync', start: new Date(Date.now() + 3600000), end: new Date(Date.now() + 3660000), color: '#1A1A1A' },
  { title: 'Lunch with team', description: 'Grab coffee and chat', start: new Date(Date.now() + 14400000), end: new Date(Date.now() + 14700000), color: '#22C55E' },
  { title: 'Review PRs', description: 'Code review session', start: new Date(Date.now() + 28800000), end: new Date(Date.now() + 29700000), color: '#6B6B6B' },
];

const DEMO_BOOKMARKS = [
  { title: 'Hellow PRD', url: 'https://docs.google.com/document/d/example1', tags: ['work', 'product'] },
  { title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', tags: ['dev', 'css'] },
  { title: 'React Documentation', url: 'https://react.dev', tags: ['dev', 'frontend'] },
  { title: 'Cool Design Inspiration', url: 'https://dribbble.com', tags: ['design'] },
];

const DEMO_CONTACTS = [
  { name: 'Alex Chen', email: 'alex@example.com', phone: '+1-555-0101', favorite: true },
  { name: 'Jordan Kim', email: 'jordan@example.com', phone: '+1-555-0102', favorite: false },
  { name: 'Sam Rivera', email: 'sam@example.com', phone: '+1-555-0103', favorite: false },
  { name: 'Taylor Brooks', email: 'taylor@example.com', phone: '+1-555-0104', favorite: true },
];

exports.seedData = async (req, res) => {
  try {
    const userId = req.user._id;

    const existingNotes = await Note.countDocuments({ user: userId });
    if (existingNotes > 0) {
      return res.json({ success: true, message: 'User already has data, skipping seed' });
    }

    await Note.insertMany(DEMO_NOTES.map(n => ({ ...n, user: userId })));

    await Task.insertMany(DEMO_TASKS.map(t => ({ ...t, user: userId })));

    await Event.insertMany(DEMO_EVENTS.map(e => ({ ...e, user: userId })));

    await Bookmark.insertMany(DEMO_BOOKMARKS.map(b => ({ ...b, user: userId })));

    await Contact.insertMany(DEMO_CONTACTS.map(c => ({ ...c, user: userId })));

    const genCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    const room = await Room.create({
      name: 'General',
      description: 'Welcome chat room',
      createdBy: userId,
      members: [userId],
      code: genCode(),
      type: 'public',
    });

    await Message.create({
      room: room._id,
      sender: userId,
      content: 'Welcome to Hellow! This is a demo chat room.',
      messageType: 'text',
    });

    await User.findByIdAndUpdate(userId, { $set: { name: req.user.name || 'Demo User', bio: 'Exploring Hellow' } });

    res.json({ success: true, message: 'Demo data seeded successfully' });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
