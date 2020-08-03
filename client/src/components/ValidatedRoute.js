import React from 'react';
import { withRouter } from 'react-router-dom';
import Preloader from './Preloader';

class ValidatedRoute extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pageData: "",
      isLoaded: false
    }
  }


  // React function that is called when the page load.
  componentDidMount() {

    var email = this.props.match.params.email;
    var token = this.props.match.params.token;

    fetch("/auth/validateuser/" + email + '/' + token,
		{
			method: "GET"
		}).then(res => {
			return res.json();
		}, err => {
			console.log(err);
		}).then(data => {
      console.log(data)
      var isAuthenticated = data.status
      if (isAuthenticated === 'success') {
        // render this component if email + token are valid
        var successPage = this.props.success;
        this.setState({
          pageData: successPage
        })
      } else {
        // go here if user is not validated
        var failPage = this.props.fail;
        this.setState({
          pageData: failPage
        })
      }

      this.setState({
        isLoaded: true
      })

		});
  }

  render() {
    if (this.state.isLoaded) {
      return this.state.pageData;
    } else {
      return (<Preloader/>);
    }
  }
}

export default withRouter(ValidatedRoute);
