// ═══════════════════════════════════════════════════════
// SCREENS.JS — The 7 main tab screens + supporting cards
// Dashboard, Habits, Epic, Profile (+ HistoryChart, RecordsCard),
// Rewards, Journal, Settings, plus WeeklyChallengeCard,
// LevelUpOverlay, and SplashScreen. Each screen receives state (s)
// and an update() callback from App — screens never touch
// localStorage directly.
// Load order: data.js -> engine.js -> components.js -> screens.js -> app.js
// ═══════════════════════════════════════════════════════

function WeeklyChallengeCard({wc,update,showT}){
  const cat=CATS[wc.cat]||CATS.discipline;
  const p2=pct(wc.current,wc.goal);
  const claim=()=>{
    update(p=>({...p,xp:p.xp+wc.xpReward,weeklyChallenge:{...p.weeklyChallenge,claimed:true}}));
    showT(`🏆 +${wc.xpReward} XP réclamés !`,C.gold,3000);
  };
  return<div style={{
    background:`linear-gradient(135deg, ${cat.color}22, ${C.card})`,
    border:`1.5px solid ${cat.color}55`,borderRadius:18,padding:16,
    boxShadow:`0 4px 0 ${cat.color}33, 0 8px 20px -6px ${cat.color}40`,
    position:"relative",overflow:"hidden"
  }}>
    {wc.done&&!wc.claimed&&<div style={{position:"absolute",top:0,left:"-150%",width:"60%",height:"100%",background:`linear-gradient(115deg, transparent, ${cat.color}44, transparent)`,animation:"badgeShine 3s ease-in-out infinite"}}/>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative"}}>
      <div>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:cat.color,textTransform:"uppercase"}}>⚡ Défi de la semaine · {cat.label}</div>
        <div style={{fontSize:15,fontWeight:700,marginTop:6}}>{wc.icon} {wc.label}</div>
      </div>
      <div style={{fontSize:11,fontWeight:800,color:C.gold,flexShrink:0,marginLeft:8}}>+{wc.xpReward}XP</div>
    </div>
    <div style={{marginTop:10}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.sub,marginBottom:4}}>
        <span>{wc.current}/{wc.goal}</span>
        <span>{wc.done?"Complété !":`${p2}%`}</span>
      </div>
      <Br val={wc.current} max={wc.goal} color={cat.color} glow={wc.done}/>
    </div>
    {wc.done&&!wc.claimed&&<div style={{marginTop:12}}><Btn onClick={claim} color={C.gold} full>🎁 Réclamer +{wc.xpReward} XP</Btn></div>}
    {wc.claimed&&<div style={{marginTop:10,color:C.emerald,fontWeight:700,fontSize:12,textAlign:"center"}}>✓ Récompense réclamée</div>}
  </div>;
}

function Dashboard({s,gs,lvl,rank,update,showT,cc}){
  const[eo,setEo]=useState(false);
  const[good,setGood]=useState(s.eveningNote?.good||"");
  const[imp,setImp]=useState(s.eveningNote?.improve||"");
  const dtj=Math.max(0,Math.ceil((new Date("2026-07-11")-new Date())/86400000));
  const save=()=>{update(p=>({...p,eveningDone:true,eveningNote:{good,improve:imp}}));showT("Bilan enregistré ✓",C.emerald);setEo(false);};
  const cnt=CORE.filter(h=>{
    if(h.unit==="check")return Object.values(s.checklistProgress?.grooming||{}).filter(Boolean).length>=h.goal;
    if(h.id==="sleep")return calcSleep(s.sleepBedtime,s.sleepWake)>=SG;
    return(s.coreProgress?.[h.id]||0)>=h.goal;
  }).length;

  const hc=computeHabitCompletion(s);

  return<div style={{display:"flex",flexDirection:"column",gap:14,}}>
    {/* Weekly challenge */}
    {s.weeklyChallenge&&<WeeklyChallengeCard wc={s.weeklyChallenge} update={update} showT={showT}/>}

    {/* Japan countdown */}
    <div style={{background:"linear-gradient(135deg,#0d1117,#1a0a2e)",border:`1px solid ${C.purple}40`,borderRadius:16,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><div style={{fontSize:11,color:C.sub,letterSpacing:2,textTransform:"uppercase"}}>Départ pour le Japon</div><div style={{fontSize:13,color:C.text,marginTop:2}}>11 juillet 2026</div></div>
      <div style={{textAlign:"right"}}><div style={{fontSize:36,fontWeight:900,color:C.violet,lineHeight:1}}>{dtj}</div><div style={{fontSize:11,color:C.sub}}>jours restants</div></div>
    </div>

    {/* Global score */}
    <Crd>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
        <div><Lbl>SCORE DU JOUR</Lbl><div style={{fontSize:44,fontWeight:900,color:getScoreColor(gs),lineHeight:1.1,marginTop:4}}><CountUp value={gs} suffix="%"/></div></div>
        <div style={{textAlign:"right"}}>{cc&&<div style={{color:C.emerald,fontWeight:700,fontSize:12}}>🏆 Journée parfaite !</div>}<div style={{fontSize:11,color:C.sub,marginTop:4}}>{cnt}/{CORE.length} core</div></div>
      </div>
      <Br val={gs} max={100} color={getScoreColor(gs)} glow/>
    </Crd>

    {/* Category completion — based on habits, no Journal needed */}
    <Crd>
      <Lbl>PAR CATÉGORIE</Lbl>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
        {Object.entries(CATS).map(([k,cat])=>{
          const val=hc[k]||0;
          const color=getScoreColor(val);
          return<div key={k}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <span>{cat.icon} {cat.label}</span>
              <span style={{color,fontWeight:700}}><CountUp value={val} suffix="%"/></span>
            </div>
            <Br val={val} max={100} color={color} h={5}/>
          </div>;
        })}
      </div>
    </Crd>

    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
      <MStat icon="🔥" val={s.currentStreak} label="Streak" color={C.amber}/>
      <MStat icon="✅" val={s.perfectDays} label="Parfaits" color={C.emerald}/>
      <MStat icon="🏅" val={s.unlockedBadges?.length||0} label="Badges" color={C.gold}/>
    </div>

    {/* Evening bilan */}
    <Crd style={{border:`1px solid ${s.eveningDone?C.emerald:C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><Lbl>BILAN DU SOIR</Lbl><div style={{fontSize:11,color:C.sub,marginTop:3}}>5 min pour ancrer ta journée</div></div>
        {s.eveningDone?<span style={{color:C.emerald,fontWeight:700,fontSize:13}}>✓ Fait</span>:<Btn onClick={()=>setEo(!eo)} color={C.purple}>Remplir</Btn>}
      </div>
      {eo&&!s.eveningDone&&<div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10,animation:"modalIn .3s cubic-bezier(.22,.61,.36,1)",transformOrigin:"top center"}}>
        <div><div style={{fontSize:11,color:C.sub,marginBottom:4}}>✅ Une chose bien faite aujourd'hui</div><textarea value={good} onChange={e=>setGood(e.target.value)} style={{...tS,height:56}} placeholder="Ex: j'ai fait ma séance sans me forcer..."/></div>
        <div><div style={{fontSize:11,color:C.sub,marginBottom:4}}>🔧 Une chose à améliorer demain</div><textarea value={imp} onChange={e=>setImp(e.target.value)} style={{...tS,height:56}} placeholder="Ex: j'ai trop scrollé après 22h..."/></div>
        <Btn onClick={save} color={C.emerald} full>Enregistrer</Btn>
      </div>}
      {s.eveningDone&&(s.eveningNote?.good||s.eveningNote?.improve)&&<div style={{marginTop:10,fontSize:12,color:C.sub}}>
        {s.eveningNote.good&&<div>✅ {s.eveningNote.good}</div>}
        {s.eveningNote.improve&&<div style={{marginTop:4}}>🔧 {s.eveningNote.improve}</div>}
      </div>}
    </Crd>
  </div>;
}

// ── HABITS ──
function HRow({h,val,complete,isBonus}){
  return<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:22}}>{h.icon}</span>
      <div>
        <div style={{fontWeight:700,fontSize:14}}>{h.label}{isBonus&&<span style={{fontSize:9,color:C.gold,marginLeft:6,fontWeight:700}}>BONUS</span>}</div>
        <div style={{fontSize:11,color:C.sub}}>{h.xp} XP</div>
      </div>
    </div>
    <div style={{fontWeight:800,fontSize:17,color:complete?C.emerald:C.text}}>{val}</div>
  </div>;
}

function Habits({s,update,showT,sp}){
  const[view,setView]=useState("core");

  const addP=(id,amt,isB=false,e)=>{
    if(e)sp(e.clientX,e.clientY);
    update(p=>{
      const key=isB?"bonusProgress":"coreProgress";
      const h=(isB?BONUS:CORE).find(x=>x.id===id);if(!h)return p;
      const cur=p[key]?.[id]||0,nxt=Math.min(cur+amt,h.goal);
      const wasD=cur>=h.goal,nowD=nxt>=h.goal;
      if(!wasD&&nowD){
        const st=(p.streaks?.[id]||0)+1,bon=st>=3?Math.floor(h.xp*.25*Math.min(st-2,5)):0,xg=h.xp+bon;
        const ex={};
        if(id==="gym"){ex.gymTotal=(p.gymTotal||0)+1;ex.gymStreak=(p.gymStreak||0)+1;}
        if(id==="water")ex.waterDays=(p.waterDays||0)+1;
        if(id==="onepiece")ex.onepieceTotal=(p.onepieceTotal||0)+amt;
        if(id==="wakeup")ex.wakeupStreak=(p.wakeupStreak||0)+1;
        if(id==="meditation")ex.meditationStreak=(p.meditationStreak||0)+1;
        if(id==="reading")ex.readingStreak=(p.readingStreak||0)+1;
        if(id==="tidy")ex.tidyStreak=(p.tidyStreak||0)+1;
        if(id==="protein"){ex.proteinDays=(p.proteinDays||0)+1;ex.proteinStreak=(p.proteinStreak||0)+1;}
        if(id==="veggies"){ex.veggieDays=(p.veggieDays||0)+1;ex.veggieStreak=(p.veggieStreak||0)+1;}
        setTimeout(()=>showT(`${h.icon} ${h.label} ✓ +${xg}XP${bon?` 🔥×${st}`:""}`,C.violet),10);
        let wc=p.weeklyChallenge;
        if(wc&&wc.habitId===id&&!wc.done){
          const newCur=wc.current+1;
          const nowDone=newCur>=wc.goal;
          wc={...wc,current:newCur,done:nowDone};
          if(nowDone)setTimeout(()=>showT(`🏆 Défi de la semaine complété ! Va réclamer ta récompense`,C.gold,4000),1200);
        }
        return{...p,[key]:{...p[key],[id]:nxt},xp:p.xp+xg,streaks:{...p.streaks,[id]:st},weeklyChallenge:wc,...ex};
      }
      return{...p,[key]:{...p[key],[id]:nxt}};
    });
  };

  const togChk=(i,e)=>{
    if(e)sp(e.clientX,e.clientY);
    update(p=>{
      const cur=p.checklistProgress?.grooming||{},nxt={...cur,[i]:!cur[i]};
      const done=Object.values(nxt).filter(Boolean).length;
      const wasD=Object.values(cur).filter(Boolean).length>=4,nowD=done>=4;
      const xg=(!wasD&&nowD)?30:0;
      if(!wasD&&nowD)setTimeout(()=>showT("✨ Routine apparence ✓ +30XP",C.amber),10);
      let wc=p.weeklyChallenge;
      if(!wasD&&nowD&&wc&&wc.habitId==="grooming"&&!wc.done){
        const newCur=wc.current+1,nowDone2=newCur>=wc.goal;
        wc={...wc,current:newCur,done:nowDone2};
        if(nowDone2)setTimeout(()=>showT("🏆 Défi de la semaine complété !",C.gold,4000),1200);
      }
      return{...p,checklistProgress:{grooming:nxt},xp:p.xp+xg,groomingStreak:(!wasD&&nowD)?(p.groomingStreak||0)+1:p.groomingStreak,weeklyChallenge:wc};
    });
  };

  const setSl=(f,v)=>update(p=>{
    const nb={...p,[f]:v};const sh=calcSleep(nb.sleepBedtime,nb.sleepWake);
    if(sh>=SG&&calcSleep(p.sleepBedtime,p.sleepWake)<SG){
      setTimeout(()=>showT("😴 Sommeil atteint ! +35XP",C.purple),10);
      let wc=p.weeklyChallenge;
      if(wc&&wc.habitId==="sleep"&&!wc.done){
        const newCur=wc.current+1,nowDone=newCur>=wc.goal;
        wc={...wc,current:newCur,done:nowDone};
        if(nowDone)setTimeout(()=>showT("🏆 Défi de la semaine complété !",C.gold,4000),1200);
      }
      return{...nb,xp:p.xp+35,sleepStreak:(p.sleepStreak||0)+1,weeklyChallenge:wc};
    }
    return nb;
  });

  const rH=(h,isB=false,idx=0)=>{
    const stagger={animation:`cardIn .4s cubic-bezier(.22,.61,.36,1) ${idx*0.06}s both`};
    if(h.unit==="check"){
      const chks=s.checklistProgress?.grooming||{},done=Object.values(chks).filter(Boolean).length,cmp=done>=h.goal;
      return<Crd key={h.id} style={{borderLeft:`3px solid ${cmp?C.emerald:h.color}`,...stagger}}>
        <HRow h={h} val={`${done}/${h.goal}`} complete={cmp} isBonus={isB}/>
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
          {h.checklist.map((item,i)=><button key={i} onClick={e=>togChk(i,e)} style={{background:chks[i]?"rgba(16,185,129,0.08)":C.surface,border:`1px solid ${chks[i]?C.emerald:C.border}`,borderRadius:10,padding:"9px 12px",cursor:"pointer",color:C.text,display:"flex",alignItems:"center",gap:10,fontSize:13}}>
            <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${chks[i]?C.emerald:C.muted}`,background:chks[i]?C.emerald:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10}}>{chks[i]&&"✓"}</div>{item}
          </button>)}
        </div>
      </Crd>;
    }
    if(h.id==="sleep"){
      const sh=calcSleep(s.sleepBedtime,s.sleepWake),done=sh>=SG;
      return<Crd key="sleep" style={{borderLeft:`3px solid ${done?C.emerald:C.purple}`,...stagger}}>
        <HRow h={h} val={sh?`${sh}h`:"—"} complete={done} isBonus={false}/>
        <div style={{display:"flex",gap:10,marginTop:10}}>
          <div style={{flex:1}}><div style={{fontSize:10,color:C.sub,marginBottom:4}}>🌙 Coucher</div><input type="time" value={s.sleepBedtime||""} onChange={e=>setSl("sleepBedtime",e.target.value)} style={{...iS,width:"100%"}}/></div>
          <div style={{flex:1}}><div style={{fontSize:10,color:C.sub,marginBottom:4}}>☀️ Réveil</div><input type="time" value={s.sleepWake||""} onChange={e=>setSl("sleepWake",e.target.value)} style={{...iS,width:"100%"}}/></div>
        </div>
        {sh>0&&<div style={{marginTop:8}}><Br val={sh} max={SG} color={done?C.emerald:C.purple} glow/><div style={{fontSize:11,color:C.sub,marginTop:4}}>{sh}h / {SG.toFixed(1)}h</div></div>}
      </Crd>;
    }
    const pk=isB?"bonusProgress":"coreProgress",cur=s[pk]?.[h.id]||0,done=cur>=h.goal;
    return<Crd key={h.id} style={{borderLeft:`3px solid ${done?C.emerald:h.color}`,...stagger}}>
      <HRow h={h} val={h.unit==="bool"?(done?"✓":"—"):`${cur}${h.unit}`} complete={done} isBonus={isB}/>
      {h.unit!=="bool"&&<div style={{marginTop:8}}><Br val={cur} max={h.goal} color={done?C.emerald:h.color} glow={done}/></div>}
      {!done&&<div style={{display:"flex",gap:8,marginTop:10}}>
        <Btn onClick={e=>addP(h.id,h.step,isB,e)} color={h.color} full>+{h.step}{h.unit==="bool"?"":h.unit}</Btn>
        {h.unit!=="bool"&&h.step*2<=h.goal&&<Btn onClick={e=>addP(h.id,h.step*2,isB,e)} color={C.muted}>+{h.step*2}{h.unit}</Btn>}
      </div>}
      {done&&<div style={{marginTop:8,color:C.emerald,fontWeight:700,fontSize:12}}>✓ Complété !</div>}
    </Crd>;
  };

  return<div>
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      {["core","bonus"].map(v=><button key={v} onClick={()=>setView(v)} style={{background:view===v?C.purple:C.surface,color:view===v?"#fff":C.sub,border:`1px solid ${view===v?C.purple:C.border}`,borderRadius:20,padding:"7px 18px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{v==="core"?"Obligatoires":"✨ Bonus"}</button>)}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {view==="core"&&CORE.map((h,i)=>rH(h,false,i))}
      {view==="bonus"&&<><div style={{fontSize:12,color:C.sub,padding:"0 2px"}}>XP bonus — ne bloquent pas les récompenses.</div>{BONUS.map((h,i)=>rH(h,true,i))}</>}
    </div>
  </div>;
}

// ── EPIC ──
function Epic({s,update,showT}){
  const[adding,setAdding]=useState(false);
  const[label,setLabel]=useState("");const[ms,setMs]=useState("");const[xpv,setXpv]=useState("300");

  const setM=(qid,idx)=>update(p=>{
    const q=p.epicQuests.find(x=>x.id===qid);if(!q||(p.epicProgress?.[qid]||0)>idx)return p;
    const xp=Math.floor(q.xp/q.milestones.length);
    setTimeout(()=>showT(`⚔️ ${q.milestones[idx]} ! +${xp}XP`,C.fuchsia),10);
    return{...p,epicProgress:{...p.epicProgress,[qid]:idx+1},xp:p.xp+xp};
  });

  const add=()=>{
    if(!label.trim())return;
    const m=ms.split(",").map(x=>x.trim()).filter(Boolean);if(!m.length)m.push("Terminé !");
    update(p=>({...p,epicQuests:[...p.epicQuests,{id:"c_"+Date.now(),icon:"⭐",label,xp:parseInt(xpv)||300,milestones:m}]}));
    showT("Quête épique ajoutée !",C.gold);setAdding(false);setLabel("");setMs("");setXpv("300");
  };

  return<div style={{display:"flex",flexDirection:"column",gap:14}}>
    {s.epicQuests.map((q,qi)=>{
      const prog=s.epicProgress?.[q.id]||0,done=prog>=q.milestones.length;
      return<Crd key={q.id} style={{background:done?"linear-gradient(135deg,#1a1200,#1a1a28)":C.card,animation:`cardIn .4s cubic-bezier(.22,.61,.36,1) ${qi*0.07}s both`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${C.purple}20`,border:`1px solid ${C.purple}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{q.icon}</div>
            <div><div style={{fontWeight:700,fontSize:14}}>{q.label}</div><div style={{fontSize:11,color:C.sub}}>{q.xp} XP · {prog}/{q.milestones.length} étapes</div></div>
          </div>
          {done&&<span style={{fontSize:22}}>🏆</span>}
        </div>
        <Br val={prog} max={q.milestones.length} color={done?C.gold:C.fuchsia} glow={done}/>
        <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
          {q.milestones.map((m,i)=>{const r=prog>i,nx=prog===i;return<div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>!r&&setM(q.id,i)} style={{width:28,height:28,borderRadius:"50%",flexShrink:0,border:`2px solid ${r?C.fuchsia:nx?"#fff":C.dim}`,background:r?C.fuchsia:"transparent",color:r?"#fff":nx?C.text:C.dim,cursor:r?"default":nx?"pointer":"not-allowed",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:r?`0 0 10px ${C.fuchsia}66`:"none"}}>{r?"✓":i+1}</button>
            <span style={{fontSize:13,color:r?C.text:nx?C.text:C.sub}}>{m}</span>
            {nx&&<span style={{fontSize:10,color:C.fuchsia,marginLeft:"auto",fontWeight:700}}>← Suivant</span>}
          </div>;})}
        </div>
      </Crd>;
    })}
    {!adding
      ?<button onClick={()=>setAdding(true)} style={{background:C.surface,border:`1px dashed ${C.muted}`,borderRadius:14,padding:16,color:C.sub,fontSize:13,cursor:"pointer",fontWeight:700}}>+ Ajouter une quête épique</button>
      :<Crd style={{animation:"modalIn .3s cubic-bezier(.22,.61,.36,1)",transformOrigin:"top center"}}><Lbl>NOUVELLE QUÊTE</Lbl><div style={{display:"flex",flexDirection:"column",gap:10,marginTop:10}}>
        <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Nom de la quête" style={{...iS,width:"100%"}}/>
        <input value={ms} onChange={e=>setMs(e.target.value)} placeholder="Étapes séparées par des virgules" style={{...iS,width:"100%"}}/>
        <input value={xpv} onChange={e=>setXpv(e.target.value)} placeholder="XP total" type="number" style={{...iS,width:"100%"}}/>
        <div style={{display:"flex",gap:8}}><Btn onClick={add} color={C.emerald} full>Ajouter</Btn><Btn onClick={()=>setAdding(false)} color={C.muted}>Annuler</Btn></div>
      </div></Crd>
    }
  </div>;
}

// ── PROFILE ──
// ── HISTORY CHART (score global uniquement — % d'habitudes complétées) ──
function HistoryChart({s,gs}){
  const[range,setRange]=useState(7);
  const hist=s.history||[];

  const days=[];
  for(let i=range-1;i>=0;i--){
    const d=new Date();
    d.setDate(d.getDate()-i);
    const key=fmtLocalDate(d);
    const isToday=key===TODAY();
    const found=hist.find(h=>h.date===key);
    days.push({date:key,score:isToday?gs:(found?.score??null),isToday});
  }

  const validDays=days.filter(d=>d.score!==null&&d.score!==undefined);
  const avg=validDays.length?Math.round(validDays.reduce((a,d)=>a+d.score,0)/validDays.length):0;
  const w=280,h=100,pad=8;
  const stepX=validDays.length>1?(w-pad*2)/(validDays.length-1):0;

  const points=validDays.map((d,i)=>{
    const x=pad+i*stepX;
    const y=pad+(h-pad*2)*(1-d.score/100);
    return{x,y,score:d.score,date:d.date,isToday:d.isToday};
  });

  const pathD=points.length>1?points.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" "):"";
  const areaD=points.length>1?`${pathD} L${points[points.length-1].x},${h-pad} L${points[0].x},${h-pad} Z`:"";

  return<Crd>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
      <Lbl>HISTORIQUE</Lbl>
      <div style={{display:"flex",gap:6}}>
        {[7,30].map(r=><button key={r} onClick={()=>setRange(r)} style={{background:range===r?C.violet:C.surface,color:range===r?"#fff":C.sub,border:`1px solid ${range===r?C.violet:C.border}`,borderRadius:16,padding:"3px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{r}j</button>)}
      </div>
    </div>
    <div style={{display:"flex",alignItems:"baseline",gap:8,margin:"10px 0 12px"}}>
      <span style={{fontSize:26,fontWeight:900,color:getScoreColor(avg)}}>{avg}%</span>
      <span style={{fontSize:11,color:C.sub}}>moyenne sur {range} jours</span>
    </div>
    {validDays.length<2?
      <div style={{textAlign:"center",padding:"20px 10px",color:C.sub,fontSize:12}}>Pas encore assez d'historique — reviens demain pour voir ta courbe !</div>
      :<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:100,overflow:"visible"}}>
        <defs>
          <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.violet} stopOpacity="0.35"/>
            <stop offset="100%" stopColor={C.violet} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0,50,100].map(v=>{const y=pad+(h-pad*2)*(1-v/100);return<line key={v} x1={pad} y1={y} x2={w-pad} y2={y} stroke={C.border} strokeWidth="1" strokeDasharray="2,3"/>;})}
        {areaD&&<path d={areaD} fill="url(#histGrad)"/>}
        {pathD&&<path d={pathD} fill="none" stroke={C.violet} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
        {points.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={p.isToday?4:2.5} fill={p.isToday?C.gold:C.violet} stroke={C.bg} strokeWidth="1.5"/>)}
      </svg>
    }
    {validDays.length>=2&&<div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:9,color:C.sub}}>
      <span>{new Date(validDays[0].date).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span>
      <span>Aujourd'hui</span>
    </div>}
  </Crd>;
}

// ── RECORDS CARD ──
function RecordsCard({s}){
  const r=s.records||{bestStreak:0,bestWeekAvg:0,bestDayXP:0,bestDayScore:0};
  const items=[
    {icon:"🔥",label:"Meilleur streak",val:r.bestStreak,suffix:" jours",color:C.amber},
    {icon:"📈",label:"Meilleure semaine",val:r.bestWeekAvg,suffix:"%",color:C.emerald},
    {icon:"⚡",label:"Plus gros gain XP (1j)",val:r.bestDayXP,suffix:" XP",color:C.gold},
    {icon:"🏆",label:"Meilleur score (1j)",val:r.bestDayScore,suffix:"%",color:C.violet},
  ];
  return<Crd>
    <Lbl>🏆 RECORDS PERSONNELS</Lbl>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>
      {items.map(it=>(
        <div key={it.label} style={{background:C.surface,borderRadius:12,padding:"12px 10px",border:`1px solid ${C.border}`,textAlign:"center"}}>
          <div style={{fontSize:18}}>{it.icon}</div>
          <div style={{fontSize:20,fontWeight:900,color:it.color,marginTop:4}}><CountUp value={it.val}/>{it.suffix}</div>
          <div style={{fontSize:10,color:C.sub,marginTop:2}}>{it.label}</div>
        </div>
      ))}
    </div>
  </Crd>;
}

function Profile({s,lvl,rank,gs}){
  const ul=s.unlockedBadges||[];
  const[filter,setFilter]=useState("all");
  const cats=["all","Corps","Cerveau","Nutrition","Style","Discipline","Légendaire"];
  const filtered=filter==="all"?BADGES:BADGES.filter(b=>b.cat===filter);

  return<div style={{display:"flex",flexDirection:"column",gap:14,}}>
    {/* Player card */}
    <div style={{background:"linear-gradient(135deg,#0d0a20 0%,#1a0d35 50%,#0a1520 100%)",border:`1px solid ${rank.color}40`,borderRadius:20,padding:20,position:"relative",overflow:"hidden",boxShadow:`0 0 30px ${rank.color}22`}}>
      <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:.06}}>{rank.icon}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:10,color:C.sub,letterSpacing:2,textTransform:"uppercase"}}>Amaury</div>
          <div style={{fontSize:28,fontWeight:900,letterSpacing:-1,marginTop:4}}>Niveau {lvl.lvl}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}><span style={{fontSize:18}}>{rank.icon}</span><span style={{fontSize:13,fontWeight:700,color:rank.color}}>{rank.name}</span></div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:22,fontWeight:900,color:C.gold}}><CountUp value={s.xp}/></div>
          <div style={{fontSize:10,color:C.sub}}>XP total</div>
          <div style={{marginTop:8,fontSize:14,fontWeight:700,color:C.amber}}>🔥 {s.currentStreak} jours</div>
        </div>
      </div>
      <div style={{marginTop:14}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.sub,marginBottom:4}}><span>→ niv.{lvl.lvl+1}</span><span>{Math.round(lvl.rem)}/{lvl.needed} XP</span></div>
        <SegBar pct={lvl.pct} color={rank.color} segments={20} h={8}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:14}}>
        {[{v:s.perfectDays||0,l:"Parfaits"},{v:ul.length,l:"Badges"},{v:s.gymTotal||0,l:"Gym"}].map(({v,l})=><div key={l} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"8px 6px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:C.text}}>{v}</div><div style={{fontSize:9,color:C.sub,marginTop:1}}>{l}</div></div>)}
      </div>
      {lvl.lvl<50&&(()=>{const nx=RANKS.find(r=>r.min>lvl.lvl);return nx?<div style={{marginTop:12,padding:"8px 12px",background:"rgba(255,255,255,0.04)",borderRadius:10,fontSize:12,color:C.sub}}>Prochain rang : <span style={{color:nx.color,fontWeight:700}}>{nx.icon} {nx.name}</span> au niv.{nx.min}</div>:null;})()}
    </div>

    {/* History chart */}
    <HistoryChart s={s} gs={gs}/>

    {/* Personal records */}
    <RecordsCard s={s}/>

    {/* Badges */}
    <Crd>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><Lbl>BADGES ({ul.length}/{BADGES.length})</Lbl></div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{background:filter===c?C.purple:C.surface,color:filter===c?"#fff":C.sub,border:`1px solid ${filter===c?C.purple:C.border}`,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{c==="all"?"Tous":c}</button>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(b=>{
          const got=ul.includes(b.id),rc=RC[b.rarity],isNew=s.newBadges?.includes(b.id);
          const shiny=got&&(b.rarity==="epic"||b.rarity==="legendary");
          return<div key={b.id} style={{background:got?rc.bg:C.surface,border:`1.5px solid ${got?rc.border:C.border}`,borderRadius:12,padding:"10px 14px",display:"flex",gap:12,alignItems:"center",opacity:got?1:0.4,boxShadow:got?rc.glow:"none",position:"relative",overflow:"hidden"}}>
            {isNew&&<div style={{position:"absolute",top:-4,right:-4,background:C.gold,borderRadius:"50%",width:12,height:12,animation:"shimmer 1.5s infinite",zIndex:2}}/>}
            {shiny&&<div style={{position:"absolute",top:0,left:"-150%",width:"60%",height:"100%",background:`linear-gradient(115deg, transparent 0%, ${rc.text}33 45%, ${rc.text}66 50%, ${rc.text}33 55%, transparent 100%)`,animation:"badgeShine 3.5s ease-in-out infinite",pointerEvents:"none"}}/>}
            <span style={{fontSize:24,filter:got?"none":"grayscale(1)",position:"relative",zIndex:1}}>{b.icon}</span>
            <div style={{flex:1,position:"relative",zIndex:1}}><div style={{fontWeight:700,fontSize:13,color:got?rc.text:C.sub}}>{b.name}</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>{b.desc}</div></div>
            <div style={{fontSize:9,fontWeight:800,color:rc.text,textTransform:"uppercase",letterSpacing:1,opacity:got?1:0.5,position:"relative",zIndex:1}}>{b.rarity}</div>
          </div>;
        })}
      </div>
    </Crd>
  </div>;
}

// ── REWARDS ──
function Rewards({s,lvl,cc,update,showT}){
  const dc=s.debt===0,du=lvl.lvl>=3&&cc&&dc;

  return<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Crd>
      <Lbl>RÉCOMPENSES QUOTIDIENNES</Lbl>
      <div style={{fontSize:12,color:du?C.emerald:C.rose,marginTop:6,marginBottom:12,fontWeight:600}}>
        {du?"✅ Méritées — profites-en sans culpabilité !":!dc?`⚠️ Efface tes ${s.debt} dette(s) d'abord`:!cc?"Complète tes habitudes core d'abord":"Niveau 3 requis"}
      </div>
      {RD.map(r=><div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${C.border}`,opacity:du?1:0.35}}>
        <span style={{fontSize:24}}>{r.icon}</span>
        <span style={{fontSize:14,fontWeight:500}}>{r.label}</span>
        {du&&<span style={{marginLeft:"auto",color:C.emerald,fontSize:12,fontWeight:700}}>Débloqué 🔓</span>}
      </div>)}
    </Crd>
    <Crd>
      <Lbl>PALIERS DE NIVEAU</Lbl>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:12}}>
        {RP.map(r=>{const ul=lvl.lvl>=r.lvl,cl=s.claimedPalier?.includes(r.id);return<div key={r.id} style={{display:"flex",alignItems:"center",gap:12,opacity:ul?1:0.4}}>
          <span style={{fontSize:26}}>{r.icon}</span>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{r.label}</div><div style={{fontSize:11,color:ul?C.emerald:C.sub}}>{ul?"Débloqué !":"Niveau "+r.lvl+" requis"}</div></div>
          {ul&&!cl&&<Btn onClick={()=>{update(p=>({...p,claimedPalier:[...(p.claimedPalier||[]),r.id]}));showT("🎁 Réclamé !",C.gold);}} color={C.gold}>Réclamer</Btn>}
          {cl&&<span style={{color:C.emerald,fontWeight:800}}>✓</span>}
        </div>;})}
      </div>
    </Crd>
  </div>;
}

// ── JOURNAL (Activities + Conscience) ──
// ── CONSCIENCE (dette/fautes, autonome — plus de lien au Journal) ──
function Conscience({s,update,showT}){
  const addFault=f=>{update(p=>({...p,debt:p.debt+f.debt,conscience:[...(p.conscience||[]),{date:TODAY(),label:f.label,debt:f.debt}]}));showT(`+${f.debt} dette`,C.red);};
  const redeem=r=>{if(s.debt<=0){showT("Aucune dette !",C.sub);return;}update(p=>({...p,debt:Math.max(0,p.debt-r.r)}));showT(`${r.icon} Rachat ! -${r.r} dette`,C.emerald);};
  const todayFaults=(s.conscience||[]).filter(e=>e.date===TODAY());

  return<div style={{display:"flex",flexDirection:"column",gap:14,}}>
    {/* Debt meter */}
    <Crd style={{border:`1px solid ${s.debt>0?C.red:C.emerald}40`}}>
      <Lbl>DETTE ACTUELLE</Lbl>
      <div style={{display:"flex",alignItems:"center",gap:14,marginTop:10}}>
        <div style={{fontSize:48,fontWeight:900,color:s.debt>0?C.rose:C.emerald,lineHeight:1,textShadow:s.debt>0?`0 0 20px ${C.red}`:undefined}}>{s.debt}</div>
        <div style={{fontSize:13,color:s.debt>0?C.rose:C.emerald,fontWeight:600}}>{s.debt===0?"Conscience nette 🟢":s.debt===1?"Rachat requis":`${s.debt} rachats requis`}</div>
      </div>
      {s.debt>0&&<div style={{marginTop:10}}><Br val={Math.min(s.debt,5)} max={5} color={C.red}/></div>}
    </Crd>

    {/* Log fault */}
    <Crd>
      <Lbl>NOTER UNE FAUTE</Lbl>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:10}}>
        {CF.map(f=><button key={f.id} onClick={()=>addFault(f)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",cursor:"pointer",color:C.text,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13}}>
          <span>{f.label}</span><span style={{color:C.rose,fontWeight:800}}>+{f.debt}</span>
        </button>)}
      </div>
    </Crd>

    {/* Redeem */}
    <Crd>
      <Lbl>SE RACHETER</Lbl>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:10}}>
        {RED.map(r=><button key={r.id} onClick={()=>redeem(r)} style={{background:s.debt>0?"rgba(16,185,129,0.07)":C.surface,border:`1px solid ${s.debt>0?C.emerald:C.border}`,borderRadius:10,padding:"11px 14px",cursor:"pointer",color:C.text,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13}}>
          <span>{r.icon} {r.label}</span><span style={{color:C.emerald,fontWeight:800}}>-{r.r}</span>
        </button>)}
      </div>
    </Crd>

    {/* Today's faults log */}
    {todayFaults.length>0&&<Crd>
      <Lbl>LOG DU JOUR</Lbl>
      <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
        {todayFaults.map((e,i)=><div key={i} style={{fontSize:12,color:C.sub,display:"flex",justifyContent:"space-between"}}>
          <span>⚠️ {e.label}</span><span style={{color:C.rose}}>+{e.debt}</span>
        </div>)}
      </div>
    </Crd>}
  </div>;
}


// ── SETTINGS ──
function Settings({s,update,showT}){
  const fileInputRef=useRef(null);
  const rd=()=>{update(p=>({...p,coreProgress:{},bonusProgress:{},checklistProgress:{},sleepBedtime:null,sleepWake:null,eveningDone:false,eveningNote:{good:"",improve:""},todayKey:TODAY()}));showT("Journée réinitialisée",C.sub);};
  const ra=()=>{update(()=>({...mkDef(),weeklyChallenge:generateWeeklyChallenge()}));showT("Données effacées",C.red);};

  const exportData=()=>{
    try{
      const dataStr=JSON.stringify(s,null,2);
      const blob=new Blob([dataStr],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      const dateStr=TODAY();
      a.href=url;
      a.download=`amaury-quest-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showT("💾 Sauvegarde téléchargée !",C.emerald);
    }catch(e){showT("Erreur d'export",C.red);}
  };

  const triggerImport=()=>{fileInputRef.current?.click();};

  const handleImportFile=(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try{
        const parsed=JSON.parse(ev.target.result);
        if(typeof parsed.xp!=="number"){showT("Fichier invalide",C.red);return;}
        // Merge with defaults to fill any missing fields from older backups
        const merged={...mkDef(),...parsed};
        if(!merged.weeklyChallenge||merged.weeklyChallenge.weekKey!==getWeekKey()){
          merged.weeklyChallenge=generateWeeklyChallenge();
        }
        update(()=>merged);
        showT("✅ Sauvegarde restaurée !",C.emerald,3000);
      }catch(err){showT("Erreur : fichier corrompu",C.red);}
    };
    reader.readAsText(file);
    e.target.value="";
  };

  return<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Crd style={{border:`1px solid ${C.sky}40`}}>
      <Lbl>💾 SAUVEGARDE</Lbl>
      <div style={{fontSize:12,color:C.sub,marginTop:6,marginBottom:12,lineHeight:1.5}}>
        Tes données sont stockées uniquement sur cet appareil. Exporte régulièrement une sauvegarde pour ne rien perdre — surtout avant un voyage !
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div>
          <div style={{fontSize:12,color:C.sub,marginBottom:6}}>Télécharge toutes tes données dans un fichier</div>
          <Btn onClick={exportData} color={C.sky} full>⬇️ Exporter ma sauvegarde</Btn>
        </div>
        <div>
          <div style={{fontSize:12,color:C.sub,marginBottom:6}}>Restaure une sauvegarde précédente (remplace les données actuelles)</div>
          <Btn onClick={triggerImport} color={C.violet} full>⬆️ Importer une sauvegarde</Btn>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImportFile} style={{display:"none"}}/>
        </div>
      </div>
    </Crd>
    <div style={{fontSize:12,color:C.sub}}>⚠️ Zone sensible.</div>
    <Crd style={{border:`1px solid ${C.red}40`}}>
      <Lbl>ACTIONS</Lbl>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
        <div><div style={{fontSize:12,color:C.sub,marginBottom:6}}>Remet les compteurs du jour à zéro (XP conservé)</div><Btn onClick={rd} color={C.amber} full>Réinitialiser la journée</Btn></div>
        <div style={{marginTop:6}}><div style={{fontSize:12,color:C.sub,marginBottom:6}}>Efface toutes les données</div><Btn onClick={ra} color={C.red} full>Tout réinitialiser</Btn></div>
      </div>
    </Crd>
    <Crd>
      <Lbl>STATISTIQUES</Lbl>
      <div style={{fontSize:12,color:C.sub,marginTop:10,lineHeight:1.8}}>
        <div>XP total : <span style={{color:C.text,fontWeight:700}}>{s.xp}</span></div>
        <div>Niveau : <span style={{color:C.text,fontWeight:700}}>{getLvl(s.xp).lvl}</span></div>
        <div>Badges : <span style={{color:C.text,fontWeight:700}}>{s.unlockedBadges?.length||0}/{BADGES.length}</span></div>
        <div>Séances gym : <span style={{color:C.text,fontWeight:700}}>{s.gymTotal||0}</span></div>
        <div>Jours protéines : <span style={{color:C.text,fontWeight:700}}>{s.proteinDays||0}</span></div>
        <div>Épisodes One Piece : <span style={{color:C.text,fontWeight:700}}>{s.onepieceTotal||0}</span></div>
      </div>
    </Crd>
  </div>;
}

// ── LEVEL UP OVERLAY ──
function LevelUpOverlay({data,onClose}){
  const[closing,setClosing]=useState(false);
  const[shownData,setShownData]=useState(null);
  useEffect(()=>{
    if(data){setShownData(data);setClosing(false);}
  },[data]);
  if(!shownData)return null;
  const handleClose=()=>{
    setClosing(true);
    setTimeout(()=>{onClose();setShownData(null);},280);
  };
  const{lvl,rank}=shownData;
  const confetti=Array.from({length:24},(_,i)=>({
    id:i,left:Math.random()*100,delay:Math.random()*0.6,dur:1.4+Math.random()*1,
    rot:(Math.random()>0.5?1:-1)*(360+Math.random()*360),
    color:[C.violet,C.gold,C.emerald,C.fuchsia,C.sky,C.rose][Math.floor(Math.random()*6)],
    size:5+Math.random()*5,
  }));
  return<div onClick={handleClose} style={{position:"fixed",inset:0,background:"rgba(5,5,12,0.88)",backdropFilter:"blur(6px)",zIndex:10000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:closing?"fadeOutBg .28s ease both":"fadeInBg .3s ease",cursor:"pointer",overflow:"hidden"}}>
    {/* Confetti */}
    {!closing&&confetti.map(c=><div key={c.id} style={{position:"absolute",top:-20,left:`${c.left}%`,width:c.size,height:c.size*1.6,background:c.color,borderRadius:2,animation:`confettiFall ${c.dur}s ease-in ${c.delay}s forwards`,"--rot":`${c.rot}deg`}}/>)}

    {/* Rotating light rays behind badge */}
    <div style={{position:"relative",width:220,height:220,display:"flex",alignItems:"center",justifyContent:"center",animation:closing?"modalOut .28s ease both":"none"}}>
      <div style={{position:"absolute",width:220,height:220,background:`conic-gradient(from 0deg, transparent, ${rank.color}33, transparent, ${rank.color}33, transparent)`,borderRadius:"50%",animation:"rotateSlow 6s linear infinite"}}/>
      <div style={{position:"absolute",width:170,height:170,background:`conic-gradient(from 45deg, transparent, ${rank.color}22, transparent)`,borderRadius:"50%",animation:"rotateSlowRev 8s linear infinite"}}/>
      <div style={{position:"absolute",width:150,height:150,borderRadius:"50%",background:`radial-gradient(circle, ${rank.color}30, transparent 70%)`,animation:"rayPulse 2s ease-in-out infinite"}}/>
      {/* Badge icon */}
      <div style={{position:"relative",width:120,height:120,borderRadius:"50%",background:`linear-gradient(135deg, ${C.card}, ${C.surface})`,border:`3px solid ${rank.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56,boxShadow:`0 0 40px ${rank.color}88, inset 0 0 20px ${rank.color}33`,animation:closing?"none":"bounceIn .6s cubic-bezier(.34,1.56,.64,1)"}}>
        {rank.icon}
      </div>
    </div>

    <div style={{marginTop:24,textAlign:"center",animation:closing?"modalOut .28s ease both":"textPop .5s ease .3s both"}}>
      <div style={{fontSize:13,color:C.gold,fontWeight:800,letterSpacing:3,textTransform:"uppercase"}}>Niveau supérieur !</div>
      <div style={{fontSize:52,fontWeight:900,color:C.text,letterSpacing:-2,marginTop:4,textShadow:`0 0 30px ${rank.color}66`}}>NIV. {lvl}</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:10}}>
        <span style={{fontSize:20}}>{rank.icon}</span>
        <span style={{fontSize:16,fontWeight:700,color:rank.color}}>{rank.name}</span>
      </div>
    </div>

    <div style={{marginTop:32,fontSize:12,color:C.sub,animation:closing?"modalOut .28s ease both":"textPop .5s ease .5s both"}}>Touche l'écran pour continuer</div>
  </div>;
}

// ── SPLASH SCREEN ──
function SplashScreen({fadingOut}){
  return<div style={{
    position:"fixed",inset:0,zIndex:20000,
    background:"linear-gradient(160deg, #0d0a20 0%, #07070d 60%, #0a1020 100%)",
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    animation:fadingOut?"splashOut .45s ease forwards":"none",
  }}>
    <div style={{position:"relative",width:140,height:140,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{position:"absolute",width:140,height:140,borderRadius:"50%",background:`conic-gradient(from 0deg, transparent, ${C.violet}44, transparent, ${C.gold}33, transparent)`,animation:"rotateSlow 3s linear infinite"}}/>
      <div style={{position:"absolute",width:112,height:112,borderRadius:"50%",border:`2px solid ${C.violet}55`}}/>
      <div style={{fontSize:56,animation:"splashPop .6s cubic-bezier(.34,1.56,.64,1) both"}}>⚔️</div>
    </div>
    <div style={{marginTop:20,fontSize:20,fontWeight:900,letterSpacing:1,color:C.text,animation:"splashText .5s ease .25s both"}}>
      Amaury<span style={{color:C.violet}}>'s Quest</span>
    </div>
    <div style={{marginTop:8,fontSize:10,color:C.sub,letterSpacing:3,textTransform:"uppercase",animation:"splashText .5s ease .4s both"}}>Chargement de l'aventure...</div>
  </div>;
}

// ── MAIN APP ──
