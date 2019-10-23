import React, { Component } from 'react'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { submitOffer } from "../../actions/tradeActions";

function sortOffers(offers, opts) {
    console.log('sortOffers');

    if (!offers.length) { return []; }

    const leftOffers = offers.filter(o => {
        return (o.buy === opts[0][0] && o.yes !== opts[0][1]) || (o.buy !== opts[0][0] && o.yes === opts[0][1]);
    }).map(o => {
        o.normPrice = (o.buy === opts[0][0] ? (100 - o.price) : o.price);
        return o;
    }).sort((a,b) => {
        return  a.normPrice - b.normPrice;
    });

    const rightOffers = offers.filter(o => {
        return (o.buy === opts[1][0] && o.yes !== opts[1][1]) || (o.buy !== opts[1][0] && o.yes === opts[1][1]);
    }).map(o => {
        o.normPrice = (o.buy === opts[1][0] ? (100 - o.price) : o.price);
        return o;
    }).sort((a,b) => {
        return  a.normPrice - b.normPrice;
    });

    return [leftOffers, rightOffers];
}

class offerRow extends Component {
    state = {};

    onTradeClick(bs, yn, p, q=1) {
        return () => {
            console.log(this.props);
            console.log(submitOffer);
            this.props.submitOffer(this.props.contractInfo.contractID, bs, yn, p, q);
            console.log('122222');
        };
    }

    render() {
        const o = this.props.offersInfo;
        const choices = this.props.choices;
        const no = sortOffers(o, choices);
        return (
          // <tr>
          //   <td><img src={c.imageURL} alt="icon"/>{c.contractName} {Nsharebox(c.numY, true)} {Nsharebox(c.numN, false)} | {Nofferbox(c.numBuyOffer)} {Nofferbox(c.numSellOffer)} </td>
          //   <td>{c.lastYes}</td>
          //   <td>{c.bestLeft} <span onClick={this.onTradeClick(o[0][0], o[0][1], c.bestLeft)}> {TradeBox(o[0][0], o[0][1])} </span></td>
          //   <td>{c.bestRight} <span onClick={this.onTradeClick(o[1][0], o[1][1], c.bestRight)}> {TradeBox(o[1][0], o[1][1])} </span></td>
          // </tr>

        )
    }
}



offerRow.propTypes = {
  auth: PropTypes.object.isRequired,
  offersInfo: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
  offersInfo: state.offersInfo,  
});

const mapDispatchToProps = {
 submitOffer,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(offerRow);