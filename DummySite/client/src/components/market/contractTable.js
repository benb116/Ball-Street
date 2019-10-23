import React, { Component } from 'react'
import PropTypes from "prop-types";
import { connect } from "react-redux";

import ContractRow from "./contractRow";

const TableHeader = () => {
  return (
    <thead>
      <tr>
        <th>Contract</th>
        <th>Last Yes Price</th>
        <th>Best Offer</th>
        <th>Best Offer</th>
      </tr>
    </thead>
  )
}

class TableBody extends Component {
  state = { contracts: [] }
  render() {
    const cs = this.props.contracts;
    const formC = cs.map((c) => {
      const Yshares = this.props.userInfo.yesShares.filter((cs) => cs.contractID === c.contractID)[0];
      const Nshares = this.props.userInfo.noShares.filter((cs) => cs.contractID === c.contractID)[0];
      c.numY = (Yshares ? Yshares.quantity : null);
      c.numN = (Nshares ? Nshares.quantity : null);
      const uOffers = this.props.userInfo.offers.filter(o => o.contractID === c.contractID)
      c.numBuyOffer = uOffers.filter(o => o.buy).length;
      c.numSellOffer = uOffers.filter(o => !o.buy).length;
      return c;
    })

    const rows = formC.map((c, i) => {
      return <ContractRow contractInfo={c} key={c.contractID}/>
    });

    return (<tbody>{rows}</tbody>)
  } 
}

class ContractTable extends Component {
  render() {
    const { contracts } = (this.props || {});
    const ui = this.props.userInfo;
    console.log(this.props.userInfo);
    return (
      <table>
        <TableHeader />
        <TableBody contracts={contracts} userInfo={ui} />
      </table>
    )
  }
}

ContractTable.propTypes = {
  auth: PropTypes.object.isRequired,
  userInfo: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
  userInfo: state.userInfo,  
});

export default connect(
  mapStateToProps,
  null,
)(ContractTable);