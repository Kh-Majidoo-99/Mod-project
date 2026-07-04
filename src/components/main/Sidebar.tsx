import React from 'react';
import { 
  FolderHeart, 
  Layers, 
  Sparkles,
  Compass,
  Settings,

} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
} 

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab
}) => {
  // 5 main items: Mods, Favourites, and 3 empty options
  const menuItems = [
    {
      id: 'mods',
      icon: <Layers size={20} />
    },
    {
      id: 'favourites',
      icon: <FolderHeart size={20} />
    },
    {
      id: 'opt1',
      icon: <Compass size={20} />
    },
    {
      id: 'opt2',
      icon: <Sparkles size={20} />
    },
    {
      id: 'opt3',
      icon: <Settings size={20} />
    }
  ];

  const labelMap: Record<string, string> = {
    mods: 'Mods Feed',
    favourites: 'Favourites',
    opt1: 'Analytics',
    opt2: 'Schedules',
    opt3: 'Settings'
  };

  return (
    <aside className="sidebar">
      {/* Logo & close action button
      <div className="sidebar-logo-container" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="sidebar-logo">
            <span>Δ</span>
          </div>
          <span className="sidebar-title">Mod Station</span>
        </div>
        
      </div> */}

      {/* Navigation Options */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                title={labelMap[item.id] || item.id}
                aria-label={labelMap[item.id] || item.id}
            >
              {item.icon}
              
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
