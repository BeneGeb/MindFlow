export const toDateString = (date: Date): string =>
  date.toISOString().split('T')[0];

export const today = (): string => toDateString(new Date());

export const getDayOfWeek = (dateStr: string): number =>
  new Date(dateStr + 'T12:00:00').getDay();

export const getLastNDays = (n: number): string[] => {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDateString(d));
  }
  return days;
};

// page=0 → most recent n days, page=1 → n..2n days ago, etc. Oldest first.
export const getDaysWithOffset = (n: number, page: number): string[] => {
  const days: string[] = [];
  for (let i = page * n + n - 1; i >= page * n; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDateString(d));
  }
  return days;
};

export const formatDateRange = (dates: string[]): string => {
  if (dates.length === 0) return '';
  const fmt = (s: string) =>
    new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const formatTime = (time: string): string => {
  const [h, m] = time.split(':').map(Number);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const getWeekDates = (referenceDate: Date): string[] => {
  const week: string[] = [];
  const day = referenceDate.getDay();
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - ((day + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(toDateString(d));
  }
  return week;
};

export const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
