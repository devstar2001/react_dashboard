import React, {Component} from 'react'
import {Badge, Card, CardBody} from "reactstrap";

class TopHours extends Component {
  render() {
    const {peopleEnterPerHours} = this.props;

    let hourValues = [];
    for (let i = 0; i < peopleEnterPerHours.length; i++) {
      if (peopleEnterPerHours[i] > 0)
        hourValues[i.toString() + ":00"] = peopleEnterPerHours[i];
    }

    let topHours = Object.keys(hourValues).sort(function (a, b) {
      return hourValues[b] - hourValues[a];
    });

    topHours = topHours.slice(0, 3);

    return (
      <Card>
        <CardBody style={{ height: 200}}>
          <div className="mb-3">
            <span className="h5 header-title" >Top Peakzeiten</span>
          </div>
          <ul className="list-unstyled">
            {topHours.map((value, key) =>
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

TopHours.defaultProps = {
  peopleEnterPerHours: [],
};

export default TopHours;
