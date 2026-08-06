(() => {
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

  function recoveryPreview() {
    return `<ul class="workout-preview-list"><li class="workout-preview-row"><span><strong>Easy walk</strong><small>20-30 minutes</small></span><b>Comfortable pace</b></li><li class="workout-preview-row"><span><strong>Mobility</strong><small>10-15 minutes</small></span><b>Hips · ankles · knees · upper back</b></li></ul>`;
  }

  function workoutPreview(workout, compact = false) {
    if (workout.type === 'strength') return strengthPreview(workout, compact);
    if (workout.type === 'run') return runPreview(workout, compact);
    return recoveryPreview();
  }

  todayView = function todayViewWithPreview() {
    const i = dayIndex();
    const workout = plan()[i];
    const log = state.logs[workout.id] || {};
    const pct = Math.round(completedCount() / 84 * 100);
    const tomorrow = plan()[Math.min(83, i + 1)];
    return `<section class="card hero"><p class="eyebrow">WEEK ${workout.week} OF 12</p><h2>${workout.title}</h2><p class="muted">${workout.minutes} min${workout.distance ? ` · ${workout.distance} km target` : ''}</p><div class="progress"><span style="width:${pct}%"></span></div><p class="muted">${pct}% plan complete</p>${workout.hyrox ? '<div class="notice">Optional: replace this session with Hyrox.</div>' : ''}</section><section class="card workout-preview"><div class="preview-heading"><div><p class="eyebrow">TODAY'S SESSION</p><h3>What you will do</h3></div><span class="tag">${workout.type}</span></div>${workoutPreview(workout)}<button class="primary" data-start="${i}">${log.completed ? 'Review workout' : 'Start workout'}</button></section><section class="grid-2"><div class="metric"><span class="muted">Weight</span><strong>${state.weight} kg</strong></div><div class="metric"><span class="muted">Completed</span><strong>${completedCount()}/84</strong></div></section><section class="card"><p class="eyebrow">TOMORROW</p><h3>${tomorrow.title}</h3><div class="tomorrow-preview">${workoutPreview(tomorrow, true)}</div></section>`;
  };

  weekView = function weekViewWithPreviews() {
    const start = (currentWeek() - 1) * 7;
    return plan().slice(start, start + 7).map((workout, offset) => `<button class="card day-card day-card-detailed ${state.logs[workout.id]?.completed ? 'done' : ''}" data-start="${start + offset}"><span class="day-badge">${state.logs[workout.id]?.completed ? '✓' : offset + 1}</span><span class="day-main"><span class="day-title"><strong>${workout.title}</strong><span class="tag">${workout.minutes}m</span></span><small class="muted">${fmtDate(dateFor(start + offset))}</small><span class="week-session-preview">${workout.type === 'strength' ? (strength[workout.template] || []).map(def => def.name).slice(0, 3).join(' · ') : workout.type === 'run' ? (workout.distance ? `${workout.distance} km target` : `${workout.minutes} min with faster efforts`) : 'Easy walk · mobility'}</span></span></button>`).join('');
  };

  render();
})();
