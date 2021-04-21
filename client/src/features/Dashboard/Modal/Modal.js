import Modal from 'react-modal';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

const OfferModal = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const { leagueID, contestID } = useParams();

  const modalIsOpen = useSelector(modalStatusSelector);
  const modalInfo = useSelector(modalSelector);

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function close() {
    dispatch(closeModal());
  }
  // {leagueID, contestID, offerobj:
  function handleClick(data) {
    const offerobj = { ...modalInfo, ...data };
    dispatch(createOffer({ leagueID, contestID, offerobj }));
    close();
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
        <form>
          <span>Price</span>
          <input {...register('price')} defaultValue={modalInfo.price} />
          <br />
          <span>🔒 Protected</span>
          <input {...register('protected')} type="checkbox" />
          <br />
          <button onClick={handleSubmit(handleClick)} type="button">Submit offer</button>
        </form>
        <button onClick={close} type="button">close</button>

      </Modal>
    </div>
  );
};

export default OfferModal;
