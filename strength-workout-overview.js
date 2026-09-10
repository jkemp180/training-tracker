(() => {
  const baseRenderPlayer = renderPlayer;

  function setSummary(set) {
    return `${set.weight ? `${set.weight} kg` : 'BW'} × ${set.reps}`;
  }

  renderPlayer = function renderPlayerWithFullWorkout() {
    baseRenderPlayer();

    if (!player) return;
    const dialog = document.getElementById('workoutDialog');
    const picker = dialog.querySelector('.exercise-picker');
    const title = dialog.querySelector('.player-title');
    if (!picker || !title) return;

    const completed = player.defs.filter(def => player.results[def.name].sets.every(set => set.done)).length;
    const eyebrow = picker.querySelector('.eyebrow');
    if (eyebrow) eyebrow.textContent = `FULL WORKOUT · ${completed}/${player.defs.length} COMPLETE`;

    picker.querySelectorAll('[data-exercise-index]').forEach(button => {
      const index = +button.dataset.exerciseIndex;
      const def = player.defs[index];
      const result = player.results[def.name];
      const finished = result.sets.every(set => set.done);
      const isCurrent = index === player.index;

      button.innerHTML = `<span style="display:block;text-align:left"><strong>${finished ? '✓ ' : ''}${def.name}</strong><small class="muted" style="display:block;margin-top:4px">${result.sets.map(setSummary).join(' · ')}</small>${isCurrent ? '<small style="display:block;margin-top:3px">Current exercise</small>' : ''}</span>`;
      button.setAttribute('aria-label', `${def.name}, ${result.sets.length} sets${finished ? ', completed' : ''}`);
    });

    const intro = document.createElement('p');
    intro.className = 'muted compact-help full-workout-help';
    intro.textContent = 'This is the whole training session. Tap any exercise to work in whatever order the gym allows.';
    picker.querySelector('.eyebrow')?.insertAdjacentElement('afterend', intro);

    // Keep the entire workout visible before the active exercise instead of hiding it below the set editor.
    title.insertAdjacentElement('beforebegin', picker);
  };
})();
