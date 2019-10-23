import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";

import MarketCard from "./marketCard";

class Dashboard extends Component {
  state = {
    markets: [],
  }

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  // Code is invoked after the component is mounted/inserted into the DOM tree.
  componentDidMount() {
    const url = './api/markets';

    fetch(url)
      .then(result => result.json())
      .then(result => {
        this.setState({
          markets: result,
        })
      })
  }

  render() {
    const { user } = this.props.auth;
    const mcards = this.state.markets.map((m, index) => {
      return (<MarketCard key={index} market={m} />)
    });

    return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
        <div className="row"> 
          <div className="landing-copy col s12 center-align">
            <h4>
              <b>Hey there,</b> {user.name.split(" ")[0]}
              <p className="flow-text grey-text text-darken-1">
                Welcome to HeadsUp Fantasy
              </p>
            </h4>
            <div>
              {mcards}
            </div>
            <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                margin: "1rem"
              }}
              onClick={this.onLogoutClick}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logoutUser },
)(Dashboard);
