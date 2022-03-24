import Modal from 'react-modal';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';

import { useAppSelector, useAppDispatch } from '../../../app/hooks';

import { modalSelector, modalStatusSelector, closeModal } from './Modal.slice';
import { useCreateOfferMutation } from '../../../helpers/api';

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
  const { contestID } = useParams<{ contestID: string }>();

  const [createOffer] = useCreateOfferMutation();

  const modalIsOpen = useAppSelector(modalStatusSelector);
  const modalInfo = useAppSelector(modalSelector);

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function close() {
    dispatch(closeModal());
  }
  function handleClick(data: { price: number, protected: boolean }) {
    // eslint-disable-next-line no-param-reassign
    data.price *= 100;
    const offerobj = {
      nflplayerID: modalInfo.nflplayerID,
      isbid: modalInfo.isbid,
      price: data.price,
      protected: data.protected,
    };
    createOffer({ contestID, offerobj });
    close();
  }

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
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
