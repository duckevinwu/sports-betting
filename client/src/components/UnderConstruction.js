import React from 'react';
import '../style/Style.css';

export default class UnderConstruction extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="submit-page">
        <div className="lb-links">
          <span className=""><a href="/"><img src="https://i.ibb.co/TgG3h46/logo-1.png" width="75px" height="75px" className="lb-logo"></img></a></span>
        </div>
        <div className="sb-container">
          <div className="tree">
              <div><img src="https://i.ibb.co/TgG3h46/logo-1.png" alt="" width="150px" height="150px" className="pre-img"/></div>
              <img src="https://i.ibb.co/TgG3h46/logo-1.png" alt="" width="150px" height="150px"/>
          </div>
          <p className="ty-text">Coming soon!</p>
        </div>
      </div>
    )
  }
}
