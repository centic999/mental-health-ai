import React from 'react';
import TermsOfService from './TermsOfService';

export default function TermsModal({ onAccept }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 10000
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#1e1e1e',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #72ffaf',
          boxShadow: '0 0 20px rgba(114, 255, 175, 0.3)',
          animation: 'fadeSlideUp 0.6s ease-out'
        }}
      >
        <TermsOfService />

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={onAccept}
            style={{
              background: '#4caf50',
              color: 'white',
              padding: '0.8rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            I Accept
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
