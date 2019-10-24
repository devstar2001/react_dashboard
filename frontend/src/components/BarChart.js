import React, {Component} from 'react';
import zc from "@dvsl/zoomcharts"
import PropTypes from "prop-types";
import Header from "../containers/Layout/Header";

let TimeChart = zc.TimeChart;

window.ZoomChartsLicense = "ZCP-mvg0u8815-16: ZoomCharts SDK TimeChart Named-user license for 10 users";
window.ZoomChartsLicenseKey = "ae4c77c5f6ee2253a6c140ff70a75651e9603ef8a7b147f376" +
  "3b726adbd7e582f2999cebd5fdee43e1b8d3f03d717a7e6bc626d57a5d1f72bf93b9d7921412f" +
  "5986df7b780ef03a0395ba9398eddf7aa119aa6ff09df038bf61c280e0707dca7c007802b27c3" +
  "1db69d9f41306c16a433893c072a9c1c9adfd29b8a53c6bde0c8fd74f71c10ee63b1c832fe6ec" +
  "049a4ba6760176e88f0a973a75d300d833ead73efa703b05445f35b90ae9f9634a1d7025f3605" +
  "1643199919e0420036ff8445396e3d02e052b1bcf0cfa331ac34cd81833813a7da89ca939eb98" +
  "02d37ca5c58b09df3037c596da293f876ac59ceb8ad62f3b9070fcc30391e6ab6dee91b01c0a1";

class BarChart extends Component {

  componentWillReceiveProps(nextProps) {
    if (!nextProps.data)
      return;
    if (this.chart) {
      this.chart.replaceData(nextProps.data);
      this.chart.replaceSettings({series: nextProps.series});
    } else {
      this.createChart(nextProps.data, nextProps.series);
    }
  }

  createChart(data, series) {
    this.chart = new TimeChart({
      legend: {
        enabled: true
      },
      stacks: {
        default: {
          type: "normal"
        }
      },
      timeAxis: {
        timeZone: 'Europe/Berlin'
      },
      container: document.getElementById("peopleEnterBarChart"),
      toolbar: {
        location: "outside",
        enabled: true,
        displayPeriod: false,
        displayUnit: false,
        logScale: false,
      },
      interaction: {
        resizing: {
          enabled: false
        }
      },
      localization: {
        toolbar: {
          backButton: "Zurück",
          exportJpeg: "Office und Web (jpeg)",
          exportPNG: "Photoshop (png)",
          exportPDF: "Drucker (pdf)",
          exportCSV: "Spreadsheet (csv)",
          exportXLS: "Spreadsheet (xls)"
        },
        timeUnitsNames: {
          y: "Year",
          M: "Monat",
          d: "Tag",
          h: "Stunde",
        },
        timeUnitsNamesPlural: {
          y: "Year",
          M: "Monate",
          d: "Tage",
          h: "Stunden",
        }
      },
      series: series,
      data: {
        units: "h",
        preloaded: data,
      }
    });
  }

  render() {
    return (
      <div id="peopleEnterBarChart"/>
    );
  }
}

Header.propTypes = {
  data: PropTypes.object,
  series: PropTypes.array,
};

export default BarChart;
