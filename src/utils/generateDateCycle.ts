export const getDateCycle = (type: 'year' | 'month' | 'week') => {
  let startDate: Date;
  let startDatePreviousCycle: Date;

  const now = new Date();

  if (type === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    startDatePreviousCycle = new Date(now.getFullYear() - 1, 0, 1);
  } else if (type === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    if (now.getMonth() === 0) {
      startDatePreviousCycle = new Date(now.getFullYear() - 1, 11, 1);
    } else {
      startDatePreviousCycle = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
    }
  } else if (type === 'week') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);

    startDatePreviousCycle = new Date(now);
    startDatePreviousCycle.setDate(now.getDate() - 14);
  }
  return { startDate, startDatePreviousCycle };
};
