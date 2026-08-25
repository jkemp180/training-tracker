(() => {
  const dialog=document.getElementById('workoutDialog');

  function enhance(){
    const sets=dialog.querySelector('.player-sets');
    const next=dialog.querySelector('#nextExercise');
    const finish=dialog.querySelector('#finishWorkout');
    if(!sets||!next||dialog.querySelector('.exercise-complete'))return;

    const currentSets=[...dialog.querySelectorAll('.player-set')];
    const currentComplete=currentSets.length>0&&currentSets.every(button=>button.classList.contains('completed'));
    const exerciseButtons=[...dialog.querySelectorAll('[data-exercise-index]')];
    const unfinishedExercises=exerciseButtons.filter(button=>!button.textContent.trim().startsWith('✓'));
    const isFinalExercise=unfinishedExercises.length===1&&unfinishedExercises[0].classList.contains('active');

    const complete=document.createElement('button');
    complete.type='button';
    complete.className='primary exercise-complete';
    complete.textContent=isFinalExercise?'Complete workout':'Complete exercise';

    complete.onclick=()=>{
      const incomplete=[...dialog.querySelectorAll('.player-set:not(.completed)')];
      incomplete.forEach(button=>button.click());
      setTimeout(()=>{
        if(isFinalExercise){
          dialog.querySelector('#finishWorkout')?.click();
        }else{
          dialog.querySelector('#nextExercise')?.click();
        }
      },50);
    };

    next.classList.add('secondary-action');
    next.textContent='Choose another exercise';
    next.insertAdjacentElement('beforebegin',complete);

    const help=document.createElement('p');
    help.className='muted compact-help';
    help.textContent=isFinalExercise
      ? 'This is your last unfinished exercise. Complete workout saves the full training session.'
      : 'Complete exercise marks the remaining sets as done and moves to another unfinished exercise.';
    complete.insertAdjacentElement('afterend',help);

    if(finish){
      finish.textContent='Finish workout early';
      finish.classList.add('secondary-action');
    }
  }

  new MutationObserver(enhance).observe(dialog,{childList:true,subtree:true});
})();
