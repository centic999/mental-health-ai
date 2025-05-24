import React from 'react';

export default function TermsOfService() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#e0e0e0' }}>
      <h1 style={{ color: '#72ffaf' }}>Terms of Service</h1>

      <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

      <p>
        Welcome to HelpLineAI. By using this service, you agree to the following Terms of Service.
        Please read them carefully. If you do not agree, do not use the service.
      </p>

      <h2>1. Not Medical Advice</h2>
      <p>
        HelpLineAI is not a medical provider. Our service does not diagnose, treat, or cure any condition.
        The AI responses are generated from reputable sources for informational purposes only.
        Always consult a licensed mental health professional for medical guidance.
      </p>

      <h2>2. Emergency Use Prohibited</h2>
      <p>
        If you or someone you know is in crisis, do not use this platform. Instead, contact a national
        or local emergency helpline immediately. We provide helpline numbers during high-risk conversations.
      </p>

      <h2>3. Privacy & Data Protection</h2>
      <p>
        Your conversations are end-to-end encrypted and stored anonymously using Supabase. Data may be used
        for research or service improvement only if anonymized. We comply with applicable data protection
        laws (HIPAA, GDPR).
      </p>

      <h2>4. User Responsibilities</h2>
      <p>
        You agree not to abuse, exploit, or misuse this platform. You may not use the AI to promote harmful
        behavior or misinformation.
      </p>

      <h2>5. Age Restriction</h2>
      <p>
        You must be at least 13 years old to use this service. If you are under 18, parental consent is advised.
      </p>

      <h2>6. Account & Consent</h2>
      <p>
        If you create an account, you consent to securely storing minimal user metadata. You may request data
        deletion at any time via your profile menu.
      </p>

      <h2>7. Service Updates</h2>
      <p>
        These Terms may change in the future. Users with accounts will be notified and must re-accept before
        continuing to use the service.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        HelpLineAI and its developers are not liable for any damages resulting from use or misuse of this service.
        This platform is for educational and support purposes only.
      </p>

      <p>
        By clicking "I Accept", you confirm that you have read and understood these Terms.
      </p>
    </div>
  );
}
