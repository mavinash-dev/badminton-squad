// All date helpers in IST (Asia/Kolkata, UTC+5:30)

export function todayIST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function offsetIST(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function formatDisplayIST(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export function formatShortIST(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short', day: 'numeric', month: 'short',
  });
}
