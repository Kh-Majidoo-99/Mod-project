import React, { useState } from 'react';
import type { FeedItem } from '../../types';
import { Star, Eye, Download, ExternalLink } from 'lucide-react';
import ImageCarousel from './Feed dep/ImageCarousel';
import { Link } from 'react-router-dom';
import type { Mod } from './ModCard';

const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes || isNaN(bytes)) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface ModDetailCardProps {
  profileData: FeedItem;
  favoritedMods: Mod[];
  onToggleFavorite: (id: string, customModObj?: Mod) => void;
}

export const ModDetailCard: React.FC<ModDetailCardProps> = ({ 
  profileData,
  favoritedMods = [],
  onToggleFavorite
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyMd5 = (md5: string, index: number) => {
    navigator.clipboard.writeText(md5);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isFavorited = favoritedMods.some((m) => m.id === String(profileData.id));

  // Helper to map profileData to our standard Mod structure for favorites persistence
  const getBadgeClass = (modelName: string): 'development' | 'palette' | 'prototyping' | 'typography' => {
    const model = (modelName || '').toLowerCase();
    if (model === 'mod' || model === 'skin') return 'development';
    if (model === 'sound') return 'palette';
    if (model === 'wip') return 'prototyping';
    return 'typography';
  };

  const modObj: Mod = {
    id: String(profileData.id),
    title: profileData.title || 'Untitled',
    category: profileData._sModelName || 'Mod',
    badgeClass: getBadgeClass(profileData._sModelName),
    description: profileData.text ? profileData.text.replace(/<[^>]*>?/gm, '') : 'No description available.',
    image: profileData.imageUrl || '',
    author: {
      name: profileData.author || 'Unknown',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profileData.author || 'Unknown')}`
    },
    views: profileData._nViewCount ? (profileData._nViewCount >= 1000 ? (profileData._nViewCount / 1000).toFixed(1) + 'K' : String(profileData._nViewCount)) : '0',
    stars: profileData._nLikeCount || 0,
    isFavorited: isFavorited,
    link: profileData.link,
    _sInitialVisibility: profileData._sInitialVisibility || 'show',
  };

  // Extract details from mapping or raw data fields
  const viewsCount = profileData._nViewCount
    ? (profileData._nViewCount >= 1000 ? (profileData._nViewCount / 1000).toFixed(1) + 'K' : profileData._nViewCount)
    : '1.2K';
  const starsCount = profileData._nLikeCount ?? 42;
  const postDate = profileData._tsDateAdded
    ? new Date(profileData._tsDateAdded * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently';
  const categoryName = profileData._sModelName || 'Mod';

  const carouselImages = profileData.images && profileData.images.length > 0
    ? profileData.images
    : (profileData.imageUrl ? [profileData.imageUrl] : []);

  const memberId = profileData.authorId || (profileData.authorUrl ? profileData.authorUrl.match(/\/members?\/(\d+)/)?.[1] : null);

  return (
    <div className="profile-card animate-fade-in">
      {/* Visual Header / Banner */}
      <div className="profile-banner-container">
        <ImageCarousel images={carouselImages} title={profileData.title} />
      </div>

      {/* Main Info Section */}
      <div className="profile-content-container">
        <div className="profile-header-main">
          <div className="profile-meta-row">
            <span className="profile-category-badge">{categoryName}</span>
            <span className="profile-date">{postDate}</span>
          </div>
          <h1 className="profile-main-title">{profileData.title}</h1>
        </div>

        {/* Submitter info card */}
        <div className="profile-author-card">
          <div className="author-left">
            <div className="author-avatar-wrapper">
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profileData.author)}`}
                alt={profileData.author}
                className="author-avatar-img"
              />
            </div>
            <div className="author-details">
              <span className="author-label">Created By</span>
              {memberId ? (
                <Link
                  to={`/author/${memberId}`}
                  className="author-name-link"
                >
                  {profileData.author}
                  <ExternalLink size={12} className="inline-icon" />
                </Link>
              ) : (
                <span className="author-name-text">{profileData.author}</span>
              )}
            </div>
          </div>

          <div className="profile-stats-row">
            <div className="stat-badge">
              <Eye size={15} />
              <span>{viewsCount} Views</span>
            </div>
            <div className="stat-badge highlight">
              <Star size={15} fill="currentColor" />
              <span>{starsCount} Likes</span>
            </div>
            <button 
              className={`stat-badge favorite-badge-button ${isFavorited ? 'active' : ''}`}
              onClick={() => onToggleFavorite(String(profileData.id), modObj)}
              title={isFavorited ? "Remove from Favorites" : "Save to Favorites"}
            >
              <Star size={15} fill={isFavorited ? "currentColor" : "none"} />
              <span>{isFavorited ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Mod details body */}
        <div className="profile-body-section">
          <h3 className="section-subtitle">Description</h3>
          <div
            className="profile-description-text"
            dangerouslySetInnerHTML={{ __html: profileData.text || '<p>No description provided.</p>' }}
          />
        </div>

        {/* Download Footer action */}
        {profileData.downloadUrl && (
          <div className="profile-download-bar">
            <a
              href={profileData.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-download-button"
            >
              <Download size={18} />
              <span>Download on GameBanana</span>
            </a>
          </div>
        )}

        {/* Direct Downloads Section */}
        {(() => {
          const files = profileData._aFiles || profileData._afiles || [];
          if (!files || files.length === 0) return null;
          
          return (
            <div className="direct-downloads-section animate-fade-in">
              <h4 className="direct-downloads-title">
                <Download size={16} className="title-icon" style={{ color: 'var(--accent-orange)' }} />
                <span>Direct Download Links</span>
              </h4>
              <div className="direct-downloads-grid">
                {files.map((file: any, index: number) => {
                  const fileSizeStr = formatBytes(file._nFilesize);
                  const isZip = (file._sFile || '').toLowerCase().endsWith('.zip') || 
                                (file._sFile || '').toLowerCase().endsWith('.rar') || 
                                (file._sFile || '').toLowerCase().endsWith('.7z');
                  
                  return (
                    <div key={file._idRow || index} className="direct-download-card">
                      <div className="file-info-header">
                        <div className="file-icon-wrapper">
                          {isZip ? (
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" className="zip-icon" style={{ color: 'var(--accent-orange)' }}>
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                              <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" className="generic-file-icon" style={{ color: 'var(--accent-orange)' }}>
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                          )}
                        </div>
                        <div className="file-text-details">
                          <span className="file-name" title={file._sFile}>{file._sFile}</span>
                          <div className="file-meta-row-sub">
                            <span className="file-size-badge">{fileSizeStr}</span>
                            {file._nDownloadCount !== undefined && (
                              <span className="file-dl-count">{file._nDownloadCount.toLocaleString()} dl</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {file._sMd5Checksum && (
                        <div className="file-md5-container">
                          <span className="md5-label">MD5:</span>
                          <code className="md5-value" title={file._sMd5Checksum}>{file._sMd5Checksum}</code>
                          <button 
                            className="copy-md5-btn"
                            onClick={() => handleCopyMd5(file._sMd5Checksum, index)}
                            title="Copy MD5 checksum"
                          >
                            {copiedIndex === index ? (
                              <span className="copied-text">Copied!</span>
                            ) : (
                              <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            )}
                          </button>
                        </div>
                      )}
                      
                      <a
                        href={file._sDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="direct-dl-action-button"
                      >
                        <Download size={13} />
                        <span>Direct Download</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ModDetailCard;
