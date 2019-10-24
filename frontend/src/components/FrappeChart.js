import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Chart} from 'frappe-charts/dist/frappe-charts.esm'
import 'frappe-charts/dist/frappe-charts.min.css';

class FrappeChart extends Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
  }

  componentDidMount() {
    const {
      data,
      type,
      ...rest
    } = this.props;

    this.chart = new Chart(this.chartRef.current, {
      type,
      data,
      ...rest
    });
  }

  componentWillReceiveProps(props) {
    this.chart.update(props.data);
  }

  render() {
    return <div ref={this.chartRef}/>
  }
}

FrappeChart.propTypes = {
  data: PropTypes.object,
  type: PropTypes.string,
};

export default FrappeChart;