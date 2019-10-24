import React, {Component} from 'react'
import {Badge, Card, CardBody} from "reactstrap";

const weekDays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag','Freitag', 'Samstag'];

class TopWeekDays extends Component {
  render() {
    const {peopleEnterPerWeekDays} = this.props;

    let weekDaysValues = [];
    for (let i = 0; i < peopleEnterPerWeekDays.length; i++) {
      if (peopleEnterPerWeekDays[i] > 0)
        weekDaysValues[weekDays[i]] = peopleEnterPerWeekDays[i];
    }

    let topWeekDays = Object.keys(weekDaysValues).sort(function (a, b) {
      return weekDaysValues[b] - weekDaysValues[a];
    });

    topWeekDays = topWeekDays.slice(0, 3);

    return (
      <Card>
        <CardBody style={{ height: 200}}>
          <div className="mb-3">
            <span className="h5 header-title">Top Week Days</span>
          </div>
          <ul className="list-unstyled">
            {topWeekDays.map((value, key) =>
              <React.Fragment key={key}>
                <li className="mb-3">
                  <h4>
                    <Badge color="secondary mr-2" style={{borderRadius: '0.75rem', color: 'white'}}>{key + 1}</Badge>
                    <span style={{color: '#596586'}}>{value}</span>
                  </h4>
                </li>
              </React.Fragment>
            )}
          </ul>
        </CardBody>
      </Card>
    )
  }
}

TopWeekDays.defaultProps = {
  peopleEnterPerWeekDays: [],
};

export default TopWeekDays;
