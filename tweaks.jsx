/* Temple — Tweaks island (color/mood, hero & feature layout, motion) */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#ffffff",
  "mood": "obsidian",
  "particles": "ambient",
  "features": "alt",
  "marquees": true,
  "buddhaX": -20,
  "buddhaY": -40,
  "buddhaW": 564,
  "buddhaScale": 1.18,
  "aristotleX": -19,
  "aristotleY": 4,
  "aristotleW": 553,
  "aristotleScale": 0.9
}/*EDITMODE-END*/;

function applyTweaks(t){
  const r = document.documentElement;
  r.setAttribute('data-mood', t.mood);
  r.setAttribute('data-particles', t.particles);
  r.setAttribute('data-flayout', t.features);
  r.style.setProperty('--accent', t.accent);
  r.classList.toggle('no-mq', !t.marquees);
  if(window.__particles) window.__particles.refresh();
  const l = document.querySelector('.hero-statue-l');
  const rr = document.querySelector('.hero-statue-r');
  if(l){
    l.style.left = t.buddhaX + '%';
    l.style.bottom = t.buddhaY + 'px';
    l.style.width = t.buddhaW + 'px';
    l.style.transform = 'scale(' + t.buddhaScale + ')';
  }
  if(rr){
    rr.style.right = t.aristotleX + '%';
    rr.style.bottom = t.aristotleY + 'px';
    rr.style.width = t.aristotleW + 'px';
    rr.style.transform = 'scale(' + t.aristotleScale + ')';
  }
}

function TweaksApp(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(()=>{ applyTweaks(t); }, [t]);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Mood" />
      <TweakColor label="Accent" value={t.accent}
        options={['#ffffff','#e8e6e1','#b0b4ba','#7d8590']}
        onChange={(v)=>setTweak('accent', v)} />
      <TweakRadio label="Background" value={t.mood}
        options={['obsidian','ink','parchment']}
        onChange={(v)=>setTweak('mood', v)} />
      <TweakSection label="Layout" />
      <TweakRadio label="Particles" value={t.particles}
        options={['ambient','minimal','off']}
        onChange={(v)=>setTweak('particles', v)} />
      <TweakRadio label="Features" value={t.features}
        options={['alt','gallery']}
        onChange={(v)=>setTweak('features', v)} />
      <TweakSection label="Motion" />
      <TweakToggle label="Marquees" value={t.marquees}
        onChange={(v)=>setTweak('marquees', v)} />
      <TweakSection label="Buddha (left statue)" />
      <TweakSlider label="X offset" value={t.buddhaX} min={-50} max={20} unit="%"
        onChange={(v)=>setTweak('buddhaX', v)} />
      <TweakSlider label="Y offset" value={t.buddhaY} min={-100} max={200} unit="px"
        onChange={(v)=>setTweak('buddhaY', v)} />
      <TweakSlider label="Width" value={t.buddhaW} min={150} max={700} unit="px"
        onChange={(v)=>setTweak('buddhaW', v)} />
      <TweakSlider label="Scale" value={t.buddhaScale} min={0.5} max={1.6} step={0.02}
        onChange={(v)=>setTweak('buddhaScale', v)} />
      <TweakSection label="Aristotle (right statue)" />
      <TweakSlider label="X offset" value={t.aristotleX} min={-50} max={20} unit="%"
        onChange={(v)=>setTweak('aristotleX', v)} />
      <TweakSlider label="Y offset" value={t.aristotleY} min={-100} max={200} unit="px"
        onChange={(v)=>setTweak('aristotleY', v)} />
      <TweakSlider label="Width" value={t.aristotleW} min={150} max={700} unit="px"
        onChange={(v)=>setTweak('aristotleW', v)} />
      <TweakSlider label="Scale" value={t.aristotleScale} min={0.5} max={1.6} step={0.02}
        onChange={(v)=>setTweak('aristotleScale', v)} />
    </TweaksPanel>
  );
}

(function(){
  const mount = document.getElementById('tweaks-root');
  // apply persisted/default immediately so first paint matches
  try { applyTweaks(TWEAK_DEFAULTS); } catch(e){}
  ReactDOM.createRoot(mount).render(<TweaksApp />);
})();
