import Modal from 'react-modal';
import React from 'react';
import { useAppSelector, useAppDispatch } from '../../../app/hooks'
import { useForm } from 'react-hook-form';

import { useParams } from 'react-router';
import { modalSelector, modalStatusSelector, closeModal } from './ModalSlice';
import { createOffer } from '../Offers/OffersSlice';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#root');

const OfferModal = () => {
  const dispatch = useAppDispatch();
  const { register, handleSubmit } = useForm();
  const { contestID } = useParams();

  const modalIsOpen = useAppSelector(modalStatusSelector);
  const modalInfo = useAppSelector(modalSelector);

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function close() {
    dispatch(closeModal());
  }
  function handleClick(data) {
    // eslint-disable-next-line no-param-reassign
    data.price *= 100;
    const offerobj = { ...modalInfo, ...data };
    delete offerobj.nflplayerName;
    dispatch(createOffer({ contestID, offerobj }));
    close();
  }

  function onFormSubmit(e) {
    e.preventDefault();
    handleSubmit(handleClick);
  }

  return (
    <div>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={close}
        style={customStyles}
        contentLabel="Offer Modal"
      >
        <span>
          {modalInfo.isbid ? 'Bid' : 'Ask'}
          {' '}
          -
          {' '}
          {modalInfo.nflplayerName}
        </span>
        <form onSubmit={onFormSubmit}>
          <span>Price</span>
          <input {...register('price')} defaultValue={Math.floor(modalInfo.price / 100)} />
          <br />
          <span>🔒 Protected</span>
          <input {...register('protected')} type="checkbox" />
          <br />
          <button onClick={handleSubmit(handleClick)} type="submit">Submit offer</button>
        </form>
        <button onClick={close} type="button">close</button>

      </Modal>
    </div>
  );
};

export default OfferModal;
