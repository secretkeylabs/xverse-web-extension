import { format, isToday, isYesterday } from 'date-fns';

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

export const formatDateKey = (date: Date) => format(date, 'yyyy-MM-dd');
