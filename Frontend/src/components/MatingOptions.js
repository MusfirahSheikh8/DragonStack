import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "react-bootstrap";
import { BACKEND } from "../config";
import { useNavigate } from "react-router-dom";

class MatingOptions extends Component {
    mate = ({ matronDragonId, patronDragonId }) => () => {
        fetch(`${BACKEND.ADDRESS}/dragon/mate`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matronDragonId, patronDragonId })
        }).then(response => response.json())
            .then(json => {
                alert(json.message)
                if (json.type !== "error") {
                    this.props.navigate("/account-dragons");
                }
            })
            .catch(error => alert(error.message));
    }

    render() {
        console.log(this.props.accountDragons);
        return (
            <div>
                <h4>Pick one of your dragons to mate with:</h4>
                {this.props.accountDragons?.dragons?.map(dragon => {
                    const { dragonId, generationId, nickname } = dragon;

                    return (
                        <span key={dragonId}>
                            <Button
                                onClick={
                                    this.mate({
                                        patronDragonId: this.props.patronDragonId,
                                        matronDragonId: dragon.dragonId
                                    })
                                }
                            >
                                G{generationId}.I{dragonId}. {nickname}
                            </Button>
                            {' '}
                        </span>
                    )
                }
                )}
            </div>
        )
    }
}

export default connect(
    ({ accountDragons }) => ({ accountDragons }),
    null
)(MatingOptions)