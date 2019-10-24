import moment from 'moment';

export const colors = [
  '#eb3b5a',
  '#fa8231',
  '#f7b731',
  '#20bf6b',
  '#0fb9b1',
  '#2d98da',
  '#3867d6',
  '#8854d0',
  '#a5b1c2',
  '#4b6584'
];

export const specificDates = [
  {
    value: 'Select specific date',
    dates: [null, null]
  }, {
    value: 'Winter',
    dates: [moment().year(moment().year() - 1).month(11).date(26), moment().month(0).date(14)]
  }, {
    value: 'Valentin',
    dates: [moment().month(0).date(15), moment().month(1).date(14)]
  }, {
    value: 'Ostern',
    dates: [moment().month(1).date(19), moment().month(3).date(22)]
  }, {
    value: 'Muttertag',
    dates: [moment().month(3).date(23), moment().month(4).date(12)]
  }, {
    value: 'Maikäfer',
    dates: [moment().month(3).date(23), moment().month(4).date(26)]
  }, {
    value: 'Sommer',
    dates: [moment().month(4).date(28), moment().month(6).date(28)]
  }, {
    value: 'Touristik',
    dates: [moment().month(6).date(30), moment().month(8).date(1)]
  },{
    value: 'Herbst',
    dates: [moment().month(8).date(3), moment().month(9).date(20)]
  }, {
    value: 'Chlaus',
    dates: [moment().month(9).date(2), moment().month(10).date(10)]
  }, {
    value: 'Weihnachten',
    dates: [moment().month(10).date(12), moment().month(11).date(25)]
  }
];