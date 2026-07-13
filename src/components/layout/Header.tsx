"use client";

import React, { useState, useEffect } from 'react';
import { Search, User, Menu, MessageSquare, Sun, Moon, Eye } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useDynamicIcon } from '../IconProvider';
import Link from 'next/link';

export function Header({ 
  toggleSidebar, 
  toggleChatbot 
}: { 
  toggleSidebar: () => void; 
  toggleChatbot: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const { IconComponent, setShowGrid } = useDynamicIcon();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      // Get time for India (Asia/Kolkata)
      const options: Intl.DateTimeFormatOptions = { 
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      const formatter = new Intl.DateTimeFormat('en-IN', options);
      setTimeStr(formatter.format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header glass">
      <div className="header-left">
        <button onClick={toggleSidebar} className="icon-button" aria-label="Toggle Sidebar">
          <Menu size={24} />
        </button>
        <Link href="/" className="logo-container">
          <img src="/logo.png" alt="Harshz Technologies" />
        </Link>
      </div>

      <div className="search-container">
        <Search size={18} className="search-icon-left" />
        <input type="text" placeholder="Search everywhere..." className="search-input" />
        <button 
          onDoubleClick={() => setShowGrid(true)} 
          className="search-icon-right"
          title="Double tap to change icon"
          aria-label="Dynamic Icon"
        >
          <IconComponent size={18} />
        </button>
      </div>

      <div className="header-right">
        <div className="time-display">
          {timeStr} (IST)
        </div>
        
        <div className="theme-toggle-group">
          <button 
            onClick={() => setTheme('light')} 
            className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
            aria-label="Light Mode"
          >
            <Sun size={16} />
          </button>
          <button 
            onClick={() => setTheme('dark')} 
            className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
            aria-label="Dark Mode"
          >
            <Moon size={16} />
          </button>
          <button 
            onClick={() => setTheme('high-contrast')} 
            className={`theme-toggle-btn ${theme === 'high-contrast' ? 'active' : ''}`}
            aria-label="High Contrast Mode"
          >
            <Eye size={16} />
          </button>
        </div>

        <button className="icon-button" aria-label="Profile / Login">
          <User size={20} />
        </button>

        <button onClick={toggleChatbot} className="icon-button" aria-label="Toggle Chatbot">
          <MessageSquare size={20} />
        </button>
      </div>
    </header>
  );
}
