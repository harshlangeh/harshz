import React from 'react';

export function Chatbot({ collapsed }: { collapsed: boolean }) {
  return (
    <aside className={`chatbot-panel ${collapsed ? 'collapsed' : ''}`}>
      <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Harshz AI Assistant</h3>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        <div style={{ background: 'var(--background)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
          Hello! I am the Harshz AI. How can I assist you with your green building automation today?
        </div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <input 
          type="text" 
          placeholder="Type your message..." 
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            borderRadius: '4px', 
            border: '1px solid var(--border)',
            background: 'var(--background)',
            color: 'var(--foreground)'
          }} 
        />
      </div>
    </aside>
  );
}
