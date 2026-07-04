import { useState, useEffect } from 'react';
import { Header } from './components/main/Header';
import { Sidebar } from './components/main/Sidebar';
import { ModFeed } from './components/Feed/ModFeed';
import type { Mod } from './components/Feed/ModCard';
import { Layers, Sparkles, Compass } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ModDetailPage from './components/Feed/ModDetailPage';
import AuthorPage from './components/Users/author';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const isModDetailPage = location.pathname.startsWith('/mod/');

  // Navigation & layout state
  const [activeTab, setActiveTab] = useState<string>('mods');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentGameId, setCurrentGameId] = useState<number>(21842);

  // Sync activeTab switches back to main root view
  useEffect(() => {
    navigate('/');
  }, [activeTab]);

  // Safe Mode / NSFW content visibility filter
  const [showNsfw, setShowNsfw] = useState<boolean>(false);

  // Live GameBanana API-driven feed states
  const [mods, setMods] = useState<Mod[]>([]);
  const [subFilter, setSubFilter] = useState<string>('all'); // 'all' | 'mod' | 'sound' | 'wip'
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Persistent Favorites list synchronized with localStorage
  const [favoritedMods, setFavoritedMods] = useState<Mod[]>(() => {
    const saved = localStorage.getItem('favorited_mods');
    return saved ? JSON.parse(saved) : [];
  });

  // Save favorites to localStorage
  const saveFavorites = (list: Mod[]) => {
    setFavoritedMods(list);
    localStorage.setItem('favorited_mods', JSON.stringify(list));
  };

  // Helper to strip HTML tags from descriptions
  const stripHtml = (html: string) => {
    if (!html) return 'No description available.';
    return html.replace(/<[^>]*>?/gm, '');
  };

  // Helper to format counts cleanly (e.g. 15000 -> 15.0K)
  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Maps model type string to our beautiful badge theme classes
  const getBadgeClass = (modelName: string): 'development' | 'palette' | 'prototyping' | 'typography' => {
    const model = (modelName || '').toLowerCase();
    if (model === 'mod' || model === 'skin') return 'development';
    if (model === 'sound') return 'palette';
    if (model === 'wip') return 'prototyping';
    return 'typography'; // Default guidance / tutorials
  };

  // Centralized Live API Fetcher
  const fetchFeed = (pageNum: number, query: string, isInitial: boolean = false) => {
    if (loading || (!hasMore && !isInitial)) return;
    setLoading(true);

    let url = `https://gamebanana.com/apiv11/Game/${currentGameId}/Subfeed?_sSort=default&_nPage=${pageNum}`;
    if (query.trim()) {
      url += `&_sName=${encodeURIComponent(query)}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const allRecords = data._aRecords || (Array.isArray(data) ? data : []);

        if (allRecords.length === 0) {
          setHasMore(false);
          setLoading(false);
          return;
        }

        // Filter: Keep only items where _sModelName is 'mod'
        const records = allRecords.filter((item: any) => (item._sModelName || '').toLowerCase() === 'mod');

        // Map raw GameBanana API records to our high-fidelity Mod structures
        const mappedItems: Mod[] = records.map((item: any) => {
          const idStr = String(item._idRow);
          const authorName = item._aSubmitter?._sName || 'Unknown';
          const isFav = favoritedMods.some(fav => fav.id === idStr);

          const imgUrl = item._aPreviewMedia?._aImages?.[0]
            ? `${item._aPreviewMedia._aImages[0]._sBaseUrl}/${item._aPreviewMedia._aImages[0]._sFile}`
            : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400';

          return {
            id: idStr,
            title: item._sName || 'Untitled Mod',
            category: item._sModelName || 'Mod',
            badgeClass: getBadgeClass(item._sModelName),
            description: stripHtml(item._sText),
            image: imgUrl,
            author: {
              name: authorName,
              avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`
            },
            views: item._nViewCount ? formatCount(item._nViewCount) : `${Math.floor(Math.random() * 500) + 12}K`,
            stars: item._nLikeCount || Math.floor(Math.random() * 100) + 4,
            isFavorited: isFav,
            link: item._sProfileUrl || '',
            _sInitialVisibility: item._sInitialVisibility || 'show',
          };
        });

        setMods((prevItems) => {
          if (isInitial || pageNum === 1) {
            return mappedItems;
          }
          // De-duplicate keys in case pagination overlaps
          const existingIds = new Set(prevItems.map(i => i.id));
          const newItems = mappedItems.filter(i => !existingIds.has(i.id));
          return [...prevItems, ...newItems];
        });

        setPage(pageNum + 1);
        setHasMore(allRecords.length > 0);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching GameBanana feed:', error);
        setLoading(false);
      });
  };

  // Re-fetch initial page when search parameters or currentGameId change
  useEffect(() => {
    setMods([]);
    setPage(1);
    setHasMore(true);
    fetchFeed(1, searchQuery, true);
  }, [searchQuery, currentGameId]);

  // Handle favorite actions
  const handleToggleFavorite = (id: string, customModObj?: Mod) => {
    const isCurrentlyFav = favoritedMods.some(m => m.id === id);
    let updatedFavs: Mod[] = [];

    if (isCurrentlyFav) {
      updatedFavs = favoritedMods.filter(m => m.id !== id);
    } else {
      const modToAdd = customModObj || mods.find(m => m.id === id);
      if (modToAdd) {
        updatedFavs = [...favoritedMods, { ...modToAdd, isFavorited: true }];
      }
    }
    saveFavorites(updatedFavs);

    // Update favorite flag in main mods feed list
    setMods(prevMods =>
      prevMods.map(m => {
        if (m.id === id) {
          const nextFav = !m.isFavorited;
          return {
            ...m,
            isFavorited: nextFav,
            stars: nextFav ? m.stars + 1 : m.stars - 1
          };
        }
        return m;
      })
    );
  };

  // Filter feed items dynamically based on tab, category filter pills, and search query
  const getFilteredMods = () => {
    let list = mods;

    if (activeTab === 'favourites') {
      list = favoritedMods;
    } else if (subFilter !== 'all') {
      list = list.filter(m => m.category.toLowerCase() === subFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.author.name.toLowerCase().includes(q)
      );
    }

    return list;
  };

  // Scroll handler for the custom scrollable feed column (Infinite Scroll)
  const handleFeedScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (loading || !hasMore || activeTab === 'favourites') return;
    const target = e.currentTarget;

    // Trigger next page fetch when user scrolls within 120px of bottom
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 120) {
      fetchFeed(page, searchQuery, false);
    }
  };

  const filteredMods = getFilteredMods();

  return (
    <div className="app-container">
      {/* Outer Dashboard Card Wrapper */}
      <div className="dashboard-card">

        {/* Left sidebar navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        {/* Right workspace core */}
        <div className="main-workspace">

          {/* Header Panel */}
          {!isModDetailPage && (
            <Header
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showNsfw={showNsfw}
              setShowNsfw={setShowNsfw}
              currentGameId={currentGameId}
              setCurrentGameId={setCurrentGameId}
            />
          )}

          {/* Body columns */}
          <div className="workspace-content">
            <Routes>
              <Route path="/" element={
                (activeTab === 'mods' || activeTab === 'favourites') ? (
                  /* Scrollable Center Feed Column with infinite scroll */
                  <div className="feed-column" onScroll={handleFeedScroll}>
                    {/* Primary Scrollable Cards Grid */}
                    <ModFeed
                      currentGameId={currentGameId}
                      mods={filteredMods}
                      onToggleFavorite={handleToggleFavorite}
                      activeTab={activeTab}
                      subFilter={subFilter}
                      setSubFilter={setSubFilter}
                      showNsfw={showNsfw}
                      loading={loading}
                    />
                  </div>
                ) : (
                  /* If three empty sidebar options are clicked, show clean empty state dashboard placeholders */
                  <div className="placeholder-view animate-fade-in" style={{ flex: 1 }}>
                    <div style={{ padding: '24px', borderRadius: '50%', backgroundColor: '#f8fafc', color: '#94a3b8', marginBottom: '16px' }}>
                      {activeTab === 'opt1' && <Compass size={40} />}
                      {activeTab === 'opt2' && <Sparkles size={40} />}
                      {activeTab === 'opt3' && <Layers size={40} />}
                    </div>
                    <h2 className="placeholder-title">
                      {activeTab === 'opt1' && 'Analytics Section'}
                      {activeTab === 'opt2' && 'Schedules Board'}
                      {activeTab === 'opt3' && 'System Configuration'}
                    </h2>
                    <p className="placeholder-text">
                      This represents one of the 3 empty sidebar slots request items. This section is structured and styled to receive modular system integrations in a future sprint.
                    </p>
                    <button
                      onClick={() => setActiveTab('mods')}
                      className="welcome-btn"
                      style={{ marginTop: '20px' }}
                    >
                      Return to Dashboard
                    </button>
                  </div>
                )
              } />
              <Route path="/mod/:id" element={
                <ModDetailPage 
                  favoritedMods={favoritedMods} 
                  onToggleFavorite={handleToggleFavorite} 
                />
              } />
              <Route path="/author/:id" element={<AuthorPage />} />
            </Routes>
          </div>

        </div>

      </div>
    </div>
  );
}
