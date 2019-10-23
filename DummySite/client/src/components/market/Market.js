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
    const { mID } = this.props.match.params;
    const murl = '../api/markets/'+mID;

    fetch(murl)
      .then(result => result.json())
      .then(result => {
        this.setState({
          mInfo: result,
        });
        return result;
      });
  }

  render() {
    const info = this.state.mInfo;
    if (!info.contracts) { info.contracts = []; }
    const pricedC = info.contracts.map((c) => {
      c.lastYes = 56;
      c.bestLeft = 55;
      c.bestRight = 47;
      return c;
    });

    const ui = this.props.userInfo;
    return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
        <div className="row"> 
          <div className="landing-copy col s12 center-align">
            <img src={info.imageURL} alt="Logo"/>
            <h3>{info.name}</h3>
            <p>{info.rules}</p>
            <ContractTable contracts={pricedC} userInfo={ui}/>
          </div>
        </div>
      </div>
    );
  }
}

Market.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  userInfo: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
  userInfo: state.userInfo,  
});

export default connect(
  mapStateToProps,
  { logoutUser },
)(Market);
