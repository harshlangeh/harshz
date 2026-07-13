import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <h1>Privacy Policy</h1>
      <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
      
      <h2>1. Introduction</h2>
      <p>Welcome to Harshz Technologies Private Limited. We are committed to protecting your personal information and your right to privacy.</p>
      
      <h2>2. Information We Collect</h2>
      <p>We collect information that you voluntarily provide to us when registering on the platform, including your name, email address, and building data required for GRIHA / IGBC automation.</p>

      <h2>3. How We Use Your Information</h2>
      <p>We use the information we collect to operate, maintain, and provide the features and functionality of the Green Building Automation Platform.</p>

      <h2>4. Contact Us</h2>
      <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
      <p>Harshz Technologies Private Limited<br/>Email: contact@harshz.com<br/>Founder: Harsh Langeh</p>
    </div>
  );
}
