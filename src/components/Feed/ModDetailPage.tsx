import { useState, useEffect } from 'react';
import type { FeedItem } from '../../types';
import ModDetailCard from './ModDetailCard';
import { useParams, useNavigate } from 'react-router-dom';
import type { Mod } from './ModCard';

interface ModDetailPageProps {
  favoritedMods: Mod[];
  onToggleFavorite: (id: string, customModObj?: Mod) => void;
}

const ModDetailPage = ({ favoritedMods = [], onToggleFavorite }: ModDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<FeedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Profile ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`https://gamebanana.com/apiv12/Mod/${id}/ProfilePage`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch profile data');
        }
        return res.json();
      })
      .then((data) => {
        const mappedData: FeedItem = {
          id: data._idRow,
          author: data._aSubmitter?._sName || 'Unknown',
          authorId: data._aSubmitter?._idRow,
          authorUrl: data._aSubmitter?._idRow ? `https://gamebanana.com/members/${data._aSubmitter._idRow}` : undefined,
          downloadUrl: data._sProfileUrl ? `${data._sProfileUrl}#FileInfo` : undefined,
          title: data._sName || 'Untitled',
          imageUrl: data._aPreviewMedia?._aImages?.[0]
            ? `${data._aPreviewMedia._aImages[0]._sBaseUrl}/${data._aPreviewMedia._aImages[0]._sFile}`
            : '',
          images: data._aPreviewMedia?._aImages?.map(
            (img: any) => `${img._sBaseUrl}/${img._sFile}`
          ) || [],
          link: data._sProfileUrl || '',
          text: data._sText || '',
          ...(data as any),
        };
        setProfileData(mappedData);
      })
      .catch((err) => {
        setError(err.message);
        console.error('Error fetching profile data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="profile-detail-container loading-state">
        <div className="spinner-wrapper">
          <div className="loading-spinner"></div>
          <p>Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-detail-container error-state">
        <h3>Unable to load mod details</h3>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Back to Mods
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-detail-container error-state">
        <h3>No profile data available.</h3>
        <button onClick={() => navigate(-1)} className="back-button">
          Back to Mods
        </button>
      </div>
    );
  }

  return (
    <div className="profile-detail-container" style={{ animation: 'fadeIn 0.4s ease' }}>
      <button onClick={() => navigate(-1)} className="back-button">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Back to Mods</span>
      </button>
      <ModDetailCard 
        profileData={profileData} 
        favoritedMods={favoritedMods}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
};

export default ModDetailPage;
