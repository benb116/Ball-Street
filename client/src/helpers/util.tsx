import React from 'react';
import PropTypes from 'prop-types';
import { isRejectedWithValue } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

interface ErrType {
  data: {
    error: string,
  },
  status: number,
}

export const RenderPrice = (price: number | null = 0) => (Math.round(price || 0) / 100).toFixed(2);

// Generic action button that triggers a drop/offer/cancel
export function ActionButton({ thephase, oclick, text }: { thephase: string, oclick: () => void, text: string }) {
  if (thephase !== 'pre' && thephase !== 'mid') {
    return (<td />);
  }
  return (
    <td style={{ textAlign: 'center' }}>
      <button
        className="ActionButton"
        onClick={oclick}
        type="button"
      >
        {text}
      </button>
    </td>
  );
}

ActionButton.propTypes = {
  thephase: PropTypes.string.isRequired,
  oclick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export const ErrHandler = (_state: unknown, action: { payload: ErrType | unknown }) => {
  if (isRejectedWithValue(action)) {
    const err = (action.payload as ErrType);
    if (err.status === 401) {
      localStorage.setItem('isLoggedIn', 'false');
      // history.push('/login');
    }
    toast.error(err.data.error || 'Unknown error');
  }
};
