/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../../../app/store';

interface ModalInfo {
  nflplayerID: number,
  nflplayerName: string,
  isbid: boolean,
  price: number,
  protected: boolean,
}
interface ModalState {
  modalIsOpen: boolean,
  info: ModalInfo
}
const defaultState: ModalState = {
  modalIsOpen: false,
  info: {
    nflplayerID: 0,
    nflplayerName: '',
    isbid: true,
    price: 0,
    protected: false,
  },
};

export const modalSlice = createSlice({
  name: 'modal',
  initialState: defaultState,
  reducers: {
    setModal: (state, { payload }: { payload: ModalInfo }) => {
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
