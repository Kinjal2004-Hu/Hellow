const MOCK_ARTICLES = {
  technology: [
    { title: 'AI Breakthrough: New Model Achieves Human-Level Reasoning', source: 'Tech Daily', url: '#', publishedAt: new Date().toISOString(), urlToImage: '' },
    { title: 'Quantum Computing Milestone Reached by Research Team', source: 'Science Weekly', url: '#', publishedAt: new Date().toISOString(), urlToImage: '' }
  ],
  business: [
    { title: 'Global Markets Reach New Heights in Q2', source: 'Finance Times', url: '#', publishedAt: new Date().toISOString(), urlToImage: '' },
    { title: 'Startup Ecosystem Sees Record Investment Levels', source: 'Business Insider', url: '#', publishedAt: new Date().toISOString(), urlToImage: '' }
  ],
  science: [
    { title: 'Mars Rover Discovers Evidence of Ancient Water Flows', source: 'Space News', url: '#', publishedAt: new Date().toISOString(), urlToImage: '' },
    { title: 'New Study Reveals Insights into Brain Plasticity', source: 'Nature Journal', url: '#', publishedAt: new Date().toISOString(), urlToImage: '' }
  ],
  health: [
    { title: 'Breakthrough Vaccine Shows Promise for Chronic Diseases', source: 'Health Today', url: '#', publishedAt: new Date().toISOString(), urlToImage: '' },
    { title: 'Study Links Mediterranean Diet to Longer Lifespan', source: 'Medical News', url: '#', publishedAt: new Date().toISOString(), urlToImage: '' }
  ],
  entertainment: [
    { title: 'Streaming Wars Heat Up with New Platform Launches', source: 'Entertainment Weekly', url: '#', publishedAt: new Date().toISOString(), urlToImage: '' },
    { title: 'Independent Film Wins Top Prize at International Festival', source: 'Film Daily', url: '#', publishedAt: new Date().toISOString(), urlToImage: '' }
  ],
  sports: [
    { title: 'Underdog Team Clinches Championship in Thrilling Final', source: 'Sports Central', url: '#', publishedAt: new Date().toISOString(), urlToImage: '' },
    { title: 'Record-Breaking Performance at International Tournament', source: 'Athletic News', url: '#', publishedAt: new Date().toISOString(), urlToImage: '' }
  ]
};

const MOCK_HEADLINES = [
  { title: 'Markets hit all-time high amid tech rally', source: 'Finance Times' },
  { title: 'New climate agreement signed by 50 nations', source: 'World News' },
  { title: 'Major breakthrough in renewable energy storage', source: 'Science Weekly' },
  { title: 'Global health organization announces new initiative', source: 'Health Today' },
  { title: 'Space agency reveals plans for lunar base', source: 'Space News' }
];

exports.getNews = async (req, res, next) => {
  try {
    const category = req.query.category || 'technology';

    if (process.env.NEWS_API_KEY) {
      const axios = require('axios');
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          category,
          pageSize: 10,
          apiKey: process.env.NEWS_API_KEY
        }
      });
      return res.json({ success: true, data: response.data.articles });
    }

    const articles = MOCK_ARTICLES[category] || MOCK_ARTICLES.technology;
    res.json({ success: true, data: articles });
  } catch (err) {
    next(err);
  }
};

exports.getHeadlines = async (req, res, next) => {
  try {
    if (process.env.NEWS_API_KEY) {
      const axios = require('axios');
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country: 'us',
          pageSize: 5,
          apiKey: process.env.NEWS_API_KEY
        }
      });
      return res.json({ success: true, data: response.data.articles });
    }

    res.json({ success: true, data: MOCK_HEADLINES });
  } catch (err) {
    next(err);
  }
};
