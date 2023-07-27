import { format, isYesterday, isToday } from 'date-fns';

// eslint-disable-next-line import/prefer-default-export
export const formatDate = (date: Date) => {
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMMM dd, yyyy');
};
