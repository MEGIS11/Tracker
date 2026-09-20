// ═══════════════════════════════════════════════════════
// DATA.JS — Constants and pure data structures
// Colors, badges, ranks, habits, foods, XP tables, badge-check logic.
// No React here — safe to edit for rebalancing values (XP amounts,
// badge thresholds, food macros, daily targets) without touching
// any rendering or calculation logic.
// Load order: data.js -> engine.js -> components.js -> screens.js -> app.js
// ═══════════════════════════════════════════════════════

const C={
  bg:"#080810",surface:"#0f0f1c",card:"#13131f",border:"#1e1e35",muted:"#2a2a45",dim:"#30304a",
  text:"#eeeeff",sub:"#6060a0",
  purple:"#7c3aed",violet:"#a78bfa",lavender:"#c4b5fd",
  green:"#10b981",emerald:"#34d399",
  yellow:"#f59e0b",gold:"#fbbf24",
  red:"#e11d48",rose:"#f43f5e",
  blue:"#0ea5e9",sky:"#38bdf8",
  orange:"#ea580c",amber:"#fb923c",
  pink:"#db2777",fuchsia:"#f472b6",
};

const SK="amaury-quest-v4";
const fmtLocalDate=(d)=>{
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
};
const TODAY=()=>fmtLocalDate(new Date());
const getWeekKey=()=>{
  const d=new Date();
  const day=d.getDay()===0?7:d.getDay(); // Monday=1..Sunday=7
  const monday=new Date(d);
  monday.setDate(d.getDate()-(day-1));
  return fmtLocalDate(monday);
};

const RANKS=[
  {min:1,max:2,icon:"🥚",name:"L'Œuf Cosmique",color:"#94a3b8"},
  {min:3,max:5,icon:"🌱",name:"Apprenti du Chaos",color:C.emerald},
  {min:6,max:9,icon:"⚔️",name:"Écuyer des Temps Modernes",color:C.sky},
  {min:10,max:14,icon:"🐺",name:"Loup Solitaire Discipliné",color:C.violet},
  {min:15,max:19,icon:"🔥",name:"Guerrier de l'Aube",color:C.amber},
  {min:20,max:29,icon:"🏯",name:"Samouraï du Quotidien",color:C.gold},
  {min:30,max:39,icon:"🌊",name:"Maître des Flots Intérieurs",color:C.blue},
  {min:40,max:49,icon:"⚡",name:"Titan Silencieux",color:C.rose},
  {min:50,max:999,icon:"🌌",name:"Éveillé des Étoiles",color:"#e879f9"},
];
const getRank=l=>RANKS.find(r=>l>=r.min&&l<=r.max)||RANKS[0];

const BADGES=[
  {id:"b_gym10",icon:"🏋️",name:"No Days Off",desc:"10 séances de gym consécutives",cat:"Corps",rarity:"rare"},
  {id:"b_gym30",icon:"💪",name:"Bras de Titan",desc:"30 séances de gym au total",cat:"Corps",rarity:"epic"},
  {id:"b_water7",icon:"💧",name:"Chameau Légendaire",desc:"7 jours d'hydratation parfaite",cat:"Corps",rarity:"rare"},
  {id:"b_water30",icon:"🌊",name:"Fontaine Vivante",desc:"30 jours d'hydratation parfaite",cat:"Corps",rarity:"epic"},
  {id:"b_sleep10",icon:"😴",name:"Hibernation Royale",desc:"10 nuits de sommeil parfait de suite",cat:"Corps",rarity:"rare"},
  {id:"b_wakeup14",icon:"🌅",name:"L'Aurore m'appartient",desc:"14 levers avant 8h30 de suite",cat:"Corps",rarity:"epic"},
  {id:"b_backflip",icon:"🤸",name:"Corps de Légende",desc:"Quête backflip terminée",cat:"Corps",rarity:"legendary"},
  {id:"b_reading20",icon:"📚",name:"Bibliothèque Ambulante",desc:"20 jours de lecture consécutifs",cat:"Cerveau",rarity:"epic"},
  {id:"b_japanese",icon:"🎌",name:"Fils de Miyazaki",desc:"Quête 100 mots japonais terminée",cat:"Cerveau",rarity:"epic"},
  {id:"b_drawing",icon:"🎨",name:"Da Vinci du Dimanche",desc:"Carnet de 25 dessins terminé",cat:"Cerveau",rarity:"rare"},
  {id:"b_onepiece30",icon:"🏴‍☠️",name:"Nakama Éternel",desc:"30 épisodes One Piece trackés",cat:"Cerveau",rarity:"rare"},
  {id:"b_style",icon:"👔",name:"Séducteur Structuré",desc:"Style signature 5 tenues terminé",cat:"Style",rarity:"rare"},
  {id:"b_grooming14",icon:"✨",name:"Gentleman Fantôme",desc:"14 jours de routine apparence parfaite",cat:"Style",rarity:"epic"},
  {id:"b_cooking",icon:"🍳",name:"Gordon en Devenir",desc:"5 plats cuisinés de A à Z",cat:"Discipline",rarity:"rare"},
  {id:"b_tidy10",icon:"🧹",name:"Moine Zen de l'IKEA",desc:"10 jours de rangement consécutifs",cat:"Discipline",rarity:"common"},
  {id:"b_meditation",icon:"🧘",name:"Moine Urbain",desc:"7 jours de méditation consécutifs",cat:"Discipline",rarity:"rare"},
  {id:"b_nocturne",icon:"🌙",name:"Noctambule Repenti",desc:"10 couchers avant minuit de suite",cat:"Discipline",rarity:"rare"},
  {id:"b_protein14",icon:"🥩",name:"Carnivore Discipliné",desc:"14 jours d'objectif protéines atteint",cat:"Nutrition",rarity:"rare"},
  {id:"b_protein30",icon:"💪",name:"Machine à Croître",desc:"30 jours d'objectif protéines atteint",cat:"Nutrition",rarity:"epic"},
  {id:"b_veggie7",icon:"🥦",name:"Jardinier de l'Intérieur",desc:"7 jours de 5 fruits et légumes",cat:"Nutrition",rarity:"rare"},
  {id:"b_veggie30",icon:"🌱",name:"Végétal Suprême",desc:"30 jours de fruits et légumes parfaits",cat:"Nutrition",rarity:"epic"},
  {id:"b_perfect7",icon:"📅",name:"Machine",desc:"7 jours parfaits de suite",cat:"Légendaire",rarity:"epic"},
  {id:"b_perfect30",icon:"🌌",name:"Le Mois Parfait",desc:"30 jours parfaits au total",cat:"Légendaire",rarity:"legendary"},
  {id:"b_pure14",icon:"👁️",name:"Âme Pure",desc:"14 jours sans aucune dette conscience",cat:"Légendaire",rarity:"legendary"},
  {id:"b_streak21",icon:"⚡",name:"Mode Berserk",desc:"21 jours de streak global",cat:"Légendaire",rarity:"legendary"},
  {id:"b_conscience7",icon:"🙏",name:"Conscience Nette",desc:"7 jours sans dette conscience",cat:"Légendaire",rarity:"epic"},
  {id:"b_japan",icon:"🇯🇵",name:"Samouraï de l'Été",desc:"Tous les badges avant le départ au Japon",cat:"Légendaire",rarity:"legendary"},
];

const RC={
  common:{bg:"#1e293b",border:"#334155",text:"#94a3b8",glow:"none"},
  rare:{bg:"#1e1b4b",border:"#4338ca",text:"#818cf8",glow:"0 0 12px rgba(99,102,241,0.4)"},
  epic:{bg:"#2d1b69",border:"#7c3aed",text:"#a78bfa",glow:"0 0 16px rgba(124,58,237,0.5)"},
  legendary:{bg:"#451a03",border:"#f59e0b",text:"#fbbf24",glow:"0 0 20px rgba(245,158,11,0.6)"},
};

const XPT=Array.from({length:100},(_,i)=>Math.floor(120*Math.pow(1.38,i)));
const getLvl=xp=>{let l=1,r=xp;for(let i=0;i<XPT.length;i++){if(r>=XPT[i]){r-=XPT[i];l=i+2;}else break;}const n=XPT[l-1]||99999;return{lvl:l,rem:r,needed:n,pct:(r/n)*100};};

const CORE=[
  {id:"water",cat:"corps",icon:"💧",label:"Hydratation",unit:"ml",goal:2000,step:200,xp:30,color:C.sky},
  {id:"gym",cat:"corps",icon:"🏋️",label:"Séance Gym",unit:"min",goal:90,step:15,xp:55,color:C.violet},
  {id:"sleep",cat:"corps",icon:"😴",label:"Sommeil",unit:"h",goal:8.67,step:0,xp:35,color:C.purple},
  {id:"protein",cat:"nutrition",icon:"🥩",label:"Protéines",unit:"g",goal:150,step:10,xp:40,color:C.amber},
  {id:"veggies",cat:"nutrition",icon:"🥦",label:"Fruits & Légumes",unit:"port.",goal:5,step:1,xp:30,color:C.emerald},
  {id:"japanese",cat:"cerveau",icon:"🎌",label:"Japonais",unit:"min",goal:60,step:10,xp:45,color:C.fuchsia},
  {id:"reading",cat:"cerveau",icon:"📚",label:"Lecture",unit:"min",goal:30,step:10,xp:35,color:C.gold},
  {id:"grooming",cat:"apparence",icon:"✨",label:"Routine apparence",unit:"check",goal:4,step:1,xp:30,color:C.amber,
    checklist:["Rasage / visage","Skincare","Parfum","Tenue soignée"]},
  {id:"wakeup",cat:"discipline",icon:"🌅",label:"Lever avant 8h30",unit:"bool",goal:1,step:1,xp:25,color:C.gold},
  {id:"meditation",cat:"discipline",icon:"🧘",label:"Méditation",unit:"min",goal:10,step:5,xp:30,color:C.emerald},
  {id:"onepiece",cat:"discipline",icon:"🏴‍☠️",label:"One Piece",unit:"ep",goal:2,step:1,xp:20,color:C.red},
];

const BONUS=[
  {id:"stretching",cat:"corps",icon:"🤸",label:"Étirements",unit:"min",goal:15,step:5,xp:20,color:C.emerald},
  {id:"drawing",cat:"cerveau",icon:"🎨",label:"Dessin",unit:"min",goal:20,step:5,xp:25,color:C.fuchsia},
  {id:"tidy",cat:"discipline",icon:"🧹",label:"Ranger",unit:"bool",goal:1,step:1,xp:15,color:C.sub},
  {id:"cooking",cat:"discipline",icon:"🍳",label:"Cuisiner",unit:"bool",goal:1,step:1,xp:35,color:C.amber},
];

const EQ_DEF=[
  {id:"backflip",icon:"🤸",label:"Faire un backflip",xp:500,milestones:["Headstand 10s","Backbend fluide","Backflip assisté","Backflip solo !"]},
  {id:"cuisine5",icon:"🍽️",label:"Cuisiner 5 plats de A à Z",xp:300,milestones:["Plat 1","Plat 2","Plat 3","Plat 4","Plat 5"]},
  {id:"nihongo",icon:"🎌",label:"+100 mots japonais",xp:400,milestones:["25 mots","50 mots","75 mots","100 mots"]},
  {id:"meditation7",icon:"🧘",label:"7 jours méditation consécutifs",xp:200,milestones:["Jour 3","Jour 5","Jour 7"]},
  {id:"sketchbook",icon:"🎨",label:"Carnet de croquis (25 dessins)",xp:350,milestones:["5 dessins","10 dessins","15 dessins","20 dessins","25 dessins !"]},
  {id:"style",icon:"👔",label:"Style signature (5 tenues)",xp:300,milestones:["Tenue 1","Tenue 2","Tenue 3","Tenue 4","Tenue 5"]},
  {id:"pullups",icon:"💪",label:"15 tractions",xp:450,milestones:["5 tractions","8 tractions","10 tractions","12 tractions","15 tractions !"]},
];

const RD=[
  {id:"match",icon:"⚽",label:"Match / épisode tard le soir"},
  {id:"series",icon:"📺",label:"2 épisodes série bonus"},
];
const SCREEN_APPS=[
  {id:"snap",icon:"👻",label:"Snapchat",baseMin:5,maxMin:50,color:C.gold},
  {id:"coc",icon:"⚔️",label:"Clash of Clans",baseMin:5,maxMin:40,color:C.violet},
  {id:"insta",icon:"📸",label:"Instagram",baseMin:5,maxMin:30,color:C.fuchsia},
];
const RP=[
  {id:"p3",icon:"🎮",label:"Récompenses quotidiennes débloquées",lvl:3},
  {id:"p8",icon:"🇯🇵",label:"Budget Japon (Pokémon, mangas, figurines)",lvl:8},
  {id:"p12",icon:"😴",label:"Journée off totale sans culpabilité",lvl:12},
  {id:"p20",icon:"🏆",label:"Grosse récompense — à définir !",lvl:20},
];
const CF=[
  {id:"s1",label:"Scroll excessif",debt:1},
  {id:"s2",label:"Couché tard (sans raison valable)",debt:1},
  {id:"s3",label:"Malbouffe",debt:1},
  {id:"s4",label:"Séance gym ratée sans raison",debt:2},
];
const RED=[
  {id:"r1",icon:"💪",label:"30 pompes",r:1},
  {id:"r2",icon:"🏃",label:"20 min cardio bonus",r:1},
  {id:"r3",icon:"📖",label:"30 min lecture bonus",r:1},
  {id:"r4",icon:"🧘",label:"15 min méditation bonus",r:1},
];

const CATS={
  corps:{label:"Corps",icon:"💪",color:C.violet},
  nutrition:{label:"Nutrition",icon:"🥗",color:C.emerald},
  cerveau:{label:"Cerveau",icon:"🧠",color:C.sky},
  apparence:{label:"Apparence",icon:"✨",color:C.amber},
  discipline:{label:"Discipline",icon:"🎯",color:C.fuchsia},
  social:{label:"Social",icon:"🤝",color:C.orange},
};

const TABS=[
  {id:"dashboard",icon:"🏠",label:"Accueil"},
  {id:"habits",icon:"📋",label:"Habitudes"},
  {id:"epic",icon:"⚔️",label:"Épiques"},
  {id:"profile",icon:"🃏",label:"Profil"},
  {id:"rewards",icon:"🎁",label:"Récompenses"},
  {id:"journal",icon:"👁️",label:"Journal"},
  {id:"settings",icon:"⚙️",label:"Réglages"},
];

const pct=(v,g)=>Math.min(100,Math.round((v/g)*100));
const getScoreColor=(v)=>{
  if(v<20)return C.rose;
  if(v<40)return C.amber;
  if(v<60)return C.gold;
  if(v<80)return C.emerald;
  return C.sky;
};
const calcSleep=(b,w)=>{if(!b||!w)return 0;const[bh,bm]=b.split(":").map(Number);const[wh,wm]=w.split(":").map(Number);let m=(wh*60+wm)-(bh*60+bm);if(m<0)m+=1440;return Math.round((m/60)*100)/100;};
const SG=8+40/60;

const mkDef=()=>({
  xp:0,streaks:{},perfectDays:0,currentStreak:0,todayKey:TODAY(),
  coreProgress:{},bonusProgress:{},checklistProgress:{},
  sleepBedtime:null,sleepWake:null,
  epicProgress:{},epicQuests:EQ_DEF,
  debt:0,conscience:[],
  activities:[],
  activityImpacts:{corps:0,nutrition:0,cerveau:0,apparence:0,discipline:0,social:0},
  eveningDone:false,eveningNote:{good:"",improve:""},
  claimedPalier:[],unlockedBadges:[],newBadges:[],
  gymTotal:0,waterDays:0,onepieceTotal:0,proteinDays:0,veggieDays:0,
  gymStreak:0,wakeupStreak:0,groomingStreak:0,sleepStreak:0,
  meditationStreak:0,readingStreak:0,tidyStreak:0,
  nocturneStreak:0,conscienceCleanStreak:0,proteinStreak:0,veggieStreak:0,
  history:[],
  catBase:{corps:50,nutrition:50,cerveau:50,apparence:50,discipline:50,social:50},
  screenUsage:{},
  records:{bestStreak:0,bestWeekAvg:0,bestDayXP:0,bestDayScore:0},
  weeklyChallenge:null, // {weekKey, cat, habitId, goal, current, xpReward, done, claimed}
  dailyXPGained:0, dailyXPDate:null,
});

const isCoreOk=s=>CORE.every(h=>{
  if(h.unit==="check")return Object.values(s.checklistProgress?.grooming||{}).filter(Boolean).length>=h.goal;
  if(h.id==="sleep")return calcSleep(s.sleepBedtime,s.sleepWake)>=SG;
  return(s.coreProgress?.[h.id]||0)>=h.goal;
});

const CAT_ORDER=["corps","nutrition","cerveau","apparence","discipline","social"];

const CHALLENGE_TEMPLATES={
  corps:[
    {id:"gym3",label:"3 séances de gym cette semaine",habitId:"gym",target:3,xp:120,icon:"🏋️"},
    {id:"water7",label:"Hydratation complète 5 jours sur 7",habitId:"water",target:5,xp:100,icon:"💧"},
    {id:"sleep5",label:"5 nuits de sommeil complet",habitId:"sleep",target:5,xp:110,icon:"😴"},
  ],
  nutrition:[
    {id:"protein5",label:"Objectif protéines atteint 5 jours",habitId:"protein",target:5,xp:110,icon:"🥩"},
    {id:"veg5",label:"5 fruits & légumes, 5 jours sur 7",habitId:"veggies",target:5,xp:100,icon:"🥦"},
  ],
  cerveau:[
    {id:"jap5",label:"Japonais 5 jours cette semaine",habitId:"japanese",target:5,xp:120,icon:"🎌"},
    {id:"read4",label:"Lecture 4 jours cette semaine",habitId:"reading",target:4,xp:90,icon:"📚"},
  ],
  apparence:[
    {id:"groom5",label:"Routine apparence complète 5 jours",habitId:"grooming",target:5,xp:100,icon:"✨"},
  ],
  discipline:[
    {id:"med5",label:"Méditation 5 jours cette semaine",habitId:"meditation",target:5,xp:100,icon:"🧘"},
    {id:"wake5",label:"Lever avant 8h30, 5 jours sur 7",habitId:"wakeup",target:5,xp:110,icon:"🌅"},
    {id:"clean7",label:"7 jours sans dette conscience",habitId:"__debtfree",target:7,xp:150,icon:"🙏"},
  ],
};

function generateWeeklyChallenge(){
  const weekKey=getWeekKey();
  const d=new Date();
  const weekNum=Math.floor((d-new Date(d.getFullYear(),0,1))/(7*86400000));
  const cat=CAT_ORDER[weekNum%CAT_ORDER.length];
  const templates=CHALLENGE_TEMPLATES[cat]||CHALLENGE_TEMPLATES.discipline;
  const chosen=templates[weekNum%templates.length];
  return{
    weekKey,cat,
    id:chosen.id,label:chosen.label,habitId:chosen.habitId,
    goal:chosen.target,current:0,xpReward:chosen.xp,icon:chosen.icon,
    done:false,claimed:false,
  };
}

const computeGlobalScore=s=>{
  const cs={};
  const base=s.catBase||{};
  Object.keys(CATS).forEach(cat=>{
    const b=base[cat]!==undefined?base[cat]:50;
    const impact=s.activityImpacts?.[cat]||0;
    cs[cat]=Math.max(0,Math.min(100,Math.round(b+impact)));
  });
  const gs=Math.round(Object.values(cs).reduce((a,b)=>a+b,0)/Object.keys(CATS).length);
  return{cs,gs};
};

// Habits still track their own completion % for the Habitudes tab display (XP/streaks unaffected)
const computeHabitCompletion=s=>{
  const hc={};
  Object.keys(CATS).forEach(cat=>{
    const all=[...CORE.filter(h=>h.cat===cat),...BONUS.filter(h=>h.cat===cat)];
    if(!all.length){hc[cat]=0;return;}
    const tot=all.reduce((a,h)=>{
      if(h.unit==="check")return a+pct(Object.values(s.checklistProgress?.grooming||{}).filter(Boolean).length,h.goal);
      if(h.id==="sleep")return a+pct(calcSleep(s.sleepBedtime,s.sleepWake),SG);
      const pg=BONUS.find(b=>b.id===h.id)?(s.bonusProgress?.[h.id]||0):(s.coreProgress?.[h.id]||0);
      return a+pct(pg,h.goal);
    },0);
    hc[cat]=Math.round(tot/all.length);
  });
  return hc;
};

// Compute tomorrow's morning starting base per category: drift halfway toward 50 from today's end-of-day score
const computeNextDayBase=(cs)=>{
  const next={};
  Object.keys(CATS).forEach(cat=>{
    const today=cs[cat]??50;
    next[cat]=Math.round(today+(50-today)*0.4); // 40% drift toward neutral 50
  });
  return next;
};

const chkBadges=s=>{
  const r=[],has=id=>(s.unlockedBadges||[]).includes(id),c=(id,cond)=>{if(cond&&!has(id))r.push(id);};
  c("b_gym10",(s.gymStreak||0)>=10);c("b_gym30",(s.gymTotal||0)>=30);
  c("b_water7",(s.waterDays||0)>=7);c("b_water30",(s.waterDays||0)>=30);
  c("b_sleep10",(s.sleepStreak||0)>=10);c("b_wakeup14",(s.wakeupStreak||0)>=14);
  c("b_backflip",(s.epicProgress?.backflip||0)>=4);
  c("b_reading20",(s.readingStreak||0)>=20);
  c("b_japanese",(s.epicProgress?.nihongo||0)>=4);
  c("b_drawing",(s.epicProgress?.sketchbook||0)>=5);
  c("b_onepiece30",(s.onepieceTotal||0)>=30);
  c("b_style",(s.epicProgress?.style||0)>=5);
  c("b_grooming14",(s.groomingStreak||0)>=14);
  c("b_cooking",(s.epicProgress?.cuisine5||0)>=5);
  c("b_tidy10",(s.tidyStreak||0)>=10);
  c("b_meditation",(s.epicProgress?.meditation7||0)>=3);
  c("b_nocturne",(s.nocturneStreak||0)>=10);
  c("b_protein14",(s.proteinStreak||0)>=14);c("b_protein30",(s.proteinDays||0)>=30);
  c("b_veggie7",(s.veggieStreak||0)>=7);c("b_veggie30",(s.veggieDays||0)>=30);
  c("b_perfect7",(s.currentStreak||0)>=7);c("b_perfect30",(s.perfectDays||0)>=30);
  c("b_pure14",(s.conscienceCleanStreak||0)>=14);c("b_streak21",(s.currentStreak||0)>=21);
  c("b_conscience7",(s.conscienceCleanStreak||0)>=7);
  const ae=BADGES.filter(b=>b.id!=="b_japan").every(b=>(s.unlockedBadges||[]).includes(b.id));
  c("b_japan",ae);
  return r;
};


