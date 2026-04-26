import React, { Component } from "react";
import { connect } from 'react-redux';
import Header from "./Header";
import { fetchAccountDragons } from "../actions/accountDragons";
import { Link } from "react-router-dom";
import AccountDragonRow from "./AccountDragonRow";

class AccountDragons extends Component {
    componentDidMount() {
        this.props.fetchAccountDragons();
    }
    render() {
        const dragons = this.props.accountDragons?.dragons || [];

        return (
            <div>
                <Header />
                <h3>Account Dragons</h3>
                {dragons.map(dragon => {
                    return (
                        <div key={dragon.dragonId}>
                            <AccountDragonRow dragon={dragon} />
                            <hr />
                        </div>
                    );
                })}

                <Link to="/">Home</Link>
            </div>
        );
    }
}

export default connect(
    ({ accountDragons }) => ({ accountDragons }),
    { fetchAccountDragons }
)(AccountDragons) 