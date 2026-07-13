import React from 'react';

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <h1>Terms of Service</h1>
      <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
      
      <h2>1. Agreement to Terms</h2>
      <p>By using the green building automation platform provided by Harshz Technologies Private Limited, you agree to these Terms of Service.</p>
      
      <h2>2. Intellectual Property</h2>
      <p>The platform, its original content, features, and functionality are owned by Harshz Technologies Private Limited and are protected by international copyright and trademark laws.</p>

      <h2>3. Limitation of Liability</h2>
      <p>In no event shall Harshz Technologies Private Limited, nor its founder Harsh Langeh, be liable for any indirect, incidental, special, consequential or punitive damages arising from your use of the platform.</p>

      <h2>4. Contact Us</h2>
      <p>For any questions about these Terms, please contact:</p>
      <p>Email: contact@harshz.com</p>
    </div>
  );
}
