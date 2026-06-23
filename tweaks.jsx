/* Temple — Tweaks island (color/mood, hero & feature layout, motion) */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#ffffff",
  "mood": "obsidian",
  "particles": "ambient",
  "features": "alt",
  "marquees": true
}/*EDITMODE-END*/;

function applyTweaks(t){
  const r = document.documentElement;
  r.setAttribute('data-mood', t.mood);
  r.setAttribute('data-particles', t.particles);
  r.setAttribute('data-flayout', t.features);
  r.style.setProperty('--accent', t.accent);
  r.classList.toggle('no-mq', !t.marquees);
  if(window.__particles) window.__particles.refresh();
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
    </TweaksPanel>
  );
}

(function(){
  const mount = document.getElementById('tweaks-root');
  // apply persisted/default immediately so first paint matches
  try { applyTweaks(TWEAK_DEFAULTS); } catch(e){}
  ReactDOM.createRoot(mount).render(<TweaksApp />);
})();
