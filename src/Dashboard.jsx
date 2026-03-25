import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, AlertCircle, BookOpen, Activity, Globe, Users, MapPin, Building2, Hash, Calendar } from 'lucide-react';

const NewsScraperDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('viral');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [investigations, setInvestigations] = useState([]);
  const [showInvestigationForm, setShowInvestigationForm] = useState(false);
  const [investigationData, setInvestigationData] = useState({ topic: '', angle: '' });
  const [minViralScore, setMinViralScore] = useState(60);
  const [language, setLanguage] = useState('th');
  
  // Timeframe filtering
  const [timeframe, setTimeframe] = useState('7d');  // Default: 7 days
  const [timeframeStats, setTimeframeStats] = useState({});
  
  // Entity filtering
  const [entities, setEntities] = useState({});
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedEntityType, setSelectedEntityType] = useState('people');
  const [entityArticles, setEntityArticles] = useState([]);
  const [relatedEntities, setRelatedEntities] = useState(null);
  const [entityNetwork, setEntityNetwork] = useState({});

 const API_URL = 'https://thai-news-scraper-api.onrender.com/api';

  // ============ TRANSLATIONS ============
  const translations = {
    th: {
      title: 'ตัวติดตามข่าวไวรัลไทย',
      subtitle: 'ตรวจจับแนวโน้มแบบเรียลไทม์และการสืบสวนอัตโนมัติ',
      tabs: {
        viral: '🔥 ข่าวไวรัล',
        trending: '📈 ข่าวลือมาก',
        investigations: '📋 การสืบสวน',
        entities: '👥 ตัวชี้วัด'
      },
      buttons: {
        scrapeNow: '🔄 สแกนตอนนี้',
        scraping: 'กำลังสแกน...',
        startInvestigation: 'เริ่มสืบสวน',
        readFull: 'อ่านเต็ม',
        createInvestigation: 'สร้างการสืบสวน',
        newInvestigation: '+ การสืบสวนใหม่',
        create: 'สร้าง',
        cancel: 'ยกเลิก',
        viewArticles: 'ดูข่าว',
        viewNetwork: 'ดูเครือข่าย'
      },
      labels: {
        viralScore: 'คะแนนไวรัล',
        source: 'แหล่งข่าว',
        keywords: 'คำหลัก',
        deepDive: '📍 จุดสำคัญ',
        topics: 'หัวข้อ',
        articles: 'ข่าว',
        avgScore: 'เฉลี่ย',
        people: '👥 บุคคล',
        places: '📍 สถานที่',
        organizations: '🏢 องค์กร',
        numbers: '📊 ตัวเลข',
        percentages: '%️ เปอร์เซ็นต์',
        dates: '📅 วันที่',
        mentions: 'ครั้ง',
        coOccurrence: 'ร่วม',
        relatedEntities: 'ตัวชี้วัดที่เกี่ยวข้อง',
        foundIn: 'พบใน',
        timeframe: '📅 ระยะเวลา',
        published: 'เผยแพร่'
      },
      timeframes: {
        '24h': 'ช่วง 24 ชั่วโมงที่ผ่านมา',
        '3d': 'ช่วง 3 วันที่ผ่านมา',
        '7d': 'ช่วง 7 วันที่ผ่านมา',
        '14d': 'ช่วง 14 วันที่ผ่านมา',
        '1m': 'ช่วง 1 เดือนที่ผ่านมา',
        '3m': 'ช่วง 3 เดือนที่ผ่านมา',
        '6m': 'ช่วง 6 เดือนที่ผ่านมา',
        '1y': 'ช่วง 1 ปีที่ผ่านมา',
        'all': 'ทั้งหมด'
      }
    },
    en: {
      title: 'Thai News Viral Tracker',
      subtitle: 'Real-time trend detection & investigation',
      tabs: {
        viral: '🔥 Viral Articles',
        trending: '📈 Trending Topics',
        investigations: '📋 Investigations',
        entities: '👥 Entities'
      },
      buttons: {
        scrapeNow: '🔄 Scrape Now',
        scraping: 'Scraping...',
        startInvestigation: 'Start Investigation',
        readFull: 'Read Full',
        createInvestigation: 'Create Investigation',
        newInvestigation: '+ New Investigation',
        create: 'Create',
        cancel: 'Cancel',
        viewArticles: 'View Articles',
        viewNetwork: 'View Network'
      },
      labels: {
        viralScore: 'Viral Score',
        source: 'Source',
        keywords: 'Keywords',
        deepDive: '📍 Deep Dive Points',
        topics: 'Topics',
        articles: 'Articles',
        avgScore: 'Avg',
        people: '👥 People',
        places: '📍 Places',
        organizations: '🏢 Organizations',
        numbers: '📊 Numbers',
        percentages: '% Percentages',
        dates: '📅 Dates',
        mentions: 'mentions',
        coOccurrence: 'co-occurrence',
        relatedEntities: 'Related Entities',
        foundIn: 'Found in',
        timeframe: '📅 Timeframe',
        published: 'Published'
      },
      timeframes: {
        '24h': 'Last 24 Hours',
        '3d': 'Last 3 Days',
        '7d': 'Last 7 Days',
        '14d': 'Last 14 Days',
        '1m': 'Last 1 Month',
        '3m': 'Last 3 Months',
        '6m': 'Last 6 Months',
        '1y': 'Last 1 Year',
        'all': 'All Time'
      }
    }
  };

  const t = translations[language];

  // Fetch articles with timeframe
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_URL}/articles`);
      url.searchParams.append('limit', 50);
      url.searchParams.append('min_viral_score', minViralScore);
      url.searchParams.append('timeframe', timeframe);
      if (filterCategory !== 'all') {
        url.searchParams.append('category', filterCategory);
      }

      const response = await fetch(url);
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
    setLoading(false);
  };

  // Fetch timeframe statistics
  const fetchTimeframeStats = async () => {
    try {
      const response = await fetch(`${API_URL}/timeframe-stats`);
      const data = await response.json();
      if (data.success) {
        setTimeframeStats(data.timeframe_stats || {});
      }
    } catch (error) {
      console.error('Error fetching timeframe stats:', error);
    }
  };

  // Fetch trends
  const fetchTrends = async () => {
    try {
      const response = await fetch(`${API_URL}/trending?limit=20`);
      const data = await response.json();
      setTrends(data.trends || []);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  // Fetch entities
  const fetchEntities = async () => {
    try {
      const response = await fetch(`${API_URL}/entities?type=all`);
      const data = await response.json();
      if (data.success) {
        setEntities(data.entities || {});
      }
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  // Fetch articles by entity
  const fetchArticlesByEntity = async (entityName, entityType) => {
    try {
      const response = await fetch(
        `${API_URL}/articles-by-entity?name=${encodeURIComponent(entityName)}&type=${entityType}`
      );
      const data = await response.json();
      if (data.success) {
        setEntityArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching entity articles:', error);
    }
  };

  // Fetch entity network
  const fetchEntityNetwork = async (entityName) => {
    try {
      const response = await fetch(
        `${API_URL}/entity-network?name=${encodeURIComponent(entityName)}`
      );
      const data = await response.json();
      if (data.success) {
        setEntityNetwork(data.related_entities || {});
        setRelatedEntities({
          name: entityName,
          foundIn: data.found_in_articles
        });
      }
    } catch (error) {
      console.error('Error fetching entity network:', error);
    }
  };

  // Trigger scrape
  const triggerScrape = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/scrape-now`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        await fetchArticles();
        await fetchTrends();
        await fetchEntities();
        await fetchTimeframeStats();
      }
    } catch (error) {
      console.error('Error triggering scrape:', error);
    }
    setLoading(false);
  };

  // Create investigation
  const handleCreateInvestigation = async () => {
    if (!investigationData.topic || !investigationData.angle) {
      alert(language === 'th' ? 'กรุณากรอกหัวข้อและมุมมอง' : 'Please fill in topic and angle');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/investigation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investigationData)
      });
      const data = await response.json();
      if (data.success) {
        setInvestigations([
          ...investigations,
          { id: data.investigation_id, ...investigationData, status: 'active', findings: '' }
        ]);
        setInvestigationData({ topic: '', angle: '' });
        setShowInvestigationForm(false);
      }
    } catch (error) {
      console.error('Error creating investigation:', error);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchTrends();
    fetchEntities();
    fetchTimeframeStats();
    const interval = setInterval(() => {
      fetchArticles();
      fetchTrends();
      fetchEntities();
      fetchTimeframeStats();
    }, 300000);
    return () => clearInterval(interval);
  }, [minViralScore, filterCategory, timeframe]);

  // ============ TIMEFRAME SELECTOR ============
  const TimeframeSelector = () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Calendar size={18} className="text-gray-700" />
        <label className="font-semibold text-gray-900">
          {language === 'th' ? '📅 ระยะเวลา' : '📅 Timeframe'}
        </label>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {Object.entries(t.timeframes).map(([tf_key, tf_label]) => (
          <button
            key={tf_key}
            onClick={() => setTimeframe(tf_key)}
            className={`px-2 py-2 rounded-lg text-sm font-medium transition ${
              timeframe === tf_key
                ? 'bg-blue-600 text-white border-2 border-blue-800'
                : 'bg-gray-200 text-gray-700 border-2 border-gray-300 hover:bg-gray-300'
            }`}
          >
            {tf_key === '24h' && '⏱️'}
            {tf_key === '3d' && '📆'}
            {tf_key === '7d' && '📅'}
            {tf_key === '14d' && '🗓️'}
            {tf_key === '1m' && '📊'}
            {tf_key === '3m' && '📈'}
            {tf_key === '6m' && '📉'}
            {tf_key === '1y' && '📋'}
            {tf_key === 'all' && '🌐'}
            {' '}
            {tf_key}
          </button>
        ))}
      </div>

      {/* Timeframe Statistics */}
      {timeframeStats[timeframe] && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {timeframeStats[timeframe].count} {language === 'th' ? 'ข่าว' : 'articles'}
              </p>
              <p className="text-xs text-gray-600">
                {language === 'th' ? 'เฉลี่ย' : 'Avg'} {timeframeStats[timeframe].avg_viral_score} {language === 'th' ? 'คะแนน' : 'score'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ============ VIRAL ARTICLES VIEW ============
  const ViralArticlesView = () => (
    <div className="space-y-4">
      {/* Timeframe Selector */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <TimeframeSelector />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={triggerScrape}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? t.buttons.scraping : t.buttons.scrapeNow}
        </button>
        <select
          value={minViralScore}
          onChange={(e) => setMinViralScore(Number(e.target.value))}
          className="px-3 py-2 border rounded-lg bg-white text-gray-900"
        >
          <option value={0}>{language === 'th' ? 'ทั้งหมด' : 'All Scores'}</option>
          <option value={50}>{language === 'th' ? 'คะแนน 50+' : 'Score 50+'}</option>
          <option value={70}>{language === 'th' ? 'คะแนน 70+' : 'Score 70+'}</option>
          <option value={85}>{language === 'th' ? 'คะแนน 85+' : 'Score 85+'}</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-white text-gray-900"
        >
          <option value="all">{language === 'th' ? 'หมวดหมู่ทั้งหมด' : 'All Categories'}</option>
          <option value="politics">{language === 'th' ? 'การเมือง' : 'Politics'}</option>
          <option value="economy">{language === 'th' ? 'เศรษฐกิจ' : 'Economy'}</option>
          <option value="technology">{language === 'th' ? 'เทคโนโลยี' : 'Technology'}</option>
          <option value="health">{language === 'th' ? 'สุขภาพ' : 'Health'}</option>
          <option value="stock_market">{language === 'th' ? 'ตลาดหุ้น' : 'Stock Market'}</option>
        </select>
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {articles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {language === 'th' ? 'ไม่พบข่าว' : 'No articles found'}
          </div>
        ) : (
          articles.map((article, idx) => (
            <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition bg-white">
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg leading-tight text-gray-900">{article.title}</h3>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {article.source}
                    </span>
                    <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700 capitalize">
                      {article.category}
                    </span>
                    {article.published_date && (
                      <span className="text-xs bg-green-100 px-2 py-1 rounded text-green-700">
                        📅 {new Date(article.published_date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{Math.round(article.viral_score)}</div>
                  <div className="text-xs text-gray-500">{t.labels.viralScore}</div>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{article.summary}</p>

              {/* Named Entities */}
              {article.deep_dive_highlights?.named_entities && (
                <div className="mb-3 space-y-2 bg-green-50 p-2 rounded">
                  {article.deep_dive_highlights.named_entities.people?.length > 0 && (
                    <div className="text-xs">
                      <span className="font-bold text-green-700">👥 {t.labels.people}:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {article.deep_dive_highlights.named_entities.people.slice(0, 3).map((p, i) => (
                          <span key={i} className="bg-green-100 text-green-700 px-1 rounded text-xs">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {article.deep_dive_highlights.named_entities.places?.length > 0 && (
                    <div className="text-xs">
                      <span className="font-bold text-green-700">📍 {t.labels.places}:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {article.deep_dive_highlights.named_entities.places.slice(0, 3).map((p, i) => (
                          <span key={i} className="bg-green-100 text-green-700 px-1 rounded text-xs">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {article.deep_dive_highlights.named_entities.organizations?.length > 0 && (
                    <div className="text-xs">
                      <span className="font-bold text-green-700">🏢 {t.labels.organizations}:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {article.deep_dive_highlights.named_entities.organizations.slice(0, 3).map((o, i) => (
                          <span key={i} className="bg-green-100 text-green-700 px-1 rounded text-xs">
                            {o}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {t.buttons.readFull}
                </a>
                <button
                  onClick={() => {
                    setInvestigationData({ topic: article.category, angle: article.title });
                    setShowInvestigationForm(true);
                  }}
                  className="text-xs px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  {t.buttons.startInvestigation}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ============ TRENDING TOPICS VIEW ============
  const TrendingTopicsView = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <TimeframeSelector />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trends.map((trend, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer bg-white"
            onClick={() => setSelectedTopic(trend)}
          >
            <h4 className="font-bold text-lg text-gray-900 capitalize mb-1">{trend.topic}</h4>
            <div className="flex gap-2">
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                {trend.frequency} {t.labels.articles}
              </span>
            </div>
            <button
              onClick={() => setFilterCategory(trend.topic)}
              className="w-full text-xs px-2 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded hover:opacity-90 mt-2"
            >
              {t.buttons.viewArticles}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // ============ INVESTIGATIONS VIEW ============
  const InvestigationsView = () => (
    <div className="space-y-4">
      <button
        onClick={() => setShowInvestigationForm(!showInvestigationForm)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        {t.buttons.newInvestigation}
      </button>

      {showInvestigationForm && (
        <div className="border rounded-lg p-4 bg-purple-50">
          <h3 className="font-bold mb-3 text-gray-900">📋 {t.buttons.createInvestigation}</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder={language === 'th' ? 'หัวข้อ' : 'Topic'}
              value={investigationData.topic}
              onChange={(e) => setInvestigationData({ ...investigationData, topic: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-gray-900"
            />
            <textarea
              placeholder={language === 'th' ? 'มุมมองการสืบสวน' : 'Investigation angle'}
              value={investigationData.angle}
              onChange={(e) => setInvestigationData({ ...investigationData, angle: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-gray-900"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateInvestigation}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {t.buttons.create}
              </button>
              <button
                onClick={() => setShowInvestigationForm(false)}
                className="px-4 py-2 border rounded-lg text-gray-600"
              >
                {t.buttons.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {investigations.map((inv) => (
          <div key={inv.id} className="border rounded-lg p-4 bg-white">
            <h4 className="font-bold text-gray-900 capitalize">{inv.topic}</h4>
            <p className="text-sm text-gray-700 mt-2">{inv.angle}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ============ ENTITIES VIEW ============
  const EntitiesView = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <TimeframeSelector />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={triggerScrape}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? t.buttons.scraping : t.buttons.scrapeNow}
        </button>
      </div>

      {/* Entity Type Tabs */}
      <div className="flex gap-2 border-b border-gray-300 pb-3 flex-wrap">
        {[
          { type: 'people', label: t.labels.people, icon: Users },
          { type: 'places', label: t.labels.places, icon: MapPin },
          { type: 'organizations', label: t.labels.organizations, icon: Building2 },
          { type: 'numbers', label: t.labels.numbers, icon: Hash }
        ].map((tab) => (
          <button
            key={tab.type}
            onClick={() => {
              setSelectedEntityType(tab.type);
              setSelectedEntity(null);
              setEntityArticles([]);
              setEntityNetwork({});
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedEntityType === tab.type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Entities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {entities[selectedEntityType] && entities[selectedEntityType].length > 0 ? (
          entities[selectedEntityType].map((entity, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedEntity(entity.name);
                fetchArticlesByEntity(entity.name, selectedEntityType);
                fetchEntityNetwork(entity.name);
              }}
              className={`border rounded-lg p-3 cursor-pointer transition ${
                selectedEntity === entity.name
                  ? 'bg-blue-100 border-blue-600'
                  : 'bg-white hover:shadow-lg'
              }`}
            >
              <h4 className="font-bold text-gray-900 truncate">{entity.name}</h4>
              <div className="text-sm text-gray-600 mt-1">
                {entity.count} {t.labels.mentions}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (entity.count / Math.max(...entities[selectedEntityType].map((e) => e.count))) * 100,
                      100
                    )}%`
                  }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            {language === 'th' ? 'ไม่พบตัวชี้วัด' : 'No entities found'}
          </div>
        )}
      </div>

      {/* Selected Entity Details */}
      {selectedEntity && (
        <div className="border-t-4 border-blue-600 rounded-lg p-4 bg-blue-50 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl text-gray-900">{selectedEntity}</h3>
              <p className="text-sm text-gray-600">
                {selectedEntityType} • {relatedEntities?.foundIn || 0} {t.labels.foundIn} articles
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedEntity(null);
                setEntityArticles([]);
                setEntityNetwork({});
              }}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Related Entities Network */}
          {entityNetwork && Object.keys(entityNetwork).length > 0 && (
            <div className="bg-white rounded p-3">
              <h4 className="font-semibold mb-2 text-gray-900">{t.labels.relatedEntities}</h4>
              <div className="space-y-2">
                {Object.entries(entityNetwork).map(([type, entities_list]) =>
                  entities_list.length > 0 ? (
                    <div key={type}>
                      <div className="text-xs font-bold text-gray-700 capitalize">{type}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entities_list.slice(0, 5).map((ent, i) => (
                          <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {ent.name} ({ent.co_occurrence})
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Articles Mentioning This Entity */}
          <div>
            <h4 className="font-semibold mb-2 text-gray-900">
              {t.labels.articles} ({entityArticles.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {entityArticles.slice(0, 10).map((article, idx) => (
                <div key={idx} className="bg-white p-2 rounded border border-gray-200">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 hover:underline text-sm line-clamp-2"
                  >
                    {article.title}
                  </a>
                  <div className="flex gap-2 mt-1 text-xs">
                    <span className="bg-gray-100 px-1 rounded">{article.source}</span>
                    <span className="text-red-600 font-bold">{article.viral_score.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-red-500" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-white">{t.title}</h1>
                <p className="text-xs text-gray-400">{t.subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              <Globe size={18} />
              <span className="font-bold">{language.toUpperCase()}</span>
            </button>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-2 border-t border-gray-700 pt-3 flex-wrap">
            {[
              { id: 'viral', label: t.tabs.viral },
              { id: 'trending', label: t.tabs.trending },
              { id: 'investigations', label: t.tabs.investigations },
              { id: 'entities', label: t.tabs.entities }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'viral' && <ViralArticlesView />}
        {activeTab === 'trending' && <TrendingTopicsView />}
        {activeTab === 'investigations' && <InvestigationsView />}
        {activeTab === 'entities' && <EntitiesView />}
      </div>
    </div>
  );
};

export default NewsScraperDashboard;
