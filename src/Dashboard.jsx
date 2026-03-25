import React, { useState, useEffect } from 'react';

export default function NewsScraperDashboard() {
  const [articles, setArticles] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('viral');
  const [lang, setLang] = useState('th');

  const API = 'https://thai-news-scraper-api.onrender.com/api';

  useEffect(() => {
    fetch(API + '/articles?limit=50').then(r => r.json()).then(d => d.articles && setArticles(d.articles));
    fetch(API + '/trending').then(r => r.json()).then(d => d.trends && setTrends(d.trends));
  }, []);

  const scrape = async () => {
    setLoading(true);
    await fetch(API + '/scrape', { method: 'POST' });
    fetch(API + '/articles?limit=50').then(r => r.json()).then(d => d.articles && setArticles(d.articles));
    fetch(API + '/trending').then(r => r.json()).then(d => d.trends && setTrends(d.trends));
    setLoading(false);
  };

  const sorted = [...articles].sort((a, b) => (b.viral_score || 0) - (a.viral_score || 0)).slice(0, 20);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1>{lang === 'th' ? 'ตัวติดตามข่าวไวรัล' : 'Thai News Tracker'}</h1>
          <button onClick={() => setLang(lang === 'th' ? 'en' : 'th')} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {lang === 'th' ? 'EN' : 'ไทย'}
          </button>
        </div>

        <button onClick={scrape} disabled={loading} style={{ padding: '10px 20px', backgroundColor: loading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>
          {loading ? '🔄 กำลังสแกน...' : '🔄 สแกน'}
        </button>

        <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #ddd', marginBottom: '20px' }}>
          <button onClick={() => setTab('viral')} style={{ border: 'none', backgroundColor: 'transparent', color: tab === 'viral' ? '#007bff' : '#666', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
            🔥 {lang === 'th' ? 'ไวรัล' : 'Viral'}
          </button>
          <button onClick={() => setTab('trending')} style={{ border: 'none', backgroundColor: 'transparent', color: tab === 'trending' ? '#007bff' : '#666', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
            📈 {lang === 'th' ? 'เทรนด์' : 'Trending'}
          </button>
        </div>

        {tab === 'viral' && (
          <div>
            {sorted.map((a, i) => (
              <div key={i} style={{ backgroundColor: 'white', padding: '15px', marginBottom: '10px', borderRadius: '4px' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{a.title}</h3>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>{a.summary}</p>
                <small style={{ color: '#999' }}>📊 {Math.round(a.viral_score || 50)} | 📰 {a.source || 'Unknown'}</small>
              </div>
            ))}
          </div>
        )}

        {tab === 'trending' && (
          <div>
            {trends.map((t, i) => (
              <div key={i} style={{ backgroundColor: 'white', padding: '15px', marginBottom: '10px', borderRadius: '4px' }}>
                <h3 style={{ margin: '0' }}>#{i + 1} {t.title}</h3>
                <small style={{ color: '#999' }}>📊 {Math.round(t.viral_score || 50)}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
