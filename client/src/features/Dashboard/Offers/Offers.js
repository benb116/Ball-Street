import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, clearState } from './OffersSlice';
import Loader from 'react-loader-spinner';
import { useHistory } from 'react-router-dom';

const Offers = () => {

  return (
    <div className="container mx-auto">
      Offers
    </div>
  );
};

export default Offers;
