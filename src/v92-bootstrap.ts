import './v92-approved-ui.css';
import './v92-approved-ui';
import { Assets } from 'pixi.js';
import { APPROVED_TUBE } from './v91-approved-assets';

await Assets.load(APPROVED_TUBE);
await import('./main');

// V108 production runtime wiring: V103 owns both preview + equip behavior.
// Do not boot V102 interaction JS separately, otherwise the same cosmetic
// cards receive duplicate controls/listeners and conflicting persistence.
await import('./v99-economy-readiness');
await import('./v101-mobile-focus');
await import('./v103-cosmetic-ownership');
await import('./v104-unlock-celebration');

const settingsTitle=document.querySelector<HTMLElement>('#settingsPanel h2');
if(settingsTitle)settingsTitle.textContent='ChemLab V108';
const settingsCopy=document.querySelector<HTMLElement>('#settingsPanel p');
if(settingsCopy)settingsCopy.textContent='Approved asset lock · certified solvable puzzles · mobile game-focus hierarchy · consolidated cosmetic preview, ownership and unlock celebration · premium victory payoff · production runtime integrity · release preflight and artifact smoke';
