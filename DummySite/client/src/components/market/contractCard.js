import React, { Component } from 'react'

class ContractCard extends Component {
  render() {
    const { contract } = this.props;
    console.log(contract);
    return (
      <div>
        <div>{contract.contractName}</div>
      </div>
    )
  }
}

export default ContractCard