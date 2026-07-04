import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Award, Heart, Calendar, Flame, Coins, ExternalLink, ShieldAlert, Sparkles, Eye, Compass } from 'lucide-react';

interface Medal {
  _idRow: number;
  _sImage: string;
  _sName: string;
  _sGrade: string;
  _sGradeTitle: string;
  _tsDateAdded: number;
}

interface ContactInfo {
  _sTitle: string;
  _sValue: string;
  _sFormattedValue: string;
  _sIconClasses: string;
}

interface CoreStats {
  _sAccountAge: string;
  _nCurrentSubmissions: number;
  _nCurrentSubscribers: number;
  _nThanksReceived: number;
  _nPoints: number;
  _nSubmissionsFeatured: number;
  _nMedalsCount: number;
}

interface MemberProfile {
  _sName: string;
  _sUpicUrl?: string;
  _sPoints: string;
  _sPointsRank?: string;
  _bIsBanned: boolean;
  _aMedals?: Medal[];
  _aContactInfo?: ContactInfo[];
  _aCoreStats?: CoreStats;
  _aOnlineStatus?: {
    _bIsOnline: boolean;
    _sLocation?: string;
  };
}

export const AuthorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submissions state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Author ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    // Fetch profile details
    fetch(`https://gamebanana.com/apiv12/Member/${id}/ProfilePage`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch author profile');
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => {
        setError(err.message);
        console.error('Error fetching author profile:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch submissions feed
    setLoadingSubmissions(true);
    setSubmissionsError(null);
    fetch(`https://gamebanana.com/apiv12/Member/${id}/SubFeed?_nPage=1&_nPerpage=12`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load author submissions');
        }
        return res.json();
      })
      .then((data) => {
        setSubmissions(data._aRecords || []);
      })
      .catch((err) => {
        console.error('Error fetching submissions:', err);
        setSubmissionsError(err.message);
      })
      .finally(() => {
        setLoadingSubmissions(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="profile-detail-container loading-state">
        <div className="spinner-wrapper">
          <div className="loading-spinner"></div>
          <p>Loading creator profile details...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-detail-container error-state">
        <ShieldAlert size={48} className="placeholder-icon" style={{ color: '#ef4444' }} />
        <h3>Unable to load creator profile</h3>
        <p>{error || 'No profile data is available.'}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  const stats = profile._aCoreStats;
  const medals = profile._aMedals || [];
  const contacts = profile._aContactInfo || [];
  const isOnline = profile._aOnlineStatus?._bIsOnline || false;
  const avatarSeed = encodeURIComponent(profile._sName);
  const avatarUrl = profile._sUpicUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

  return (
    <div className="profile-detail-container" style={{ animation: 'fadeIn 0.4s ease' }}>
      <button onClick={() => navigate(-1)} className="back-button">
        <ChevronLeft size={16} />
        <span>Back</span>
      </button>

      <div className="profile-card author-profile-card">
        {/* Visual Header / Banner Accent */}
        <div className="profile-banner-container author-banner-accent">
          <div className="author-ambient-banner" />
          <div className="author-main-info-overlay">
            <div className="author-avatar-badge-wrapper">
              <div className="author-profile-avatar-container">
                <img src={avatarUrl} alt={profile._sName} className="author-profile-avatar" />
              </div>
              <span className={`online-status-indicator ${isOnline ? 'online' : 'offline'}`}></span>
            </div>
            
            <div className="author-identity">
              <div className="author-identity-top">
                <h1 className="author-profile-name">{profile._sName}</h1>
                {profile._bIsBanned && <span className="banned-badge">Banned</span>}
              </div>
              <p className="author-online-text">
                {isOnline ? 'Currently Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="profile-content-container author-body-content">
          {/* Stats Grid Column */}
          <div className="author-stats-grid">
            <div className="author-stat-card">
              <div className="stat-card-icon-wrapper orange">
                <Flame size={20} />
              </div>
              <div className="stat-card-details">
                <span className="stat-card-label">Subscribers</span>
                <span className="stat-card-value">{stats?._nCurrentSubscribers?.toLocaleString() || '0'}</span>
              </div>
            </div>

            <div className="author-stat-card">
              <div className="stat-card-icon-wrapper blue">
                <Coins size={20} />
              </div>
              <div className="stat-card-details">
                <span className="stat-card-label">Points</span>
                <span className="stat-card-value">{profile._sPoints || '0'}</span>
              </div>
            </div>

            <div className="author-stat-card">
              <div className="stat-card-icon-wrapper purple">
                <Heart size={20} />
              </div>
              <div className="stat-card-details">
                <span className="stat-card-label">Thanks Received</span>
                <span className="stat-card-value">{stats?._nThanksReceived?.toLocaleString() || '0'}</span>
              </div>
            </div>

            <div className="author-stat-card">
              <div className="stat-card-icon-wrapper emerald">
                <Calendar size={20} />
              </div>
              <div className="stat-card-details">
                <span className="stat-card-label">Account Age</span>
                <span className="stat-card-value">{stats?._sAccountAge || '3y'}</span>
              </div>
            </div>
          </div>

          {/* Double Column Area: Left (Medals) & Right (Links & Bio) */}
          <div className="author-details-columns">
            {/* Left Column - Medals Showcase */}
            <div className="author-details-main-col">
              <div className="author-section-header">
                <Award size={20} className="section-header-icon" />
                <h3 className="section-subtitle">Earned Medals ({medals.length})</h3>
              </div>
              
              {medals.length > 0 ? (
                <div className="author-medals-showcase-grid">
                  {medals.map((medal) => (
                    <div 
                      key={medal._idRow} 
                      className={`author-medal-item ${medal._sGrade || 'normal'}`}
                      title={`${medal._sName} (${medal._sGradeTitle} Medal)`}
                    >
                      <div className="medal-image-container">
                        <img src={medal._sImage} alt={medal._sName} className="medal-icon-img" />
                      </div>
                      <div className="medal-info">
                        <span className="medal-name">{medal._sName}</span>
                        <span className="medal-badge-tag">{medal._sGradeTitle}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-medals-box">
                  <p>This creator has not earned any medals yet.</p>
                </div>
              )}
            </div>

            {/* Right Column - Contacts & Details */}
            <div className="author-details-side-col">
              <div className="author-section-header">
                <ExternalLink size={18} className="section-header-icon" />
                <h3 className="section-subtitle">Social & Contact</h3>
              </div>

              {contacts.length > 0 ? (
                <div className="author-contacts-list">
                  {contacts.map((contact, i) => (
                    <div key={i} className="author-contact-row-card">
                      <div className="contact-info-left">
                        <span className="contact-title">{contact._sTitle}</span>
                      </div>
                      <div 
                        className="contact-value-wrapper"
                        dangerouslySetInnerHTML={{ __html: contact._sFormattedValue }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-contacts-box">
                  <p>No social contact links provided.</p>
                </div>
              )}
            </div>
          </div>

          {/* New Section: Author Created Mods Feed */}
          <div className="author-submissions-section" style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
            <div className="author-section-header" style={{ marginBottom: '24px' }}>
              <Sparkles size={20} className="section-header-icon" />
              <h3 className="section-subtitle">Created Mods ({submissions.length})</h3>
            </div>

            {loadingSubmissions ? (
              <div className="spinner-wrapper" style={{ padding: '40px 0' }}>
                <div className="loading-spinner"></div>
                <p>Loading submissions feed...</p>
              </div>
            ) : submissionsError ? (
              <div className="no-medals-box">
                <p>Error loading submissions: {submissionsError}</p>
              </div>
            ) : submissions.length > 0 ? (
              <div className="author-submissions-grid">
                {submissions.map((mod) => {
                  const firstImg = mod._aPreviewMedia?._aImages?.[0];
                  const modImgUrl = firstImg ? `${firstImg._sBaseUrl}/${firstImg._sFile}` : '';
                  const viewVal = mod._nViewCount >= 1000 ? (mod._nViewCount / 1000).toFixed(1) + 'K' : mod._nViewCount;
                  
                  return (
                    <Link to={`/mod/${mod._idRow}`} key={mod._idRow} className="author-submission-card">
                      <div className="submission-card-banner">
                        {modImgUrl ? (
                          <img src={modImgUrl} alt={mod._sName} className="submission-card-img" />
                        ) : (
                          <div className="submission-card-img-fallback">No Preview</div>
                        )}
                        <span className="submission-card-cat-badge">{mod._aSubCategory?._sName || mod._sSingularTitle || 'Mod'}</span>
                      </div>
                      
                      <div className="submission-card-body">
                        <h4 className="submission-card-title" title={mod._sName}>
                          {mod._sName}
                        </h4>
                        
                        <div className="submission-card-game-info">
                          <Compass size={12} className="inline-icon" />
                          <span>{mod._aGame?._sName || 'Arknights: Endfield'}</span>
                        </div>

                        <div className="submission-card-footer">
                          <div className="footer-stat">
                            <Eye size={12} />
                            <span>{viewVal}</span>
                          </div>
                          <div className="footer-stat highlight">
                            <Heart size={12} />
                            <span>{mod._nLikeCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="no-medals-box">
                <p>This creator has not submitted any mods yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorPage;
