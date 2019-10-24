import React, {Component} from 'react';
import {
  Button,
  Input,
  Form,
  FormGroup,
  Label, FormFeedback,
  Modal, ModalBody, ModalHeader, ModalFooter
} from 'reactstrap';
import AuthHelper from '../../helpers/authHelper';


class PasswordChangeModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      errors: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
    };
  }

  handleChangeInput = e => {
    let errors = this.state.errors;
    if (errors[e.target.name] !== '') {
      errors[e.target.name] = '';
      this.setState({errors});
    }

    this.setState({[e.target.name]: e.target.value});
  }

  handleSave = e => {
    e.preventDefault();
    let currentPassword = e.target.elements.currentPassword.value;
    let newPassword = e.target.elements.newPassword.value;
    let confirmPassword = e.target.elements.confirmPassword.value;

    if (currentPassword === '') {
      let errors = this.state.errors;
      errors.currentPassword = 'Current password is required.';
      this.setState({errors});
      return;
    }

    if (newPassword === '') {
      let errors = this.state.errors;
      errors.newPassword = 'New password is required.';
      this.setState({errors});
      return;
    }

    if (confirmPassword === '') {
      let errors = this.state.errors;
      errors.confirmPassword = 'Confirm password is required.';
      this.setState({errors});
      return;
    }

    if (newPassword !== confirmPassword) {
      let errors = this.state.errors;
      errors.confirmPassword = 'Password does not match.';
      this.setState({errors});
      return;
    }

    AuthHelper.changePassword(currentPassword, newPassword)
      .then(res => {
        this.props.onSubmit();
      }).catch(err => {
        let errors = this.state.errors;
        errors.currentPassword = 'Current password does not match.';
        this.setState({errors});
    });

  }

  render() {
    return (
      <Modal isOpen={this.props.show} toggle={this.props.toggle}>
        <ModalHeader>Change Password</ModalHeader>
        <Form onSubmit={this.handleSave}>

          <ModalBody>
            <FormGroup>
              <Label>Current Password</Label>
              <Input type="password" name="currentPassword" placeholder="Current Password"
                     invalid={this.state.errors.currentPassword !== ''} onChange={this.handleChangeInput}/>
              <FormFeedback>{this.state.errors.currentPassword}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label>New Password</Label>
              <Input type="password" name="newPassword" placeholder="New Password"
                     invalid={this.state.errors.newPassword !== ''} onChange={this.handleChangeInput}/>
              <FormFeedback>{this.state.errors.newPassword}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label>Confirm Password</Label>
              <Input type="password" name="confirmPassword" placeholder="Confirm Password"
                     invalid={this.state.errors.confirmPassword !== ''} onChange={this.handleChangeInput}/>
              <FormFeedback>{this.state.errors.confirmPassword}</FormFeedback>
            </FormGroup>

          </ModalBody>

          <ModalFooter>
            <Button color="primary">Change</Button>
            <Button color="secondary" onClick={this.props.toggle}>Cancel</Button>
          </ModalFooter>
        </Form>

      </Modal>
    );
  }
}

export default PasswordChangeModal;

