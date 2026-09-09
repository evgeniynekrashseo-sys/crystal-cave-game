import './v110-visual-rebuild.css';

const shell=document.querySelector<HTMLElement>('.board-shell');
if(shell&&!shell.querySelector('.v110-bench')){
  const lamp=document.createElement('div');
  lamp.className='v110-lamp';
  lamp.setAttribute('aria-hidden','true');
  const bench=document.createElement('div');
  bench.className='v110-bench';
  bench.setAttribute('aria-hidden','true');
  shell.prepend(lamp,bench);
}

document.documentElement.dataset.chemlabVisual='v110';
