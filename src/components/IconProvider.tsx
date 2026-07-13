"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { iconMap, sustainabilityDays } from '../data/sustainability';

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

interface IconContextType {
  dayData: any;
  selectedIconName: string;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  selectIcon: (name: string) => void;
  resetIcon: () => void;
  IconComponent: any;
}

const IconContext = createContext<IconContextType | undefined>(undefined);

export function IconProvider({ children }: { children: React.ReactNode }) {
  const [dayData, setDayData] = useState(sustainabilityDays[0]);
  const [selectedIconName, setSelectedIconName] = useState<string>('Leaf');
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    const day = getDayOfYear();
    const index = (day - 1) % sustainabilityDays.length;
    const currentDayData = sustainabilityDays[index];
    setDayData(currentDayData);
    
    const override = localStorage.getItem('global-icon-override');
    if (override) {
      setSelectedIconName(override);
    } else {
      setSelectedIconName(currentDayData.icon);
    }
  }, []);

  const selectIcon = (name: string) => {
    setSelectedIconName(name);
    localStorage.setItem('global-icon-override', name);
    setShowGrid(false);
  };

  const resetIcon = () => {
    localStorage.removeItem('global-icon-override');
    setSelectedIconName(dayData.icon);
    setShowGrid(false);
  };

  const IconComponent = iconMap[selectedIconName] || iconMap['Leaf'];

  return (
    <IconContext.Provider value={{ dayData, selectedIconName, showGrid, setShowGrid, selectIcon, resetIcon, IconComponent }}>
      {children}

      {showGrid && (
        <div className="icon-grid-overlay" onClick={() => setShowGrid(false)}>
          <div 
            className="icon-grid-modal"
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Choose an Icon</h3>
            <div className="icon-grid-container">
              {Object.keys(iconMap).map(name => {
                const GridIcon = iconMap[name];
                return (
                  <button
                    key={name}
                    onClick={() => selectIcon(name)}
                    className={`icon-grid-button ${selectedIconName === name ? 'selected' : ''}`}
                  >
                    <GridIcon size={24} />
                    <span style={{ fontSize: '0.6rem', marginTop: '0.5rem' }}>{name}</span>
                  </button>
                );
              })}
            </div>
            <button 
              onClick={resetIcon}
              className="icon-grid-reset"
            >
              Reset to Daily Auto-Icon
            </button>
          </div>
        </div>
      )}
    </IconContext.Provider>
  );
}

export function useDynamicIcon() {
  const context = useContext(IconContext);
  if (context === undefined) {
    throw new Error('useDynamicIcon must be used within an IconProvider');
  }
  return context;
}
