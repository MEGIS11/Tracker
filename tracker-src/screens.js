// ═══════════════════════════════════════════════════════
// SCREENS.JS — Tabs, Mastery / No-Fap Tracker, Zen UI
// ═══════════════════════════════════════════════════════

function WeeklyChallengeCard({wc,update,showT}){
  const cat=CATS[wc.cat]||CATS.esprit;
  const p2=pct(wc.current,wc.goal);
  const claim=()=>{
    update(p=>({...p,xp:p.xp+wc.xpReward,weeklyChallenge:{...p.weeklyChallenge,claimed:true}}));
    showT(`🌸 +${wc.xpReward} XP réclamés !`,C.rose,3000);
  };
  return<div style={{
    background:`linear-gradient(135deg, ${C.surface}, ${C.card})`,
    border:`1.5px solid ${C.border}`,borderRadius:20,padding:18,
    boxShadow:"0 4px 20px rgba(224,82,127,0.06)",
    position:"relative",overflow:"hidden"
  }}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative"}}>
      <div>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.roseDeep,textTransform:"uppercase"}}>⚡ Défi de la semaine · {cat.label}</div>
        <div style={{fontSize:15,fontWeight:700,marginTop:6,color:C.text}}>{wc.icon} {wc.label}</div>
      </div>
      <div style={{fontSize:12,fontWeight:800,color:C.amber,flexShrink:0,marginLeft:8}}>+{wc.xpReward}XP</div>
    </div>
    <div style={{marginTop:12}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.sub,marginBottom:6}}>
        <span>Progression : {wc.current}/{wc.goal}</span>
        <span>{wc.done?"Complété !":`${p2}%`}</span>
      </div>
      <Br val={wc.current} max={wc.goal} color={C.rose} glow={wc.done}/>
    </div>
    {wc.done&&!wc.claimed&&<div style={{marginTop:14}}><Btn onClick={claim} color={C.rose} full>🎁 Réclamer +{wc.xpReward} XP</Btn></div>}
    {wc.claimed&&<div style={{marginTop:12,color:C.green,fontWeight:700,fontSize:13,textAlign:"center"}}>✓ Récompense réclamée</div>}
  </div>;
}

function Dashboard({s,gs,lvl,rank,update,showT,cc}){
  const[eo,setEo]=useState(false);
  const[good,setGood]=useState(s.eveningNote?.good||"");
  const[imp,setImp]=useState(s.eveningNote?.improve||"");
  const dtj=Math.max(0,Math.ceil((new Date("2026-07-11")-new Date())/86400000));
  const save=()=>{update(p=>({...p,eveningDone:true,eveningNote:{good,improve:imp}}));showT("Bilan enregistré ✓",C.green);setEo(false);};
  const cnt=CORE.filter(h=>{
    if(h.id==="sleep")return calcSleep(s.sleepBedtime,s.sleepWake)>=SG;
    return(s.coreProgress?.[h.id]||0)>=h.goal;
  }).length;
  const hc=computeHabitCompletion(s);

  return<div style={{display:"flex",flexDirection:"column",gap:16}}>
    {s.weeklyChallenge&&<WeeklyChallengeCard wc={s.weeklyChallenge} update={update} showT={showT}/>}

    {/* Countdown Japan */}
    <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:20,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><div style={{fontSize:11,color:C.sub,letterSpacing:2,textTransform:"uppercase",fontWeight:700}}>Prochain voyage · Japon</div><div style={{fontSize:13,color:C.text,marginTop:2,fontWeight:600}}>11 juillet 2026</div></div>
      <div style={{textAlign:"right"}}><div style={{fontSize:32,fontWeight:900,color:C.roseDeep,lineHeight:1}}>{dtj}</div><div style={{fontSize:11,color:C.sub}}>jours restants</div></div>
    </div>

    {/* Score du jour */}
    <Crd>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
        <div><Lbl>SÉRÉNITÉ DU JOUR</Lbl><div style={{fontSize:44,fontWeight:900,color:getScoreColor(gs),lineHeight:1.1,marginTop:4}}><CountUp value={gs} suffix="%"/></div></div>
        <div style={{textAlign:"right"}}>{cc&&<div style={{color:C.green,fontWeight:700,fontSize:12}}>🌸 Journée accomplie</div>}<div style={{fontSize:11,color:C.sub,marginTop:4}}>{cnt}/{CORE.length} rituels</div></div>
      </div>
      <Br val={gs} max={100} color={getScoreColor(gs)} glow/>
    </Crd>

    {/* Par catégorie */}
    <Crd>
      <Lbl>ÉQUILIBRE DES DOMAINES</Lbl>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:12}}>
        {Object.entries(CATS).map(([k,cat])=>{
          const val=hc[k]||0;
          const color=getScoreColor(val);
          return<div key={k}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6,fontWeight:600}}>
              <span>{cat.icon} {cat.label}</span>
              <span style={{color}}><CountUp value={val} suffix="%"/></span>
            </div>
            <Br val={val} max={100} color={color} h={6}/>
          </div>;
        })}
      </div>
    </Crd>

    {/* Stats rapides */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
      <MStat icon="🔥" val={s.currentStreak} label="Série" color={C.amber}/>
      <MStat icon="🌸" val={s.perfectDays} label="Parfaits" color={C.rose}/>
      <MStat icon="🪷" val={s.nofapStreak||0} label="Maîtrise" color={C.green}/>
    </div>

    {/* Bilan du soir */}
    <Crd style={{border:`1.5px solid ${s.eveningDone?C.green:C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><Lbl>RÉFLEXION DU SOIR</Lbl><div style={{fontSize:11,color:C.sub,marginTop:3}}>Apaiser l'esprit avant la nuit</div></div>
        {s.eveningDone?<span style={{color:C.green,fontWeight:700,fontSize:13}}>✓ Fait</span>:<Btn onClick={()=>setEo(!eo)} color={C.rose} small>Écrire</Btn>}
      </div>
      {eo&&!s.eveningDone&&<div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10}}>
        <div><div style={{fontSize:11,color:C.sub,marginBottom:4}}>🌸 Un moment positif aujourd'hui</div><textarea value={good} onChange={e=>setGood(e.target.value)} style={{...tS,height:56}} placeholder="Ex: calme, respiration..."/></div>
        <div><div style={{fontSize:11,color:C.sub,marginBottom:4}}>🍃 Une intention pour demain</div><textarea value={imp} onChange={e=>setImp(e.target.value)} style={{...tS,height:56}} placeholder="Ex: moins de téléphone..."/></div>
        <Btn onClick={save} color={C.green} full>Enregistrer</Btn>
      </div>}
    </Crd>
  </div>;
}

// ── HABITS ──
function Habits({s,update,showT}){
  const addP=(id,amt)=>{
    update(p=>{
      const h=CORE.find(x=>x.id===id);if(!h)return p;
      const cur=p.coreProgress?.[id]||0,nxt=Math.min(cur+amt,h.goal);
      const wasD=cur>=h.goal,nowD=nxt>=h.goal;
      if(!wasD&&nowD){
        const xg=h.xp;
        const ex={};
        if(id==="gym")ex.gymTotal=(p.gymTotal||0)+1;
        if(id==="water")ex.waterDays=(p.waterDays||0)+1;
        if(id==="sun")ex.sunDays=(p.sunDays||0)+1;
        if(id==="detox")ex.detoxDays=(p.detoxDays||0)+1;
        setTimeout(()=>showT(`${h.icon} ${h.label} ✓ +${xg}XP`,C.rose),10);
        let wc=p.weeklyChallenge;
        if(wc&&wc.habitId===id&&!wc.done){
          const newCur=wc.current+1;
          const nowDone=newCur>=wc.goal;
          wc={...wc,current:newCur,done:nowDone};
        }
        return{...p,coreProgress:{...p.coreProgress,[id]:nxt},xp:p.xp+xg,weeklyChallenge:wc,...ex};
      }
      return{...p,coreProgress:{...p.coreProgress,[id]:nxt}};
    });
  };

  const setSl=(f,v)=>update(p=>{
    const nb={...p,[f]:v};const sh=calcSleep(nb.sleepBedtime,nb.sleepWake);
    if(sh>=SG&&calcSleep(p.sleepBedtime,p.sleepWake)<SG){
      setTimeout(()=>showT("😴 Sommeil réparateur validé ! +35XP",C.purple),10);
      return{...nb,xp:p.xp+35};
    }
    return nb;
  });

  return<div style={{display:"flex",flexDirection:"column",gap:12}}>
    {CORE.map((h)=>{
      if(h.id==="sleep"){
        const sh=calcSleep(s.sleepBedtime,s.sleepWake),done=sh>=SG;
        return<Crd key="sleep" style={{borderLeft:`4px solid ${done?C.green:C.purple}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>{h.icon}</span><div><div style={{fontWeight:700,fontSize:14}}>{h.label}</div><div style={{fontSize:11,color:C.sub}}>{h.xp} XP</div></div></div>
            <div style={{fontWeight:800,fontSize:16,color:done?C.green:C.text}}>{sh?`${sh}h`:"—"}</div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:12}}>
            <div style={{flex:1}}><div style={{fontSize:10,color:C.sub,marginBottom:4}}>🌙 Coucher</div><input type="time" value={s.sleepBedtime||""} onChange={e=>setSl("sleepBedtime",e.target.value)} style={{...iS,width:"100%"}}/></div>
            <div style={{flex:1}}><div style={{fontSize:10,color:C.sub,marginBottom:4}}>☀️ Réveil</div><input type="time" value={s.sleepWake||""} onChange={e=>setSl("sleepWake",e.target.value)} style={{...iS,width:"100%"}}/></div>
          </div>
        </Crd>;
      }
      const cur=s.coreProgress?.[h.id]||0,done=cur>=h.goal;
      return<Crd key={h.id} style={{borderLeft:`4px solid ${done?C.green:h.color}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>{h.icon}</span><div><div style={{fontWeight:700,fontSize:14}}>{h.label}</div><div style={{fontSize:11,color:C.sub}}>{h.xp} XP</div></div></div>
          <div style={{fontWeight:800,fontSize:16,color:done?C.green:C.text}}>{h.unit==="bool"?(done?"✓":"—"):`${cur}${h.unit}`}</div>
        </div>
        {h.unit!=="bool"&&<div style={{marginTop:10}}><Br val={cur} max={h.goal} color={done?C.green:h.color} glow={done}/></div>}
        {!done&&<div style={{marginTop:12}}><Btn onClick={()=>addP(h.id,h.step)} color={h.color} full>+{h.step}{h.unit==="bool"?" Valider":h.unit}</Btn></div>}
        {done&&<div style={{marginTop:10,color:C.green,fontWeight:700,fontSize:12}}>✓ Accomplis pour aujourd'hui</div>}
      </Crd>;
    })}
  </div>;
}

// ── EPIC ──
function Epic({s,update,showT}){
  const setM=(qid,idx)=>update(p=>{
    const q=p.epicQuests.find(x=>x.id===qid);if(!q||(p.epicProgress?.[qid]||0)>idx)return p;
    const xp=Math.floor(q.xp/q.milestones.length);
    setTimeout(()=>showT(`🌸 ${q.milestones[idx]} ! +${xp}XP`,C.rose),10);
    return{...p,epicProgress:{...p.epicProgress,[qid]:idx+1},xp:p.xp+xp};
  });

  return<div style={{display:"flex",flexDirection:"column",gap:14}}>
    {s.epicQuests.map((q)=>{
      const prog=s.epicProgress?.[q.id]||0,done=prog>=q.milestones.length;
      return<Crd key={q.id}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:40,height:40,borderRadius:12,background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{q.icon}</div>
            <div><div style={{fontWeight:700,fontSize:14}}>{q.label}</div><div style={{fontSize:11,color:C.sub}}>{q.xp} XP · {prog}/{q.milestones.length} étapes</div></div>
          </div>
          {done&&<span style={{fontSize:20}}>✨</span>}
        </div>
        <Br val={prog} max={q.milestones.length} color={done?C.amber:C.rose} glow={done}/>
        <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
          {q.milestones.map((m,i)=>{const r=prog>i,nx=prog===i;return<div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>!r&&setM(q.id,i)} style={{width:26,height:26,borderRadius:"50%",flexShrink:0,border:`2px solid ${r?C.rose:nx?C.text:C.border}`,background:r?C.rose:"transparent",color:r?"#fff":C.text,cursor:r?"default":nx?"pointer":"not-allowed",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{r?"✓":i+1}</button>
            <span style={{fontSize:13,color:r?C.sub:C.text}}>{m}</span>
          </div>;})}
        </div>
      </Crd>;
    })}
  </div>;
}

// ── PROFILE ──
function Profile({s,lvl,rank}){
  return<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{background:`linear-gradient(135deg, ${C.surface}, ${C.card})`,border:`1.5px solid ${C.border}`,borderRadius:24,padding:20,boxShadow:"0 6px 24px rgba(224,82,127,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:10,color:C.sub,letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>Profil Personnel</div>
          <div style={{fontSize:26,fontWeight:900,color:C.text,marginTop:4}}>Niveau {lvl.lvl}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}><span style={{fontSize:18}}>{rank.icon}</span><span style={{fontSize:13,fontWeight:700,color:rank.color}}>{rank.name}</span></div>
        </div>
        <div style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:900,color:C.roseDeep}}><CountUp value={s.xp}/></div><div style={{fontSize:10,color:C.sub}}>XP total</div></div>
      </div>
      <div style={{marginTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.sub,marginBottom:4}}><span>Progression</span><span>{Math.round(lvl.rem)}/{lvl.needed} XP</span></div>
        <SegBar pct={lvl.pct} color={C.rose} segments={20} h={8}/>
      </div>
    </div>
  </div>;
}

// ── REWARDS / PLAISIRS ──
function Rewards({s,lvl,cc}){
  const du=lvl.lvl>=2&&cc;
  return<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Crd>
      <Lbl>PLAISIRS SAINS & DOUX</Lbl>
      <div style={{fontSize:12,color:du?C.green:C.rose,marginTop:6,marginBottom:12,fontWeight:600}}>
        {du?"✅ Bien mérités — profites-en pleinement !":!cc?"Accomplis tes rituels du jour d'abord":"Niveau 2 requis"}
      </div>
      {RD.map(r=><div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${C.border}`,opacity:du?1:0.4}}>
        <span style={{fontSize:24}}>{r.icon}</span>
        <span style={{fontSize:14,fontWeight:500}}>{r.label}</span>
        {du&&<span style={{marginLeft:"auto",color:C.green,fontSize:12,fontWeight:700}}>Disponible 🔓</span>}
      </div>)}
    </Crd>
  </div>;
}

// ── CONSCIENCE & MAÎTRISE DE SOI (No-Fap & Titres Mystères) ──
function Conscience({s,update,showT}){
  const streak=s.nofapStreak||0;
  const best=s.nofapBest||0;
  const unlocked=s.unlockedMastery||[0];

  const resetStreak=()=>{
    const current=s.nofapStreak||0;
    if(current>best) update(p=>({...p,nofapBest:current,nofapStreak:0,nofapLastReset:TODAY()}));
    else update(p=>({...p,nofapStreak:0,nofapLastReset:TODAY()}));
    showT("Le compteur a redémarré. Chaque pas est un apprentissage.",C.rose);
  };

  const incrementDay=()=>update(p=>{
    const next=(p.nofapStreak||0)+1;
    const newBest=Math.max(next,p.nofapBest||0);
    let addedXp=0;
    const newUnlocked=[...(p.unlockedMastery||[0])];

    // Vérifier les paliers mystères
    MASTERY_MILESTONES.forEach((m,idx)=>{
      if(next>=m.days&&!newUnlocked.includes(idx+1)){
        newUnlocked.push(idx+1);
        addedXp+=m.xp;
        setTimeout(()=>showT(`🪷 Palier débloqué : ${m.title} (+${m.xp}XP) !`,C.gold,4000),500);
      }
    });

    return{...p,nofapStreak:next,nofapBest:newBest,xp:p.xp+addedXp,unlockedMastery:newUnlocked};
  });

  return<div style={{display:"flex",flexDirection:"column",gap:16}}>
    {/* Compteur Maîtrise de soi */}
    <Crd style={{background:`linear-gradient(135deg, ${C.surface}, ${C.card})`,border:`1.5px solid ${C.rosePale}`}}>
      <Lbl>🪷 MAÎTRISE DE SOI & CLARTÉ</Lbl>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14}}>
        <div>
          <div style={{fontSize:42,fontWeight:900,color:C.roseDeep,lineHeight:1}}><CountUp value={streak}/> <span style={{fontSize:18,fontWeight:600}}>jours</span></div>
          <div style={{fontSize:12,color:C.sub,marginTop:4}}>Record personnel : {best} jours</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <Btn onClick={incrementDay} color={C.green} small>+1 Jour</Btn>
          <button onClick={resetStreak} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:12,padding:"6px 10px",color:C.sub,fontSize:11,cursor:"pointer",fontWeight:600}}>Recommencer</button>
        </div>
      </div>
    </Crd>

    {/* Paliers & Titres Mystères Cachés */}
    <Crd>
      <Lbl>✨ TITRES & PALIERS MYSTÈRES</Lbl>
      <div style={{fontSize:12,color:C.sub,marginTop:6,marginBottom:14}}>Continue ton chemin pour révéler les secrets de la maîtrise.</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {MASTERY_MILESTONES.map((m,idx)=>{
          const isUnlocked=unlocked.includes(idx+1);
          return<div key={idx} style={{
            background:isUnlocked?C.surface:C.card,
            border:`1.5px solid ${isUnlocked?C.border:"#eee"}`,
            borderRadius:14,padding:"12px 14px",
            display:"flex",justifyContent:"space-between",alignItems:"center",
            opacity:isUnlocked?1:0.75
          }}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:isUnlocked?C.text:C.sub}}>
                {isUnlocked?m.title:"🔒 ??????????? ("+m.days+" jours)"}
              </div>
              <div style={{fontSize:11,color:C.sub,marginTop:2}}>
                {isUnlocked?m.desc:"Atteins ce palier pour révéler ce titre et gagner "+m.xp+" XP."}
              </div>
            </div>
            <div style={{fontSize:12,fontWeight:800,color:isUnlocked?C.green:C.sub}}>
              {isUnlocked?"✓ Débloqué":m.days+"j"}
            </div>
          </div>;
        })}
      </div>
    </Crd>
  </div>;
}

// ── SETTINGS ──
function Settings({s,update,showT}){
  const fileInputRef=useRef(null);
  const rd=()=>{update(p=>({...p,coreProgress:{},sleepBedtime:null,sleepWake:null,eveningDone:false,eveningNote:{good:"",improve:""},todayKey:TODAY()}));showT("Journée réinitialisée",C.sub);};
  const exportData=()=>{try{const dataStr=JSON.stringify(s,null,2);const blob=new Blob([dataStr],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`zen-tracker-backup-${TODAY()}.json`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);showT("💾 Sauvegarde exportée !",C.green);}catch(e){showT("Erreur",C.rose);}};
  const triggerImport=()=>fileInputRef.current?.click();
  const handleImportFile=(e)=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=(ev)=>{try{const parsed=JSON.parse(ev.target.result);update(()=>({...mkDef(),...parsed}));showT("✅ Restauré !",C.green,3000);}catch(err){showT("Fichier invalide",C.rose);}};reader.readAsText(file);e.target.value="";};

  return<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <Crd>
      <Lbl>💾 SAUVEGARDE</Lbl>
      <div style={{fontSize:12,color:C.sub,marginTop:6,marginBottom:12,lineHeight:1.5}}>Tes données sont sauvegardées sur cet appareil. Pense à exporter régulièrement.</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Btn onClick={exportData} color={C.blue} full>⬇️ Exporter les données</Btn>
        <Btn onClick={triggerImport} color={C.purple} full>⬆️ Importer une sauvegarde</Btn>
        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImportFile} style={{display:"none"}}/>
      </div>
    </Crd>
    <Crd>
      <Lbl>RÉINITIALISATION</Lbl>
      <div style={{marginTop:12}}><Btn onClick={rd} color={C.amber} full>Remettre la journée à zéro</Btn></div>
    </Crd>
  </div>;
}
