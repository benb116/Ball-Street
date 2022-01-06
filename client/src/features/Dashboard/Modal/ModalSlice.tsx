/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store';

interface ModelState {
  modalIsOpen: boolean,
  info: {
    nflplayerID: number,
    isbid: boolean,
    price: number,
    protected: boolean,
  },
}
const defaultState: ModelState = {
  modalIsOpen: false,
  info: {
    nflplayerID: 0,
    isbid: true,
    price: 0,
    protected: false,
  },
};

export const modalSlice = createSlice({
  name: 'modal',
  initialState: defaultState,
  reducers: {
    setModal: (state, { payload }) => {
      state.info = payload;
      state.modalIsOpen = true;
    },
    openModal: (state) => {
      state.modalIsOpen = true;
    },
    closeModal: (state) => {
      state.modalIsOpen = false;
    },
    toggleModal: (state) => {
      state.modalIsOpen = !state.modalIsOpen;
    },
  },
  extraReducers: {

  },
});

export const {
  setModal, openModal, closeModal, toggleModal,
} = modalSlice.actions;

export const modalStatusSelector = (state: RootState) => state.modal.modalIsOpen;
export const modalSelector = (state: RootState) => state.modal.info;
