import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";

import ContractTable from "./contractTable";

class Market extends Component {
  state = {
    mInfo: [],
  }

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  // Code is invoked after the component is mounted/inserted into the DOM tree.
  componentDidMount() {
    const { mID } = this.props.match.params
    const url = '../api/markets/'+mID;

    fetch(url)
      .then(result => result.json())
      .then(result => {
        this.setState({
          mInfo: result,
        })
        return result;
      })
      .then(console.log)
  }

  render() {
    const { user } = this.props.auth;
    const info = this.state.mInfo;
    if (!info.contracts) { info.contracts = []; }
    const pricedC = info.contracts.map((c) => {
      c.lastYes = 56;
      c.bestLeft = 55;
      c.bestRight = 57;
      return c;
    });
    return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
        <div className="row"> 
          <div className="landing-copy col s12 center-align">
            <img src={info.imageURL}/>
            <h3>{info.name}</h3>
            <p>{info.rules}</p>
            {/*<div>{ccards}</div>*/}
            <ContractTable contracts={pricedC}/>
          </div>
        </div>
      </div>
    );
  }
}

Market.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logoutUser },
)(Market);
