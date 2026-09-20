// ═══════════════════════════════════════════════════════
// COMPONENTS.JS — Shared, reusable UI building blocks
// Card, progress bars (linear + segmented), labels, buttons, stat
// tiles, animated CountUp numbers, circular Ring progress, category
// impact pills. These have no knowledge of app state — pure
// presentation components used throughout screens.js.
// Load order: data.js -> engine.js -> components.js -> screens.js -> app.js
// ═══════════════════════════════════════════════════════
const {useState,useEffect,useCallback,useRef}=React;

const Crd=({children,style={},accent})=><div style={{
  background:`linear-gradient(180deg, ${C.card2} 0%, ${C.card} 100%)`,
  border:`1.5px solid ${accent?accent+"55":C.border}`,
  borderRadius:18,
  padding:16,
  boxShadow:accent
    ?`0 4px 0 ${accent}33, 0 8px 20px -6px ${accent}40, inset 0 1px 0 rgba(255,255,255,0.04)`
    :`0 3px 0 rgba(0,0,0,0.35), 0 6px 16px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)`,
  position:"relative",
  ...style
}}>{children}</div>;
const Br=({val,max,color,h=7,glow})=>{
  const p=Math.min((val/max)*100,100);
  return<div style={{background:C.dim,borderRadius:8,height:h,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${p}%`,background:color,borderRadius:8,transition:"width .6s cubic-bezier(.22,.61,.36,1)",boxShadow:glow?`0 0 8px ${color}88`:"none",position:"relative",overflow:"hidden"}}>
      {p>0&&<div style={{position:"absolute",top:0,left:0,height:"100%",width:"40%",background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",animation:"barShimmer 2.2s ease-in-out infinite"}}/>}
    </div>
  </div>;
};
const SegBar=({pct,color,segments=16,h=8})=>{
  const filled=Math.floor((pct/100)*segments);
  const partial=((pct/100)*segments)-filled;
  return<div style={{display:"flex",gap:2,height:h}}>
    {Array.from({length:segments}).map((_,i)=>{
      const isFull=i<filled;
      const isPartial=i===filled&&partial>0;
      return<div key={i} style={{flex:1,background:C.dim,borderRadius:2,overflow:"hidden",position:"relative"}}>
        {(isFull||isPartial)&&<div style={{position:"absolute",inset:0,background:color,borderRadius:2,width:isFull?"100%":`${partial*100}%`,boxShadow:`0 0 6px ${color}aa`,animation:isFull?`segPop .3s ease ${i*0.02}s both`:"none"}}/>}
      </div>;
    })}
  </div>;
};
const Lbl=({children})=><div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.sub,textTransform:"uppercase"}}>{children}</div>;
function CountUp({value,duration=700,decimals=0,suffix=""}){
  const[display,setDisplay]=useState(value);
  const prevRef=useRef(value);
  const rafRef=useRef(null);
  useEffect(()=>{
    const from=prevRef.current;
    const to=value;
    if(from===to){setDisplay(to);return;}
    const start=performance.now();
    const ease=t=>1-Math.pow(1-t,3); // ease-out cubic, smooth & premium
    const tick=now=>{
      const t=Math.min(1,(now-start)/duration);
      const eased=ease(t);
      const current=from+(to-from)*eased;
      setDisplay(current);
      if(t<1) rafRef.current=requestAnimationFrame(tick);
      else{setDisplay(to);prevRef.current=to;}
    };
    rafRef.current=requestAnimationFrame(tick);
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);};
  },[value,duration]);
  const shown=decimals>0?display.toFixed(decimals):Math.round(display).toLocaleString();
  return<>{shown}{suffix}</>;
}

function Ring({value,size=64,strokeWidth=7,color,children,glow=false}){
  const r=(size-strokeWidth)/2;
  const circ=2*Math.PI*r;
  const offset=circ*(1-Math.max(0,Math.min(100,value))/100);
  return<div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.dim} strokeWidth={strokeWidth}/>
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{transition:"stroke-dashoffset .7s cubic-bezier(.22,.61,.36,1), stroke .4s ease",
          filter:glow?`drop-shadow(0 0 6px ${color}aa)`:"none"}}
      />
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
      {children}
    </div>
  </div>;
}
const Btn=({children,onClick,color,full,small})=>{
  const dk=[C.gold,C.emerald,C.amber,C.green].includes(color);
  return<button onClick={onClick} className="btn3d" style={{
    background:color,color:dk?"#000":"#fff",border:"none",
    borderRadius:small?9:12,
    padding:small?"6px 12px":"10px 16px",
    fontWeight:800,fontSize:small?12:13,cursor:"pointer",
    width:full?"100%":"auto",flexShrink:0,
    boxShadow:`0 3px 0 rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.25)`,
    transition:"transform .1s ease, box-shadow .1s ease",
  }}>{children}</button>;
};
const MStat=({icon,val,label,color})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:18}}>{icon}</div><div style={{fontSize:22,fontWeight:900,color,marginTop:2}}>{typeof val==="number"?<CountUp value={val}/>:val}</div><div style={{fontSize:10,color:C.sub,marginTop:1}}>{label}</div></div>;
const iS={background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"8px 12px",fontSize:13};
const tS={...iS,width:"100%",resize:"none",fontFamily:"inherit"};

// ── IMPACT BADGE ──
const ImpactPill=({cat,val})=>{
  if(val===0)return null;
  const positive=val>0;
  const catInfo=CATS[cat];
  return<div style={{display:"inline-flex",alignItems:"center",gap:4,background:positive?"rgba(16,185,129,0.12)":"rgba(244,63,94,0.12)",border:`1px solid ${positive?C.emerald:C.rose}40`,borderRadius:20,padding:"3px 8px",fontSize:11,fontWeight:700,color:positive?C.emerald:C.rose}}>
    {catInfo?.icon} {positive?"+":""}{val}%
  </div>;
};

// ── LOCAL ACTIVITY ANALYSIS (keyword + duration) ──
