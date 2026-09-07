import backgroundLab from './v92-assets/background-lab';
import logo from './v92-assets/logo';
import goal from './v92-assets/goal';
import progress from './v92-assets/progress';
import synthesis from './v92-assets/synthesis';
import undo from './v92-assets/undo';
import restart from './v92-assets/restart';
import hint from './v92-assets/hint';
import iconSettings from './v92-assets/icon-settings';
import iconLab from './v92-assets/icon-lab';

const assets={
  '--v92-background':backgroundLab,
  '--v92-logo':logo,
  '--v92-goal':goal,
  '--v92-progress':progress,
  '--v92-synthesis':synthesis,
  '--v92-undo':undo,
  '--v92-restart':restart,
  '--v92-hint':hint,
  '--v92-settings':iconSettings,
  '--v92-lab-icon':iconLab,
} as const;

for(const [name,url] of Object.entries(assets)){
  document.documentElement.style.setProperty(name,`url("${url}")`);
  const img=new Image();img.decoding='async';img.src=url;
}
