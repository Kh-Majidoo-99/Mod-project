import React from 'react';
import ModCard from './ModCard';
import type { Mod } from './ModCard';
import { Inbox, Star } from 'lucide-react';
import gameBanner from '../../assets/game_banner.png';
import { GAMES } from '../main/Header';

interface ModFeedProps {
  mods: Mod[];
  onToggleFavorite: (id: string) => void;
  activeTab: string;
  subFilter: string;
  setSubFilter: (filter: string) => void;
  showNsfw: boolean;
  loading: boolean;
  currentGameId?: number;
}

export const ModFeed: React.FC<ModFeedProps> = ({
  mods,
  onToggleFavorite,
  activeTab,
  subFilter,
  setSubFilter,
  showNsfw,
  loading,
  currentGameId = 21842
}) => {
  const activeGame = GAMES.find((g) => g.id === currentGameId) || GAMES[0];

  const getFeedTitle = () => {
    switch (activeTab) {
      case 'favourites':
        return 'Favorited Mods';
      case 'mods':
      default:
        return 'Trending Mods';
    }
  };

  const getEmptyStateContent = () => {
    if (activeTab === 'favourites') {
      return {
        icon: <Star size={48} className="placeholder-icon" style={{ color: 'var(--accent-orange)' }} />,
        title: "No Favorites Yet",
        text: "Star mods from the feed, and they will appear in this section for quick access!"
      };
    }

    return {
      icon: <Inbox size={48} className="placeholder-icon" />,
      title: "No Mods Found",
      text: "We couldn't find any mods matching your search query. Try another keyword or category."
    };
  };

  const emptyState = getEmptyStateContent();

  const filterOptions = [
    { id: 'all', label: 'All Content' },
    { id: 'mod', label: 'Mods' },
    { id: 'sound', label: 'Sounds' },
    { id: 'wip', label: 'WIPs' }
  ];

  return (
    <section className="feed-section">
      {/* Game Banner Header */}
      {activeTab === 'mods' && (
        <div className="game-banner-header animate-fade-in" style={{
          background: activeGame.gradient
        }}>
          {activeGame.id === 21842 ? (
            <img src={gameBanner} alt={activeGame.name} className="game-banner-img" />
          ) : (
            <div className="game-banner-fallback-bg" style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${activeGame.bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(12px) brightness(0.55)',
              transform: 'scale(1.1)'
            }} />
          )}
          <div className="game-banner-overlay-dark" />
          <div className="game-banner-content">
            <span className="game-banner-tag">Official Community Hub</span>
            <h1 className="game-banner-title">{activeGame.name}</h1>
            <p className="game-banner-subtitle">
              Explore trending skins, gameplay mods, UI enhancements, and custom scripts created by the community.
            </p>
          </div>
        </div>
      )}

      {/* Subcategory Pills - Only for main Mod feed */}
      {activeTab === 'mods' && (
        <div className="filter-pills-row">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSubFilter(opt.id)}
              className={`filter-pill-btn ${subFilter === opt.id ? 'active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Mods Grid / Blank States */}
      {mods.length > 0 ? (
        <div className="mod-grid">
          {mods.map((mod) => (
            <ModCard
              key={mod.id}
              mod={mod}
              onToggleFavorite={onToggleFavorite}
              showNsfw={showNsfw}
            />
          ))}
        </div>
      ) : !loading ? (
        <div className="placeholder-view animate-fade-in" style={{ margin: '0' }}>
          {emptyState.icon}
          <h3 className="placeholder-title">{emptyState.title}</h3>
          <p className="placeholder-text">{emptyState.text}</p>
        </div>
      ) : null}

      {/* Infinite Scroll Shimmer Loading State Skeletons */}
      {loading && (
        <div className="mod-grid" style={{ marginTop: mods.length > 0 ? '20px' : '0' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="mod-card skeleton animate-pulse">
              <div className="mod-card-image-wrapper skeleton-box" style={{ height: '140px', backgroundColor: '#e2e8f0', border: 'none' }}></div>
              <div className="skeleton-box" style={{ width: '80px', height: '18px', borderRadius: '12px', marginTop: '4px' }}></div>
              <div className="skeleton-box" style={{ width: '85%', height: '22px', borderRadius: '6px', marginTop: '4px' }}></div>
              <div className="skeleton-box" style={{ width: '100%', height: '36px', borderRadius: '8px', marginTop: '4px' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div className="skeleton-box" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
                  <div className="skeleton-box" style={{ width: '50px', height: '12px', borderRadius: '4px' }}></div>
                </div>
                <div className="skeleton-box" style={{ width: '60px', height: '12px', borderRadius: '4px' }}></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};