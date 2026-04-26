import React from "react";
import { connect } from "react-redux";
import { Button } from "react-bootstrap";
import { logout } from "../actions/account";

const Header= ({ logout }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <Button onClick={logout} className="logout-button">
        Log Out
      </Button>
    </div>
  );
};

export default connect(null, { logout })(Header);