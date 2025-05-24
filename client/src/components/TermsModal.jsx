import React from 'react';
import TermsOfService from './TermsOfService';

export default function TermsModal({ onAccept }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      overflowY: 'auto',
      padding: '2rem'
    }}>
      <div style={{
        background: '#1e1e1e',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: '800px',
        color: 'white',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        overflowY: 'auto',
        maxHeight: '90vh'
      }}>
        <TermsOfService />
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={onAccept}
            style={{
              padding: '0.8rem 1.6rem',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
}
