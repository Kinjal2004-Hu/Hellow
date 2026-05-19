const articles = [
  { title: 'Apple Unveils Next-Generation M4 Chip with AI Focus', description: 'The new chip promises a 50% boost in neural engine performance, enabling on-device AI processing at unprecedented speeds.', url: 'https://example.com/news/1', urlToImage: 'https://via.placeholder.com/800x400?text=Tech+News', source: 'TechCrunch', publishedAt: new Date().toISOString(), category: 'technology' },
  { title: 'OpenAI Launches GPT-5 with Multimodal Capabilities', description: 'The latest model can process text, images, audio, and video simultaneously, marking a new era in AI interaction.', url: 'https://example.com/news/2', urlToImage: 'https://via.placeholder.com/800x400?text=AI', source: 'The Verge', publishedAt: new Date(Date.now() - 3600000).toISOString(), category: 'technology' },
  { title: 'Tesla Reports Record Q2 Deliveries Despite Supply Chain Challenges', description: 'The electric vehicle manufacturer delivered 1.2 million vehicles globally, surpassing analyst expectations.', url: 'https://example.com/news/3', urlToImage: 'https://via.placeholder.com/800x400?text=Business', source: 'Bloomberg', publishedAt: new Date(Date.now() - 7200000).toISOString(), category: 'business' },
  { title: 'Federal Reserve Holds Interest Rates Steady at 4.5%', description: 'The decision comes amid mixed signals on inflation and employment, with markets reacting positively to the announcement.', url: 'https://example.com/news/4', urlToImage: 'https://via.placeholder.com/800x400?text=Finance', source: 'Reuters', publishedAt: new Date(Date.now() - 10800000).toISOString(), category: 'business' },
  { title: 'NASA Confirms Water Ice on Lunar South Pole', description: 'New analysis from the Artemis mission data reveals vast deposits of water ice, crucial for future lunar habitation.', url: 'https://example.com/news/5', urlToImage: 'https://via.placeholder.com/800x400?text=Science', source: 'National Geographic', publishedAt: new Date(Date.now() - 14400000).toISOString(), category: 'science' },
  { title: 'CRISPR Gene Therapy Receives FDA Approval for Sickle Cell Treatment', description: 'The landmark approval paves the way for widespread adoption of gene-editing therapies for genetic disorders.', url: 'https://example.com/news/6', urlToImage: 'https://via.placeholder.com/800x400?text=Medical', source: 'Nature Medicine', publishedAt: new Date(Date.now() - 18000000).toISOString(), category: 'science' },
  { title: 'WHO Declares New Pandemic Preparedness Framework', description: 'The global health organization outlines a comprehensive strategy for faster response to future health emergencies.', url: 'https://example.com/news/7', urlToImage: 'https://via.placeholder.com/800x400?text=Health', source: 'WHO News', publishedAt: new Date(Date.now() - 21600000).toISOString(), category: 'health' },
  { title: 'Mediterranean Diet Linked to 30% Lower Risk of Dementia', description: 'A 15-year longitudinal study confirms the cognitive benefits of olive oil, fish, and plant-based eating patterns.', url: 'https://example.com/news/8', urlToImage: 'https://via.placeholder.com/800x400?text=Nutrition', source: 'The Lancet', publishedAt: new Date(Date.now() - 25200000).toISOString(), category: 'health' },
  { title: 'Inception Wins Best Picture at 2026 Academy Awards', description: 'Christopher Nolan\'s mind-bending thriller took home eight Oscars including Best Director and Best Original Screenplay.', url: 'https://example.com/news/9', urlToImage: 'https://via.placeholder.com/800x400?text=Entertainment', source: 'Variety', publishedAt: new Date(Date.now() - 28800000).toISOString(), category: 'entertainment' },
  { title: 'Netflix Announces Interactive AI-Generated Movie Platform', description: 'Subscribers can now influence plotlines in real-time using natural language commands during select feature films.', url: 'https://example.com/news/10', urlToImage: 'https://via.placeholder.com/800x400?text=Streaming', source: 'The Hollywood Reporter', publishedAt: new Date(Date.now() - 32400000).toISOString(), category: 'entertainment' },
  { title: 'USA Clinches Gold Medal in Basketball World Cup Final', description: 'A thrilling overtime victory against France secured the championship behind a 40-point performance from the star guard.', url: 'https://example.com/news/11', urlToImage: 'https://via.placeholder.com/800x400?text=Sports', source: 'ESPN', publishedAt: new Date(Date.now() - 36000000).toISOString(), category: 'sports' },
  { title: 'Premier League Announces Goal-Line AI Assistant for 2026 Season', description: 'The new system uses computer vision to make offside calls in under 2 seconds with 99.8% accuracy.', url: 'https://example.com/news/12', urlToImage: 'https://via.placeholder.com/800x400?text=Soccer', source: 'Sky Sports', publishedAt: new Date(Date.now() - 39600000).toISOString(), category: 'sports' },
];

exports.fetchNews = async (category, page = 1) => {
  const pageSize = 6;
  const filtered = category && category !== 'all'
    ? articles.filter(a => a.category === category)
    : articles;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);
  return {
    articles: paginated,
    totalResults: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
};

exports.fetchHeadlines = async () => {
  return articles.slice(0, 6);
};
