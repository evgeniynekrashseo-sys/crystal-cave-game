import './v111-lab-art.css';

const shell=document.querySelector<HTMLElement>('.board-shell');
if(shell&&!shell.querySelector('.v111-art')){
  const art=document.createElement('div');
  art.className='v111-art';
  art.setAttribute('aria-hidden','true');
  art.innerHTML=`<svg viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice" role="presentation">
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2030"/><stop offset="0.58" stop-color="#07131e"/><stop offset="1" stop-color="#02070c"/></linearGradient>
    <linearGradient id="bench" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17354a"/><stop offset="0.12" stop-color="#0a1c29"/><stop offset="1" stop-color="#02070c"/></linearGradient>
    <radialGradient id="reactor"><stop offset="0" stop-color="#d9fbff" stop-opacity=".98"/><stop offset=".16" stop-color="#60e7ff" stop-opacity=".9"/><stop offset=".42" stop-color="#1988ff" stop-opacity=".32"/><stop offset="1" stop-color="#1988ff" stop-opacity="0"/></radialGradient>
    <radialGradient id="violet"><stop offset="0" stop-color="#dca7ff" stop-opacity=".82"/><stop offset=".35" stop-color="#9e50ff" stop-opacity=".34"/><stop offset="1" stop-color="#9e50ff" stop-opacity="0"/></radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="soft"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <rect width="900" height="520" fill="url(#wall)"/>
  <g opacity=".6" stroke="#4cb8e8" stroke-opacity=".18" fill="none">
    <path d="M40 0v380M155 0v380M745 0v380M860 0v380"/>
    <path d="M0 95h900M0 305h900"/>
  </g>
  <g opacity=".95">
    <path d="M18 78h150v154H18z" fill="#06111a" stroke="#2e789b" stroke-opacity=".35"/>
    <path d="M732 78h150v154H732z" fill="#06111a" stroke="#2e789b" stroke-opacity=".35"/>
    <circle cx="93" cy="154" r="46" fill="none" stroke="#40dfff" stroke-opacity=".35" stroke-width="5"/>
    <circle cx="807" cy="154" r="46" fill="none" stroke="#9f5fff" stroke-opacity=".35" stroke-width="5"/>
    <path d="M42 204h102M756 204h102" stroke="#74dfff" stroke-opacity=".25" stroke-width="3"/>
  </g>
  <g stroke-linecap="round" fill="none">
    <path d="M0 42h215q22 0 22 22v62" stroke="#19384a" stroke-width="18"/>
    <path d="M900 42H685q-22 0-22 22v62" stroke="#19384a" stroke-width="18"/>
    <path d="M0 42h215q22 0 22 22v62" stroke="#5adfff" stroke-opacity=".18" stroke-width="3"/>
    <path d="M900 42H685q-22 0-22 22v62" stroke="#bb76ff" stroke-opacity=".16" stroke-width="3"/>
  </g>
  <g opacity=".92">
    <ellipse cx="450" cy="155" rx="235" ry="120" fill="url(#reactor)" filter="url(#blur)"/>
    <ellipse cx="450" cy="162" rx="95" ry="72" fill="#07131d" stroke="#53dfff" stroke-opacity=".55" stroke-width="3"/>
    <ellipse cx="450" cy="162" rx="58" ry="45" fill="url(#reactor)"/>
    <circle cx="450" cy="162" r="18" fill="#e7fdff" opacity=".9"/>
    <g stroke="#76eaff" stroke-opacity=".28" fill="none">
      <ellipse cx="450" cy="162" rx="125" ry="92"/>
      <ellipse cx="450" cy="162" rx="154" ry="108"/>
    </g>
  </g>
  <g opacity=".9">
    <ellipse cx="185" cy="280" rx="95" ry="92" fill="url(#violet)" filter="url(#blur)"/>
    <ellipse cx="715" cy="280" rx="95" ry="92" fill="url(#reactor)" filter="url(#blur)"/>
  </g>
  <g fill="#0a1823" stroke="#66dfff" stroke-opacity=".24">
    <rect x="72" y="257" width="135" height="82" rx="12"/>
    <rect x="693" y="257" width="135" height="82" rx="12"/>
  </g>
  <g fill="#56e6ff" opacity=".78">
    <circle cx="95" cy="279" r="4"/><circle cx="111" cy="279" r="4"/><circle cx="127" cy="279" r="4"/>
    <rect x="95" y="299" width="82" height="5" rx="2.5" opacity=".35"/><rect x="95" y="312" width="54" height="5" rx="2.5" opacity=".22"/>
  </g>
  <g fill="#b276ff" opacity=".72">
    <circle cx="716" cy="279" r="4"/><circle cx="732" cy="279" r="4"/><circle cx="748" cy="279" r="4"/>
    <rect x="716" y="299" width="82" height="5" rx="2.5" opacity=".35"/><rect x="716" y="312" width="54" height="5" rx="2.5" opacity=".22"/>
  </g>
  <path d="M40 382h820l-38 138H78z" fill="url(#bench)" stroke="#75dfff" stroke-opacity=".22"/>
  <path d="M58 394h784" stroke="#8aeaff" stroke-opacity=".34" stroke-width="2"/>
  <ellipse cx="450" cy="408" rx="290" ry="38" fill="#4fdfff" opacity=".07" filter="url(#soft)"/>
  <g opacity=".34" stroke="#64dfff"><path d="M110 420h125M665 420h125"/><path d="M140 438h85M675 438h85"/></g>
  </svg>`;
  shell.prepend(art);
}

document.documentElement.dataset.chemlabVisual='v111';
