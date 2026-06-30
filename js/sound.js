window.GameSounds={
 enabled:localStorage.getItem('kla_sound')!=='off',
 files:{correct:'../sounds/correct.mp3',wrong:'../sounds/wrong.mp3',star:'../sounds/star.mp3',complete:'../sounds/complete.mp3',click:'../sounds/click.mp3',pop:'../sounds/pop.mp3',launch:'../sounds/launch.mp3',celebration:'../sounds/celebration.mp3'},
 audio:{},
 init(){Object.entries(this.files).forEach(([k,v])=>{const a=new Audio(v);a.preload='auto';this.audio[k]=a;});},
 play(name){if(!this.enabled||!this.audio[name])return;const a=this.audio[name];a.currentTime=0;a.play().catch(()=>{});},
 speak(text){if(!this.enabled||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.78;u.pitch=1.15;speechSynthesis.speak(u);},
 toggle(){this.enabled=!this.enabled;localStorage.setItem('kla_sound',this.enabled?'on':'off');return this.enabled;}
};
GameSounds.init();
