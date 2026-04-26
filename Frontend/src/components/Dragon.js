import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { connect } from "react-redux";
import DragonAvatar from "./DragonAvatar";
import { fetchDragon } from '../actions/dragon';
import fetchStates from '../reducers/fetchStates';

const DEFAULT_DRAGON = {
  dragonId: "",
  generationId: "",
  nickname: "",
  birthdate: "",
  traits: [],
};

class Dragon extends Component {
  get dragonView () {
    const { dragon } = this.props;

    if (dragon.status === fetchStates.error) return <span>{dragon.message}</span>;

    return <DragonAvatar dragon={dragon} />;
  }
  // state = { dragon: DEFAULT_DRAGON };

  // componentDidMount() {
  //   this.props.fetchDragon();
  // }

  // fetchDragon = () => {
  //   fetch("http://localhost:3003/dragon/new")
  //     .then(response => response.json())
  //     .then(json => this.setState({ dragon: json.dragon }))
  //     .catch(error => console.error("Error fetching dragon:", error));
  // };

  render() {
    return (
      <div>
        <Button onClick={this.props.fetchDragon}>New Dragon</Button>
        <br />
        {this.dragonView}
      </div>
    );
  }
}

export default connect(
  ({ dragon }) => ({ dragon }),
  { fetchDragon }
) (Dragon);
