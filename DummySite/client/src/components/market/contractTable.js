import React, { Component } from 'react'

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

const TableBody = props => {
  const rows = props.contracts.map((c) => {
    return (
      <tr key={c.contractID}>
        <td><img src={c.imageURL}/>{c.contractName}</td>
        <td>{c.lastYes}</td>
        <td>{c.bestLeft}</td>
        <td>{c.bestRight}</td>
      </tr>
    )
  })

  return <tbody>{rows}</tbody>
}

class ContractTable extends Component {
  render() {
    const { contracts } = this.props;

    return (
      <table>
        <TableHeader />
        <TableBody contracts={contracts} />
      </table>
    )
  }
}

export default ContractTable