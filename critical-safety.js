(() => {
  const DRAFT_KEY = 'hybrid-training-strength-drafts-v1';
  const dialog = document.getElementById('workoutDialog');
  let suppressDraftSave = false;

  function readDrafts() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeDrafts(drafts) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
  }

  function clearDraft(workoutId) {
    if (!workoutId) return;
    const drafts = readDrafts();
    if (!(workoutId in drafts)) return;
    delete drafts[workoutId];
    writeDrafts(drafts);
  }

  function persistDraft() {
    if (suppressDraftSave || !player?.w || player.w.type !== 'strength') return;
    if (state.logs[player.w.id]?.completed) {
      clearDraft(player.w.id);
      return;
    }
    const drafts = readDrafts();
    drafts[player.w.id] = {
      workoutId: player.w.id,
      planIndex: player.i,
      exerciseIndex: player.index,
      updatedAt: new Date().toISOString(),
      results: player.results
    };
    writeDrafts(drafts);
  }

  function restoreDraftObject(draft, workout) {
    if (!draft?.results || state.logs[workout.id]?.completed) return false;
    player.index = Math.max(0, Math.min(player.defs.length - 1, +draft.exerciseIndex || 0));
    player.defs.forEach(def => {
      const saved = draft.results[def.name]?.sets;
      if (!Array.isArray(saved) || !saved.length) return;
      player.results[def.name] = {
        sets: saved.map(set => ({
          weight: +set.weight || 0,
          reps: +set.reps || 0,
          done: !!set.done
        }))
      };
    });
    player.restoredDraft = true;
    return true;
  }

  function setText(sets) {
    return (sets || []).map(set => `${+set.weight ? `${+set.weight} kg` : 'Bodyweight'} × ${+set.reps || 0}`).join(' · ');
  }

  function openCompletedReview(workout, log) {
    clearDraft(workout.id);
    let details = '';
    if (workout.type === 'strength') {
      const defs = strength[workout.template] || [];
      details = `<ul class="workout-preview-list">${defs.map(def => {
        const sets = log.exercises?.[def.name]?.sets || [];
        return `<li class="workout-preview-row"><span><strong>${def.name}</strong><small>${sets.filter(set => set.done).length}/${sets.length || 0} sets completed</small></span><b>${sets.length ? setText(sets) : 'No recorded sets'}</b></li>`;
      }).join('')}</ul>`;
    } else if (workout.type === 'run') {
      const extras = workout.template === 'quality' ? `<li class="workout-preview-row"><span><strong>Intervals</strong></span><b>${+log.intervalsCompleted || 0}/${+log.intervalsTarget || 0}</b></li>` : '';
      details = `<ul class="workout-preview-list"><li class="workout-preview-row"><span><strong>Distance</strong></span><b>${(+log.distance || 0).toFixed(2)} km</b></li><li class="workout-preview-row"><span><strong>Time</strong></span><b>${+log.duration || 0} min</b></li>${extras}<li class="workout-preview-row"><span><strong>Effort</strong></span><b>${log.rpe ?? '-'} / 10</b></li><li class="workout-preview-row"><span><strong>Knee pain</strong></span><b>${log.knee ?? '-'} / 10</b></li>${log.avgHeartRate ? `<li class="workout-preview-row"><span><strong>Average HR</strong></span><b>${log.avgHeartRate} bpm</b></li>` : ''}</ul>`;
    } else {
      details = `<div class="notice">${+log.duration || workout.minutes} minutes completed.</div>`;
    }

    dialog.innerHTML = `<div class="sheet-content"><div class="between row"><div><p class="eyebrow">COMPLETED WORKOUT</p><h2>${workout.title}</h2></div><button class="icon-button" id="closeCompletedReview" aria-label="Close">×</button></div><div class="notice">This is a read-only record. Reviewing it cannot change your history or progression.</div>${details}<button class="secondary" id="closeCompletedReviewBottom">Close</button></div>`;
    document.getElementById('closeCompletedReview').onclick = () => dialog.close();
    document.getElementById('closeCompletedReviewBottom').onclick = () => dialog.close();
    if (!dialog.open) dialog.showModal();
  }

  const baseOpenWorkout = openWorkout;
  openWorkout = function safeOpenWorkout(index) {
    const workout = plan()[index];
    const existing = workout ? state.logs[workout.id] : null;
    if (workout && existing?.completed) return openCompletedReview(workout, existing);
    return baseOpenWorkout(index);
  };

  const baseRenderPlayer = renderPlayer;
  renderPlayer = function autosavingRenderPlayer() {
    persistDraft();
    baseRenderPlayer();
    if (player?.restoredDraft) {
      const content = dialog.querySelector('.sheet-content');
      if (content && !content.querySelector('.draft-restored-notice')) {
        const notice = document.createElement('div');
        notice.className = 'notice draft-restored-notice';
        notice.textContent = 'Saved workout restored. Your completed sets and adjustments were kept.';
        content.prepend(notice);
      }
      player.restoredDraft = false;
    }
  };

  const baseOpenStrengthPlayer = openStrengthPlayer;
  openStrengthPlayer = function draftAwareOpenStrengthPlayer(index, workout) {
    const savedDraft = readDrafts()[workout.id];
    suppressDraftSave = true;
    try {
      baseOpenStrengthPlayer(index, workout);
      restoreDraftObject(savedDraft, workout);
    } finally {
      suppressDraftSave = false;
    }
    if (player?.restoredDraft) renderPlayer();
    else persistDraft();
  };

  dialog.addEventListener('change', event => {
    if (event.target.matches('[data-weight],[data-reps]')) persistDraft();
  });
  dialog.addEventListener('close', persistDraft);

  const baseFinishStrength = finishStrength;
  finishStrength = function finishStrengthAndClearDraft() {
    const workoutId = player?.w?.id;
    baseFinishStrength();
    clearDraft(workoutId);
  };

  window.trainingDraftStatus = () => {
    const drafts = readDrafts();
    return Object.values(drafts).map(draft => ({workoutId:draft.workoutId, updatedAt:draft.updatedAt}));
  };
})();
