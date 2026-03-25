import React, { useState, useEffect } from 'react';
import { TrendingUp, Globe, Users, MapPin, Building2, Hash, Calendar } from 'lucide-react';

const NewsScraperDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('viral');
  const [filterCategory, setFilterCategory] = useState('all');
  const [language, setLanguage] = useState('th');
  
  const API_URL = 'https://thai-news-scraper-api.onrender.com/api';

  const translations = {
    th: {
      title: 'ตัวติดตามข่าวไวรัลไทย',
      subtitle: 'ตรวจจับแนวโน้มแบบเรียลไทม์',
      tabs: {
        viral: '🔥 ข่าวไวรัล',
        trending: '📈 ข่าวลือมาก',
      },
      buttons: {
        scrapeNow: '🔄 สแกนตอนนี้',
        scraping: 'กำลังสแกน...',
      },
      labels: {
        viralScore: 'คะแนนไวรัล',
        source: 'แหล่งข่าว',
        noArticles: 'ไม่พบข่าว',
      },
    },
    en: {
      title: 'Thai News Viral Tracker',
      subtitle: 'Real-time trend detection',
      tabs: {
        viral: '🔥 Viral Articles',
        trending: '📈 Trending Topics',
      },
      buttons: {
        scrapeNow: '🔄 Scrape Now',
        scraping: 'Scraping...',
      },
      labels: {
        viralScore: 'Viral Score',
        source: 'Source',
        noArticles: 'No articles found',
      },
    },
  };

  const t = translations[language];

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/articles?limit=50`);
      const data = await response.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await fetch(`${API_URL}/trending`);
      const data = await response.json();
      if (data.trends) {
        setTrends(data.trends);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchTrends();
  }, []);

  const handleScrape = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/scrape`, { method: 'POST' });
      await fetchArticles();
      await fetchTrends();
    } catch (error) {
      console.error('Error scraping:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    if (filterCategory === 'all') return true;
    return article.category === filterCategory;
  });

  const topArticles = filteredArticles
    .sort((a, b) => (b.viral_score || 0) - (a.viral_score || 0))
    .slice(0, 20);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{t.title}</h1>
          <button
            onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {language === 'th' ? 'EN' : 'ไทย'}
          </button>
        </div>
        <p style={{ color: '#666', margin: 0 }}>{t.subtitle}</p>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleScrape}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {loading ? t.buttons.scraping : t.buttons.scrapeNow}
        </button>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value="all">All Categories</option>
          <option value="general">General</option>
          <option value="viral">Viral</option>
        </select>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #ddd', display: 'flex', gap: '20px' }}>
        <button
          onClick={() => setActiveTab('viral')}
          style={{
            padding: '10px 0',
            border: 'none',
            backgroundColor: 'transparent',
            color: activeTab === 'viral' ? '#007bff' : '#666',
            borderBottom: activeTab === 'viral' ? '3px solid #007bff' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {t.tabs.viral}
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          style={{
            padding: '10px 0',
            border: 'none',
            backgroundColor: 'transparent',
            color: activeTab === 'trending' ? '#007bff' : '#666',
            borderBottom: activeTab === 'trending' ? '3px solid #007bff' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {t.tabs.trending}
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'viral' && (
          <div>
            <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>
              {t.tabs.viral} ({topArticles.length})
            </h2>
            {topArticles.length === 0 ? (
              <p style={{ color: '#666' }}>{t.labels.noArticles}</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {topArticles.map((article, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      borderLeft: `4px solid ${(article.viral_score || 50) > 75 ? '#ff6b6b' : '#4ecdc4'}`,
                    }}
                  >
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', lineHeight: '1.4' }}>
                      {article.title}
                    </h3>
                    <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                      {article.summary}
                    </p>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#999' }}>
                      <span>📊 {t.labels.viralScore}: {Math.round(article.viral_score || 50)}</span>
                      <span>📰 {t.labels.source}: {article.source || 'Unknown'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'trending' && (
          <div>
            <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>
              {t.tabs.trending} ({trends.length})
            </h2>
            {trends.length === 0 ? (
              <p style={{ color: '#666' }}>{t.labels.noArticles}</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {trends.map((trend, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
                      #{idx + 1} {trend.title}
                    </h3>
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                      📊 Score: {Math.round(trend.viral_score || 50)} | 💬 Mentions: {trend.mentions || 1}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p>Thai News Viral Tracker v1.0 | Powered by News Scraper API</p>
      </div>
    </div>
  );
};

export default NewsScraperDashboard;
