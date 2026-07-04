import React from 'react';
import { Search } from 'lucide-react';

import zzzimg from '../../assets/zzz.png';
import deadlockimg from '../../assets/deadlock.png';
import arknightsimg from '../../assets/arknights.png';
import userimg from '../../assets/user.jpg';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showNsfw: boolean;
  setShowNsfw: (val: boolean) => void;
  currentGameId: number;
  setCurrentGameId: (id: number) => void;
}

export const GAMES = [
  {
    id: 21842,
    name: 'Arknights',
    shortName: 'AK',
    color: '#ff8e3c',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #ff8e3c 100%)',
    bgImage: arknightsimg
  },
  {
    id: 20948,
    name: 'Deadlock',
    shortName: 'DL',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #450a0a 0%, #ef4444 100%)',
    bgImage: deadlockimg
  },
  {
    id: 19567,
    name: 'Zenless Zone Zero',
    shortName: 'ZZZ',
    color: '#e2ff44',
    gradient: 'linear-gradient(135deg, #022c22 0%, #10b981 100%)',
    bgImage: zzzimg
  }
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  showNsfw,
  setShowNsfw,
  currentGameId,
  setCurrentGameId
}) => {
  return (
    <div className="header-wrapper">
      <header className="header">
        <div className="header-left">
          {/* Search input container */}
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search mods, authors, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="header-right">
          {/* NSFW Filter / Safe Mode Toggle */}
          <button
            onClick={() => setShowNsfw(!showNsfw)}
            className={`nsfw-toggle-btn ${showNsfw ? 'show-all' : 'safe-mode'}`}
            title={showNsfw ? "Disable NSFW content" : "Show NSFW content"}
          >
            <span className="dot"></span>
            <span className="text">{showNsfw ? "18+ On" : "Safe Mode"}</span>
          </button>

          {/* User Mini UI */}
          <div className="header-user-profile">
            <div className="user-info-text">
              <span className="user-name">John Doe</span>
              <span className="user-role">Mod Creator</span>
            </div>
            <img
              src={userimg}
              alt="John Doe Avatar"
              className="user-avatar"
            />
          </div>
        </div>
      </header>

      {/* Game Selector Row */}
      <div className="game-selector-container">
        <div className="game-selector-header">
          <span className="game-selector-title">Select Game Database</span>
          <span className="game-selector-subtitle">Switch between live Banana feeds</span>
        </div>
        <div className="game-selector-list">
          {GAMES.map((game) => {
            const isActive = game.id === currentGameId;
            return (
              <button
                key={game.id}
                onClick={() => setCurrentGameId(game.id)}
                className={`game-selector-item ${isActive ? 'active' : ''}`}
                style={{
                  '--game-accent-color': game.color,
                  '--game-gradient': game.gradient,
                } as React.CSSProperties}
              >
                <div
                  className="game-icon-bg"
                  style={{ backgroundImage: `url(${game.bgImage})` }}
                />
                <div className="game-icon-overlay" />
                <div className="game-icon-glow" />
                <div className="game-icon-content">
                  <span className="game-icon-short">{game.shortName}</span>
                  <span className="game-icon-full">{game.name}</span>
                </div>
                {isActive && <span className="game-icon-active-badge" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
