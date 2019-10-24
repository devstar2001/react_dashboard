import React, {Component} from 'react';
import {DropdownItem, DropdownMenu, DropdownToggle, Nav} from 'reactstrap';
import {AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler} from '@coreui/react';
import imgLogo from '../../images/logo.svg'
import imgLogoSmall from '../../images/logo_small.png';
import imgDefaultUser from '../../images/default_user.png';


class Header extends Component {

  render() {
    let email = this.props.user ? this.props.user.email: '';

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile/>
        <AppNavbarBrand
          full={{src: imgLogo, width: 130, height: 50, alt: 'TopKamera'}}
          minimized={{src: imgLogoSmall, width: 30, height: 30, alt: 'TopKamera'}}
        />
        <AppSidebarToggler className="d-md-down-none" display="lg"/>
        <Nav className="ml-auto" navbar>
          <AppHeaderDropdown direction="down">
            <DropdownToggle nav>
              <img src={imgDefaultUser} className="img-avatar" alt="user"/>
            </DropdownToggle>
            <DropdownMenu right style={{right: 'auto'}}>
              <DropdownItem header tag="div"
                            className="text-center"><strong>{email}</strong></DropdownItem>
              <DropdownItem onClick={e => this.props.history.push('/profile')}><i className="fa fa-user"/>Profile</DropdownItem>
              <DropdownItem onClick={e => this.props.logout()}><i className="fa fa-sign-out"/>Logout</DropdownItem>
            </DropdownMenu>
          </AppHeaderDropdown>
        </Nav>
      </React.Fragment>
    );
  }
}

export default Header;
