import React from 'react';
import '../style/Style.css';

export default class PostSubmit extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.status === 'success') {
      return (
        <div className="submit-page">
          <div className="lb-links">
            <span className=""><a href="/"><img src="https://i.ibb.co/TgG3h46/logo-1.png" width="75px" height="75px" className="lb-logo"></img></a></span>
          </div>
          <div className="sb-container">
            <div className="tree">
                <div><img src="https://i.ibb.co/tQGtcsc/check.png" alt="" width="150px" height="150px" className="pre-img"/></div>
                <img src="https://i.ibb.co/tQGtcsc/check.png" alt="" width="150px" height="150px"/>
            </div>
            <p className="ty-text">Thank you for submitting your picks!</p>
          </div>
        </div>
      )
    } else {
      return (
        <div className="submit-page">
          <div className="lb-links">
            <span className=""><a href="/"><img src="https://i.ibb.co/TgG3h46/logo-1.png" width="75px" height="75px" className="lb-logo"></img></a></span>
          </div>
          <div className="sb-container">
            <div className="tree">
                <div><img src="https://i.ibb.co/zNv95VR/x.png" alt="" width="150px" height="150px" className="pre-img"/></div>
                <img src="https://i.ibb.co/zNv95VR/x.png" alt="" width="150px" height="150px"/>
            </div>
            <p className="ty-text">An error occurred. Please try again!</p>
          </div>
        </div>
      )
    }

  }
}
