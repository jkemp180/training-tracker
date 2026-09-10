(() => {
  function calendarIndex() {
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
    return workouts.length;
  }

  function displayIndex() {
    return Math.min(plan().length - 1, nextUnfinishedIndex());
  }

  function nextIncompleteIndex() {
    const index = nextUnfinishedIndex();
    return index < plan().length ? index : null;
  }

  function shiftedDateFor(index) {
    const workout = plan()[index];
    const completedAt = workout ? state.logs[workout.id]?.date : null;
    if (completedAt) {
      const completedDate = new Date(completedAt);
      if (!Number.isNaN(completedDate.getTime())) return completedDate;
    }

    const next = nextUnfinishedIndex();
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + Math.max(0, index - next));
    return date;
  }

  window.calendarPlanIndex = calendarIndex;
  window.nextIncompletePlanIndex = nextIncompleteIndex;
  window.nextUnfinishedPlanIndex = nextUnfinishedIndex;

  // The program is one sequential cycle. If a day is missed, the next unfinished session becomes today's session and every later session shifts forward.
  dayIndex = displayIndex;
  currentWeek = () => Math.floor(displayIndex() / 7) + 1;
  dateFor = shiftedDateFor;
})();
