"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Chatbot } from './Chatbot';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatbotCollapsed, setChatbotCollapsed] = useState(true);

  return (
    <div className="app-container">
      <Header 
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
        toggleChatbot={() => setChatbotCollapsed(!chatbotCollapsed)} 
      />
      <div className="main-wrapper">
        <Sidebar collapsed={sidebarCollapsed} />
        <main className="content flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          
          <footer className="footer mt-8 pt-6 border-t border-border flex flex-col gap-4 items-center">
            <div className="flex gap-6 flex-wrap justify-center">
              <Link href="/privacy-policy" className="text-foreground no-underline opacity-80 hover:opacity-100 transition-opacity">Privacy Policy</Link>
              <Link href="/terms-of-service" className="text-foreground no-underline opacity-80 hover:opacity-100 transition-opacity">Terms of Service</Link>
              <Link href="/cookie-policy" className="text-foreground no-underline opacity-80 hover:opacity-100 transition-opacity">Cookie Policy</Link>
              <Link href="/contact" className="text-foreground no-underline opacity-80 hover:opacity-100 transition-opacity">Contact Us</Link>
              <Link href="/disclaimer" className="text-foreground no-underline opacity-80 hover:opacity-100 transition-opacity">Disclaimer</Link>
            </div>
            <div className="text-sm opacity-60">
              &copy; {new Date().getFullYear()} Harshz Technologies Private Limited. All rights reserved.
            </div>
          </footer>
        </main>
        <Chatbot collapsed={chatbotCollapsed} />
      </div>
    </div>
  );
}
