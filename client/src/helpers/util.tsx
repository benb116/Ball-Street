import { isRejectedWithValue } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

interface ErrType {
  data: {
    error: string
  }
}

const RenderPrice = (price = 0) => (Math.round(price) / 100).toFixed(2);

export const ErrHandler = (_state: unknown, action: { payload: ErrType | unknown }) => {
  if (isRejectedWithValue(action)) { toast.error((action.payload as ErrType).data.error || 'Unknown error'); }
};

export default RenderPrice;
