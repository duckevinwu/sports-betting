import React from 'react';
import { withRouter } from 'react-router-dom';


class ValidatedRoute extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pageData: ""
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
		});
  }

  render() {
    return this.state.pageData;
  }
}

export default withRouter(ValidatedRoute);
