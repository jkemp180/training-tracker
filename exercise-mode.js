(() => {
  const rests = {
    'Bench press':'2-3 min','Back squat':'3 min','Romanian deadlift':'2-3 min','Barbell row':'2 min','Shoulder press':'2 min','Pull-ups':'2 min','Incline dumbbell press':'90 sec','Lat pulldown':'90 sec','Bulgarian split squat':'90 sec','Leg curl':'60-90 sec','Calf raise':'60 sec','Lateral raise':'60 sec','Triceps pressdown':'60 sec','Face pull':'60 sec','Hanging knee raise':'45-60 sec'
  };
  const dialog=document.getElementById('workoutDialog');
  function enhance(){
    const title=dialog.querySelector('.player-title h2');
    const sets=dialog.querySelector('.player-sets');
    const next=dialog.querySelector('#nextExercise');
    if(!title||!sets||!next||dialog.querySelector('.exercise-complete'))return;
    const exercise=title.textContent.trim();
    const note=document.createElement('div');
    note.className='rest-guidance';
    note.innerHTML=`<span>Rest between sets</span><strong>${rests[exercise]||'60-90 sec'}</strong><small>You do not need to use the phone between sets.</small>`;
    sets.insertAdjacentElement('beforebegin',note);
    const complete=document.createElement('button');
    complete.type='button';
    complete.className='primary exercise-complete';
    complete.textContent=next.textContent==='Finish workout'?'Complete exercise and finish':'Complete exercise';
    complete.onclick=()=>{
      dialog.querySelectorAll('.player-set:not(.completed)').forEach(button=>button.click());
      setTimeout(()=>dialog.querySelector('#nextExercise')?.click(),50);
    };
    next.classList.add('secondary-action');
    next.textContent=next.textContent==='Finish workout'?'Finish with current set status':'Continue with current set status';
    next.insertAdjacentElement('beforebegin',complete);
    const help=document.createElement('p');
    help.className='muted compact-help';
    help.textContent='Only tap individual sets when something was missed or changed.';
    complete.insertAdjacentElement('afterend',help);
  }
  new MutationObserver(enhance).observe(dialog,{childList:true,subtree:true});
})();
