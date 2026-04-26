import React, {Component} from "react";
import { connect } from "react-redux";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Header from "./Header";
import Generation from './Generation';
import Dragon from './Dragon';
import { logout } from "../actions/account";
import ACCOUNT_INFO from "../actions/types";
import AccountInfo from "./accountInfo";

class Home extends Component {
    
    componentDidMount() {
        fetch('http://localhost:3003/account/dragons', {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(json => console.log('account dragons', json));
    }
    
    render() {
        return (
                <div>
                    <Header />
                    <h2>Dragon Stack</h2>
                <Generation />
                <Dragon />
                <hr />
                <AccountInfo />
                <hr />
                <Link to= '/account-dragons'>Account Dragons</Link>
                <br />
                <Link to='/public-dragons'>Public Dragons</Link>
                </div>
        );
    }
}

export default connect( null, { logout })(Home);
