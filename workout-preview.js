(() => {
  const dialog = document.getElementById('workoutDialog');

  function setText(sets) {
    return sets.map(set => `${set.weight ? `${set.weight} kg` : 'Bodyweight'} × ${set.reps}`).join(' · ');
  }

  function strengthPreview(workout, compact = false) {
    const exercises = strength[workout.template] || [];
    const visible = compact ? exercises.slice(0, 3) : exercises;
    const rows = visible.map(def => {
      const sets = prescription(def);
      return `<li class="workout-preview-row"><span><strong>${def.name}</strong><small>${sets.length} sets</small></span><b>${setText(sets)}</b></li>`;
    }).join('');
    const remaining = exercises.length - visible.length;
    return `<ul class="workout-preview-list">${rows}</ul>${remaining > 0 ? `<p class="preview-more">+ ${remaining} more exercises</p>` : ''}`;
  }

  function completedStrengthPreview(workout, log) {
    const exercises = strength[workout.template] || [];
    return `<ul class="workout-preview-list">${exercises.map(def => {
      const completed = log.exercises?.[def.name]?.sets || [];
      const done = completed.filter(set => set.done);
      const shown = done.length ? done : completed;
      return `<li class="workout-preview-row"><span><strong>${def.name}</strong><small>${done.length || shown.length} sets completed</small></span><b>${shown.length ? setText(shown) : 'Completed'}</b></li>`;
    }).join('')}</ul>`;
  }

  function runPreview(workout, compact = false) {
    let title = 'Easy aerobic run';
    let detail = `${workout.minutes} minutes at conversational effort`;
    if (workout.template === 'quality') {
      title = 'Quality intervals';
      detail = compact ? `${workout.minutes} min with faster efforts` : `Easy warm-up, controlled faster intervals with easy recoveries, then cool down · ${workout.minutes} min total`;
    } else if (workout.template === 'steady') {
      title = 'Steady run';
      detail = `${workout.distance} km · relaxed, even pace`;
    } else if (workout.template === 'long') {
      title = 'Long easy run';
      detail = `${workout.distance} km target · keep the effort easy enough to speak in sentences`;
    }
    return `<div class="run-preview"><span class="preview-icon">RUN</span><span><strong>${title}</strong><small>${detail}</small></span></div>`;
  }

  function completedRunPreview(log) {
    return `<div class="run-preview"><span class="preview-icon">DONE</span><span><strong>${(+log.distance || 0).toFixed(1)} km</strong><small>${+log.duration || 0} min · effort ${log.rpe || '-'} / 10 · knee pain ${log.knee || 0} / 10</small></span></div>`;
  }

  function recoveryPreview() {
    return `<ul class="workout-preview-list"><li class="workout-preview-row"><span><strong>Easy walk</strong><small>20-30 minutes</small></span><b>Comfortable pace</b></li><li class="workout-preview-row"><span><strong>Mobility</strong><small>10-15 minutes</small></span><b>Hips · ankles · knees · upper back</b></li></ul>`;
  }

  function workoutPreview(workout, compact = false) {
    if (workout.type === 'strength') return strengthPreview(workout, compact);
    if (workout.type === 'run') return runPreview(workout, compact);
    return recoveryPreview();
  }

  function completedPreview(workout, log) {
    if (workout.type === 'strength') return completedStrengthPreview(workout, log);
    if (workout.type === 'run') return completedRunPreview(log);
    return `<div class="notice">${+log.duration || workout.minutes} minutes completed.</div>`;
  }

  function completedToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return plan().map((workout, index) => ({workout, index, log: state.logs[workout.id]}))
      .filter(item => item.log?.completed && item.log.date && new Date(item.log.date) >= start && new Date(item.log.date) < end)
      .sort((a, b) => new Date(b.log.date) - new Date(a.log.date))[0] || null;
  }

  function effectivePreviewWorkout(workout) {
    if (workout?.type === 'run' && window.adaptiveRunTarget) return window.adaptiveRunTarget(workout) || workout;
    return workout;
  }

  function upcomingWorkoutChoices() {
    const workouts = plan();
    const start = window.nextUnfinishedPlanIndex ? window.nextUnfinishedPlanIndex() : dayIndex();
    const seen = new Set();
    const choices = [];

    for (let index = Math.max(0, start); index < workouts.length && choices.length < 7; index += 1) {
      const workout = workouts[index];
      if (!workout || state.logs[workout.id]?.completed || seen.has(workout.template)) continue;
      seen.add(workout.template);
      choices.push({index, workout});
    }
    return choices;
  }

  function choiceMeta(workout) {
    if (workout.type === 'strength') return `${strength[workout.template]?.length || 0} exercises · about ${workout.minutes} min`;
    if (workout.template === 'quality') return `Intervals · about ${workout.minutes} min`;
    if (workout.distance) return `${workout.distance} km target · about ${workout.minutes} min`;
    return `About ${workout.minutes} min`;
  }

  function openWorkoutChooser() {
    const choices = upcomingWorkoutChoices();
    const required = window.nextUnfinishedPlanIndex ? window.nextUnfinishedPlanIndex() : dayIndex();
    dialog.innerHTML = `<div class="sheet-content workout-chooser"><div class="between row"><div><p class="eyebrow">CHOOSE WORKOUT</p><h2>What do you want to train?</h2></div><button class="icon-button" data-close-chooser aria-label="Close">×</button></div><p class="muted chooser-intro">Browse the full session before starting. Doing a later workout does not skip the earlier sessions in your training cycle.</p><div class="stack">${choices.map(({index, workout}) => {
      const previewWorkout = effectivePreviewWorkout(workout);
      const requiredTag = index === required ? '<span class="tag chooser-required">NEXT REQUIRED</span>' : '<span class="tag">AVAILABLE</span>';
      return `<section class="card workout-choice"><div class="preview-heading"><div><p class="eyebrow">WEEK ${workout.week}</p><h3>${workout.title}</h3></div>${requiredTag}</div><p class="muted workout-choice-meta">${choiceMeta(previewWorkout)}</p>${workoutPreview(previewWorkout, true)}<button class="secondary" data-workout-preview="${index}">See full workout</button></section>`;
    }).join('')}</div></div>`;
    dialog.querySelector('[data-close-chooser]')?.addEventListener('click', () => dialog.close());
    if (!dialog.open) dialog.showModal();
  }

  function openWorkoutChoice(index) {
    const workout = plan()[index];
    if (!workout) return openWorkoutChooser();
    const previewWorkout = effectivePreviewWorkout(workout);
    const required = window.nextUnfinishedPlanIndex ? window.nextUnfinishedPlanIndex() : dayIndex();
    const requiredWorkout = required === null ? null : plan()[required];
    const exact = window.sessionDetails ? window.sessionDetails(previewWorkout) : workoutPreview(previewWorkout);
    const sequenceNotice = index !== required && requiredWorkout
      ? `<div class="notice">Your next required session is still ${requiredWorkout.title}. Starting ${workout.title} now will not remove or skip it.</div>`
      : '<div class="notice">This is your next required session in the training cycle.</div>';

    dialog.innerHTML = `<div class="sheet-content workout-choice-detail"><div class="between row"><div><p class="eyebrow">WEEK ${workout.week} · ${workout.type.toUpperCase()}</p><h2>${workout.title}</h2></div><button class="icon-button" data-close-chooser aria-label="Close">×</button></div>${sequenceNotice}<section class="session-instructions">${exact}</section><button class="primary" data-start-chosen-workout="${index}">Start this workout</button><button class="secondary" data-back-to-workouts>Back to all workouts</button></div>`;
    dialog.querySelector('[data-close-chooser]')?.addEventListener('click', () => dialog.close());
  }

  document.addEventListener('click', event => {
    const launch = event.target.closest('[data-workout-chooser]');
    if (launch) {
      event.preventDefault();
      openWorkoutChooser();
      return;
    }

    const preview = event.target.closest('[data-workout-preview]');
    if (preview) {
      event.preventDefault();
      openWorkoutChoice(+preview.dataset.workoutPreview);
      return;
    }

    if (event.target.closest('[data-back-to-workouts]')) {
      event.preventDefault();
      openWorkoutChooser();
      return;
    }

    const start = event.target.closest('[data-start-chosen-workout]');
    if (start) {
      event.preventDefault();
      const index = +start.dataset.startChosenWorkout;
      dialog.close();
      setTimeout(() => openWorkout(index), 0);
    }
  });

  window.openWorkoutChooser = openWorkoutChooser;

  todayView = function smartTodayView() {
    const completed = completedToday();
    const pct = Math.round(completedCount() / 84 * 100);

    if (completed) {
      const nextIndex = nextIncompletePlanIndex(completed.index);
      const next = nextIndex === null ? null : plan()[nextIndex];
      return `<section class="card hero"><p class="eyebrow">COMPLETED TODAY</p><h2>${completed.workout.title} ✓</h2><p class="muted">Nice work. Today's recorded session is locked in below.</p><div class="progress"><span style="width:${pct}%"></span></div><p class="muted">${pct}% plan complete</p></section><section class="card workout-preview"><div class="preview-heading"><div><p class="eyebrow">WHAT YOU COMPLETED</p><h3>Your recorded session</h3></div><span class="tag">done</span></div>${completedPreview(completed.workout, completed.log)}<button class="secondary" data-start="${completed.index}">Review workout</button></section>${next ? `<section class="card workout-preview"><div class="preview-heading"><div><p class="eyebrow">UP NEXT</p><h3>${next.title}</h3></div><span class="tag">${next.type}</span></div>${workoutPreview(effectivePreviewWorkout(next), true)}<button class="primary" data-start="${nextIndex}">View next workout</button><button class="secondary" data-workout-chooser>Choose another workout</button></section>` : ''}<section class="grid-2"><div class="metric"><span class="muted">Weight</span><strong>${state.weight} kg</strong></div><div class="metric"><span class="muted">Completed</span><strong>${completedCount()}/84</strong></div></section>`;
    }

    const index = dayIndex();
    const workout = plan()[index];
    const scheduled = calendarPlanIndex();
    const overdue = index < scheduled && workout.type !== 'recovery';
    return `<section class="card hero"><p class="eyebrow">${overdue ? 'CARRY FORWARD' : `WEEK ${workout.week} OF 12`}</p><h2>${workout.title}</h2><p class="muted">${workout.minutes} min${workout.distance ? ` · ${workout.distance} km target` : ''}</p>${overdue ? '<div class="notice">This session was missed earlier, so it stays next in your plan. Complete it and the plan continues from there.</div>' : ''}<div class="progress"><span style="width:${pct}%"></span></div><p class="muted">${pct}% plan complete</p>${workout.hyrox ? '<div class="notice">Optional: replace this session with Hyrox.</div>' : ''}</section><section class="card workout-preview"><div class="preview-heading"><div><p class="eyebrow">${overdue ? 'NEXT REQUIRED SESSION' : "TODAY'S SESSION"}</p><h3>What you will do</h3></div><span class="tag">${workout.type}</span></div>${workoutPreview(effectivePreviewWorkout(workout))}<button class="primary" data-start="${index}">Start workout</button><button class="secondary" data-workout-chooser>Choose another workout</button></section><section class="grid-2"><div class="metric"><span class="muted">Weight</span><strong>${state.weight} kg</strong></div><div class="metric"><span class="muted">Completed</span><strong>${completedCount()}/84</strong></div></section>`;
  };

  render();
})();
