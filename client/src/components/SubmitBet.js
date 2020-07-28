import React from 'react';
import { withRouter } from 'react-router-dom';

class SubmitBet extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      params: {}
    }

    this.submitTest = this.submitTest.bind(this);

  }

  componentDidMount() {
    var params = this.parseQueryString(this.props.location.search);
    this.setState({
      params: params
    })
  }

  parseQueryString(queryString) {
    if(queryString.indexOf('?') > -1){
      queryString = queryString.split('?')[1];
    }
    var pairs = queryString.split('&');
    var result = {};
    pairs.forEach(function(pair) {
      pair = pair.split('=');
      result[pair[0]] = decodeURIComponent(pair[1] || '');
    });
    return result;
  }

  submitTest() {
    fetch("/api/submitbet", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      //make sure to serialize your JSON body
      body: JSON.stringify({
        params: this.state.params
      })
    })
    .then(res => {
			return res.json();
		}, err => {
			console.log(err);
		})
    .then(data => {
      console.log(data);
    });
  }

  render() {
    return (
      <div>
        <button onClick={this.submitTest}>Submit</button>
      </div>
    )
  }

}

export default withRouter(SubmitBet);
