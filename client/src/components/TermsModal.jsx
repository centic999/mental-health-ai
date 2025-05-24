import React, { useState } from 'react';

function TermsModal({ onAccept }) {
  const [checked, setChecked] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.9)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#1e1e1e',
        padding: '2rem',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 0 15px rgba(114, 255, 175, 0.3)'
      }}>
        <h2 style={{ color: '#72ffaf' }}>Terms of Service</h2>
        <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: 1.6 }}>
          By using this app, you agree that this is not a substitute for medical treatment, that no diagnosis will be made, and that you must confirm all health-related suggestions with a licensed professional. We are not liable for outcomes. Conversations may be logged securely with your consent. Full details are in the privacy policy. Usage is subject to HIPAA, GDPR, and your region’s data guidelines.
        </p>

        <label style={{ display: 'block', marginTop: '1.5rem', color: '#ccc' }}>
          <input type="checkbox" onChange={(e) => setChecked(e.target.checked)} /> I agree to the Terms of Service
        </label>

        <button
          disabled={!checked}
          onClick={onAccept}
          style={{
            marginTop: '1rem',
            background: checked ? '#4caf50' : '#444',
            color: '#fff',
            padding: '0.6rem 1.2rem',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: checked ? 'pointer' : 'not-allowed',
            width: '100%'
          }}
        >
          Accept and Continue
        </button>
      </div>
    </div>
  );
}

export default TermsModal;
