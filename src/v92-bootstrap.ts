import './v92-approved-ui.css';
import './v92-approved-ui';
import { Assets } from 'pixi.js';
import { APPROVED_TUBE } from './v91-approved-assets';

await Assets.load(APPROVED_TUBE);
await import('./main');

// V110 production runtime wiring: bootstrap owns release-layer orchestration.
// V103 owns cosmetic preview + equip behavior; V104 owns unlock celebration.
await import('./v99-economy-readiness');
await import('./v101-mobile-focus');
await import('./v103-cosmetic-ownership');
await import('./v104-unlock-celebration');
await import('./v110-scene');

const settingsTitle=document.querySelector<HTMLElement>('#settingsPanel h2');
if(settingsTitle)settingsTitle.textContent='ChemLab V110';
const settingsCopy=document.querySelector<HTMLElement>('#settingsPanel p');
if(settingsCopy)settingsCopy.textContent='Cinematic laboratory scene rebuild · approved tube asset lock · deeper glass and liquid rendering · certified solvable puzzles · mobile game-focus hierarchy · explicit cosmetic ownership states · premium victory payoff · production integrity gates';
