(() => {
  function calendarIndex() {
    const start = new Date(`${state.startDate}T00:00:00`);
    return Math.max(0, Math.min(83, Math.floor((new Date() - start) / 86400000)));
  }

  function isComplete(index) {
    const workout = plan()[index];
    return Boolean(workout && state.logs[workout.id]?.completed);
  }

  function pendingIndexThroughToday() {
    const scheduled = calendarIndex();
    const workouts = plan();

    for (let index = 0; index <= scheduled; index += 1) {
      const workout = workouts[index];
      if (!workout || workout.type === 'recovery') continue;
      if (!isComplete(index)) return index;
    }

    return scheduled;
  }

  function nextIncompleteIndex(afterIndex) {
    const workouts = plan();
    for (let index = Math.max(0, afterIndex + 1); index < workouts.length; index += 1) {
      const workout = workouts[index];
      if (workout.type === 'recovery') {
        if (index >= calendarIndex()) return index;
        continue;
      }
      if (!isComplete(index)) return index;
    }
    return null;
  }

  window.calendarPlanIndex = calendarIndex;
  window.nextIncompletePlanIndex = nextIncompleteIndex;
  dayIndex = pendingIndexThroughToday;
  currentWeek = () => Math.floor(dayIndex() / 7) + 1;
})();
