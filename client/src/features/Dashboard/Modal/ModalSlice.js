import { createSlice } from '@reduxjs/toolkit';

const defaultState = {
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

export const modalStatusSelector = (state) => state.modal.modalIsOpen;
export const modalSelector = (state) => state.modal.info;
