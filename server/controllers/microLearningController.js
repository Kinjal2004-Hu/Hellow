const MicroLearning = require('../models/MicroLearning');

const SEED_DATA = [
  {
    bookTitle: 'Deep Work',
    author: 'Cal Newport',
    category: 'Productivity',
    coverImage: '',
    readTime: '5 min',
    ideas: [
      { title: 'Deep Work vs Shallow Work', body: 'Deep work is professional activity performed in a state of distraction-free concentration that pushes your cognitive capabilities to their limit.' },
      { title: 'Embrace Boredom', body: 'Don\'t take breaks from distraction, instead take breaks from focus. Train your brain to resist the urge for constant stimulation.' },
      { title: 'Quit Social Media', body: 'Adopt a craftsman approach to tool selection: identify the core factors that determine success and happiness, then adopt a tool only if its positive impacts substantially outweigh its negative impacts.' },
      { title: 'The 4 Disciplines of Execution', body: 'Focus on the wildly important, act on lead measures, keep a compelling scoreboard, and create a cadence of accountability.' },
      { title: 'Schedule Every Minute', body: 'Plan every minute of your work day and stick to the schedule. This forces you to be intentional about how you spend your time.' }
    ]
  },
  {
    bookTitle: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self Improvement',
    coverImage: '',
    readTime: '5 min',
    ideas: [
      { title: 'The 1% Rule', body: 'Small habits compound over time. Getting 1% better every day results in a 37x improvement over a year.' },
      { title: 'Habit Stacking', body: 'Pair a new habit with an existing one using the formula: After [CURRENT HABIT], I will [NEW HABIT].' },
      { title: 'Environment Design', body: 'Make good habits obvious and bad habits invisible. Your environment shapes your behavior more than willpower.' },
      { title: 'The Two-Minute Rule', body: 'When starting a new habit, scale it down to something that takes less than two minutes to do.' },
      { title: 'Identity-Based Habits', body: 'Focus on who you want to become, not what you want to achieve. Each action is a vote for the type of person you wish to be.' }
    ]
  },
  {
    bookTitle: 'The Almanack of Naval Ravikant',
    author: 'Eric Jorgenson',
    category: 'Wisdom',
    coverImage: '',
    readTime: '5 min',
    ideas: [
      { title: 'Seek Wealth, Not Money', body: 'Wealth is assets that earn while you sleep. Money is how we transfer time and wealth. Learn to build wealth through ownership.' },
      { title: 'Play Long-Term Games', body: 'All returns in life come from compound interest — whether in wealth, relationships, or knowledge. Play iterated games.' },
      { title: 'Specific Knowledge', body: 'Specific knowledge is found by pursuing your genuine curiosity and passion. It can\'t be taught, but it can be created.' },
      { title: 'Read What You Love', body: 'Read what you love until you love to read. The best books are those that teach you something new about how to live.' },
      { title: 'The Art of Solitude', body: 'The ability to be alone and content is a superpower. Learn to sit with your own thoughts without distraction.' }
    ]
  },
  {
    bookTitle: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Psychology',
    coverImage: '',
    readTime: '5 min',
    ideas: [
      { title: 'System 1 and System 2', body: 'System 1 is fast, intuitive, and emotional. System 2 is slower, deliberate, and logical. Most of our decisions come from System 1.' },
      { title: 'Cognitive Ease', body: 'When something feels familiar or easy to process, System 1 is more likely to accept it as true. Familiarity breeds comfort.' },
      { title: 'Anchoring Effect', body: 'We rely heavily on the first piece of information we receive (the anchor) when making decisions, even if it\'s irrelevant.' },
      { title: 'Loss Aversion', body: 'The pain of losing is psychologically about twice as powerful as the pleasure of gaining. We avoid losses more than we seek gains.' },
      { title: 'Confirmation Bias', body: 'We tend to seek out information that confirms our existing beliefs and ignore evidence that contradicts them.' }
    ]
  },
  {
    bookTitle: 'The Art of War',
    author: 'Sun Tzu',
    category: 'Strategy',
    coverImage: '',
    readTime: '5 min',
    ideas: [
      { title: 'Know Yourself and Your Enemy', body: 'If you know the enemy and know yourself, you need not fear the result of a hundred battles. Self-awareness is the foundation of strategy.' },
      { title: 'Win Without Fighting', body: 'The supreme art of war is to subdue the enemy without fighting. The best victories are those that require no battle.' },
      { title: 'Be Fluid Like Water', body: 'Water shapes its course according to the ground. Adapt your strategy to the situation rather than forcing a rigid plan.' },
      { title: 'Preparation Prevents Failure', body: 'Victorious warriors win first and then go to war, while defeated warriors go to war first and then seek to win.' },
      { title: 'Use Speed and Timing', body: 'Speed is the essence of war. Strike when the opportunity presents itself — hesitation can cost you the advantage.' }
    ]
  }
];

exports.getToday = async (req, res, next) => {
  try {
    const count = await MicroLearning.countDocuments();
    if (count === 0) {
      await MicroLearning.insertMany(SEED_DATA);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let entry = await MicroLearning.findOne({ date: { $gte: todayStart, $lte: todayEnd } });

    if (!entry) {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const index = dayOfYear % SEED_DATA.length;
      const seeded = await MicroLearning.findOne().skip(index).limit(1);

      if (seeded) {
        entry = await MicroLearning.create({
          ...seeded.toObject(),
          _id: undefined,
          date: new Date()
        });
      } else {
        entry = await MicroLearning.create({ ...SEED_DATA[index], date: new Date() });
      }
    }

    res.json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
};
