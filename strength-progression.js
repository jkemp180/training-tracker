(() => {
  const rules = {
    'Bench press': {mode:'fixed', increment:2.5},
    'Back squat': {mode:'fixed', increment:2.5},
    'Romanian deadlift': {mode:'fixed', increment:2.5},
    'Barbell row': {mode:'fixed', increment:2.5},
    'Shoulder press': {mode:'fixed', increment:2.5},
    'Incline dumbbell press': {mode:'range', increment:2.5, min:8, max:10},
    'Bulgarian split squat': {mode:'range', increment:2.5, min:8, max:10},
    'Lat pulldown': {mode:'range', increment:2.5, min:8, max:10},
    'Face pull': {mode:'range', increment:2.5, min:12, max:15},
    'Dumbbell curl': {mode:'range', increment:2.5, min:8, max:12},
    'Lateral raise': {mode:'range', increment:2.5, min:10, max:15},
    'Triceps pressdown': {mode:'range', increment:2.5, min:10, max:12},
    'Leg curl': {mode:'range', increment:2.5, min:10, max:12},
    'Calf raise': {mode:'range', increment:5, min:12, max:15}
  };

  const bodyweight = new Set(['Pull-ups','Hanging knee raise','Dead bug']);
  const roundTo = (value, increment) => Math.round(value / increment) * increment;

  // Clean up old invented dumbbell/machine prescriptions such as 13.5 or 29.5 kg.
  Object.entries(state.prescriptions || {}).forEach(([name, sets]) => {
    const rule = rules[name];
    if (!rule || rule.mode !== 'range' || !Array.isArray(sets)) return;
    sets.forEach(set => {
      if (set.weight) set.weight = roundTo(set.weight, rule.increment);
    });
  });
  save();

  function targetWasCompleted(actualSets, targetSets) {
    if (!Array.isArray(actualSets) || !Array.isArray(targetSets) || actualSets.length !== targetSets.length) return false;
    return actualSets.every((actual, index) => {
      const target = targetSets[index];
      return actual.done && (+actual.weight || 0) >= (+target.weight || 0) && (+actual.reps || 0) >= (+target.reps || 0);
    });
  }

  function nextPrescription(name, actualSets, targetSets) {
    if (bodyweight.has(name)) return actualSets.map(set => ({weight:set.weight,reps:set.reps}));
    const rule = rules[name];
    const success = targetWasCompleted(actualSets, targetSets);
    if (!rule || !success) return targetSets.map(set => ({weight:set.weight,reps:set.reps}));

    if (rule.mode === 'fixed') {
      return targetSets.map(set => ({weight:set.weight ? roundTo(+set.weight + rule.increment, rule.increment) : set.weight,reps:set.reps}));
    }

    const reachedTop = actualSets.every(set => (+set.reps || 0) >= rule.max);
    if (reachedTop) {
      return actualSets.map(set => ({weight:set.weight ? roundTo(+set.weight + rule.increment, rule.increment) : set.weight,reps:rule.min}));
    }

    // Same load, add one rep per set until the top of the range is reached.
    return actualSets.map(set => ({weight:roundTo(+set.weight || 0, rule.increment),reps:Math.min(rule.max, Math.max(rule.min, (+set.reps || rule.min) + 1))}));
  }

  finishStrength = function progressionAwareFinishStrength() {
    const log={id:player.w.id,type:'strength',completed:true,date:new Date().toISOString(),exercises:{}};
    player.defs.forEach(def => {
      const result = player.results[def.name];
      const target = prescription(def).map(set => ({weight:+set.weight || 0,reps:+set.reps || 0}));
      const actual = result.sets.map(set => ({weight:+set.weight || 0,reps:+set.reps || 0,done:!!set.done}));
      const success = targetWasCompleted(actual, target);
      const next = nextPrescription(def.name, actual, target);
      log.exercises[def.name] = {sets:actual,target,success,nextPrescription:next};
      state.history[def.name] = [...(state.history[def.name]||[]),{date:new Date().toISOString(),success,sets:actual.map(({weight,reps})=>({weight,reps})),target}];
      state.prescriptions[def.name] = next;
    });
    state.logs[player.w.id]=log;
    save();
    workoutDialog.close();
    render('today');
  };

  window.strengthProgressionRules = rules;
})();
