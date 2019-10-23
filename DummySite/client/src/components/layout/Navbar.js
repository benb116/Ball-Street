import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { logoutUser } from "../../actions/authActions";

class Navbar extends Component {
  render() {  
    const { user } = this.props.auth;
    const ui = this.props.userInfo;
    return (
      <div className="navbar-fixed">
        <nav className="z-depth-0">
          <div className="nav-wrapper white">
            <Link
              to="/dashboard"
              className="col s5 brand-logo center black-text"
            >
              {/*<i className="material-icons">code</i>*/}
              HeadsUp Fantasy {user.name} { !isNaN(ui.balance) ? <span>${ui.balance/100}</span> : <span></span> }
            </Link>
          </div>
        </nav>
      </div>
    );
  }
}

// export default Navbar;

Navbar.propTypes = {
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
)(Navbar);
