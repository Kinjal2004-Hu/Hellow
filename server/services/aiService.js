const titles = ['Getting Things Done', 'Deep Work Habits', 'The Power of Focus', 'Mindful Productivity', 'Effective Routines'];
const contents = [
  'The key to productivity is not doing more, but doing what matters. Focus on high-impact activities and eliminate distractions.',
  'Deep work means concentrating on a cognitively demanding task without distraction. Schedule blocks of uninterrupted time.',
  'Your focus determines your reality. By concentrating on one thing at a time, you achieve more with less effort.',
  'Mindfulness in productivity means being present with your tasks. Quality over quantity leads to better outcomes.',
  'Consistent routines build momentum. Small daily habits compound into extraordinary results over time.',
];

exports.generateNote = async (topic) => {
  const idx = Math.floor(Math.random() * titles.length);
  return { title: titles[idx], content: contents[idx] };
};

exports.summarize = async (url) => {
  return { summary: 'This article discusses key insights and takeaways from the provided content. The main arguments center around practical strategies for improvement and actionable advice that can be implemented immediately.' };
};
