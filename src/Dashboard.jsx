import React, { useState, useEffect } from 'react';

const NewsScraperDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('viral');
  const [language, setLanguage] = useState('th');
  
  const API_URL = 'https://thai-news-scraper-api.onrender.com/api';

  const t = language === 'th' ? {
    title: 'ตัวติดตามข่าวไวรัลไทย',
    scrapeNow: '🔄 สแกนตอนนี้',
    scraping: 'กำลังสแกน...',
    viral: '🔥 ข่าวไวรัล',
    trending: '📈 เทรนด์',
    noArticles: 'ไม่พบข่าว',
  } : {
    title: 'Thai News Viral Tracker',
    scrapeNow: '🔄 Scrape Now',
    scraping: 'Scraping...',
    viral: '🔥 Viral Articles',
    trending: '📈 Trending',
    noArticles: 'No articles found',
  };

  const fetchData = async () => {
    try {
      const [articlesRes, trendsRes] = await Promise.all([
        fetch(`${API_URL}/articles?limit=50`),
        fetch(`${API_URL}/trending`)
      ]);
      const articlesData = await articlesRes.json();
      const trendsData = await trendsRes.json();
      
      if (articlesData.articles) setArticles(articlesData.articles);
      if (trendsData.trends) setTrends(trendsData.trends);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScrape = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/scrape`, { method: 'POST' });
      await fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const sorted = [...articles].sort((a, b) => (b.viral_score || 0) - (a.viral_score || 0)).slice(0, 20);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', margin: 0 }}>{t.title}</h1>
          <button onClick={() => setLanguage(language === 'th' ? 'en' : 'th')} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {language === 'th' ? 'EN' : 'ไทย'}
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleScrape} disabled={loading} style={{ padding: '10px 20px', backgroundColor: loading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
            {loading ? t.scraping : t.scrapeNow}
          </button>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
          <button onClick={() => setActiveTab('viral')} style={{ border: 'none', backgroundColor: 'transparent', color: activeTab === 'viral' ? '#007bff' : '#666', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {t.viral}
          </button>
          <button onClick={() => setActiveTab('trending')} style={{ border: 'none', backgroundColor: 'transparent', color: activeTab === 'trending' ? '#007bff' : '#666', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {t.trending}
          </button>
        </div>

        {activeTab === 'viral' && (
          <div>
            {sorted.length === 0 ? (
              <p>{t.noArticles}</p>
            ) : (
              sorted.map((article, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{article.title}</h3>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>{article.summary}</p>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    📊 Score: {Math.round(article.viral_score || 50)} | 📰 {article.source || 'Unknown'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'trending' && (
          <div>
            {trends.length === 0 ? (
              <p>{t.noArticles}</p>
            ) : (
              trends.map((trend, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0', fontSize: '16px' }}>#{idx + 1} {trend.title}</h3>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>📊 {Math.round(trend.viral_score || 50)} | 💬 {trend.mentions || 1}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsScraperDashboard;
