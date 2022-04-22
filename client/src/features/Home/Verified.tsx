import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';

const Home = () => {
  const history = useHistory();

  useEffect(() => {
    localStorage.setItem('isLoggedIn', 'true');
    history.push('/');
  }, [history]);

  return (
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
};

export default Home;
