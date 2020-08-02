import React from 'react';
import '../style/Preloader.css';

export default class Preloader extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    }
  }

  componentDidMount() {

  }

  render() {
    return (
      <div className="preloader-page">
        <div className="Box">
    			<span>
    				<span></span>
    			</span>
    		</div>
      </div>
    );
  }

}
