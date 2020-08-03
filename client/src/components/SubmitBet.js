import React from 'react';
import Preloader from './Preloader';
import PostSubmit from './PostSubmit';
import { withRouter } from 'react-router-dom';

class SubmitBet extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      success: false
    }

  }

  componentDidMount() {
    var params = this.parseQueryString(this.props.location.search);

    fetch("/api/submitbet", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      //make sure to serialize your JSON body
      body: JSON.stringify({
        params: params
      })
    })
    .then(res => {
			return res.json();
		}, err => {
			console.log(err);
		})
    .then(data => {
      console.log(data);
      if (data.status === 'success') {
        this.setState({
          success: true
        })
      }

      this.setState({
        isLoaded: true
      })
    });
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


  render() {
    if (!this.state.isLoaded) {
      return (<Preloader/>);
    } else {
      if (this.state.success) {
        return (<PostSubmit status="success"/>)
      } else {
        return (<PostSubmit status="fail"/>)
      }
    }
  }

}

export default withRouter(SubmitBet);
