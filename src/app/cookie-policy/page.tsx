import React from 'react';

export default function CookiePolicy() {
  return (
    <div className="legal-page">
      <h1>Cookie Policy</h1>
      <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
      
      <h2>1. What Are Cookies</h2>
      <p>Cookies are small pieces of text sent by your web browser by a website you visit. They help us remember your theme preferences (Light/Dark mode) and authentication sessions.</p>
      
      <h2>2. How We Use Cookies</h2>
      <p>Harshz Technologies Private Limited uses cookies primarily to store user preferences and secure your login sessions within our green building platform.</p>

      <h2>3. Your Choices</h2>
      <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, some parts of our platform may not function properly without cookies.</p>

      <h2>4. Contact</h2>
      <p>For more information on our cookie practices, reach out to contact@harshz.com.</p>
    </div>
  );
}
