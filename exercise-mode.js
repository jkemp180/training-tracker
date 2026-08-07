(() => {
  const dialog=document.getElementById('workoutDialog');
  function enhance(){
    const sets=dialog.querySelector('.player-sets');
    const next=dialog.querySelector('#nextExercise');
    if(!sets||!next||dialog.querySelector('.exercise-complete'))return;
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
    help.textContent='Tap Complete exercise if everything went as planned. Only edit individual sets when something changed.';
    complete.insertAdjacentElement('afterend',help);
  }
  new MutationObserver(enhance).observe(dialog,{childList:true,subtree:true});
})();
