import React from 'react';
import '../style/Style.css';
import '../style/Navbar.css';

export default class Navbar extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="navbar">
        <span className=""><a href="/"><img src="https://i.ibb.co/TgG3h46/logo-1.png" width="75px" height="75px" className="lb-logo"></img></a></span>
      </div>
    )
  }
}
