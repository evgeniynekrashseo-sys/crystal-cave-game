import './v92-approved-ui.css';
import './v92-approved-ui';
import { Assets } from 'pixi.js';
import { APPROVED_TUBE } from './v91-approved-assets';

await Assets.load(APPROVED_TUBE);
await import('./main');

await import('./v99-economy-readiness');
await import('./v101-mobile-focus');
await import('./v103-cosmetic-ownership');
await import('./v104-unlock-celebration');
await import('./v110-scene');
await import('./v111-lab-art');

const settingsTitle=document.querySelector<HTMLElement>('#settingsPanel h2');
if(settingsTitle)settingsTitle.textContent='ChemLab V111';
const settingsCopy=document.querySelector<HTMLElement>('#settingsPanel p');
if(settingsCopy)settingsCopy.textContent='Full illustrated laboratory scene · illuminated apparatus wall · approved tube asset lock · certified solvable puzzles · premium game presentation · production integrity gates';
