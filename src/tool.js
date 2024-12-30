
export function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // 32비트 정수로 변환
  }
  return Math.abs(hash);
}

export function getColorForSchedule(schedule) {
  const { title, description, startDate, startTime } = schedule;
  const key = `${title}-${description}-${startDate}-${startTime}`;
  const hash = generateHash(key);
  return `#${(hash & 0xffffff).toString(16).padStart(6, "0")}`;
}

export function generateDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dates = [];

  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  return dates;
}

export const LocalStorageManager = {
  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  load(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
};

export function sortSchedules(schedules) {
  return schedules.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed - b.completed;
    }
    const timeA = a.startTime || "00:00";
    const timeB = b.startTime || "00:00";
    return timeA.localeCompare(timeB);
  });
}

