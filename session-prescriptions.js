(() => {
  const qualityByWeek = [
    {warmup:10, rounds:4, work:3, recovery:2, cooldown:5, pace:'6:20-6:40/km', effort:'7/10 controlled'},
    {warmup:10, rounds:4, work:3, recovery:2, cooldown:8, pace:'6:15-6:35/km', effort:'7/10 controlled'},
    {warmup:10, rounds:5, work:3, recovery:2, cooldown:5, pace:'6:15-6:30/km', effort:'7/10 controlled'},
    {warmup:10, rounds:4, work:3, recovery:2, cooldown:5, pace:'6:20-6:40/km', effort:'6-7/10 deload'},
    {warmup:10, rounds:4, work:4, recovery:2, cooldown:8, pace:'6:10-6:30/km', effort:'7/10 controlled'},
    {warmup:10, rounds:5, work:4, recovery:2, cooldown:5, pace:'6:10-6:25/km', effort:'7-8/10'},
    {warmup:10, rounds:4, work:3, recovery:2, cooldown:8, pace:'6:15-6:35/km', effort:'6-7/10 deload'},
    {warmup:10, rounds:4, work:5, recovery:2, cooldown:7, pace:'6:05-6:25/km', effort:'7-8/10'},
    {warmup:10, rounds:5, work:5, recovery:2, cooldown:8, pace:'6:05-6:20/km', effort:'7-8/10'},
    {warmup:10, rounds:4, work:4, recovery:2, cooldown:8, pace:'6:10-6:30/km', effort:'6-7/10 deload'},
    {warmup:10, rounds:4, work:6, recovery:2, cooldown:8, pace:'6:00-6:20/km', effort:'7-8/10'},
    {warmup:10, rounds:3, work:6, recovery:2, cooldown:7, pace:'6:00-6:15/km', effort:'controlled, do not race'}
  ];

  const easyPaceByWeek = [
    '7:20-7:50/km','7:15-7:45/km','7:15-7:40/km','7:20-7:50/km',
    '7:10-7:40/km','7:10-7:35/km','7:15-7:45/km','7:05-7:35/km',
    '7:00-7:30/km','7:10-7:40/km','6:55-7:25/km','7:00-7:30/km'
  ];

  const longPaceByWeek = [
    '7:25-7:55/km','7:20-7:50/km','7:20-7:50/km','7:25-7:55/km',
    '7:15-7:45/km','7:15-7:45/km','7:20-7:50/km','7:10-7:40/km',
    '7:05-7:35/km','7:15-7:45/km','7:00-7:30/km','7:05-7:35/km'
  ];

  const restByExercise = {
    'Bench press':'2:30-3:00','Incline dumbbell press':'1:30','Shoulder press':'2:00','Lateral raise':'1:00','Triceps pressdown':'1:00',
    'Pull-ups':'2:00','Barbell row':'2:00','Lat pulldown':'1:30','Face pull':'1:00','Dumbbell curl':'1:15','Hanging knee raise':'1:00','Dead bug':'1:00',
    'Back squat':'3:00','Romanian deadlift':'2:30','Bulgarian split squat':'1:30','Leg curl':'1:15','Calf raise':'1:00'
  };

  function strengthDetails(workout) {
    const defs = strength[workout.template] || [];
    return `<div class="session-detail-block"><p class="eyebrow">EXACT PLAN</p><p class="muted">Use the prescribed weights shown below. Leave about 1-2 reps in reserve on early sets. Complete all sets cleanly before progressing next time.</p><ul class="workout-preview-list">${defs.map(def => {
      const sets = prescription(def);
      return `<li class="workout-preview-row"><span><strong>${def.name}</strong><small>Rest ${restByExercise[def.name] || '1:30'}</small></span><b>${sets.map(s => `${s.weight ? `${s.weight} kg` : 'Bodyweight'} × ${s.reps}`).join(' · ')}</b></li>`;
    }).join('')}</ul><div class="notice">If a prescribed weight feels clearly too heavy today, reduce it and record the actual value. Progress only comes from completed sets.</div></div>`;
  }

  function qualityDetails(workout) {
    const q = qualityByWeek[Math.max(0, workout.week - 1)];
    return `<div class="session-detail-block"><p class="eyebrow">EXACT RUN</p><ul class="workout-preview-list"><li class="workout-preview-row"><span><strong>Warm-up</strong><small>Relaxed</small></span><b>${q.warmup} min easy · ${easyPaceByWeek[workout.week - 1]}</b></li><li class="workout-preview-row"><span><strong>${q.rounds} rounds</strong><small>Work + recovery</small></span><b>${q.work} min faster at ${q.pace} · ${q.recovery} min very easy</b></li><li class="workout-preview-row"><span><strong>Cool-down</strong><small>Relaxed</small></span><b>${q.cooldown} min easy</b></li></ul><div class="notice">Fast sections: ${q.effort}. Do not sprint. If pace is hard to monitor, run by effort and let the Apple Watch intervals guide the timing.</div><p class="muted"><strong>Apple Watch:</strong> ${q.warmup} min warm-up → ${q.rounds} × (${q.work} min work / ${q.recovery} min recovery) → ${q.cooldown} min cool-down</p></div>`;
  }

  function steadyDetails(workout) {
    const pace = easyPaceByWeek[workout.week - 1];
    return `<div class="session-detail-block"><p class="eyebrow">EXACT RUN</p><ul class="workout-preview-list"><li class="workout-preview-row"><span><strong>Steady run</strong><small>Conversational effort</small></span><b>${workout.distance} km at roughly ${pace}</b></li></ul><div class="notice">Keep the whole run controlled. You should be able to speak in full sentences. Do not turn this into a tempo run.</div></div>`;
  }

  function longDetails(workout) {
    const pace = longPaceByWeek[workout.week - 1];
    return `<div class="session-detail-block"><p class="eyebrow">EXACT RUN</p><ul class="workout-preview-list"><li class="workout-preview-row"><span><strong>Long run</strong><small>Easy endurance</small></span><b>${workout.distance} km at roughly ${pace}</b></li></ul><div class="notice">Start slower than you think you need to. The goal is time on feet and aerobic endurance, not speed. Walk briefly if needed rather than forcing pace.</div></div>`;
  }

  function recoveryDetails() {
    return `<div class="session-detail-block"><p class="eyebrow">EXACT RECOVERY</p><ul class="workout-preview-list"><li class="workout-preview-row"><span><strong>Easy walk</strong><small>Very light</small></span><b>20-30 min</b></li><li class="workout-preview-row"><span><strong>Mobility</strong><small>10-15 min</small></span><b>Calves · ankles · quads · hip flexors · glutes · upper back</b></li><li class="workout-preview-row"><span><strong>Knee prep</strong><small>Gentle</small></span><b>Bodyweight squats · calf raises · controlled leg swings</b></li></ul></div>`;
  }

  function sessionDetails(workout) {
    if (workout.type === 'strength') return strengthDetails(workout);
    if (workout.template === 'quality') return qualityDetails(workout);
    if (workout.template === 'steady') return steadyDetails(workout);
    if (workout.template === 'long') return longDetails(workout);
    return recoveryDetails();
  }

  window.sessionDetails = sessionDetails;

  const originalWorkoutPreview = window.workoutPreview;
  const originalOpenWorkout = window.openWorkout;

  const observer = new MutationObserver(() => {
    const dialog = document.getElementById('workoutDialog');
    if (!dialog?.open || dialog.querySelector('.session-instructions')) return;
    const title = dialog.querySelector('h2')?.textContent?.trim();
    if (!title) return;
    const workout = plan().find(w => w.title === title);
    if (!workout) return;
    const wrapper = document.createElement('section');
    wrapper.className = 'session-instructions';
    wrapper.innerHTML = sessionDetails(workout);
    const content = dialog.querySelector('.sheet-content');
    const anchor = content?.querySelector('.grid-2,.notice,.player-title');
    if (content && anchor) anchor.insertAdjacentElement('beforebegin', wrapper);
  });
  observer.observe(document.getElementById('workoutDialog'), {childList:true, subtree:true});
})();
