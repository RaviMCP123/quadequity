import moment from 'moment';

export const formatDate = (
  date: moment.Moment | string,
  format: string = 'DD-MM-YYYY',
): string => {
  return moment(date).format(format);
};

export const formatDateTime = (
  date: moment.Moment | string,
  format: string = 'DD-MM-YYYY HH:mm:ss',
): string => {
  return moment(date).format(format);
};

export const getDayRangeString = () => {
  const today = moment().format("YYYY-MM-DD");
  return `${today}T00:00TO${today}T23:59`;
};
