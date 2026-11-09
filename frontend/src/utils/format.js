// Small helpers for showing money and dates the same way everywhere.
export const formatMoney = (amount) => `Rs ${Number(amount || 0).toLocaleString('en-PK')}`;

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });

export const formatTime = (value) =>
  new Date(value).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in LOCAL time
export const toInputValue = (date) => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

export const roundUpToNextHalfHour = (date = new Date()) => {
  const rounded = new Date(date);
  rounded.setSeconds(0, 0);
  rounded.setMinutes(rounded.getMinutes() < 30 ? 30 : 60);
  return rounded;
};

export const errorMessage = (error) =>
  error?.response?.data?.message || 'Something went wrong. Please check your connection and try again.';
