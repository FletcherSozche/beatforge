const STEPS = [
  {
    title: 'BeatForge\'a Hos Geldin',
    body: 'Hizli adim — vurus ekle, davul cal. Izgaradaki hucrelere tikla, saniyeler icinde ritim olustur. Basit basla, sonra katman ekle.'
  },
  {
    title: 'Sesini Kesfet',
    body: 'Mixer\'da volume/pan ayarla. Efektler panelinde Reverb, Delay, Distortion ekle. Vokal tabiyla mikrofon kaydi yap — hepsi projeyle kaydedilir.'
  },
  {
    title: 'Uretime Basla',
    body: 'Tarz onayarlariyla basla, sablonlardan pattern sec. Demo\'yu yukle, sonra kendi projene donustur. Kaydet, export et, paylas. BPM 40-240.'
  }
];

const ONBOARDING_DISMISSED_KEY = 'beatforge.onboarding.dismissed';
let stepIndex = 0;

export function showOnboarding() {
  if (localStorage.getItem(ONBOARDING_DISMISSED_KEY)) return;
  stepIndex = 0;
  renderStep();
}

function renderStep() {
  const existing = document.getElementById('onboarding-backdrop');
  if (existing) existing.remove();

  const step = STEPS[stepIndex];
  if (!step) return closeOnboarding();

  const backdrop = document.createElement('div');
  backdrop.className = 'onboarding-backdrop';
  backdrop.id = 'onboarding-backdrop';

  const isLast = stepIndex === STEPS.length - 1;
  const isFirst = stepIndex === 0;

  backdrop.innerHTML = `
    <div class="onboarding-card">
      <div class="onboarding-step">Adim ${stepIndex + 1}/${STEPS.length}</div>
      <h2>${step.title}</h2>
      <p>${step.body}</p>
      <div class="onboarding-actions">
        <div class="onboarding-dots">
          ${STEPS.map((_, i) => `<span class="onboarding-dot${i === stepIndex ? ' active' : ''}"></span>`).join('')}
        </div>
        <button class="btn-ghost" id="onb-skip">Atla</button>
        ${isFirst ? '' : '<button class="btn-ghost" id="onb-prev">Geri</button>'}
        <button class="btn-ghost" id="onb-next" style="background:var(--accent-cyan,#22d3ee);color:#0d111c;font-family:Orbitron,monospace;font-weight:700;">
          ${isLast ? 'BASLA!' : 'Ileri'}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  document.getElementById('onb-next').addEventListener('click', () => {
    if (isLast) {
      closeOnboarding();
    } else {
      stepIndex++;
      renderStep();
    }
  });

  const skipBtn = document.getElementById('onb-skip');
  if (skipBtn) skipBtn.addEventListener('click', dismissOnboarding);

  const prevBtn = document.getElementById('onb-prev');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    stepIndex = Math.max(0, stepIndex - 1);
    renderStep();
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) dismissOnboarding();
  });
}

function closeOnboarding() {
  document.getElementById('onboarding-backdrop')?.remove();
}

function dismissOnboarding() {
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1');
  closeOnboarding();
}
