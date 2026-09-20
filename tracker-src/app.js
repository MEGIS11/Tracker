// ═══════════════════════════════════════════════════════
// APP.JS — Root component: state, persistence, and orchestration
// Owns the single source of truth (s / setS), handles localStorage
// load/save, day-rollover logic (badges, streaks, history snapshot,
// category-base drift, weekly challenge), the level-up detector,
// screen shake trigger, and renders the header + tab navigation +
// active screen. This is the last file loaded and the only one
// that calls ReactDOM.createRoot().
// Load order: data.js -> engine.js -> components.js -> screens.js -> app.js
// ═══════════════════════════════════════════════════════

function App(){
  const[s,setS]=useState(null);
  const[tab,setTab]=useState("dashboard");
  const[toast,setToast]=useState(null);
  const[parts,setParts]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[levelUp,setLevelUp]=useState(null);
  const[shake,setShake]=useState(false);
  const[splashFading,setSplashFading]=useState(false);
  const[showSplash,setShowSplash]=useState(true);
  const prevLvlRef=useRef(null);

  useEffect(()=>{
    const t1=setTimeout(()=>setSplashFading(true),1100);
    const t2=setTimeout(()=>setShowSplash(false),1500);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);

  useEffect(()=>{
    try{
      const raw=localStorage.getItem(SK);
      if(raw){
        const p=JSON.parse(raw);
        if(p.todayKey!==TODAY()){
          const ok=isCoreOk(p);
          const{gs:dayScore,cs:dayCats}=computeGlobalScore(p);
          const hist=(p.history||[]).filter(h=>h.date!==p.todayKey);
          hist.push({date:p.todayKey,score:dayScore,perfect:ok,cats:dayCats});
          p.history=hist.slice(-90); // keep last 90 days max
          if(ok){p.perfectDays=(p.perfectDays||0)+1;p.currentStreak=(p.currentStreak||0)+1;const cs=p.currentStreak;if(cs%7===0)p.xp=(p.xp||0)+100;else if(cs%3===0)p.xp=(p.xp||0)+50;}
          else p.currentStreak=0;
          if(p.debt===0)p.conscienceCleanStreak=(p.conscienceCleanStreak||0)+1;else p.conscienceCleanStreak=0;

          // debt-free weekly challenge progress
          if(p.weeklyChallenge&&p.weeklyChallenge.habitId==="__debtfree"&&!p.weeklyChallenge.done){
            if(p.debt===0){
              const newCur=p.weeklyChallenge.current+1;
              p.weeklyChallenge={...p.weeklyChallenge,current:newCur,done:newCur>=p.weeklyChallenge.goal};
            }else{
              p.weeklyChallenge={...p.weeklyChallenge,current:0};
            }
          }

          // Update personal records
          if(!p.records)p.records={bestStreak:0,bestWeekAvg:0,bestDayXP:0,bestDayScore:0};
          if(p.currentStreak>p.records.bestStreak)p.records.bestStreak=p.currentStreak;
          if(dayScore>p.records.bestDayScore)p.records.bestDayScore=dayScore;
          if((p.dailyXPGained||0)>p.records.bestDayXP)p.records.bestDayXP=p.dailyXPGained||0;
          const last7=p.history.slice(-7);
          if(last7.length===7){
            const weekAvg=Math.round(last7.reduce((a,d)=>a+d.score,0)/7);
            if(weekAvg>p.records.bestWeekAvg)p.records.bestWeekAvg=weekAvg;
          }
          p.dailyXPGained=0;

          // Weekly challenge: new week? generate fresh challenge
          const wk=getWeekKey();
          if(!p.weeklyChallenge||p.weeklyChallenge.weekKey!==wk){
            p.weeklyChallenge=generateWeeklyChallenge();
          }

          p.coreProgress={};p.bonusProgress={};p.checklistProgress={};
          p.sleepBedtime=null;p.sleepWake=null;
          p.eveningDone=false;p.eveningNote={good:"",improve:""};
          p.catBase=computeNextDayBase(dayCats);
          p.screenUsage={};
          p.activities=[];p.activityImpacts={corps:0,nutrition:0,cerveau:0,apparence:0,discipline:0,social:0};
          p.todayKey=TODAY();
          const nb=chkBadges(p);if(nb.length){p.unlockedBadges=[...(p.unlockedBadges||[]),...nb];p.newBadges=nb;}
        }
        if(!p.activities)p.activities=[];
        if(!p.activityImpacts)p.activityImpacts={corps:0,nutrition:0,cerveau:0,apparence:0,discipline:0,social:0};
        if(!p.history)p.history=[];
        if(!p.catBase)p.catBase={corps:50,nutrition:50,cerveau:50,apparence:50,discipline:50,social:50};
        if(!p.screenUsage)p.screenUsage={};
        if(!p.records)p.records={bestStreak:0,bestWeekAvg:0,bestDayXP:0,bestDayScore:0};
        if(!p.weeklyChallenge||p.weeklyChallenge.weekKey!==getWeekKey())p.weeklyChallenge=generateWeeklyChallenge();
        if(p.dailyXPGained===undefined)p.dailyXPGained=0;
        prevLvlRef.current=getLvl(p.xp).lvl;
        setS(p);
      }else{const d=mkDef();d.weeklyChallenge=generateWeeklyChallenge();setS(d);prevLvlRef.current=1;}
    }catch{setS(mkDef());}
    setLoaded(true);
  },[]);

  const persist=useCallback(n=>{try{localStorage.setItem(SK,JSON.stringify(n));}catch{}},[]);
  const triggerShake=useCallback(()=>{
    setShake(true);
    setTimeout(()=>setShake(false),500);
  },[]);

  const update=useCallback(fn=>{
    setS(prev=>{
      const next=fn({...prev});
      const xpDelta=Math.max(0,(next.xp||0)-(prev.xp||0));
      if(xpDelta>0){
        next.dailyXPGained=(prev.dailyXPDate===TODAY()?(prev.dailyXPGained||0):0)+xpDelta;
        next.dailyXPDate=TODAY();
      }
      const nb=chkBadges(next);
      if(nb.length){
        next.unlockedBadges=[...(next.unlockedBadges||[]),...nb];
        next.newBadges=[...(next.newBadges||[]),...nb];
        nb.forEach(bid=>{const b=BADGES.find(x=>x.id===bid);if(b)setTimeout(()=>showT(`🏅 Badge : ${b.name} !`,C.gold,3500),800);});
        setTimeout(triggerShake,750);
      }
      const wasChallengeDone=prev.weeklyChallenge?.done;
      const nowChallengeDone=next.weeklyChallenge?.done;
      if(!wasChallengeDone&&nowChallengeDone){
        setTimeout(triggerShake,1150);
      }
      const newLvl=getLvl(next.xp).lvl;
      if(prevLvlRef.current!==null&&newLvl>prevLvlRef.current){
        const newRank=getRank(newLvl);
        setTimeout(()=>setLevelUp({lvl:newLvl,rank:newRank}),300);
      }
      prevLvlRef.current=newLvl;
      persist(next);return next;
    });
  },[persist,triggerShake]);

  const sp=(x,y)=>{const ps=Array.from({length:10},(_,i)=>({id:Date.now()+i,x,y,dx:(Math.random()-.5)*100,dy:-(Math.random()*90+30),color:[C.violet,C.gold,C.emerald,C.fuchsia,C.sky][Math.floor(Math.random()*5)]}));setParts(ps);setTimeout(()=>setParts([]),900);};
  const showT=(msg,color=C.emerald,dur=2500)=>{setToast({msg,color});setTimeout(()=>setToast(null),dur);};

  if(!loaded||showSplash)return<SplashScreen fadingOut={splashFading}/>;

  const lvl=getLvl(s.xp),rank=getRank(lvl.lvl);
  const{cs,gs}=computeGlobalScore(s);
  const cc=isCoreOk(s);

  return<div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:C.text,overflowX:"hidden",animation:shake?"screenShake .5s ease":"none",position:"relative"}}>
    {/* Ambient parallax depth layers */}
    <div style={{position:"fixed",top:"-10%",left:"-15%",width:"60%",height:"40%",background:`radial-gradient(circle, ${rank.color}14, transparent 70%)`,pointerEvents:"none",zIndex:0,animation:"parallaxDrift 14s ease-in-out infinite",filter:"blur(20px)"}}/>
    <div style={{position:"fixed",bottom:"-5%",right:"-10%",width:"55%",height:"35%",background:`radial-gradient(circle, ${C.purple}10, transparent 70%)`,pointerEvents:"none",zIndex:0,animation:"parallaxDrift 18s ease-in-out infinite reverse",filter:"blur(24px)"}}/>
    <div style={{position:"relative",zIndex:1}}>
    {parts.map(p=><div key={p.id} style={{position:"fixed",left:p.x,top:p.y,width:8,height:8,borderRadius:"50%",background:p.color,pointerEvents:"none",zIndex:9998,animation:"particle .8s ease forwards","--dx":p.dx+"px","--dy":p.dy+"px"}}/>)}
    {toast&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#000",fontWeight:800,padding:"10px 24px",borderRadius:30,zIndex:9999,fontSize:13,boxShadow:`0 8px 40px ${toast.color}66`,whiteSpace:"nowrap",animation:"pop .3s cubic-bezier(.34,1.56,.64,1)"}}>{toast.msg}</div>}
    <LevelUpOverlay data={levelUp} onClose={()=>setLevelUp(null)}/>

    {/* Header */}
    <div style={{background:"linear-gradient(135deg,#0f0a1e 0%,#0a1020 100%)",borderBottom:`1px solid ${C.border}`,padding:"12px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{rank.icon}</span><span style={{fontSize:11,color:rank.color,fontWeight:700,letterSpacing:1}}>{rank.name}</span></div>
          <div style={{fontSize:24,fontWeight:900,letterSpacing:-1,marginTop:2}}>Niv. <span style={{color:C.violet}}>{lvl.lvl}</span>{s.currentStreak>=3&&<span style={{fontSize:13,color:C.amber,marginLeft:8}}>🔥 {s.currentStreak}</span>}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:26,fontWeight:900,color:C.gold,letterSpacing:-1}}><CountUp value={s.xp}/><span style={{fontSize:11,color:C.sub,fontWeight:400}}> XP</span></div>
          <div style={{fontSize:10,color:C.sub}}>{Math.round(lvl.rem)}/{lvl.needed} → niv.{lvl.lvl+1}</div>
        </div>
      </div>
      <div style={{marginTop:8}}>
        <SegBar pct={lvl.pct} color={C.violet} segments={20} h={7}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
        <span style={{fontSize:11,color:C.sub}}>Score du jour</span>
        <span style={{fontSize:12,fontWeight:800,color:gs>=80?C.emerald:gs>=50?C.gold:C.rose}}>{gs}%</span>
      </div>
      {s.debt>0&&<div style={{marginTop:6,background:"rgba(225,29,72,0.1)",border:`1px solid ${C.red}40`,borderRadius:8,padding:"5px 10px",fontSize:11,color:C.rose,fontWeight:600}}>⚠️ {s.debt} dette{s.debt>1?"s":""} — récompenses bloquées</div>}
      {s.newBadges?.length>0&&<div onClick={()=>{update(p=>({...p,newBadges:[]}));setTab("profile");}} style={{marginTop:6,background:`${C.gold}18`,border:`1px solid ${C.gold}60`,borderRadius:8,padding:"5px 10px",fontSize:11,color:C.gold,fontWeight:700,cursor:"pointer"}}>🏅 {s.newBadges.length} badge{s.newBadges.length>1?"s":""} débloqué{s.newBadges.length>1?"s":""} ! Voir le profil →</div>}
    </div>

    {/* Content */}
    <div key={tab} style={{padding:"14px 14px 90px",animation:"tabFade .35s cubic-bezier(.22,.61,.36,1)"}}>
      {tab==="dashboard"&&<Dashboard s={s} cs={cs} gs={gs} lvl={lvl} rank={rank} update={update} showT={showT} cc={cc}/>}
      {tab==="habits"&&<Habits s={s} update={update} showT={showT} sp={sp}/>}
      {tab==="epic"&&<Epic s={s} update={update} showT={showT}/>}
      {tab==="profile"&&<Profile s={s} lvl={lvl} rank={rank} gs={gs} cs={cs}/>}
      {tab==="rewards"&&<Rewards s={s} lvl={lvl} cc={cc} gs={gs} update={update} showT={showT}/>}
      {tab==="journal"&&<Journal s={s} update={update} showT={showT}/>}
      {tab==="settings"&&<Settings s={s} update={update} showT={showT}/>}
    </div>

    {/* Nav */}
    <nav style={{position:"fixed",bottom:0,left:0,right:0,background:`${C.surface}f0`,backdropFilter:"blur(12px)",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"6px 0 16px"}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,color:tab===t.id?C.violet:C.sub,transition:"all .2s",transform:tab===t.id?"translateY(-2px)":"none",position:"relative"}}>
        <span style={{fontSize:15}}>{t.icon}</span>
        <span style={{fontSize:8,fontWeight:700,letterSpacing:.3,textTransform:"uppercase"}}>{t.label}</span>
        {tab===t.id&&<div style={{position:"absolute",bottom:-6,width:20,height:2,background:C.violet,borderRadius:2}}/>}
        {t.id==="profile"&&s.newBadges?.length>0&&<div style={{position:"absolute",top:0,right:2,width:8,height:8,background:C.gold,borderRadius:"50%"}}/>}
        {t.id==="journal"&&s.debt>0&&<div style={{position:"absolute",top:0,right:2,width:8,height:8,background:C.rose,borderRadius:"50%"}}/>}
      </button>)}
    </nav>
    </div>
  </div>;
}


ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
