import React from 'react';

export default function TermsModal({ onAccept }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 9999, display: 'flex',
      justifyContent: 'center', alignItems: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: '#1e1e1e',
        color: '#fff',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(114, 255, 175, 0.3)'
      }}>
        <h2 style={{ color: '#72ffaf' }}>Terms of Service</h2>
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        <p><strong>1. No Medical Advice:</strong> HelpLineAI is for general educational and support purposes only. It is not a substitute for professional medical or psychological advice, diagnosis, or treatment. Always consult a qualified physician or mental health professional.</p>
        <p><strong>2. Emergency Use:</strong> This platform is not equipped to handle emergencies. If you are experiencing suicidal thoughts or a mental health crisis, call 911 or your local emergency number immediately.</p>
        <p><strong>3. Data Storage:</strong> All chat data is anonymized and end-to-end encrypted where possible. No human, including the creators, has access to your messages. Only you can view your chat history. We comply with applicable privacy laws such as HIPAA (USA), GDPR (Europe), and others.</p>
        <p><strong>4. Liability Limitation:</strong> The creators of HelpLineAI, its partners, and contributors are not liable for any outcomes, misuse, decisions, or consequences arising from using this service. Use is at your own risk. No warranties, guarantees, or claims are implied.</p>
        <p><strong>5. Accuracy of Content:</strong> The AI sources responses from reputable institutions including WHO, Mayo Clinic, NIH, SAMHSA, NIDA, NIAAA, and top journals (Nature, The Lancet, BMJ, JMIR Mental Health). Despite this, we cannot guarantee 100% accuracy or completeness.</p>
        <p><strong>6. No Diagnoses:</strong> HelpLineAI is prohibited from diagnosing any medical or psychological condition. Any interpretation or suggestion from the AI is purely informational.</p>
        <p><strong>7. Consent and Age:</strong> You must be 13 years or older to use this platform. By continuing, you affirm you meet this requirement and consent to the storage and processing of your data as outlined.</p>
        <p><strong>8. Content Use:</strong> You may not copy, redistribute, or repurpose any AI-generated content for clinical, commercial, or misleading use.</p>
        <p><strong>9. Changes:</strong> These Terms may be updated without notice. Continued use of the site after updates constitutes acceptance. When changes are made, users will be prompted to review and accept them again.</p>
        <p><strong>10. Deletion:</strong> You may delete your account and all associated data permanently by contacting support or using the "Delete My Data" option if logged in.</p>
        <p><strong>11. Logging:</strong> All sessions may be logged securely (with user consent) for compliance and quality auditing.</p>
        <p><strong>12. Acknowledgement:</strong> By clicking "Accept," you agree to all terms above, and release HelpLineAI, its creators, and affiliates from all liabilities.</p>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={onAccept}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Accept and Continue
          </button>
        </div>
      </div>
    </div>
  );
}
