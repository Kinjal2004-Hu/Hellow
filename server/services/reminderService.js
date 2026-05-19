const cron = require('node-cron');
const Task = require('../models/Task');

exports.startCron = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const tasksDue = await Task.find({ dueAt: { $lte: now }, done: false });
      if (tasksDue.length > 0) {
        console.log(`[Reminder] ${tasksDue.length} task(s) due at ${now.toISOString()}:`);
        tasksDue.forEach(task => {
          console.log(`  - "${task.title}" (user: ${task.user})`);
        });
      }
    } catch (err) {
      console.error('[Reminder] Error checking due tasks:', err.message);
    }
  });

  console.log('[Reminder] Cron job started (runs every minute)');
};
