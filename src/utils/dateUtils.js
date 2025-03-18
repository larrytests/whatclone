import { format, isToday as dateFnsIsToday } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

export function formatMessageTime(date) {
  if (!date) return '';

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zonedDate = utcToZonedTime(date, userTimeZone);

  if (isToday(zonedDate)) {
    return format(zonedDate, 'HH:mm');
  }

  return format(zonedDate, 'dd/MM/yyyy HH:mm');
}

export function isToday(date) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zonedDate = utcToZonedTime(date, userTimeZone);
  return dateFnsIsToday(zonedDate);
}

export function formatLastSeen(date) {
  if (!date) return 'Last seen recently';
  
  const now = new Date();
  date = new Date(date);
  const diffMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `Last seen ${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  if (isToday(date)) {
    return `Last seen today at ${format(date, 'HH:mm')}`;
  }

  if (isYesterday(date)) {
    return `Last seen yesterday at ${format(date, 'HH:mm')}`;
  }

  if (isThisYear(date)) {
    return `Last seen ${format(date, 'MMM d')} at ${format(date, 'HH:mm')}`;
  }

  return `Last seen ${format(date, 'MMM d, yyyy')} at ${format(date, 'HH:mm')}`;
}

export function groupMessagesByDate(messages) {
  const groups = {};
  
  messages.forEach(message => {
    const date = new Date(message.createdAt);
    const key = format(date, 'yyyy-MM-dd');
    
    if (!groups[key]) {
      groups[key] = {
        title: formatMessageDate(date),
        data: [],
      };
    }
    
    groups[key].data.push(message);
  });

  return Object.values(groups);
}

function formatMessageDate(date) {
  if (isToday(date)) {
    return 'Today';
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  if (isThisYear(date)) {
    return format(date, 'MMMM d');
  }

  return format(date, 'MMMM d, yyyy');
}
