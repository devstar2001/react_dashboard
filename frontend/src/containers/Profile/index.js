import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Row,
  Form,
  FormGroup,
  Label, FormFeedback,
} from 'reactstrap';
import {toastr} from "react-redux-toastr";
import PasswordChangeModal from './PasswordChangeModal';
import ApiHelper from '../../helpers/apiHelper';
import {updateUserInfo} from '../../redux/actions/auth';

function validateEmail(email) {
  let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

class Profile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: this.props.user.email,
      firstName: this.props.user.firstName,
      lastName: this.props.user.lastName,
      errors: {
        email: '',
        firstName: '',
        lastName: ''
      },
      showPasswordChangeModal: false,
    }
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
    if (this.state.email === '') {
      let errors = this.state.errors;
      errors.email = 'Email is required.';
      this.setState({errors});
      return;
    }

    if (!validateEmail(this.state.email)) {
      let errors = this.state.errors;
      errors.email = 'Email is invalid.';
      this.setState({errors});
      return;
    }

    if (this.state.firstName === '') {
      let errors = this.state.errors;
      errors.firstName = 'First name is required.';
      this.setState({errors});
      return;
    }

    if (this.state.lastName === '') {
      let errors = this.state.errors;
      errors.lastName = 'Last name is required.';
      this.setState({errors});
      return;
    }

    let user = this.props.user;
    user.email = this.state.email;
    user.firstName = this.state.firstName;
    user.lastName = this.state.lastName;
    ApiHelper.post('/user', user)
      .then(res => {
        this.props.updateUserInfo(res.data);
        toastr.success('Success!', 'Profile updated successfully.');
      }).catch(err => {
        toastr.error('Fail!', 'Failed to update profile.');
    });

  }

  openPasswordChangeModal = () => {
    this.setState({showPasswordChangeModal: true});
  }

  hidePasswordChangeModal = () => {
    this.setState({showPasswordChangeModal: false});
  }

  changePassword = () => {
    toastr.success('Success!', 'Password changed successfully.');
    this.hidePasswordChangeModal();
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" md="6">
            <Card>
              <CardHeader>
                Profile
              </CardHeader>
              <CardBody>
                <Form onSubmit={this.handleSave}>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input type="text" name="email" placeholder="Enter your email" value={this.state.email}
                           invalid={this.state.errors.email !== ''} onChange={this.handleChangeInput}/>
                    <FormFeedback>{this.state.errors.email}</FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label>First Name</Label>
                    <Input type="text" name="firstName" placeholder="Enter your first name" value={this.state.firstName}
                           invalid={this.state.errors.firstName !== ''} onChange={this.handleChangeInput}/>
                    <FormFeedback>{this.state.errors.firstName}</FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label>Last Name</Label>
                    <Input type="text" name="lastName" placeholder="Enter your last name" value={this.state.lastName}
                           invalid={this.state.errors.lastName !== ''} onChange={this.handleChangeInput}/>
                    <FormFeedback>{this.state.errors.lastName}</FormFeedback>
                  </FormGroup>
                  <Row>
                    <Col>
                      <Button color="primary mr-3" className="px-4" type="submit">Save</Button>
                      <Button color="secondary" className="px-4" onClick={this.openPasswordChangeModal}>Change Password</Button>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
        {this.state.showPasswordChangeModal &&
          <PasswordChangeModal
            show={this.state.showPasswordChangeModal}
            toggle={this.hidePasswordChangeModal}
            onSubmit={this.changePassword}
          />
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
});

const mapDispatchToProps = {
  updateUserInfo
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

