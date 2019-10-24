import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card, CardBody,} from 'reactstrap';

import classNames from 'classnames';
import {mapToCssModules} from 'reactstrap/lib/utils';

class ColoredLabelBox extends Component {
  render() {
    const {className, value, description, backgroundColor, icon, iconBackgroundColor, variant} = this.props;

    const padding = (variant === '0' ? {card: 'p-3', icon: 'p-3', lead: 'mt-2'} : (variant === '1' ? {
      card: 'p-0', icon: 'p-4', lead: 'pt-3',
    } : {card: 'p-0', icon: 'p-4 px-5', lead: 'pt-3'}));

    const card = {icon: icon, classes: ''};

    card.classes = mapToCssModules(classNames(className, padding.card));
    const lead = {style: 'h5 mb-0', classes: ''};
    lead.classes = classNames(lead.style, 'text-white', padding.lead);

    const blockIcon = function (icon) {
      const classes = classNames(icon, 'text-white', padding.icon, 'font-2xl mr-3 float-left');
      return (<i className={classes} style={{backgroundColor: iconBackgroundColor}}/>);
    };

    return (
      <Card>
        <CardBody className={card.classes} style={{backgroundColor: backgroundColor}}>
          {blockIcon(card.icon)}
          <div className={lead.classes}>{value}</div>
          <div className="font-weight-bold font-xs text-white">{description}</div>
        </CardBody>

      </Card>
    );
  }
}

ColoredLabelBox.propTypes = {
  value: PropTypes.number,
  description: PropTypes.string,
  icon: PropTypes.string,
  backgroundColor: PropTypes.string,
  iconBackgroundColor: PropTypes.string,
  variant: PropTypes.string,
};

ColoredLabelBox.defaultProps = {
  variant: '0',
  backgroundColor: '#7266BA',
  iconBackgroundColor: '#665CA7'
};

export default ColoredLabelBox;

