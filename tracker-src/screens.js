// ═══════════════════════════════════════════════════════
// SCREENS.JS — Tabs, Views, Mastery & Zen Dashboard
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

// ── DASHBOARD (Accueil) ──
function Dashboard({s,gs,lvl,rank,update,showT,cc}){
  const[eo,setEo]=useState(false);
  const[good,setGood]=useState(s.eveningNote?.good||"");
  const[imp,setImp]=useState(s.eveningNote?.improve||"");
  const cnt=CORE.filter(h=>{
    if(h.id==="sleep")return calcSleep(s.sleepBedtime,s.sleepWake)>=SG;
    return(s.coreProgress?.[h.id]||0)>=h.goal;
  }).length;
  const hc=computeHabitCompletion(s);

  return<div className="zen-grid-2col">
    {s.weeklyChallenge&&<div className="zen-full-width"><WeeklyChallengeCard wc={s.weeklyChallenge} update={update} showT={showT}/></div>}

    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Crd>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
          <div><Lbl>SCORE DU JOUR</Lbl><div style={{fontSize:44,fontWeight:900,color:getScoreColor(gs),lineHeight:1.1,marginTop:4}}><CountUp value={gs} suffix="%"/></div></div>
          <div style={{textAlign:"right"}}>{cc&&<div style={{color:C.green,fontWeight:700,fontSize:12}}>🌸 Journée accomplie</div>}<div style={{fontSize:11,color:C.sub,marginTop:4}}>{cnt}/{CORE.length} rituels</div></div>
        </div>
        <Br val={gs} max={100} color={getScoreColor(gs)} glow/>
      </Crd>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <MStat icon="🔥" val={s.currentStreak} label="Série" color={C.amber}/>
        <MStat icon="🌸" val={s.perfectDays} label="Parfaits" color={C.rose}/>
        <MStat icon="🪷" val={s.nofapStreak||0} label="Maîtrise" color={C.green}/>
      </div>
    </div>

    <div style={{display:"flex",flexDirection:"column",gap:16}}>
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

      <Crd style={{border:`1.5px solid ${s.eveningDone?C.green:C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><Lbl>BILAN DU SOIR</Lbl><div style={{fontSize:11,color:C.sub,marginTop:3}}>Notes et bilan de la journée</div></div>
          {s.eveningDone?<span style={{color:C.green,fontWeight:700,fontSize:13}}>✓ Fait</span>:<Btn onClick={()=>setEo(!eo)} color={C.rose} small>Écrire</Btn>}
        </div>
        {eo&&!s.eveningDone&&<div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10}}>
          <div><div style={{fontSize:11,color:C.sub,marginBottom:4}}>Point positif</div><textarea value={good} onChange={e=>setGood(e.target.value)} style={{...tS,height:56}} placeholder="Ce qui s'est bien passé..."/></div>
          <div><div style={{fontSize:11,color:C.sub,marginBottom:4}}>À améliorer</div><textarea value={imp} onChange={e=>setImp(e.target.value)} style={{...tS,height:56}} placeholder="Pour demain..."/></div>
          <Btn onClick={()=> { update(p=>({...p,eveningDone:true,eveningNote:{good,improve:imp}})); showT("Bilan enregistré ✓",C.green); setEo(false); }} color={C.green} full>Enregistrer</Btn>
        </div>}
      </Crd>
    </div>
  </div>;
}

// ── HABITS (Habitudes) ──
function Habits({s,update,showT}){
  const modifyP=(id,delta)=>{
    update(p=>{
      const h=CORE.find(x=>x.id===id);if(!h)return p;
      const cur=p.coreProgress?.[id]||0;
      const nxt=Math.max(0, cur+delta);
      return{...p,coreProgress:{...p.coreProgress,[id]:nxt}};
    });
  };

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

  const setSl=(f,v)=>update(p=>({...p,[f]:v}));

  return<div className="zen-grid-2col">
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
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {cur>0&&<button onClick={()=>modifyP(h.id, -h.step)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,width:24,height:24,cursor:"pointer",color:C.sub,fontWeight:700}}>-</button>}
            <div style={{fontWeight:800,fontSize:16,color:done?C.green:C.text}}>{h.unit==="bool"?(done?"✓":"—"):`${cur}${h.unit}`}</div>
          </div>
        </div>
        {h.unit!=="bool"&&<div style={{marginTop:10}}><Br val={cur} max={h.goal} color={done?C.green:h.color} glow={done}/></div>}
        {!done&&<div style={{marginTop:12}}><Btn onClick={()=>addP(h.id,h.step)} color={h.color} full>+{h.step}{h.unit==="bool"?" Valider":h.unit}</Btn></div>}
        {done&&<div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:C.green,fontWeight:700,fontSize:12}}>✓ Accomplis</span><button onClick={()=>modifyP(h.id, -h.step)} style={{background:"none",border:"none",color:C.sub,fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Annuler</button></div>}
      </Crd>;
    })}
  </div>;
}

// ── EPIC (Quêtes épiques) ──
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

// ── PROFIL (Badges & Courbes) ──
function Profile({s,lvl,rank}){
  const history=s.history||[];
  
  return<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{background:`linear-gradient(135deg, ${C.surface}, ${C.card})`,border:`1.5px solid ${C.border}`,borderRadius:24,padding:20,boxShadow:"0 6px 24px rgba(224,82,127,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:10,color:C.sub,letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>Profil Personnel</div>
          <div style={{fontSize:26,fontWeight:900,color:C.text,marginTop:4}}>Niveau {lvl.lvl}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}><span style={{
