import React from 'react';
import { Link } from 'react-router-dom';

const Verified = () => (
  <>
    <div style={{ marginTop: '10em' }}>
      <h2>Your account has been verified!</h2>
      <p>
        You are being redirected
        <Link className="AppLink" to="/"> Home</Link>
      </p>
    </div>
  </>
);

export default Verified;
