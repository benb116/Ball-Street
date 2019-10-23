import React, { Component } from 'react'

class MarketCard extends Component {
  render() {
    const { market } = this.props;
    const mURL = './market/'+market.marketID;
    return (
      <a href={mURL}>
        <img src={market.imageURL} alt="Logo"/>
        <div>{market.name}</div>
      </a>
    )
  }
}

export default MarketCard