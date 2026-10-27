// ═══════════════════════════════════════════════════════
// APP.JS — Root component with Lotus Blossom Splash Screen
// ═══════════════════════════════════════════════════════

function App(){
  const[s,setS]=useState(null);
  const[tab,setTab]=useState("dashboard");
  const[toast,setToast]=useState(null);
  const[loaded,setLoaded]=useState(false);
  const[splashFading,setSplashFading]=useState(false);
  const[showSplash,setShowSplash]=useState(true);

  useEffect(()=>{
    const t1=setTimeout(()=>setSplashFading(true),1600);
    const t2=setTimeout(()=>setShowSplash(false),2100);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);

  useEffect(()=>{
    try{
      const raw=localStorage.getItem(SK);
      if(raw){
        const p=JSON.parse(raw);
        if(p.todayKey!==TODAY()){
          const ok=isCoreOk(p);
          const{gs:dayScore}=computeGlobalScore(p);
          const hist=(p.history||[]).filter(h=>h.date!==p.todayKey);
          hist.push({date:p.todayKey,score:dayScore,perfect:ok});
          p.history=hist.slice(-90);
          if(ok){p.perfectDays=(p.perfectDays||0)+1;p.currentStreak=(p.currentStreak||0)+1;}
          else p.currentStreak=0;

          p.coreProgress={};
          p.sleepBedtime=null;p.sleepWake=null;
          p.eveningDone=false;p.eveningNote={good:"",improve:""};
          p.todayKey=TODAY();
          const nb=chkBadges(p);if(nb.length)p.unlockedBadges=[...(p.unlockedBadges||[]),...nb];
        }
        if(!p.history)p.history=[];
        if(!p.weeklyChallenge||p.weeklyChallenge.weekKey!==getWeekKey())p.weeklyChallenge=generateWeeklyChallenge();
        setS(p);
      }else{const d=mkDef();d.weeklyChallenge=generateWeeklyChallenge();setS(d);}
    }catch{setS(mkDef());}
    setLoaded(true);
  },[]);

  const persist=useCallback(n=>{try{localStorage.setItem(SK,JSON.stringify(n));}catch{}},[]);

  const update=useCallback(fn=>{
    setS(prev=>{
      const next=fn({...prev});
      const nb=chkBadges(next);
      if(nb.length){
        next.unlockedBadges=[...(next.unlockedBadges||[]),...nb];
        nb.forEach(bid=>{const b=BADGES.find(x=>x.id===bid);if(b)setTimeout(()=>showT(`🌸 Badge : ${b.name} !`,C.rose,3500),800);});
      }
      persist(next);return next;
    });
  },[persist]);

  const showT=(msg,color=C.green,dur=2500)=>{setToast({msg,color});setTimeout(()=>setToast(null),dur);};

  if(!loaded||showSplash)return<SplashScreen fadingOut={splashFading}/>;

  const lvl=getLvl(s.xp),rank=getRank(lvl.lvl);
  const{gs}=computeGlobalScore(s);
  const cc=isCoreOk(s);

  return<div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:C.text,position:"relative",maxWidth:480,margin:"0 auto",boxShadow:"0 0 40px rgba(0,0,0,0.03)"}}>
    {toast&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",fontWeight:700,padding:"10px 24px",borderRadius:30,zIndex:9999,fontSize:13,boxShadow:`0 8px 30px ${toast.color}44`,whiteSpace:"nowrap"}}>{toast.msg}</div>}

    {/* Header Zen */}
    <div style={{background:C.card,borderBottom:`1.5px solid ${C.border}`,padding:"16px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:16}}>{rank.icon}</span><span style={{fontSize:11,color:rank.color,fontWeight:700,letterSpacing:1}}>{rank.name}</span></div>
          <div style={{fontSize:22,fontWeight:900,letterSpacing:-0.5,marginTop:2,color:C.text}}>Niveau <span style={{color:C.roseDeep}}>{lvl.lvl}</span></div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:22,fontWeight:900,color:C.roseDeep}}><CountUp value={s.xp}/><span style={{fontSize:11,color:C.sub,fontWeight:400}}> XP</span></div>
          <div style={{fontSize:10,color:C.sub}}>{Math.round(lvl.rem)}/{lvl.needed}</div>
        </div>
      </div>
      <div style={{marginTop:10}}>
        <SegBar pct={lvl.pct} color={C.rose} segments={20} h={6}/>
      </div>
    </div>

    {/* Content */}
    <div key={tab} style={{padding:"16px 16px 100px"}}>
      {tab==="dashboard"&&<Dashboard s={s} gs={gs} lvl={lvl} rank={rank} update={update} showT={showT} cc={cc}/>}
      {tab==="habits"&&<Habits s={s} update={update} showT={showT}/>}
      {tab==="epic"&&<Epic s={s} update={update} showT={showT}/>}
      {tab===("profile")&&<Profile s={s} lvl={lvl} rank={rank}/>}
      {tab==="rewards"&&<Rewards s={s} lvl={lvl} cc={cc}/>}
      {tab==="conscience"&&<Conscience s={s} update={update} showT={showT}/>}
      {tab==="settings"&&<Settings s={s} update={update} showT={showT}/>}
    </div>

    {/* Nav Bar Zen */}
    <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:`${C.card}f5`,backdropFilter:"blur(12px)",borderTop:`1.5px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"8px 0 20px",zIndex:100}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"6px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:tab===t.id?C.roseDeep:C.sub,transition:"all .2s"}}>
        <span style={{fontSize:16}}>{t.icon}</span>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:.3,textTransform:"uppercase"}}>{t.label}</span>
      </button>)}
    </nav>
  </div>;
}

// ── SPLASH SCREEN AVEC LE LOTUS ROSE ──
function SplashScreen({fadingOut}){
  return<div style={{
    position:"fixed",inset:0,zIndex:20000,
    background:"#fffdfa",
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    animation:fadingOut?"splashOut .5s ease forwards":"none",
  }}>
    <div style={{position:"relative",width:120,height:120,display:"flex",alignItems:"center",justifyContent:"center"}}>
      {/* Animation d'ouverture du Lotus */}
      <div style={{
        fontSize:64,
        animation:"lotusBloom 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        filter:"drop-shadow(0 4px 12px rgba(224,82,127,0.25))"
      }}>
        🪷
      </div>
    </div>
    <div style={{marginTop:16,fontSize:18,fontWeight:800,letterSpacing:0.5,color:C.text,animation:"splashText .6s ease .3s both"}}>
      Amaury<span style={{color:C.roseDeep}}>'s Tracker</span>
    </div>
    <div style={{marginTop:6,fontSize:10,color:C.sub,letterSpacing:2,textTransform:"uppercase",animation:"splashText .6s ease .4s both"}}>Respire & Avance</div>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
