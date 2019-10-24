import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Form,
  FormGroup,
  FormFeedback,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row
} from 'reactstrap';
import AuthHelper from '../../helpers/authHelper';
import Logo from '../../images/logo.svg';
import {login} from '../../redux/actions/auth';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {
        username: '',
        password: ''
      }
    }
  }

  handleLogin = e => {

    e.preventDefault();
    let username = e.target.elements.username.value;
    let password = e.target.elements.password.value;
    if (username === '') {
      let errors = this.state.errors;
      errors.username = 'Username is required';
      this.setState(errors);
      return;
    }

    if (password === '') {
      let errors = this.state.errors;
      errors.password = 'Password is required';
      this.setState(errors);
      return;
    }

    this.props.login({username, password});
  }

  handleChangeInput = e => {
    let errors = this.state.errors;
    if (errors[e.target.name] !== '') {
      errors[e.target.name] = '';
      this.setState(errors);
    }
  }

  render() {
    if (this.props.isAuthenticated) {
      return (
        <Redirect to='/'/>
      );
    }

    let {errors} = this.state;
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form onSubmit={this.handleLogin}>
                      <div className="text-center mb-3">
                        <img src={Logo} alt="TopKamera"/>
                      </div>

                      <FormGroup>
                        <InputGroup className="mb-3">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="icon-user"/>
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input type="text" placeholder="Username" name="username" invalid={errors.username !== ''} onChange={this.handleChangeInput}/>
                          <FormFeedback>{errors.username}</FormFeedback>
                        </InputGroup>
                      </FormGroup>

                      <FormGroup>
                        <InputGroup className="mb-4">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="icon-lock"/>
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input type="password" placeholder="Password" name="password" invalid={errors.password !== ''} onChange={this.handleChangeInput}/>
                          <FormFeedback>{errors.password}</FormFeedback>
                        </InputGroup>
                      </FormGroup>

                      <Row>
                        <Col xs="6">
                          <Button color="primary" className="px-4">Login</Button>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: AuthHelper.isAuthenticated(state.auth)
});

const mapDispatchToProps = {
  login
};


export default connect(mapStateToProps, mapDispatchToProps)(Login);
