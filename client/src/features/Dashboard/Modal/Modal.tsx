import Modal from 'react-modal';
import React from 'react';
import { useForm } from 'react-hook-form';

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

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function close() {
    dispatch(closeModal());
  }
  function handleClick(data: ModalType) {
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
        // eslint-disable-next-line react/jsx-no-bind
        onAfterOpen={afterOpenModal}
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
            defaultValue={Math.floor(modalInfo.price / 100)}
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
