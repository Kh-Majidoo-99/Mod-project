import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface Mod {
  id: string;
  title: string;
  category: string;
  badgeClass: 'prototyping' | 'typography' | 'palette' | 'development';
  description: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  views: string;
  stars: number;
  isFavorited: boolean;
  link?: string;
  _sInitialVisibility?: string;
}

interface ModCardProps {
  mod: Mod;
  onToggleFavorite: (id: string) => void;
  showNsfw?: boolean;
}

const ModCard = ({ mod, onToggleFavorite, showNsfw }: ModCardProps) => {
  const navigate = useNavigate();
  const [showImage, setShowImage] = useState(mod._sInitialVisibility === 'hide' || mod._sInitialVisibility === 'warn' ? false : true);

  let isVisible = showNsfw || showImage;
  const favorited = mod.isFavorited;
  if (showNsfw === true) {
    isVisible = true;
  }

  const handleCardClick = () => {
    // If the image is NSFW and currently hidden, click to reveal instead of navigating
    if (!isVisible) {
      setShowImage(true);
      return;
    }
    navigate(`/mod/${mod.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(mod.id);
  };

  return (
    <div className="mod-card" onClick={handleCardClick}>
      <div className="card-image-container">
        {mod.image && <img src={mod.image} alt={mod.title} className="feed-image" />}

        {/* NSFW Blurred Glassmorphism Overlay */}
        {!isVisible && (
          <div className="nsfw-overlay-placeholder" onClick={(e) => { e.stopPropagation(); setShowImage(true); }}>
            <span className="nsfw-badge-label">NSFW 18+</span>
            <span className="nsfw-click-prompt">Click to reveal</span>
          </div>
        )}

        {/* Favorite Icon Button */}
        <button
          className={`favorite-btn ${favorited ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          title={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Star size={16} fill={favorited ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="card-details">
        <h4 className="card-mod-title">{mod.title}</h4>
        <div className="card-mod-author">
          <span className="author-dot"></span>
          <span>By {mod.author.name}</span>
        </div>
      </div>
    </div>
  );
};
export default ModCard;
