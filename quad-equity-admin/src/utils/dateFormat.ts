import moment, { Moment } from "moment";

export const DefaultDateFormate = "YYYY-MM-DD";
export const DefaultDateTimeFormate = "YYYY-MM-DD HH:mm";

export const formatDateTime = (
  date: string | Date,
  format: string = "DD MMM YYYY hh:mm A"
): string => {
  return moment(date).format(format);
};
export const formatDate = (
  date: string | Date,
  format: string = "DD-MM-YYYY"
): string => {
  return moment(date).format(format);
};

export const formatMomentDate = (
  date: string | Date,
  format: string = "MM-DD-YYYY"
): Moment => {
  return moment(date, format);
};
