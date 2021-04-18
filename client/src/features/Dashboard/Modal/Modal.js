import Modal from 'react-modal';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';

import { modalSelector, modalStatusSelector, closeModal } from './ModalSlice';
import { createOffer } from '../Offers/OffersSlice';
import { useParams } from 'react-router';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root')

const OfferModal = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const { leagueID, contestID } = useParams();

  const modalIsOpen = useSelector(modalStatusSelector);
  const modalInfo = useSelector(modalSelector);

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  console.log(modalIsOpen, modalInfo);

  function close(){
    dispatch(closeModal());
  }
  // {leagueID, contestID, offerobj: 
  function handleClick(data) {
    const offerobj = { ...modalInfo, ...data };
    dispatch(createOffer({leagueID, contestID, offerobj}));
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
        <span>{modalInfo.isbid ? "Bid" : "Ask"} - {modalInfo.nflplayerName}</span>
        <form>
          <label>Price</label>
          <input {...register('price')} defaultValue={modalInfo.price}/>
          <br/>
          <label>Protected</label>
          <input {...register('protected')}type="checkbox"></input>
          <br />
          <button onClick={handleSubmit(handleClick)}>Submit offer</button>
        </form>
        <button onClick={close}>close</button>

      </Modal>
    </div>
  );
}

export default OfferModal;
