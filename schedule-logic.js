(() => {
  function calendarIndex() {
    const start = new Date(`${state.startDate}T00:00:00`);
    return Math.max(0, Math.min(83, Math.floor((new Date() - start) / 86400000)));
  }

  function isComplete(index) {
    const workout = plan()[index];
    return Boolean(workout && state.logs[workout.id]?.completed);
  }

  function missedBeforeToday() {
    const today = calendarIndex();
    const workouts = plan();
    const missed = [];

    for (let index = 0; index < today; index += 1) {
      const workout = workouts[index];
      if (!workout || workout.type === 'recovery') continue;
      if (!isComplete(index)) missed.push(index);
    }

    return missed;
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
  window.missedPlanIndexes = missedBeforeToday;

  // Keep Today tied to the actual calendar date. Missed workouts no longer shift the whole plan backward.
  dayIndex = calendarIndex;
  currentWeek = () => Math.floor(calendarIndex() / 7) + 1;

  const baseTodayView = todayView;
  todayView = function calendarSyncedTodayView() {
    const html = baseTodayView();
    const missed = missedBeforeToday();
    if (!missed.length) return html;

    const cards = missed.slice(-3).reverse().map(index => {
      const workout = plan()[index];
      return `<button class="card day-card" data-start="${index}"><span class="day-badge">!</span><span style="text-align:left"><strong>${workout.title}</strong><small class="muted" style="display:block">Missed · ${fmtDate(dateFor(index))}</small></span><span class="tag">Do later</span></button>`;
    }).join('');

    return `${html}<section class="card stack"><div><p class="eyebrow">MISSED</p><h3>${missed.length} unfinished session${missed.length === 1 ? '' : 's'}</h3><p class="muted">Today stays synced to the real date. Missed sessions stay available here without shifting the rest of the plan.</p></div>${cards}</section>`;
  };
})();
