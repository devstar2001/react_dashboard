import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';
import Chart from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import ApiHelper from '../../../helpers/apiHelper';
import { getDevices } from '../../../redux/actions/retail';
import {
  Badge,
  Button,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  Col,
  Input,
  Row
} from 'reactstrap';
import { DateRangePicker } from 'react-dates';
import 'react-dates/initialize';
import ReactEcharts from 'echarts-for-react';

import BarChart from '../../../components/BarChart';
import ColoredLabelBox from "../../../components/ColoredLabelBox";
import MapWidget from "../../../components/MapWidget";
import TopHours from '../../../components/TopHours';
import TopWeekDays from '../../../components/TopWeekDays';
import FrappeChart from '../../../components/FrappeChart';
import { colors, specificDates } from '../../../helpers/constants';
import { UPDATE_DATERANGE } from '../../../redux/actions/retail'


// Bah, Sih
const vfDeviceIds = ['b0375f10-f9f6-11e8-a720-5d2ca428a162', 'cc0a2d80-fd20-11e8-a720-5d2ca428a162'];

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.timeSeriesData = [];
    this.tsList = [];
    this.filteredTSList = [];
    this.vfTSList = [];
    this.selectedVFStore = null;
    this.vfDevices = [];
    this.startTS = null;
    this.endTS = null;
    this.state = {
      specificDate: "0",
      startDate: null,
      endDate: null,
      barChartData: null,
      barChartSeries: [],
      barChartStacked: true,
      heatMapChartData: [],
      heatMapChartMaxValue: 0,
      stores: [],
      selectedStores: [],
      visitsPieData: null,
      totalVisitors: 0,
      visitorsPerWeek: 0,
      visitorsPerDay: 0,
      dwellingTimePerVisitor: 0,
      dwellingTimePerSectionPieChartData: null,
      vfStores: [],
      peopleEnterPerWeekDays: [],
      peopleEnterPerHours: [],
      frappeHeatMapData: null,
      focusedInput: null,
      conversionRate: 0,
    }
  }

  updateDimensions = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  componentWillMount() {
    this.updateDimensions();
    this.props.getDevices('L01-', 100, this.props.user.customerId.id, this.props.user.authority);
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.startTS !== nextProps.startTS || this.props.endTS !== nextProps.endTS) {
      this.startTS = nextProps.startTS;
      this.endTS = nextProps.endTS;
      if (!nextProps.startTS && !nextProps.endTS) {
        this.filteredTSList = this.tsList;
      } else {
        this.filteredTSList = this.tsList.filter(t => {
          if (nextProps.startTS && !nextProps.endTS)
            return nextProps.startTS <= t;
          if (!nextProps.startTS && nextProps.endTS)
            return t < nextProps.endTS;
          return nextProps.startTS <= t && t < nextProps.endTS;
        });
      }
      this.generateDashboardData();
      this.generateDwellingTimeData();
    }
    if (this.props.devices !== nextProps.devices) {
      let stores = [];
      let index = 0;
      for (let deviceId in nextProps.devices) {
        // skip Lc01-02-1PC-002(Sihcity)
        if (deviceId !== 'c3a76d50-8da5-11e8-876b-b585f2bf8e4f') {
          stores.push({
            ...nextProps.devices[deviceId].additionalInfo,
            deviceId,
            id: index++
          });
        }
      }

      this.setState({ stores });
      this.getTimeSeriesData(stores, nextProps.devices);
    }
  }

  getTimeSeriesData(stores, devices) {
    console.log("all stores", stores);
    console.log("all devices", devices);
    let endTS = Date.now();
    let promises = [];
    for (let deviceId in devices) {
      promises.push(ApiHelper.get(`/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?limit=100000&agg=NONE&keys=PeopleEnter&startTs=1527849760000&endTs=${endTS}`)
        .then(res => {
          this.timeSeriesData[deviceId] = res.data;
        }))
    }

    Promise.all(promises).then(() => {
      let timeSeriesData = [];
      for (let i = 0; i < stores.length; i++) {
        let deviceId = stores[i].deviceId;
        timeSeriesData[deviceId] = {};
        for (let key in this.timeSeriesData[deviceId]) {
          let arr = [];
          for (let j = 0; j < this.timeSeriesData[deviceId][key].length; j++) {
            let ts = this.timeSeriesData[deviceId][key][j].ts - 3600000;
            let value = this.timeSeriesData[deviceId][key][j].value;
            if (value[0] === '_') {
              let splitValues = value.split('_');
              ts = parseInt(splitValues[1]) * 1000;
              value = JSON.parse(splitValues[2]);
            } else {
              value = parseInt(value);
            }

            // skip 2019 year data of Bah and Sih
            if ((deviceId === 'ba6e2120-8da5-11e8-876b-b585f2bf8e4f' || deviceId === '1b1318c0-8d95-11e8-876b-b585f2bf8e4f') && ts >= 1546300800000) {
              continue;
            }
            if (!this.tsList.includes(ts))
              this.tsList.push(ts);
            if (ts in arr) {
              arr[ts] += value;
            } else {
              arr[ts] = value;
            }
          }
          timeSeriesData[deviceId][key] = arr;
        }
      }

      // This code should be removed later
      // aggregate Sih data (ba6e2120-8da5-11e8-876b-b585f2bf8e4f and c3a76d50-8da5-11e8-876b-b585f2bf8e4f)

      for (let key in this.timeSeriesData['c3a76d50-8da5-11e8-876b-b585f2bf8e4f']) {
        for (let j = 0; j < this.timeSeriesData['c3a76d50-8da5-11e8-876b-b585f2bf8e4f'][key].length; j++) {
          let ts = this.timeSeriesData['c3a76d50-8da5-11e8-876b-b585f2bf8e4f'][key][j].ts - 3600000;
          let value = this.timeSeriesData['c3a76d50-8da5-11e8-876b-b585f2bf8e4f'][key][j].value;
          if (value[0] === '_') {
            let splitValues = value.split('_');
            ts = parseInt(splitValues[1]) * 1000;
            value = JSON.parse(splitValues[2]);
          } else {
            value = parseInt(value);
          }

          // skip 2019 year data of sih c3a76d50-8da5-11e8-876b-b585f2bf8e4f
          if (ts >= 1546300800000) {
            continue;
          }
          if (!this.tsList.includes(ts))
            this.tsList.push(ts);
          if (ts in timeSeriesData['ba6e2120-8da5-11e8-876b-b585f2bf8e4f'][key]) {
            timeSeriesData['ba6e2120-8da5-11e8-876b-b585f2bf8e4f'][key][ts] += value;
          } else {
            timeSeriesData['ba6e2120-8da5-11e8-876b-b585f2bf8e4f'][key][ts] = value;
          }
        }
      }

      this.tsList.sort();
      if (!this.props.startTS && !this.props.endTS) {
        this.filteredTSList = this.tsList;
      } else {
        this.filteredTSList = this.tsList.filter(t => {
          if (this.props.startTS && !this.props.endTS)
            return this.props.startTS <= t;
          if (!this.props.startTS && this.props.endTS)
            return t < this.props.endTS;
          return this.props.startTS <= t && t < this.props.endTS;
        });
      }
      this.timeSeriesData = timeSeriesData;
      this.getVFDevices();

      // This code should uncomment out later
      // this.generateDashboardData();
    });
  }

  generateDashboardData() {
    this.getStoreSalesData();
    this.updateBarChartSeries();
    this.updateDashboardData();
  }


  // get number of bons
  getStoreSalesData() {
    let stores = this.state.selectedStores.length > 0 ? this.state.selectedStores : this.state.stores;
    let data = {
      stores: stores.map(store => store.deviceId)
    };
    if (this.startTS) {
      data.from = this.startTS / 1000;
    }

    if (this.endTS) {
      data.to = this.endTS / 1000;
    }

    ApiHelper.post('/api/retail/store/sales', data, {}, true, false)
      .then(res => {
        let total = res.data.total;
        let conversionRate = total / this.state.totalVisitors * 100;
        conversionRate = Math.round(conversionRate * 100) / 100;
        this.setState({ conversionRate });
      });

  }

  updateBarChartSeries() {
    let stores = this.state.selectedStores.length > 0 ? this.state.selectedStores : this.state.stores;
    let barChartSeries = [];
    let index = 1;
    for (let i = 0; i < stores.length; i++) {
      barChartSeries.push({
        name: stores[i].Store,
        data: {
          index: index++,
          aggregation: 'sum'
        },
        style: {
          fillColor: stores[i].color,
        },
        stack: this.state.barChartStacked ? "default" : index.toString(),
        type: "columns"
      });
    }

    this.setState({
      barChartSeries,
    });
  }

  updateDashboardData() {
    let stores = this.state.selectedStores.length > 0 ? this.state.selectedStores : this.state.stores;
    let tsList = this.filteredTSList;

    let barChartValues = tsList.map(ts => [ts]);
    let visitsPieData = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],

        }
      ]
    };

    let totalVisitors = 0;
    let allStorePeopleEnterList = Array(tsList.length).fill(0);

    for (let i = 0; i < stores.length; i++) {
      let deviceId = stores[i].deviceId;
      let sum = 0;
      for (let j = 0; j < barChartValues.length; j++) {
        let ts = barChartValues[j][0];
        let value = this.timeSeriesData[deviceId]['PeopleEnter'][ts];
        value = value ? parseInt(value) : 0;
        allStorePeopleEnterList[j] += value;
        sum += value;
        barChartValues[j].push(value);
      }

      visitsPieData.labels.push(stores[i].Store);
      visitsPieData.datasets[0].data.push(sum);
      visitsPieData.datasets[0].backgroundColor.push(stores[i].color);

      totalVisitors += sum;
    }

    let barChartData = {
      values: barChartValues,
      unit: "h"
    };

    if (tsList.length > 0) {
      barChartData.from = barChartValues[0][0] - 1;
      barChartData.to = barChartValues[barChartValues.length - 1][0] + 1;
      barChartData.dataLimitTo = barChartValues[barChartValues.length - 1][0];
      barChartData.dataLimitFrom = barChartValues[0][0];
    }

    let timeDiff = 0;
    if (tsList.length > 0)
      timeDiff = tsList[tsList.length - 1] - tsList[0];
    let totalDays = timeDiff / 1000 / 3600 / 24;
    let totalWeeks = totalDays / 7;

    // Heat Map chart data
    let heatMapChartData = [];
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 24; j++) {
        heatMapChartData.push([i, j, 0]);
      }
    }

    let peopleEnterPerWeekDays = Array(7).fill(0);
    let peopleEnterPerHours = Array(24).fill(0);

    for (let i = 0; i < tsList.length; i++) {
      let date = moment(tsList[i]).tz('Europe/Berlin');
      let weekDay = 6 - date.day();
      let hour = date.hours();
      peopleEnterPerWeekDays[date.day()] += allStorePeopleEnterList[i];
      peopleEnterPerHours[date.hours()] += allStorePeopleEnterList[i];
      heatMapChartData[weekDay * 24 + hour][2] += allStorePeopleEnterList[i];
    }


    // generate top weekdays, peak times values

    let heatMapChartMaxValue = 0;
    heatMapChartData = heatMapChartData.map(function (item) {
      if (heatMapChartMaxValue < item[2])
        heatMapChartMaxValue = item[2];
      return [item[1], item[0], item[2] || '-'];
    });

    let frapppeChartDataPoints = {};
    for (let i = 0; i < tsList.length; i++) {
      let key = moment(tsList[i]).tz('Europe/Berlin').startOf('day').unix();
      if (key in frapppeChartDataPoints)
        frapppeChartDataPoints[key] += allStorePeopleEnterList[i];
      else
        frapppeChartDataPoints[key] = allStorePeopleEnterList[i];
    }

    this.setState({
      barChartData,
      visitsPieData,
      totalVisitors,
      peopleEnterPerWeekDays,
      peopleEnterPerHours,
      heatMapChartData,
      heatMapChartMaxValue,
      frappeHeatMapData: {
        dataPoints: frapppeChartDataPoints,
        start: moment(tsList[0]).tz('Europe/Berlin').toDate(),
        end: moment(tsList[tsList.length - 1]).tz('Europe/Berlin').toDate(),
      },
      visitorsPerWeek: totalWeeks > 0 ? Math.ceil(totalVisitors / totalWeeks) : 0,
      visitorsPerDay: totalDays > 0 ? Math.ceil(totalVisitors / totalDays) : 0,
    });
  }

  onSwitchBarChartStacked(barChartStacked) {
    this.setState({ barChartStacked }, this.updateBarChartSeries);
  }

  storeTableStatusFormatter = (cell, row) => {
    return (
      <Badge color="success">Online</Badge>
    );
  }

  onStoreTableRowSelect = (row, isSelected, e) => {
    let selectedStores = this.state.selectedStores;
    if (isSelected) {
      selectedStores.push(row);
    } else {
      let index = selectedStores.findIndex(store => store.id === row.id);
      selectedStores.splice(index, 1);
    }
    this.setState({ selectedStores }, this.generateDashboardData);
  }

  onStoreTableSelectAll = (isSelected, rows) => {
    this.setState({
      selectedStores: isSelected ? rows : []
    }, this.generateDashboardData);
  }

  async getVFDevices() {
    // this.props.getDevices('L01-', 100, this.props.user.customerId, this.props.userType);
    let url = '/devices?deviceIds=' + vfDeviceIds.join();
    let vfDevices = [];
    let res = await ApiHelper.get(url);
    let devices = res.data;

    let vfStores = [];
    for (let i = 0; i < devices.length; i++) {
      let additionalInfo = JSON.parse(devices[i].additionalInfo.description);
      if (!additionalInfo.color) {
        additionalInfo.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
      }
      vfDevices[devices[i].id.id] = {
        ...devices[i],
        additionalInfo
      };
      vfStores.push({
        id: devices[i].id.id,
        ...additionalInfo
      });
    }

    this.setState({ vfStores });
    this.selectedVFStore = devices[0].id.id;

    devices = await this.getDeviceAccessToken();
    for (let i = 0; i < devices.length; i++) {
      vfDevices[devices[i].deviceId.id].accessToken = devices[i].credentialsId;
    }

    let sections = await this.getSections(vfDevices);
    for (let i = 0; i < sections.length; i++) {
      vfDevices[sections[i].device_id].visitorAreas = [];
      if (sections[i].data) {
        vfDevices[sections[i].device_id].visitorAreas = sections[i].data.visitor_areas || [];
      }
    }

    let vfData = await this.getVFData(vfDevices);
    for (let i = 0; i < vfData.length; i++) {
      vfDevices[vfData[i].id].data = vfData[i].data;
    }

    this.vfDevices = vfDevices;
    this.vfTSList.sort();

    // This code should be removed later
    // vf b0375f10-f9f6-11e8-a720-5d2ca428a162, cc0a2d80-fd20-11e8-a720-5d2ca428a162
    // 1b1318c0-8d95-11e8-876b-b585f2bf8e4f, ba6e2120-8da5-11e8-876b-b585f2bf8e4f
    for (let vfDeviceId in vfDevices) {
      let deviceId = vfDeviceId === 'b0375f10-f9f6-11e8-a720-5d2ca428a162' ? '1b1318c0-8d95-11e8-876b-b585f2bf8e4f' : 'ba6e2120-8da5-11e8-876b-b585f2bf8e4f';
      for (let ts in vfDevices[vfDeviceId].data['PeopleEnter']) {
        ts = parseInt(ts);
        if (!this.tsList.includes(ts))
          this.tsList.push(ts);
        this.timeSeriesData[deviceId]['PeopleEnter'][ts] = vfDevices[vfDeviceId].data['PeopleEnter'][ts];
      }
    }

    this.tsList.sort();
    if (!this.props.startTS && !this.props.endTS) {
      this.filteredTSList = this.tsList;
    } else {
      this.filteredTSList = this.tsList.filter(t => {
        if (this.props.startTS && !this.props.endTS)
          return this.props.startTS <= t;
        if (!this.props.startTS && this.props.endTS)
          return t < this.props.endTS;
        return this.props.startTS <= t && t < this.props.endTS;
      });
    }
    this.generateDashboardData();
    this.generateDwellingTimeData();
  }

  getDeviceAccessToken() {
    let promises = [];
    for (let i = 0; i < vfDeviceIds.length; i++) {
      promises.push(ApiHelper.get('/device/' + vfDeviceIds[i] + '/credentials').then(res => res.data));
    }
    return Promise.all(promises);
  }

  getSections(devices) {
    let promises = [];
    for (let deviceId in devices) {
      promises.push(ApiHelper.get('/api/retail/section?device_id=' + deviceId, {}, {
        'access-token': devices[deviceId].accessToken
      }, false, false).then(res => res.data));
    }

    return Promise.all(promises);
  }

  getVFData(devices) {
    let endTS = Date.now();
    let promises = [];
    for (let deviceId in devices) {
      let url = `/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?limit=100000&agg=NONE&keys=PeopleEnter,Transition,DwellingTime&startTs=1527849760000&endTs=${endTS}`;
      promises.push(ApiHelper.get(url).then(res => {
        let data = res.data;
        let result = {
          id: deviceId,
          data: {},
        };
        for (let key in data) {
          let arr = [];
          for (let i = 0; i < data[key].length; i++) {
            let splitedValues = data[key][i].value.split('_');
            let ts = parseInt(splitedValues[1]) * 1000;
            if (!this.vfTSList.includes(ts))
              this.vfTSList.push(ts);
            let value = JSON.parse(splitedValues[2]);
            if (key === 'Transition') {
              let newValue = [];
              for (let j = 0; j < value.length; j++) {
                let temp = Array(value.length).fill(0);
                for (let k = j; k < value.length; k++) {
                  temp[k] = Math.ceil(value[j][k] + value[k][j]);
                }
                newValue.push(temp);
              }
              arr.push({
                ts,
                value: newValue
              });
            } else {
              arr[ts] = value

            }
          }
          result.data[key] = arr;
        }
        return result;
      }));
    }

    return Promise.all(promises);
  }

  onVFStoreSelected(id) {
    this.selectedVFStore = id;
    this.generateDwellingTimeData();
  }

  generateDwellingTimeData() {
    let dwellingTimePerSectionPieChartData = {
      labels: [],
      datasets: [],
    };

    let areas = this.vfDevices[this.selectedVFStore].visitorAreas;
    let dataset = {
      data: Array(areas.length).fill(0),
      backgroundColor: [],
    };

    for (let i = 0; i < areas.length; i++) {
      dwellingTimePerSectionPieChartData.labels.push(areas[i].area_id);
      dataset.backgroundColor.push(colors[i]);
    }

    let dwellingTimes = this.vfDevices[this.selectedVFStore].data.DwellingTime;
    let totalDwellingTime = 0;
    let totalPeopleEnter = 0;

    for (let ts in dwellingTimes) {
      if (this.startTS || this.endTS) {
        if ((this.startTS && ts < this.startTS) || (this.endTS && ts > this.endTS))
          continue;
      }
      totalPeopleEnter += this.vfDevices[this.selectedVFStore].data.PeopleEnter[ts];
      for (let i = 0; i < areas.length; i++) {
        dataset.data[i] += dwellingTimes[ts][i];
        totalDwellingTime += dwellingTimes[ts][i];
      }
    }

    dataset.data = dataset.data.map(d => totalDwellingTime > 0 ? d / totalDwellingTime * 100 : 0);
    dwellingTimePerSectionPieChartData.datasets.push(dataset);

    this.setState({
      dwellingTimePerSectionPieChartData,
      dwellingTimePerVisitor: totalPeopleEnter > 0 ? Math.ceil(totalDwellingTime / totalPeopleEnter) : 0,
    });
  }

  selectSpecificDate(id) {
    this.setState({ specificDate: id });
    if (parseInt(id) !== 0) {
      this.props.updateDateRange(specificDates[id].dates[0], specificDates[id].dates[1]);
    }
  }

  render() {
    const selectRowProp = {
      mode: 'checkbox',
      clickToSelect: true,
      onSelect: this.onStoreTableRowSelect,
      onSelectAll: this.onStoreTableSelectAll
    };

    const storeTableOptions = {
      sizePerPageList: [
        {
          text: '5',
          value: 5
        }, {
          text: '10'
          , value: 10
        }, {
          text: 'All',
          value: this.state.stores.length
        }
      ],
      sizePerPage: 5,
    };

    const pieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'right',
        display: this.state.width >= 500,
      },
      tooltips: {
        callbacks: {
          label: (tooltipItem, data) => {
            // get the data label and data value to display
            // convert the data value to local string so it uses a comma seperated number
            var dataLabel = data.labels[tooltipItem.index];
            var value = ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString();

            // make this isn't a multi-line label (e.g. [["label 1 - line 1, "line 2, ], [etc...]])
            if (Chart.helpers.isArray(dataLabel)) {
              // show value on first line of multiline label
              // need to clone because we are changing the value
              dataLabel = dataLabel.slice();
              dataLabel[0] += value;
            } else {
              dataLabel += value;
            }

            // return the text to display on the tooltip
            return dataLabel;
          }
        }
      }
    };

    const dwellingTimePieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'right',
        display: this.state.width >= 500,
      },
      tooltips: {
        callbacks: {
          label: (tooltipItem, data) => {
            // get the data label and data value to display
            // convert the data value to local string so it uses a comma seperated number
            var dataLabel = data.labels[tooltipItem.index];
            var value = ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString();

            // make this isn't a multi-line label (e.g. [["label 1 - line 1, "line 2, ], [etc...]])
            if (Chart.helpers.isArray(dataLabel)) {
              // show value on first line of multiline label
              // need to clone because we are changing the value
              dataLabel = dataLabel.slice();
              dataLabel[0] += value;
            } else {
              dataLabel += value;
            }

            // return the text to display on the tooltip
            return dataLabel + '%';
          }
        }
      }
    };

    const heatMapChartOption = {
      tooltip: {
        position: 'top'
      },
      animation: true,
      grid: {
        height: '70%',
        y: '10%'
      },
      xAxis: {
        type: 'category',
        data: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
        splitArea: {
          show: true
        }
      },
      yAxis: {
        type: 'category',
        data: ['Samstag', 'Freitag', 'Donnerstag', 'Mittwoch', 'Dienstag', 'Montag', 'Sonntag'],
        splitArea: {
          show: true
        }
      },
      visualMap: {
        min: 0,
        max: this.state.heatMapChartMaxValue,
        show: false,
        calculable: true,
        left: 'center',
        orient: 'horizontal',
      },
      series: [{
        name: 'People Flow',
        type: 'heatmap',
        data: this.state.heatMapChartData,
        label: {
          normal: {
            show: false
          }
        },
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }],
      textStyle: {
        fontSize: 10,
      }
    };

    return (
      <div className="animated fadeIn">
        <Row>
          <Col>
            <div className="date-range-picker mb-2">
              <DateRangePicker
                showClearDates
                numberOfMonths={this.state.width > 768 ? 2 : 1}
                startDate={this.props.startDate}
                startDateId="your_unique_start_date_id"
                endDate={this.props.endDate}
                endDateId="your_unique_end_date_id"
                onDatesChange={({ startDate, endDate }) => {
                  this.props.updateDateRange(startDate, endDate);
                  this.setState({ specificDate: "0" });
                }}
                focusedInput={this.state.focusedInput}
                onFocusChange={focusedInput => this.setState({ focusedInput })}
                customInputIcon={<i className="fa fa-calendar" />}
                isOutsideRange={() => false}
                small
              />
            </div>
            <div className="specific-date-div mb-4">
              <Input type="select" name="select" id="specific-date" value={this.state.specificDate}
                onChange={e => this.selectSpecificDate(e.target.value)}>
                {specificDates.map((item, id) =>
                  <option value={id} key={id}>{item.value}</option>
                )}
              </Input>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs="12" md="4">
            <Card>
              <CardBody style={{ height: '400px' }}>
                <MapWidget
                  positions={this.state.selectedStores.length > 0 ? this.state.selectedStores : this.state.stores} />
              </CardBody>
            </Card>
          </Col>
          <Col xs="12" md="8">
            <Card>
              <CardBody className="store-filter-table">
                <BootstrapTable data={this.state.stores} version='4' options={storeTableOptions} hover
                  selectRow={selectRowProp} pagination bordered={false}>
                  <TableHeaderColumn dataField='id' isKey hidden>ID</TableHeaderColumn>
                  <TableHeaderColumn dataField='Store'>Store Name</TableHeaderColumn>
                  <TableHeaderColumn dataField='Place' hidden={this.state.width <= 768}>Location</TableHeaderColumn>
                  <TableHeaderColumn dataField='Country' hidden={this.state.width <= 768}>Country</TableHeaderColumn>
                  <TableHeaderColumn dataFormat={this.storeTableStatusFormatter}>Status</TableHeaderColumn>
                </BootstrapTable>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col xs="12" sm="6" lg="3">
            <ColoredLabelBox value={this.state.totalVisitors.toLocaleString()} description="Total Visitors"
              icon="icon-people"
              backgroundColor="#7266BA" iconBackgroundColor="#665CA7" variant="1" />
          </Col>
          <Col xs="12" sm="6" lg="3">
            <ColoredLabelBox value={this.state.conversionRate + ' %'} description="Conversion Rate"
              icon="icon-basket-loaded"
              backgroundColor="#42A5F6" iconBackgroundColor="#3B94DD" variant="1" />
          </Col>
          <Col xs="12" sm="6" lg="3">
            <ColoredLabelBox value={this.state.visitorsPerDay.toLocaleString()} description="Visitors per day"
              icon="fa fa-calendar-o"
              backgroundColor="#7ED320" iconBackgroundColor="#4BBD1D" variant="1" />
          </Col>
          <Col xs="12" sm="6" lg="3">
            <ColoredLabelBox value={this.state.dwellingTimePerVisitor.toLocaleString()}
              description="Dwelling time per visitor"
              icon="fa fa-clock-o" backgroundColor="#F75D81" iconBackgroundColor="#DE5474"
              variant="1" />
          </Col>
        </Row>

        <Row>
          <Col xs="12" sm="6" lg="3">
            <TopHours peopleEnterPerHours={this.state.peopleEnterPerHours} />
          </Col>
          <Col xs="12" sm="6" lg="3">
            <TopWeekDays peopleEnterPerWeekDays={this.state.peopleEnterPerWeekDays} />
          </Col>
          <Col xs="12" lg="6">
            <Card>
              <CardBody style={{ height: 200 }}>
                <span className="h5 header-title position-absolute">Heat Map Chart</span>
                {this.state.frappeHeatMapData &&
                  <FrappeChart type="heatmap" data={this.state.frappeHeatMapData} countLabel="people" />
                }
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs="12">
            <Card>
              <CardBody>
                <Row>
                  <Col xs="12" sm="5">
                    <span className="h5 header-title">People Enter Bar Chart</span>
                  </Col>
                  <Col xs="12" sm="7" className="d-none d-sm-inline-block">
                    <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                      <ButtonGroup className="mr-3" aria-label="First group">
                        <Button color="outline-primary" onClick={() => this.onSwitchBarChartStacked(true)}
                          active={this.state.barChartStacked}>gestapelt</Button>
                        <Button color="outline-primary" onClick={() => this.onSwitchBarChartStacked(false)}
                          active={!this.state.barChartStacked}>separiert</Button>
                      </ButtonGroup>
                    </ButtonToolbar>
                  </Col>
                </Row>
                <div style={{ height: 300, marginBottom: 10 }}>
                  <BarChart data={this.state.barChartData} series={this.state.barChartSeries} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs="12" md="6">
            <Card>
              <CardBody>
                <Row className="mb-3 dwelling-time-pie-chart-title">
                  <Col>
                    <span className="h5 header-title">Distribution Per Store</span>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="dwelling-time-pie-chart-wrapper">
                      {this.state.visitsPieData &&
                        <Doughnut data={this.state.visitsPieData} options={pieChartOptions} />
                      }
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col xs="12" md="6">
            <Card>
              <CardBody>
                <Row className="mb-3 dwelling-time-pie-chart-title">
                  <Col className="mb-3" xs={12} sm={6}>
                    <span className="h5 header-title">Dwelling Time Per Sections</span>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Input type="select" name="select" id="select"
                      onChange={e => this.onVFStoreSelected(e.target.value)}>
                      {this.state.vfStores.map((store, id) =>
                        <option value={store.id} key={id}>{store.Store}</option>
                      )}
                    </Input>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="dwelling-time-pie-chart-wrapper">
                      {this.state.dwellingTimePerSectionPieChartData &&
                        <Doughnut data={this.state.dwellingTimePerSectionPieChartData}
                          options={dwellingTimePieChartOptions} />
                      }
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs="12">
            <Card>
              <CardBody>
                <Row className="mb-3">
                  <Col>
                    <span className="h5 header-title">Visitors Per Day - Detailed Heat Map Chart</span>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <ReactEcharts
                      option={heatMapChartOption}
                      notMerge={true}
                      lazyUpdate={true} />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  devices: state.retail.devices,
  startTS: state.retail.startDate ? state.retail.startDate.tz('Europe/Berlin').startOf('day').unix() * 1000 : null,
  endTS: state.retail.endDate ? state.retail.endDate.tz('Europe/Berlin').endOf('day').unix() * 1000 : null,
  startDate: state.retail.startDate,
  endDate: state.retail.endDate,
});

const mapDispatchToProps = {
  getDevices,
  updateDateRange: (startDate, endDate) => {
    return {
      type: UPDATE_DATERANGE,
      payload: {
        startDate,
        endDate
      }
    };
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

