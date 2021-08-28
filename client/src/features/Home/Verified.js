import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';

const Home = () => {
  const history = useHistory();

  useEffect(() => {
    localStorage.setItem('isLoggedIn', true);
    history.push('/');
  }, [history]);

  return (
    <div className="container mx-auto">
      Your account has been verified! You are being redirected
      <Link to="/"> home</Link>
      .
    </div>
  );
};

export default Home;
