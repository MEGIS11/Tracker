// ═══════════════════════════════════════════════════════
// DATA.JS — Constants, pastel palette, badges, ranks, new goals
// ═══════════════════════════════════════════════════════

const C={
  bg:"#fffdfa",          // Blanc cassé très doux / zen
  surface:"#f5edea",     // Rose poudré pastel très clair
  card:"#ffffff",        // Blanc pur pour les cartes
  border:"#f2d6df",      // Bordure rose poudré délicat
  muted:"#e0cbd4",
  dim:"#faeef2",
  text:"#2d2328",        // Texte sombre chaleureux (pas de noir pur)
  sub:"#8c7982",         // Texte secondaire doux
  
  // Palette pastel harmonieuse
  rose:"#ff7b9f",
  rosePale:"#ffe0ea",
  roseDeep:"#e0527f",
  green:"#5bba8f",       // Vert sauge pastel
  emerald:"#73d2a0",
  emeraldPale:"#e2f6ed",
  blue:"#64b5f6",        // Bleu ciel poudré
  skyPale:"#e3f2fd",
  amber:"#ffb74d",       // Pêche / Or doux
  goldPale:"#fff8e1",
  purple:"#b39ddb",      // Lavande douce
  lavender:"#ede7f6",
};

const SK="amaury-quest-v5";
const fmtLocalDate=(d)=>{
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
};
const TODAY=()=>fmtLocalDate(new Date());
const getWeekKey=()=>{
  const d=new Date();
  const day=d.getDay()===0?7:d.getDay();
  const monday=new Date(d);
  monday.setDate(d.getDate()-(day-1));
  return fmtLocalDate(monday);
};

const RANKS=[
  {min:1,max:2,icon:"🌱",name:"Graine de Sérénité",color:C.green},
  {min:3,max:5,icon:"💧",name:"Goutte de Pluie",color:C.blue},
  {min:6,max:9,icon:"🌸",name:"Bourgeon Éveillé",color:C.rose},
  {min:10,max:14,icon:"🌿",name:"Jeune Pousse Calme",color:C.green},
  {min:15,max:19,icon:"🍃",name:"Vent d'Apaisement",color:C.blue},
  {min:20,max:29,icon:"☀️",name:"Aube Sereine",color:C.amber},
  {min:30,max:39,icon:"🪵",name:"Racine Profonde",color:C.purple},
  {min:40,max:49,icon:"🪷",name:"Lotus de Conscience",color:C.rose},
  {min:50,max:999,icon:"✨",name:"Esprit Lumineux",color:C.gold},
];
const getRank=l=>RANKS.find(r=>l>=r.min&&l<=r.max)||RANKS[0];

// Paliers secrets pour la maîtrise de soi (No-Fap)
const MASTERY_MILESTONES=[
  { days: 3, title: "L'Étincelle de Volonté", desc: "Les premiers jours de clarté mentale.", xp: 100 },
  { days: 7, title: "Le Gardien du Seuil", desc: "Une première semaine complète de maîtrise.", xp: 250 },
  { days: 14, title: "L'Esprit de Source", desc: "Deux semaines d'énergie canalisée et retrouvée.", xp: 500 },
  { days: 21, title: "L'Ancrage Profond", desc: "Le seuil de transformation des habitudes.", xp: 800 },
  { days: 30, title: "Le Maître des Vents", desc: "Un mois entier de souveraineté sur soi.", xp: 1200 },
  { days: 50, title: "La Forêt Silencieuse", desc: "Une paix intérieure durable et inébranlable.", xp: 2000 },
  { days: 90, title: "Le Lotus d'Or", desc: "La métamorphose complète de l'esprit et du corps.", xp: 4000 },
];

const BADGES=[
  {id:"b_gym10",icon:"🏋️",name:"Corps Solide",desc:"10 séances de gym consécutives",cat:"Corps",rarity:"rare"},
  {id:"b_water7",icon:"💧",name:"Source Pure",desc:"7 jours d'hydratation parfaite",cat:"Corps",rarity:"rare"},
  {id:"b_sleep10",icon:"😴",name:"Nuit Douce",desc:"10 nuits de sommeil de qualité",cat:"Corps",rarity:"rare"},
  {id:"b_sun10",icon:"☀️",name:"Éveil Solaire",desc:"10 matins de lumière naturelle",cat:"Corps",rarity:"rare"},
  {id:"b_detox10",icon:"📵",name:"Silence Numérique",desc:"10 soirs sans écran avant de dormir",cat:"Esprit",rarity:"epic"},
  {id:"b_breath14",icon:"🌬️",name:"Souffle Maîtrisé",desc:"14 sessions de respiration anti-scroll",cat:"Esprit",rarity:"rare"},
  {id:"b_reading20",icon:"📚",name:"Page après Page",desc:"20 jours de lecture consécutifs",cat:"Esprit",rarity:"epic"},
  {id:"b_japanese",icon:"🎌",name:"Savoir d'Ailleurs",desc:"Quête japonais avancée",cat:"Esprit",rarity:"epic"},
  {id:"b_tidy10",icon:"🛏️",name:"Sanctuaire Intérieur",desc:"10 jours de chambre organisée",cat:"Discipline",rarity:"common"},
  {id:"b_mastery30",icon:"🪷",name:"Souveraineté",desc:"Atteindre 30 jours de maîtrise de soi",cat:"Maîtrise",rarity:"legendary"},
];

const RC={
  common:{bg:"#f5edea",border:"#e0cbd4",text:"#8c7982",glow:"none"},
  rare:{bg:"#e3f2fd",border:"#90caf9",text:"#1e88e5",glow:"0 0 10px rgba(100,181,246,0.3)"},
  epic:{bg:"#ede7f6",border:"#b39ddb",text:"#7e57c2",glow:"0 0 14px rgba(179,157,219,0.4)"},
  legendary:{bg:"#fff8e1",border:"#ffb74d",text:"#f57c00",glow:"0 0 18px rgba(255,183,77,0.5)"},
};

const XPT=Array.from({length:100},(_,i)=>Math.floor(120*Math.pow(1.38,i)));
const getLvl=xp=>{let l=1,r=xp;for(let i=0;i<XPT.length;i++){if(r>=XPT[i]){r-=XPT[i];l=i+2;}else break;}const n=XPT[l-1]||99999;return{lvl:l,rem:r,needed:n,pct:(r/n)*100};};

// NOUVELLES HABITUDES CORE (Mis à jour selon tes souhaits : fin du cuisine/dessin, ajout respiration, détox, lumière du matin, chambre organisée)
const CORE=[
  {id:"water",cat:"corps",icon:"💧",label:"Hydratation",unit:"ml",goal:2000,step:200,xp:25,color:C.blue},
  {id:"gym",cat:"corps",icon:"🏋️",label:"Séance Gym",unit:"min",goal:60,step:15,xp:50,color:C.purple},
  {id:"sleep",cat:"corps",icon:"😴",label:"Sommeil réparateur",unit:"h",goal:8,step:0,xp:35,color:C.purple},
  {id:"sun",cat:"corps",icon:"☀️",label:"Lumière naturelle matinale",unit:"bool",goal:1,step:1,xp:25,color:C.amber},
  {id:"breath",cat:"esprit",icon:"🌬️",label:"Respiration anti-scroll",unit:"fois",goal:3,step:1,xp:30,color:C.green},
  {id:"detox",cat:"esprit",icon:"📵",label:"Pas d'écran 1h avant dormir",unit:"bool",goal:1,step:1,xp:40,color:C.rose},
  {id:"reading",cat:"esprit",icon:"📚",label:"Lecture",unit:"min",goal:20,step:10,xp:30,color:C.blue},
  {id:"japanese",cat:"esprit",icon:"🎌",label:"Japonais",unit:"min",goal:30,step:10,xp:35,color:C.purple},
  {id:"tidy",cat:"discipline",icon:"🛏️",label:"Chambre propre & organisée",unit:"bool",goal:1,step:1,xp:25,color:C.green},
  {id:"stretching",cat:"corps",icon:"🧘",label:"Étirements",unit:"min",goal:10,step:5,xp:20,color:C.green},
];

const BONUS=[]; // Plus de bonus complexes (dessin / cuisine retirés)

const EQ_DEF=[
  {id:"backflip",icon:"🤸",label:"Apprendre le backflip",xp:500,milestones:["Headstand 10s","Backbend fluide","Backflip assisté","Backflip solo !"]},
  {id:"nihongo",icon:"🎌",label:"Maîtriser 100 mots japonais",xp:400,milestones:["25 mots","50 mots","75 mots","100 mots"]},
  {id:"pullups",icon:"💪",label:"Atteindre 15 tractions strictes",xp:450,milestones:["5 tractions","8 tractions","10 tractions","12 tractions","15 tractions !"]},
];

const RD=[
  {id:"tea",icon:"🍵",label:"Boisson ou thé de qualité en pleine conscience"},
  {id:"relax",icon:"🌿",label:"Moment de détente calme sans culpabilité"},
];
const RP=[
  {id:"p3",icon:"🌸",label:"Pillier de sérénité atteint",lvl:3},
  {id:"p10",icon:"⛩️",label:"Objectif voyage Japon",lvl:10},
  {id:"p20",icon:"🌟",label:"Maîtrise accomplie",lvl:20},
];
const CF=[
  {id:"s1",label:"Scroll impulsif / excessif",debt:1},
  {id:"s2",label:"Coucher tardif sur écran",debt:1},
  {id:"s3",label:"Manque de bienveillance envers soi",debt:1},
];
const RED=[
  {id:"r1",icon:"🌬️",label:"Session de respiration profonde x5",r:1},
  {id:"r2",icon:"🚶",label:"15 min de marche sans téléphone",r:1},
  {id:"r3",icon:"📖",label:"20 min de lecture calme",r:1},
];

const CATS={
  corps:{label:"Corps & Santé",icon:"💪",color:C.purple},
  esprit:{label:"Esprit & Clarté",icon:"🌿",color:C.green},
  discipline:{label:"Discipline & Cadre",icon:"🌸",color:C.rose},
};

const TABS=[
  {id:"dashboard",icon:"🌸",label:"Accueil"},
  {id:"habits",icon:"📋",label:"Habitudes"},
  {id:"epic",icon:"⚔️",label:"Épiques"},
  {id:"profile",icon:"🪷",label:"Profil"},
  {id:"rewards",icon:"🎁",label:"Plaisirs"},
  {id:"conscience",icon:"🍃",label:"Conscience"},
  {id:"settings",icon:"⚙️",label:"Réglages"},
];

const pct=(v,g)=>Math.min(100,Math.round((v/g)*100));
const getScoreColor=(v)=>{
  if(v<20)return C.rose;
  if(v<40)return C.amber;
  if(v<60)return C.blue;
  if(v<80)return C.green;
  return C.purple;
};
const calcSleep=(b,w)=>{if(!b||!w)return 0;const[bh,bm]=b.split(":").map(Number);const[wh,wm]=w.split(":").map(Number);let m=(wh*60+wm)-(bh*60+bm);if(m<0)m+=1440;return Math.round((m/60)*100)/100;};
const SG=8;

const mkDef=()=>({
  xp:0,streaks:{},perfectDays:0,currentStreak:0,todayKey:TODAY(),
  coreProgress:{},bonusProgress:{},checklistProgress:{},
  sleepBedtime:null,sleepWake:null,
  epicProgress:{},epicQuests:EQ_DEF,
  debt:0,conscience:[],
  // Nofap / Maîtrise de soi
  nofapStreak:0,
  nofapBest:0,
  nofapLastReset:TODAY(),
  unlockedMastery:[0], // Indices des paliers débloqués
  
  eveningDone:false,eveningNote:{good:"",improve:""},
  claimedPalier:[],unlockedBadges:[],newBadges:[],
  gymTotal:0,waterDays:0,sunDays:0,detoxDays:0,
  history:[],
  records:{bestStreak:0,bestWeekAvg:0,bestDayXP:0,bestDayScore:0},
  weeklyChallenge:null,
  dailyXPGained:0, dailyXPDate:null,
});

const isCoreOk=s=>CORE.every(h=>{
  if(h.id==="sleep")return calcSleep(s.sleepBedtime,s.sleepWake)>=SG;
  return(s.coreProgress?.[h.id]||0)>=h.goal;
});

const CAT_ORDER=["corps","esprit","discipline"];

const CHALLENGE_TEMPLATES={
  corps:[
    {id:"gym3",label:"3 séances de gym cette semaine",habitId:"gym",target:3,xp:120,icon:"🏋️"},
    {id:"water5",label:"Hydratation complète 5 jours",habitId:"water",target:5,xp:100,icon:"💧"},
  ],
  esprit:[
    {id:"detox5",label:"5 soirs sans écran avant de dormir",habitId:"detox",target:5,xp:130,icon:"📵"},
    {id:"breath7",label:"Respiration anti-scroll quotidienne",habitId:"breath",target:7,xp:120,icon:"🌬️"},
  ],
  discipline:[
    {id:"tidy7",label:"Garder la chambre propre 7 jours",habitId:"tidy",target:7,xp:100,icon:"🛏️"},
  ],
};

function generateWeeklyChallenge(){
  const weekKey=getWeekKey();
  const d=new Date();
  const weekNum=Math.floor((d-new Date(d.getFullYear(),0,1))/(7*86400000));
  const cat=CAT_ORDER[weekNum%CAT_ORDER.length];
  const templates=CHALLENGE_TEMPLATES[cat]||CHALLENGE_TEMPLATES.esprit;
  const chosen=templates[weekNum%templates.length];
  return{
    weekKey,cat,
    id:chosen.id,label:chosen.label,habitId:chosen.habitId,
    goal:chosen.target,current:0,xpReward:chosen.xp,icon:chosen.icon,
    done:false,claimed:false,
  };
}

const computeGlobalScore=s=>{
  const total=CORE.length;
  const done=CORE.filter(h=>{
    if(h.id==="sleep")return calcSleep(s.sleepBedtime,s.sleepWake)>=SG;
    return(s.coreProgress?.[h.id]||0)>=h.goal;
  }).length;
  const gs=total?Math.round((done/total)*100):0;
  return{gs};
};

const computeHabitCompletion=s=>{
  const hc={};
  Object.keys(CATS).forEach(cat=>{
    const all=CORE.filter(h=>h.cat===cat);
    if(!all.length){hc[cat]=0;return;}
    const tot=all.reduce((a,h)=>{
      if(h.id==="sleep")return a+pct(calcSleep(s.sleepBedtime,s.sleepWake),SG);
      const pg=s.coreProgress?.[h.id]||0;
      return a+pct(pg,h.goal);
    },0);
    hc[cat]=Math.round(tot/all.length);
  });
  return hc;
};

const chkBadges=s=>{
  const r=[],has=id=>(s.unlockedBadges||[]).includes(id),c=(id,cond)=>{if(cond&&!has(id))r.push(id);};
  c("b_gym10",(s.gymStreak||0)>=10);
  c("b_water7",(s.waterDays||0)>=7);
  c("b_sleep10",(s.sleepStreak||0)>=10);
  c("b_sun10",(s.sunDays||0)>=10);
  c("b_detox10",(s.detoxDays||0)>=10);
  c("b_breath14",(s.coreProgress?.breath||0)>=14);
  c("b_reading20",(s.readingStreak||0)>=20);
  c("b_tidy10",(s.tidyStreak||0)>=10);
  c("b_mastery30",(s.nofapStreak||0)>=30);
  return r;
};
