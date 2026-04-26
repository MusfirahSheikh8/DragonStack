import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchGeneration } from "../actions/Generation";
import fetchStates from "../reducers/fetchStates";
import moment from "moment";

const MINIMUM_DELAY = 3000;

class Generation extends Component {

    timer = null;

    componentDidMount() {
        this.fetchNextGeneration();
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
    }

    fetchNextGeneration = () => {
        this.props.fetchGeneration();

        let delay = new Date(this.props.generation.expiration).getTime() -
            new Date().getTime();

        if (delay < MINIMUM_DELAY) {
            delay = MINIMUM_DELAY
        }

        this.timer = setTimeout(() => this.fetchNextGeneration(), delay)
    }

    render() {
        console.log('this.props', this.props)

        const { generation } = this.props;

        if (generation.status === fetchStates.error) {
            return <div>{generation.message}</div>
        }

        return (
            <div>
                <h3>
                    Generation {generation.generationId} . Expires on:
                </h3>
                <h4>
                    {moment(generation.expiration).format('MMMM Do YYYY, h:mm:ss a')}
                </h4>
            </div>
        )
    }
};

const mapStateToProps = state => {
    const generation = state.generation;

    return { generation }
};

const componentConnector = connect(
    mapStateToProps,
    { fetchGeneration });

export default componentConnector(Generation);
