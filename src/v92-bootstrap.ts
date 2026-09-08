import './v92-approved-ui.css';
import './v92-approved-ui';
import { Assets } from 'pixi.js';
import { APPROVED_TUBE } from './v91-approved-assets';

await Assets.load(APPROVED_TUBE);
await import('./main');

// V107 production runtime wiring: keep post-V98 layers sequential so each
// progressive enhancement sees the DOM/state created by the previous layer.
await import('./v99-economy-readiness');
await import('./v101-mobile-focus');
await import('./v102-cosmetic-equip-preview');
await import('./v103-cosmetic-ownership');
await import('./v104-unlock-celebration');

const settingsTitle=document.querySelector<HTMLElement>('#settingsPanel h2');
if(settingsTitle)settingsTitle.textContent='ChemLab V107';
const settingsCopy=document.querySelector<HTMLElement>('#settingsPanel p');
if(settingsCopy)settingsCopy.textContent='Approved asset lock · certified solvable puzzles · mobile game-focus hierarchy · cosmetic economy, preview, ownership and unlock celebration · premium victory payoff · production runtime wiring · release integrity preflight and artifact smoke';
