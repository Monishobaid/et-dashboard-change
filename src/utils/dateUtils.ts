import { format } from 'date-fns';

export const formatTimestamp = (timestamp: number): string => {
  return format(new Date(timestamp * 1000), 'MMM dd, yyyy HH:mm');
};

export const formatDate = (timestamp: number): string => {
  return format(new Date(timestamp * 1000), 'MMM dd, yyyy');
};