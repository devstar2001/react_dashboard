import React, {Component} from 'react';
import fabric from 'fabric';

import ApiHelper from '../../../helpers/apiHelper';
import {connect} from "react-redux";
import {Row, Col, Input, FormGroup, Label} from "reactstrap";

class SectionConfig extends Component {

  constructor(props) {
    super(props);
    this.state = {
      devices: [],
    }
  }

  componentWillMount() {
    this.getDevices();
  }

  componentDidMount() {

  }

  async getDevices() {
    let url = `/devices?limit=100&textSearch=VF-`;
    if (this.props.user.authority === 'TENANT_ADMIN') {
      url = '/tenant' + url;
    } else {
      url = '/customer/' + this.props.user.customerId.id + url;
    }

    let devices = await ApiHelper.get(url)
      .then(res => {
        let data = res.data.data;
        let result = [];
        for (let i = 0; i < data.length; i++) {
          result[data[i].id.id] = data[i].name;
        }
        return result;

      }).catch(err => {
        return null;
      });

    if (devices === null) {
      this.setState({devices: null});
      return;
    } else {
      this.setState({devices});
    }
  }

  handleStoreChange(id) {

  }

  render() {
    console.log(this.state.devices);
    if (this.state.devices === null) {
      return (
        <div className="animated fadeIn">
          <span className="h5">No registered stores.</span>
        </div>
      )
    }
    return (
      <div className="animated fadeIn">
        <Row>
          <Col className="d-inline-flex">
            <FormGroup>
              <Label htmlFor="store">Store</Label>
              <Input className="w-auto mr-3" type="select" name="store" onChange={e => this.handleStoreChange(e.target.value)}>
                {Object.keys(this.state.devices).map(id =>
                  <option value={id} key={id}>{this.state.devices[id]}</option>
                )}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="store">Store</Label>
              <Input className="w-auto" type="select" name="store" onChange={e => this.handleStoreChange(e.target.value)}>
                {Object.keys(this.state.devices).map(id =>
                  <option value={id} key={id}>{this.state.devices[id]}</option>
                )}
              </Input>
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SectionConfig);

