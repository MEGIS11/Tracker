// ═══════════════════════════════════════════════════════
// COMPONENTS.JS — Shared UI building blocks
// ═══════════════════════════════════════════════════════
const {useState,useEffect,useCallback,useRef}=React;

const Crd=({children,style={},accent})=><div style={{
  background:C.card,
  border:`1.5px solid ${accent?accent+"40":C.border}`,
  borderRadius:20,
  padding:18,
  boxShadow:"0 4px 20px -4px rgba(224,82,127,0.06)",
  position:"relative",
  ...style
}}>{children}</div>;

const Br=({val,max,color,h=8,glow})=>{
  const p=Math.min((val/max)*100,100);
  return<div style={{background:C.dim,borderRadius:10,height:h,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${p}%`,background:color,borderRadius:10,transition:"width .6s cubic-bezier(.22,.61,.36,1)",boxShadow:glow?`0 0 10px ${color}55`:"none",position:"relative"}}/>
  </div>;
};

const SegBar=({pct,color,segments=16,h=8})=>{
  const filled=Math.floor((pct/100)*segments);
  const partial=((pct/100)*segments)-filled;
  return<div style={{display:"flex",gap:3,height:h}}>
    {Array.from({length:segments}).map((_,i)=>{
      const isFull=i<filled;
      const isPartial=i===filled&&partial>0;
      return<div key={i} style={{flex:1,background:C.dim,borderRadius:3,overflow:"hidden",position:"relative"}}>
        {(isFull||isPartial)&&<div style={{position:"absolute",inset:0,background:color,borderRadius:3,width:isFull?"100%":`${partial*100}%`}}/>}
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
    const ease=t=>1-Math.pow(1-t,3);
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

const Btn=({children,onClick,color=C.rose,full,small})=>
  <button onClick={onClick} style={{
    background:color,color:"#fff",border:"none",
    borderRadius:small?12:16,
    padding:small?"8px 14px":"12px 20px",
    fontWeight:700,fontSize:small?12:14,cursor:"pointer",
    width:full?"100%":"auto",flexShrink:0,
    boxShadow:`0 4px 14px -3px ${color}66`,
    transition:"transform .2s ease, opacity .2s ease",
  }}>{children}</button>;

const MStat=({icon,val,label,color})=><div style={{background:C.card,border:`1.5px solid ${C.border}`,borderRadius:16,padding:"14px 10px",textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.02)"}}><div style={{fontSize:20}}>{icon}</div><div style={{fontSize:22,fontWeight:900,color,marginTop:4}}>{typeof val==="number"?<CountUp value={val}/>:val}</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>{label}</div></div>;

const iS={background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,color:C.text,padding:"10px 14px",fontSize:14};
const tS={...iS,width:"100%",resize:"none",fontFamily:"inherit"};
