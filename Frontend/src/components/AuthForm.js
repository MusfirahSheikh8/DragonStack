import React, { Component } from "react";
import { connect } from 'react-redux';
import { Button, FormGroup, FormControl } from 'react-bootstrap';
import { signup, login } from "../actions/account";
import fetchStates from "../reducers/fetchStates";

class AuthForm extends Component {
    state = { username: '', password: '', buttonCLicked: false }

    updateUsername = event => {
        this.setState({ username: event.target.value })
    }

    updatePassword = event => {
        this.setState({ password: event.target.value })
    }

    signup = () => {
        this.setState({ buttonCLicked: true });
        const { username, password } = this.state;

        return this.props.signup({ username, password });
    };

    login = () => {
        this.setState({ buttonCLicked: true });
        const { username, password } = this.state;

        return this.props.login({ username, password });
    };

    get Error() {
        if (
            this.state.buttonCLicked &&
            this.props.account.status === fetchStates.error
        ) {
            return <div> {this.props.account.message} </div>
        }
    }

    render() {
        return (
            <div>
                <h2>Dragon Stack</h2>
                <FormGroup>
                    <FormControl
                        type="text"
                        value={this.state.username}
                        placeholder="username"
                        onChange={this.updateUsername}
                    />
                </FormGroup>
                <FormGroup>
                    <FormControl
                        type="password"
                        value={this.state.password}
                        placeholder="password"
                        onChange={this.updatePassword}
                    />
                </FormGroup>
                <br />
                <div>
                    <Button onClick={this.login}>Log In</Button>
                    <span> or </span>
                    <Button onClick={this.signup}>Sign up</Button>
                </div>
                <br />
                {this.Error}
            </div>
        );
    }
}

export default connect(
    ({ account }) => ({ account }),
    { signup, login }
)(AuthForm);