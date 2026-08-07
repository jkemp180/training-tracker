(() => {
  const LEGACY_FUTURE_START = '2026-08-10';

  function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function firstCompletedWorkoutDate() {
    const dates = Object.values(state.logs || {})
      .filter(log => log && log.completed && log.date)
      .map(log => new Date(log.date))
      .filter(date => !Number.isNaN(date.getTime()))
      .sort((a, b) => a - b);
    return dates[0] || null;
  }

  const firstWorkout = firstCompletedWorkoutDate();
  const today = new Date();
  const configuredStart = new Date(`${state.startDate}T00:00:00`);

  // Migrate the original hardcoded Monday start to the actual first training day.
  // This changes only the calendar anchor. Existing logs, history and prescriptions stay intact.
  if (firstWorkout && state.startDate === LEGACY_FUTURE_START && configuredStart > today) {
    state.startDate = localDateString(firstWorkout);
    save();
  }

  render();
})();
