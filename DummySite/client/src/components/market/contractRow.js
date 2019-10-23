import React, { Component } from 'react'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { submitOffer, cancelOffer } from "../../actions/tradeActions";

const Nsharebox = (num, yn) => <span style={{color: (yn ? 'green' : 'red')}}>{num}</span>;
const Nofferbox = (num) => <span>{num}</span>;

const TradeBox = (bs, yn) => {
  return <span style={{color: (yn ? 'green' : 'red')}}> {(bs ? 'Buy' : 'Sell')} {(yn ? 'Yes' : 'No')}</span>
};

// [left btn, right btn]
// btn: [buy, yes]
const TradeOptions = (ny, nn) => {
  if (nn > 0) { return [[true, false], [false, false]]; }
  if (ny > 0) { return [[true, true], [false, true]]; }
  return [[true, true], [true, false]];
}

class ContractRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lastYes: props.contractInfo.lastYes,
      bestLeft: props.contractInfo.bestLeft,
      bestRight: props.contractInfo.bestRight,
    };
    this.handleLeft = this.handleLeft.bind(this);
    this.handleRight = this.handleRight.bind(this);
  }
  
  handleLeft(event) {
    this.setState({bestLeft: Number(event.target.value)});
  }
  handleRight(event) {
    this.setState({bestRight: Number(event.target.value)});
  }

  onTradeClick(bs, yn, p, q=1) {
    return () => {
      console.log(this.props);
      this.props.submitOffer(this.props.contractInfo.contractID, bs, yn, p, q);
      console.log('122222');
    }
  }

  onOfferClick() {
    return () => {
      console.log(this.props);
      const offers = this.props.userInfo.offers;
      console.log(offers.sort((a,b) => a.date - b.date)[0]);
      const oID = offers.sort((a,b) => a.date - b.date)[0]._id;
      console.log(oID);
      this.props.cancelOffer(oID);
    }
  }

  render() {
    const c = this.props.contractInfo;
    console.log(c);
    const o = TradeOptions(c.numY, c.numN);
    return (
      <tr>
        <td><img src={c.imageURL} alt="icon"/>{c.contractName} {Nsharebox(c.numY, true)} {Nsharebox(c.numN, false)} | <span onClick={this.onOfferClick()}>{Nofferbox(c.numBuyOffer)} {Nofferbox(c.numSellOffer)}</span> </td>
        <td>{c.lastYes}</td>
        <td>
          <input style={{width:'1.5em', 'textAlign':'center'}} type="text" value={this.state.bestLeft} onChange={this.handleLeft} /> 
          <span onClick={this.onTradeClick(o[0][0], o[0][1], this.state.bestLeft)}> {TradeBox(o[0][0], o[0][1])} </span>
        </td>
        <td>
          <input style={{width:'1.5em', 'textAlign':'center'}} type="text" value={this.state.bestRight} onChange={this.handleRight} /> 
          <span onClick={this.onTradeClick(o[1][0], o[1][1], this.state.bestRight)}> {TradeBox(o[1][0], o[1][1])} </span>
        </td>
      </tr>
    )
  }
}

ContractRow.propTypes = {
  auth: PropTypes.object.isRequired,
  userInfo: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
  userInfo: state.userInfo,
});

const mapDispatchToProps = {
 submitOffer, cancelOffer
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ContractRow);