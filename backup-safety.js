(() => {
  const META_KEY = 'hybrid-training-backup-meta-v1';
  const ALLOWED = ['startDate','weight','theme','logs','prescriptions','history','runLevels'];

  function meta(){try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')}catch{return {}}}
  function completed(){return Object.values(state.logs||{}).filter(x=>x?.completed).length}
  function backupPayload(){const data={};ALLOWED.forEach(k=>{if(state[k]!==undefined)data[k]=state[k]});return {format:'hybrid-training-backup',version:2,createdAt:new Date().toISOString(),data}}
  function validObject(value){return value && typeof value==='object' && !Array.isArray(value)}
  function validate(payload){if(!validObject(payload)||payload.format!=='hybrid-training-backup'||!validObject(payload.data))throw new Error('Not a Hybrid Training backup.');const d=payload.data;if(typeof d.startDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d.startDate))throw new Error('Backup start date is invalid.');if(typeof d.weight!=='number'||!Number.isFinite(d.weight))throw new Error('Backup body weight is invalid.');if(typeof d.theme!=='string')throw new Error('Backup theme is invalid.');['logs','prescriptions','history'].forEach(k=>{if(!validObject(d[k]))throw new Error(`Backup ${k} is invalid.`)});if(d.runLevels!==undefined&&!validObject(d.runLevels))throw new Error('Backup running progression is invalid.');return d}
  function markBackedUp(payload){localStorage.setItem(META_KEY,JSON.stringify({lastBackupAt:payload.createdAt,completedAtBackup:completed()}));setTimeout(()=>render('settings'),100)}
  async function downloadBackup(){
    const payload=backupPayload();
    const name=`hybrid-training-backup-${payload.createdAt.slice(0,10)}.json`;
    const file=new File([JSON.stringify(payload,null,2)],name,{type:'application/json'});
    try{
      if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
        await navigator.share({title:'Hybrid Training backup',text:'Save this training backup to iCloud Drive or another safe location.',files:[file]});
        markBackedUp(payload);
        return;
      }
      const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);markBackedUp(payload);
      alert('Backup created. Check Files/Downloads and move it to iCloud Drive if needed.');
    }catch(err){
      if(err?.name==='AbortError')return;
      alert('Could not open the backup share sheet. Try opening the site in Safari and tap Back up my data again.');
    }
  }
  function backupCard(){const m=meta(),since=Math.max(0,completed()-(m.completedAtBackup||0));return `<section class="card stack backup-card"><div><p class="eyebrow">YOUR TRAINING DATA</p><h3>Backup</h3><p class="muted">Your Home Screen app stores its training history on this iPhone. Tap below, then choose Save to Files and keep the JSON file in iCloud Drive.</p></div><div class="grid-2"><div class="metric"><span class="muted">Last backup</span><strong>${m.lastBackupAt?new Date(m.lastBackupAt).toLocaleDateString():'Never'}</strong></div><div class="metric"><span class="muted">New workouts</span><strong>${since}</strong></div></div>${since>=3||!m.lastBackupAt?`<div class="notice">${!m.lastBackupAt?'Create your first backup now.':`You have ${since} completed workouts since your last backup.`}</div>`:''}<button class="primary" id="safeExportBtn">Back up my data</button><button class="secondary" id="safeImportBtn">Restore from backup</button><p class="muted compact-help">After tapping backup: choose Save to Files → iCloud Drive. Backup includes workout logs, actual sets, strength progression, running levels, weight, start date and settings.</p></section>`}
  const oldSettings=settingsView;settingsView=()=>backupCard()+oldSettings().replace('<button class="secondary" id="exportBtn">Export backup</button>','').replace('<button class="secondary" id="importBtn">Import backup</button>','');
  const oldBind=bind;bind=function(view){oldBind(view);if(view==='settings'){safeExportBtn.onclick=downloadBackup;safeImportBtn.onclick=()=>importInput.click()}};
  exportData=downloadBackup;
  importInput.onchange=e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const data=validate(JSON.parse(r.result));const count=Object.values(data.logs||{}).filter(x=>x?.completed).length;if(!confirm(`Restore this backup?\n\nIt contains ${count} completed workouts.\n\nYour current app data will be replaced.`))return;ALLOWED.forEach(k=>delete state[k]);Object.assign(state,data);save();localStorage.setItem(META_KEY,JSON.stringify({lastBackupAt:new Date().toISOString(),completedAtBackup:count}));location.reload()}catch(err){alert(`Could not restore backup: ${err.message}`)}finally{e.target.value=''}};r.readAsText(file)};
  window.trainingBackupStatus=()=>({lastBackupAt:meta().lastBackupAt||null,newWorkouts:Math.max(0,completed()-(meta().completedAtBackup||0))});
})();
