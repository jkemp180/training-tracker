(() => {
  function originalCalendarIndex() {
    const start = new Date(`${state.startDate}T00:00:00`);
    return Math.max(0, Math.min(83, Math.floor((new Date() - start) / 86400000)));
  }

  function isComplete(index) {
    const workout = plan()[index];
    return Boolean(workout && state.logs[workout.id]?.completed);
  }

  function nextUnfinishedIndex() {
    const workouts = plan();
    for (let index = 0; index < workouts.length; index += 1) {
      if (!isComplete(index)) return index;
    }
    return workouts.length - 1;
  }

  function shiftedDateFor(index) {
    const current = nextUnfinishedIndex();

    // Completed sessions keep the day they were actually completed when available.
    if (index < current) {
      const workout = plan()[index];
      const completedAt = state.logs[workout.id]?.date;
      if (completedAt) return new Date(completedAt);
    }

    // The next unfinished workout is always today; every later workout follows one day at a time.
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + (index - current));
    return date;
  }

  function nextIncompleteIndex(afterIndex) {
    const workouts = plan();
    for (let index = Math.max(0, afterIndex + 1); index < workouts.length; index += 1) {
      if (!isComplete(index)) return index;
    }
    return null;
  }

  window.calendarPlanIndex = originalCalendarIndex;
  window.nextIncompletePlanIndex = nextIncompleteIndex;
  window.nextUnfinishedPlanIndex = nextUnfinishedIndex;

  // Program position is sequential. A missed day never skips a workout; it shifts the remaining schedule forward.
  dayIndex = nextUnfinishedIndex;
  currentWeek = () => Math.floor(nextUnfinishedIndex() / 7) + 1;
  dateFor = shiftedDateFor;
})();
