// ChemLab laboratory-only UI localization.
// Dynamic chemistry lessons and mission descriptions require separate editorial localization.
(() => {
  const BASE = [
    'ЛАБОРАТОРІЯ ВІДКРИТТІВ','Експеримент','Цілі та винагороди','зібрано','ходів',
    'Торкнись колби, потім обери, куди перелити','Назад','Підказка','+ Колба','Заново',
    'Реактор','Квести','Модулі','Елементи','МАЙСТЕРНІСТЬ','Закрити',
    'Налаштування','Баланс монет','Збери по 4 однакові елементи у колбах',
    'Обладнання лабораторії','Покращуй дослідницькі модулі за зароблені монети.',
    'Артефакти →','Оформлення','Невідомий елемент','Відкрити елемент',
    'Карта відкриттів','Сьогодні у лабораторії','Продовжити експеримент →'
  ];
  // One-to-one strings aligned with BASE. Language variants are selected from OS locale or Settings.
  const TEXT = {
    en: 'LABORATORY OF DISCOVERIES|Experiment|Goals and rewards|collected|moves|Tap a tube, then choose where to pour|Back|Hint|+ Tube|Restart|Reactor|Quests|Upgrades|Elements|MASTERY|Close|Settings|Coin balance|Collect 4 matching elements in each tube|Laboratory equipment|Upgrade your research modules using earned coins.|Artifacts →|Themes|Unknown element|Discover element|Discovery map|Today in the lab|Continue experiment →',
    es: 'LABORATORIO DE DESCUBRIMIENTOS|Experimento|Objetivos y recompensas|reunidos|movimientos|Toca un tubo y elige dónde verter|Volver|Pista|+ Tubo|Reiniciar|Reactor|Misiones|Mejoras|Elementos|MAESTRÍA|Cerrar|Ajustes|Saldo de monedas|Reúne 4 elementos iguales en cada tubo|Equipo de laboratorio|Mejora tus módulos de investigación con las monedas ganadas.|Artefactos →|Temas|Elemento desconocido|Descubrir elemento|Mapa de descubrimientos|Hoy en el laboratorio|Continuar experimento →',
    'pt-BR': 'LABORATÓRIO DE DESCOBERTAS|Experimento|Objetivos e recompensas|coletados|movimentos|Toque em um tubo e escolha onde despejar|Voltar|Dica|+ Tubo|Reiniciar|Reator|Missões|Melhorias|Elementos|MAESTRIA|Fechar|Configurações|Saldo de moedas|Junte 4 elementos iguais em cada tubo|Equipamentos de laboratório|Melhore os módulos de pesquisa com as moedas conquistadas.|Artefatos →|Temas|Elemento desconhecido|Descobrir elemento|Mapa de descobertas|Hoje no laboratório|Continuar experimento →',
    hi: 'खोजों की प्रयोगशाला|प्रयोग|लक्ष्य और पुरस्कार|इकट्ठा|चालें|एक ट्यूब छुएँ, फिर चुनें कहाँ डालना है|वापस|संकेत|+ ट्यूब|फिर शुरू करें|रिएक्टर|मिशन|अपग्रेड|तत्व|महारत|बंद करें|सेटिंग्स|सिक्कों की शेष राशि|हर ट्यूब में 4 एक जैसे तत्व इकट्ठा करें|प्रयोगशाला उपकरण|कमाए हुए सिक्कों से शोध मॉड्यूल अपग्रेड करें।|कलाकृतियाँ →|थीम|अज्ञात तत्व|तत्व खोजें|खोज मानचित्र|आज प्रयोगशाला में|प्रयोग जारी रखें →',
    id: 'LABORATORIUM PENEMUAN|Eksperimen|Tujuan dan hadiah|terkumpul|langkah|Ketuk tabung, lalu pilih tempat menuang|Kembali|Petunjuk|+ Tabung|Ulangi|Reaktor|Misi|Peningkatan|Unsur|PENGUASAAN|Tutup|Pengaturan|Saldo koin|Kumpulkan 4 unsur yang sama di setiap tabung|Peralatan laboratorium|Tingkatkan modul riset dengan koin yang diperoleh.|Artefak →|Tema|Unsur tidak dikenal|Temukan unsur|Peta penemuan|Hari ini di laboratorium|Lanjutkan eksperimen →',
    tr: 'KEŞİF LABORATUVARI|Deney|Hedefler ve ödüller|toplandı|hamle|Bir tüpe dokun, sonra nereye dökeceğini seç|Geri|İpucu|+ Tüp|Yeniden başlat|Reaktör|Görevler|Yükseltmeler|Elementler|USTALIK|Kapat|Ayarlar|Jeton bakiyesi|Her tüpte 4 aynı elementi topla|Laboratuvar ekipmanı|Kazandığın jetonlarla araştırma modüllerini geliştir.|Eserler →|Temalar|Bilinmeyen element|Element keşfet|Keşif haritası|Bugün laboratuvarda|Deneye devam et →',
    ja: '発見のラボ|実験|目標と報酬|収集済み|手数|試験管をタップして注ぐ先を選択|戻る|ヒント|+ 試験管|やり直す|リアクター|クエスト|アップグレード|元素|マスタリー|閉じる|設定|コイン残高|各試験管に同じ元素を4つ集めよう|研究設備|獲得したコインで研究モジュールを強化しよう。|アーティファクト →|テーマ|未知の元素|元素を発見|発見マップ|今日の研究室|実験を続ける →',
    ko: '발견의 연구소|실험|목표와 보상|수집|이동|시험관을 누른 뒤 옮길 곳을 선택하세요|뒤로|힌트|+ 시험관|다시 시작|반응기|퀘스트|업그레이드|원소|숙련도|닫기|설정|코인 잔액|각 시험관에 같은 원소 4개를 모으세요|연구실 장비|획득한 코인으로 연구 모듈을 업그레이드하세요.|유물 →|테마|알 수 없는 원소|원소 발견|발견 지도|오늘의 연구실|실험 계속하기 →',
    de: 'LABOR DER ENTDECKUNGEN|Experiment|Ziele und Belohnungen|gesammelt|Züge|Tippe auf ein Röhrchen und wähle das Ziel|Zurück|Tipp|+ Röhrchen|Neustart|Reaktor|Quests|Upgrades|Elemente|MEISTERSCHAFT|Schließen|Einstellungen|Münzguthaben|Sammle 4 gleiche Elemente pro Röhrchen|Laborausrüstung|Verbessere Forschungsmodule mit verdienten Münzen.|Artefakte →|Designs|Unbekanntes Element|Element entdecken|Entdeckungskarte|Heute im Labor|Experiment fortsetzen →',
    fr: 'LABORATOIRE DES DÉCOUVERTES|Expérience|Objectifs et récompenses|collectés|coups|Touchez un tube, puis choisissez où verser|Retour|Indice|+ Tube|Recommencer|Réacteur|Quêtes|Améliorations|Éléments|MAÎTRISE|Fermer|Paramètres|Solde de pièces|Rassemblez 4 éléments identiques dans chaque tube|Équipement du laboratoire|Améliorez les modules de recherche avec vos pièces.|Artefacts →|Thèmes|Élément inconnu|Découvrir un élément|Carte des découvertes|Aujourd’hui au labo|Continuer l’expérience →',
    ar: 'مختبر الاكتشافات|تجربة|الأهداف والمكافآت|تم جمعها|حركات|المس أنبوبًا ثم اختر أين تصب|رجوع|تلميح|+ أنبوب|إعادة البدء|المفاعل|المهام|الترقيات|العناصر|الإتقان|إغلاق|الإعدادات|رصيد العملات|اجمع 4 عناصر متطابقة في كل أنبوب|معدات المختبر|طوّر وحدات البحث باستخدام العملات المكتسبة.|القطع الأثرية ←|السمات|عنصر مجهول|اكتشف عنصرًا|خريطة الاكتشافات|اليوم في المختبر|متابعة التجربة ←',
    th: 'ห้องทดลองแห่งการค้นพบ|การทดลอง|เป้าหมายและรางวัล|รวบรวมแล้ว|ครั้ง|แตะหลอดทดลอง แล้วเลือกว่าจะเทไปที่ใด|ย้อนกลับ|คำใบ้|+ หลอด|เริ่มใหม่|เครื่องปฏิกรณ์|ภารกิจ|อัปเกรด|ธาตุ|ความชำนาญ|ปิด|ตั้งค่า|ยอดเหรียญ|รวบรวมธาตุชนิดเดียวกัน 4 ชิ้นในแต่ละหลอด|อุปกรณ์ห้องทดลอง|อัปเกรดโมดูลวิจัยด้วยเหรียญที่ได้รับ|สิ่งประดิษฐ์ →|ธีม|ธาตุที่ยังไม่รู้จัก|ค้นพบธาตุ|แผนที่การค้นพบ|วันนี้ในห้องทดลอง|ทดลองต่อ →',
    vi: 'PHÒNG THÍ NGHIỆM KHÁM PHÁ|Thí nghiệm|Mục tiêu và phần thưởng|đã thu thập|lượt|Chạm vào ống nghiệm rồi chọn nơi rót|Quay lại|Gợi ý|+ Ống nghiệm|Chơi lại|Lò phản ứng|Nhiệm vụ|Nâng cấp|Nguyên tố|THÀNH THẠO|Đóng|Cài đặt|Số dư xu|Thu thập 4 nguyên tố giống nhau trong mỗi ống nghiệm|Thiết bị phòng thí nghiệm|Nâng cấp mô-đun nghiên cứu bằng số xu kiếm được.|Cổ vật →|Chủ đề|Nguyên tố chưa biết|Khám phá nguyên tố|Bản đồ khám phá|Hôm nay tại phòng thí nghiệm|Tiếp tục thí nghiệm →',
    'zh-Hans': '发现实验室|实验|目标与奖励|已收集|步数|点击试管，再选择倒入位置|返回|提示|+ 试管|重新开始|反应器|任务|升级|元素|精通|关闭|设置|金币余额|在每个试管中收集4个相同元素|实验室设备|使用赚取的金币升级研究模块。|文物 →|主题|未知元素|发现元素|发现地图|今日实验室|继续实验 →',
    ru: 'ЛАБОРАТОРИЯ ОТКРЫТИЙ|Эксперимент|Цели и награды|собрано|ходов|Нажми на пробирку, затем выбери, куда перелить|Назад|Подсказка|+ Пробирка|Заново|Реактор|Задания|Улучшения|Элементы|МАСТЕРСТВО|Закрыть|Настройки|Баланс монет|Собери по 4 одинаковых элемента в пробирках|Оборудование лаборатории|Улучшай исследовательские модули за заработанные монеты.|Артефакты →|Темы|Неизвестный элемент|Открыть элемент|Карта открытий|Сегодня в лаборатории|Продолжить эксперимент →',
    'uk': BASE.join('|')
  };
  const LANGUAGES = [
    ['uk','Українська'],['en','English'],['es','Español'],['pt-BR','Português (Brasil)'],
    ['hi','हिन्दी'],['id','Bahasa Indonesia'],['tr','Türkçe'],['ja','日本語'],
    ['ko','한국어'],['de','Deutsch'],['fr','Français'],['ar','العربية'],
    ['th','ไทย'],['vi','Tiếng Việt'],['zh-Hans','简体中文'],['ru','Русский']
  ];
  const KEY='chemlab_locale_v1';
  const supported=new Set(LANGUAGES.map(([code])=>code));
  const normalize=(value)=>{
    const input=String(value||'').toLowerCase();
    if(input.startsWith('pt'))return 'pt-BR';
    if(input.startsWith('zh'))return 'zh-Hans';
    const short=input.split('-')[0];
    return supported.has(short)?short:'en';
  };
  let requested;
  try{requested=localStorage.getItem(KEY)}catch{}
  const language=requested&&supported.has(requested)?requested:normalize(navigator.languages?.[0]||navigator.language);
  const data=TEXT[language].split('|');
  if(data.length!==BASE.length)throw new Error('ChemLab: incomplete UI locale '+language);
  const dictionary=new Map(BASE.map((phrase,index)=>[phrase,data[index]]));
  document.documentElement.lang=language;
  if(language==='ar')document.documentElement.dir='rtl';
  if(language!=='uk')document.title='ChemLab — '+data[0];
  const isRTL=language==='ar';
  const sheet=document.createElement('style');
  sheet.textContent='.chemlab-locale{display:flex;align-items:center;gap:.55rem;margin:.5rem 0 1rem;padding:.6rem;border:1px solid #608a85;border-radius:12px;color:#dcefe8}.chemlab-locale select{width:100%;min-height:42px;color:#e8faf4;background:#16333c;border:1px solid #7da6a2;border-radius:8px;padding:.4rem}.chemlab-locale span{white-space:nowrap;font-size:.9rem}'+(isRTL?'.tube-wrap,.periodic,.formula,.reaction-console{direction:ltr}':'');
  document.head.append(sheet);
  function localizeText(raw){
    const trimmed=raw.trim();if(!trimmed)return raw;
    let value=dictionary.get(trimmed);
    if(value===undefined && language!=='uk'){
      // Constrained dynamic prefixes; preserve chemistry symbols and numeric values.
      const changed=trimmed.replace(/^Дослідження (?=[A-Za-z])/,'Research ')
        .replace(/(\d+) монет/g,(_,n)=>n+' '+({en:'coins',es:'monedas','pt-BR':'moedas',hi:'सिक्के',id:'koin',tr:'jeton',ja:'コイン',ko:'코인',de:'Münzen',fr:'pièces',ar:'عملة',th:'เหรียญ',vi:'xu','zh-Hans':'金币',ru:'монет'}[language]||'coins'));
      if(changed!==trimmed)value=changed;
    }
    return value===undefined?raw:raw.replace(trimmed,value);
  }
  function walk(element){
    if(!element||element.nodeType!==1)return;
    if(element.closest?.('script,style,textarea,code,.token,.tube-number'))return;
    if(element.getAttribute('aria-label')){
      const before=element.getAttribute('aria-label');const after=localizeText(before);
      if(before!==after)element.setAttribute('aria-label',after);
    }
    const tree=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
    let node;
    while((node=tree.nextNode())){
      if(node.parentElement?.closest('script,style,textarea,code,.token,.tube-number'))continue;
      const changed=localizeText(node.nodeValue);
      if(changed!==node.nodeValue)node.nodeValue=changed;
    }
  }
  function addLanguagePicker(){
    const host=document.getElementById('modalbody');
    if(!host||!host.querySelector('#backup-export')||host.querySelector('#chemlab-locale'))return;
    const label=document.createElement('label');
    label.id='chemlab-locale';label.className='chemlab-locale';
    const span=document.createElement('span');span.textContent='🌐 Language';
    const select=document.createElement('select');select.setAttribute('aria-label','Game language');
    for(const [code,name] of LANGUAGES){const option=document.createElement('option');option.value=code;option.textContent=name;select.append(option);}
    select.value=language;
    select.onchange=()=>{try{localStorage.setItem(KEY,select.value)}catch{}location.reload();};
    label.append(span,select);host.prepend(label);
  }
  let pending=new Set(),scheduled=false;
  function flush(){
    scheduled=false;
    for(const element of pending)walk(element.nodeType===3?element.parentElement:element);
    pending.clear();addLanguagePicker();
  }
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='characterData')pending.add(record.target);
      else if(record.type==='childList') {
        if(record.addedNodes.length)for(const node of record.addedNodes)pending.add(node);
      }
    }
    if(!scheduled&&pending.size){scheduled=true;queueMicrotask(flush);}
  });
  const start=()=>{
    walk(document.body);addLanguagePicker();
    observer.observe(document.body,{childList:true,characterData:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
