"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Award } from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState({
    v6: { points: 0, stars: 0 },
    v2019: { points: 0, stars: 0 },
    v2015: { points: 0, stars: 0 },
    igbc: { points: 0, level: 'None' }
  });

  const [projectInfo, setProjectInfo] = useState({
    name: '',
    siteArea: '',
    builtUpArea: '',
    occupancyFixed: '',
    occupancyFloating: '',
    climateZone: 'Composite'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const v6 = JSON.parse(localStorage.getItem('stats_v6') || '{"points": 0, "stars": 0}');
      const v2019 = JSON.parse(localStorage.getItem('stats_v2019') || '{"points": 0, "stars": 0}');
      const v2015 = JSON.parse(localStorage.getItem('stats_v2015') || '{"points": 0, "stars": 0}');
      const igbc = JSON.parse(localStorage.getItem('stats_igbc') || '{"points": 0, "level": "None"}');
      setStats({ v6, v2019, v2015, igbc });

      const savedProject = JSON.parse(localStorage.getItem('project_info') || 'null');
      if (savedProject) setProjectInfo(savedProject);
    }
  }, []);

  const handleProjectInfoChange = (field: string, value: string) => {
    const newInfo = { ...projectInfo, [field]: value };
    setProjectInfo(newInfo);
    localStorage.setItem('project_info', JSON.stringify(newInfo));
  };

  const renderStars = (count: number, colorClass: string) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? `fill-${colorClass} text-${colorClass} glow-${colorClass}` : "text-white/20"}`} />
    ));
  };

  return (
    <div className="container px-4 md:px-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-foreground tracking-tight">
        Project Dashboard
      </h1>

      {/* Project Information Section */}
      <div className="glass-card p-8 md:p-10 mb-16 border-t-4 border-t-igbc-blue">
        <h2 className="text-2xl font-bold mb-8 text-foreground/90">Project Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="glass-panel p-6">
            <label className="block text-sm font-semibold mb-3 text-foreground/80">Project Name</label>
            <input 
              type="text" 
              value={projectInfo.name}
              onChange={(e) => handleProjectInfoChange('name', e.target.value)}
              className="!w-full glass-input !p-4 focus-ring-igbc-blue text-base" 
              placeholder="Enter Project Name" 
            />
          </div>
          
          <div className="glass-panel p-6">
            <label className="block text-sm font-semibold mb-3 text-foreground/80">Total Site Area (sq.m)</label>
            <input 
              type="number" 
              value={projectInfo.siteArea}
              onChange={(e) => handleProjectInfoChange('siteArea', e.target.value)}
              className="!w-full glass-input !p-4 focus-ring-igbc-blue text-base" 
              placeholder="e.g. 5000" 
            />
          </div>

          <div className="glass-panel p-6">
            <label className="block text-sm font-semibold mb-3 text-foreground/80">Built-up Area (sq.m)</label>
            <input 
              type="number" 
              value={projectInfo.builtUpArea}
              onChange={(e) => handleProjectInfoChange('builtUpArea', e.target.value)}
              className="!w-full glass-input !p-4 focus-ring-igbc-blue text-base" 
              placeholder="e.g. 12000" 
            />
          </div>

          <div className="glass-panel p-6">
            <label className="block text-sm font-semibold mb-3 text-foreground/80">Occupancy (Fixed)</label>
            <input 
              type="number" 
              value={projectInfo.occupancyFixed}
              onChange={(e) => handleProjectInfoChange('occupancyFixed', e.target.value)}
              className="!w-full glass-input !p-4 focus-ring-igbc-blue text-base" 
              placeholder="e.g. 200" 
            />
          </div>

          <div className="glass-panel p-6">
            <label className="block text-sm font-semibold mb-3 text-foreground/80">Occupancy (Floating)</label>
            <input 
              type="number" 
              value={projectInfo.occupancyFloating}
              onChange={(e) => handleProjectInfoChange('occupancyFloating', e.target.value)}
              className="!w-full glass-input !p-4 focus-ring-igbc-blue text-base" 
              placeholder="e.g. 50" 
            />
          </div>

          <div className="glass-panel p-6">
            <label className="block text-sm font-semibold mb-3 text-foreground/80">Climate Zone</label>
            <select 
              value={projectInfo.climateZone}
              onChange={(e) => handleProjectInfoChange('climateZone', e.target.value)}
              className="!w-full glass-input !p-4 text-foreground focus-ring-igbc-blue text-base"
            >
              <option value="Composite" className="bg-card text-foreground">Composite</option>
              <option value="Hot and Dry" className="bg-card text-foreground">Hot and Dry</option>
              <option value="Warm and Humid" className="bg-card text-foreground">Warm and Humid</option>
              <option value="Moderate" className="bg-card text-foreground">Moderate</option>
              <option value="Cold" className="bg-card text-foreground">Cold</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/griha-v2015" className="no-underline block h-full">
            <div className="glass-card cursor-pointer text-center p-8 md:p-10 h-full flex flex-col justify-center border-t-rose-red">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-rose-red">GRIHA V2015</h3>
              <div className="mb-4 flex flex-col items-center glass-panel p-4">
                <div className="text-3xl font-bold text-rose-red mb-2">{stats.v2015.points} <span className="text-sm font-normal text-foreground/60">pts</span></div>
                <div className="flex gap-1">
                  {renderStars(stats.v2015.stars, 'rose-red')}
                </div>
              </div>
              <p className="opacity-80 text-foreground leading-relaxed text-sm">Initiate and manage a project strictly following the GRIHA Version 2015 standards.</p>
            </div>
          </Link>

          <Link href="/griha-v2019" className="no-underline block h-full">
            <div className="glass-card cursor-pointer text-center p-8 md:p-10 h-full flex flex-col justify-center border-t-green">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-green">GRIHA V2019</h3>
              <div className="mb-4 flex flex-col items-center glass-panel p-4">
                <div className="text-3xl font-bold text-green mb-2">{stats.v2019.points} <span className="text-sm font-normal text-foreground/60">pts</span></div>
                <div className="flex gap-1">
                  {renderStars(stats.v2019.stars, 'green')}
                </div>
              </div>
              <p className="opacity-80 text-foreground leading-relaxed text-sm">Initiate and manage a project strictly following the GRIHA Version 2019 standards.</p>
            </div>
          </Link>

          <Link href="/griha-v6" className="no-underline block h-full">
            <div className="glass-card cursor-pointer text-center p-8 md:p-10 h-full flex flex-col justify-center border-t-orange">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-orange">GRIHA V6</h3>
              <div className="mb-4 flex flex-col items-center glass-panel p-4">
                <div className="text-3xl font-bold text-orange mb-2">{stats.v6.points} <span className="text-sm font-normal text-foreground/60">pts</span></div>
                <div className="flex gap-1">
                  {renderStars(stats.v6.stars, 'orange')}
                </div>
              </div>
              <p className="opacity-80 text-foreground leading-relaxed text-sm">Initiate and manage a project strictly following the latest GRIHA Version 6 standards.</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/igbc-sb-2020" className="no-underline block h-full">
            <div className="glass-card cursor-pointer text-center p-8 md:p-10 h-full flex flex-col justify-center border-t-igbc-blue">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-igbc-blue">IGBC SB 2020</h3>
              <div className="mb-4 flex flex-col items-center glass-panel p-4">
                <div className="text-3xl font-bold text-igbc-blue mb-2">{stats.igbc.points} <span className="text-sm font-normal text-foreground/60">pts</span></div>
                <div className={`flex items-center gap-2 font-bold ${stats.igbc.level === 'Certified' ? 'text-igbc-certified' : stats.igbc.level === 'Silver' ? 'text-igbc-silver' : stats.igbc.level === 'Gold' ? 'text-igbc-gold' : stats.igbc.level === 'Platinum' ? 'text-igbc-platinum' : 'text-igbc-blue'}`}>
                  <Award className={`w-5 h-5 ${stats.igbc.level === 'Certified' ? 'glow-igbc-certified' : stats.igbc.level === 'Silver' ? 'glow-igbc-silver' : stats.igbc.level === 'Gold' ? 'glow-igbc-gold' : stats.igbc.level === 'Platinum' ? 'glow-igbc-platinum' : 'opacity-40'}`} />
                  {stats.igbc.level !== 'None' ? stats.igbc.level : 'Not Certified'}
                </div>
              </div>
              <p className="opacity-80 text-foreground leading-relaxed text-sm">Initiate and manage a project strictly following the IGBC Service Buildings 2020 standards.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
