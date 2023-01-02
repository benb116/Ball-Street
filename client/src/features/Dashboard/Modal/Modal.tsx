import Modal from 'react-modal';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';

import { modalSelector, modalStatusSelector, closeModal } from './Modal.slice';
import { useCreateOfferMutation } from '../Offers/Offers.api';

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

interface ModalType {
  price: number,
  protected: boolean
}

function OfferModal({ contestID }: { contestID: string }) {
  const dispatch = useAppDispatch();
  const { register, handleSubmit } = useForm<ModalType>();

  const [createOffer] = useCreateOfferMutation();

  const modalIsOpen = useAppSelector(modalStatusSelector);
  const modalInfo = useAppSelector(modalSelector);

  const [userPrice, setUserPrice] = useState((modalInfo.price / 100).toString());

  useEffect(() => {
    setUserPrice((modalInfo.price / 100).toString());
  }, [modalInfo, dispatch]);

  function close() {
    dispatch(closeModal());
  }
  function handleClick(data: ModalType) {
    // eslint-disable-next-line no-param-reassign
    const thisprice = Number(userPrice) * 100;
    if (Number.isNaN(thisprice)) {
      toast.error('Please enter a valid price');
      return;
    }
    const offerobj = {
      nflplayerID: modalInfo.nflplayerID,
      isbid: modalInfo.isbid,
      price: thisprice,
      protected: data.protected,
    };
    createOffer({ contestID, ...offerobj });
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
        // eslint-disable-next-line react/jsx-no-bind
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
          <input
            style={{
              fontSize: '1em',
              margin: '0.5em',
              width: '5em',
              borderColor: 'lightgray',
              borderWidth: '0.075em',
              boxShadow: 'white',
              borderRadius: '.5em',
              borderStyle: 'solid',
            }}
            {...register('price')}
            value={userPrice}
            onChange={(e) => setUserPrice(e.target.value)}
          />
          <br />
          <span>🔒 Protected</span>
          <input {...register('protected')} type="checkbox" />
          <br />
          <button className="AppButton" onClick={handleSubmit(handleClick)} type="submit">Submit offer</button>
        </form>
        <button
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            backgroundColor: 'white',
            boxShadow: 'white',
            borderColor: 'white',
            borderStyle: 'solid',
            cursor: 'pointer',
          }}
          onClick={close}
          type="button"
        >
          ✕

        </button>

      </Modal>
    </div>
  );
}

export default OfferModal;
