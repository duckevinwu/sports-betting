import React from 'react';

export default class BetOnline extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      token: "",
      id: ""
    };

    this.submitForm = this.submitForm.bind(this);
  }

  componentDidMount() {

    this.setState({
      email: this.props.match.params.email,
      token: this.props.match.params.token,
      id: this.props.match.params.id
    })

  }

  submitForm() {

  }

  render() {
    return (
      <div>
        <form onSubmit={this.submitForm}>
          <input type="hidden" name="email" value={this.state.email}/>
          <input type="hidden" name="token" value={this.state.token}/>
          <input type="hidden" name="id" value={this.state.id}/>
          
        </form>
      </div>
    )
  }
}
