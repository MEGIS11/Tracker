// ═══════════════════════════════════════════════════════
// ENGINE.JS — Journal analysis engine
// analyzeActivity() is the single entry point: takes free-text
// French input, returns category impacts (-20..20 per category).
// Contains: FOOD_DB (nutrition lookup), bellCurve() (duration-response
// scoring for sleep/gym/study/meditation/etc.), special-case handlers
// (sleep, gym, cardio, walking, stretching, work, meditation, reading,
// chess, gaming, porn), and the keyword-matching fallback DB for
// everything else. Depends on: nothing (pure function, uses global C
// from data.js only for nothing — no color logic here).
// Load order: data.js -> engine.js -> components.js -> screens.js -> app.js
// ═══════════════════════════════════════════════════════

function analyzeActivity(text){
  return new Promise(resolve=>{
    const t=text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    const Z={corps:0,nutrition:0,cerveau:0,apparence:0,discipline:0,social:0};

    // Extract duration in minutes — prioritize durations near duration-context words ("pendant", "durant")
    // and duration-shaped numbers, while avoiding false positives from clock times ("à 14h", "vers 23h")
    let mins=0;
    // Clock-time patterns to EXCLUDE from duration matching: "à 14h", "vers 23h", "de 8h à 9h" (schedule mentions)
    const clockTimePattern=/\b(a|à|vers|des|depuis)\s+\d+[\.,]?\d*\s*h\b/g;
    const excludedRanges=[];
    let cm;
    while((cm=clockTimePattern.exec(t))!==null){
      excludedRanges.push([cm.index,cm.index+cm[0].length]);
    }
    const isExcluded=(idx)=>excludedRanges.some(([s,e])=>idx>=s&&idx<e);

    const hMatches=[...t.matchAll(/(\d+[\.,]?\d*)\s*h(?:eures?)?\b/g)].filter(m=>!isExcluded(m.index));
    const mMatches=[...t.matchAll(/(\d+[\.,]?\d*)\s*min(?:utes?)?\b/g)].filter(m=>!isExcluded(m.index));
    const secMatches=[...t.matchAll(/(\d+[\.,]?\d*)\s*sec(?:ondes?)?\b/g)].filter(m=>!isExcluded(m.index));
    if(hMatches.length) mins+=parseFloat(hMatches[0][1].replace(",","."))*60;
    if(mMatches.length) mins+=parseFloat(mMatches[0][1].replace(",","."));
    if(secMatches.length) mins+=parseFloat(secMatches[0][1].replace(",","."))/60;
    if(mins===0) mins=30; // default if no duration found
    // Safety cap: no single logged activity is realistically longer than 6h — prevents any residual mis-extraction from exploding the multiplier
    mins=Math.min(mins,360);

    // Duration multiplier: base is 30min
    const mul=Math.min(mins/30, 6); // cap at 6x (3h)

    // Intensity detection for sport activities (léger/modéré/intense)
    const intenseWords=["intense","hiit","a fond","tres dur","très dur","killer","explosif","max effort","a bloc","à bloc"];
    const lightWords=["seance legere","séance légère","entrainement leger","tranquille","recup","récup","balade tranquille","seance facile","séance facile"];
    const isIntense=intenseWords.some(w=>t.includes(w));
    const isLight=lightWords.some(w=>t.includes(w));
    const sportIntensityMul=isIntense?1.35:isLight?0.7:1;

    // Late-night detection
    const lateNight=/\b(tard|nuit|minuit|3h|2h|1h du mat|insomnie)\b/.test(t);

    // === Bell-curve helper: score peaks at optimal range, tapers below and above ===
    // segments: array of {upTo (minutes), fn(minutes)->score 0..1} evaluated in order
    const bellCurve=(minutes,{lowEnd,optStart,optEnd,highEnd,plateauAfter})=>{
      if(minutes<=0)return 0;
      if(minutes<lowEnd) return (minutes/lowEnd)*0.25; // very little benefit below low threshold
      if(minutes<optStart) return 0.25+((minutes-lowEnd)/(optStart-lowEnd))*0.75; // ramping up to optimal
      if(minutes<=optEnd) return 1; // optimal plateau = full score
      if(minutes<highEnd) return 1-((minutes-optEnd)/(highEnd-optEnd))*0.3; // gentle taper past optimal
      if(plateauAfter) return 0.7; // plateaus, never penalized further
      return Math.max(0.4,0.7-((minutes-highEnd)/60)*0.15); // slow decline if excess is meaningfully penalized
    };

    // === SPECIAL CASE: Sieste checked FIRST (priority) to avoid fragile exclusion logic ===
    if(t.includes("sieste")){
      // short naps are good, long naps (>1h30) can disrupt night sleep — mild bell curve
      const score=bellCurve(mins,{lowEnd:10,optStart:20,optEnd:30,highEnd:90,plateauAfter:false});
      resolve({...Z,corps:Math.round(score*8),cerveau:Math.round(score*5)});
      return;
    }
    // === SPECIAL CASE: Night sleep (bell curve, Corps + light Cerveau, NOT Discipline) ===
    const sleepWords=["dormi","dors","sommeil","nuit de sommeil"];
    if(sleepWords.some(w=>t.includes(w))){
      // optimal 8-9h for an 18yo athletic male
      const score=bellCurve(mins,{lowEnd:180,optStart:480,optEnd:540,highEnd:600,plateauAfter:true}); // 3h low, 8-9h optimal, plateaus after 10h
      resolve({...Z,corps:Math.round(score*18),cerveau:Math.round(score*9)});
      return;
    }

    // === SPECIAL CASE: Gym/Muscu (bell curve, plateau after — never penalized for a long session) ===
    const gymWords=["gym","muscu","musculation","soulevé","haltere","kettlebell","barbell","bench","squat","deadlift","tractions","pompes","dips","abdos","gainage","planche","crossfit"];
    if(gymWords.some(w=>t.includes(w))){
      const score=bellCurve(mins,{lowEnd:15,optStart:45,optEnd:90,highEnd:120,plateauAfter:true});
      const eff=score*sportIntensityMul;
      resolve({...Z,corps:Math.round(Math.min(20,eff*17)),cerveau:1,apparence:Math.round(eff*3),discipline:Math.round(eff*6)});
      return;
    }

    // === SPECIAL CASE: Cardio/Course (bell curve, plateaus after 60min) ===
    const cardioWords=["course","courir","jogging","sprint","cardio","run","hiit","velo","cyclisme","natation","nager","spinning"];
    if(cardioWords.some(w=>t.includes(w))){
      const score=bellCurve(mins,{lowEnd:10,optStart:20,optEnd:45,highEnd:60,plateauAfter:true});
      const eff=score*sportIntensityMul;
      resolve({...Z,corps:Math.round(Math.min(20,eff*16)),cerveau:Math.round(eff*3),apparence:Math.round(eff*2),discipline:Math.round(eff*5)});
      return;
    }

    // === SPECIAL CASE: Marche (slow taper after 90min, never harshly penalized) ===
    const walkWords=["marche","marcher","balade","balader","promenade","promener","randonnee","randonner","hiking"];
    if(walkWords.some(w=>t.includes(w))){
      const score=bellCurve(mins,{lowEnd:5,optStart:20,optEnd:60,highEnd:120,plateauAfter:true});
      const isHike=["randonnee","randonner","hiking"].some(w=>t.includes(w));
      resolve({...Z,corps:Math.round(score*(isHike?9:7)),cerveau:Math.round(score*(isHike?6:3)),discipline:Math.round(score*3)});
      return;
    }

    // === SPECIAL CASE: Étirements/Mobilité (short optimal window) ===
    const stretchWords=["etirement","etirer","stretching","souplesse","mobilite","pilates","yoga"];
    if(stretchWords.some(w=>t.includes(w))){
      const score=bellCurve(mins,{lowEnd:5,optStart:10,optEnd:20,highEnd:40,plateauAfter:true});
      resolve({...Z,corps:Math.round(score*7),cerveau:Math.round(score*3),apparence:1,discipline:Math.round(score*4)});
      return;
    }

    // === SPECIAL CASE: Travail/Révisions (30min baseline, optimal 3-4h, plateaus after — mix Cerveau + Discipline) ===
    const workWords=["travail","travailler","bosser","bosse","boulot","stage","job","revision","révision","reviser","réviser","etude","étude","etudier","étudier","cours"];
    if(workWords.some(w=>t.includes(w))){
      const score=bellCurve(mins,{lowEnd:20,optStart:180,optEnd:240,highEnd:300,plateauAfter:true}); // 30min = solid baseline, ramps to optimal 3-4h, plateaus after 5h
      resolve({...Z,cerveau:Math.round(score*13),discipline:Math.round(score*13)});
      return;
    }

    // === SPECIAL CASE: Méditation (tight optimal window, real diminishing returns past 20min) ===
    if(["meditation","mediter","pleine conscience","mindfulness"].some(w=>t.includes(w))){
      const score=bellCurve(mins,{lowEnd:3,optStart:10,optEnd:20,highEnd:40,plateauAfter:true});
      resolve({...Z,corps:Math.round(score*2),cerveau:Math.round(score*7),discipline:Math.round(score*8)});
      return;
    }

    // === SPECIAL CASE: Lecture/Japonais/Codage/Écriture (gentle slowdown after 60-90min, never penalized) ===
    const deepFocusWords=["livre","lire","lu ","lecture","roman","bouquin","bd","manga","essai","japonais","kanji","hiragana","katakana","duolingo","coder","programmer","code","dev","javascript","python","ecrire","rediger","dissertation","poeme","poésie"];
    if(deepFocusWords.some(w=>t.includes(w))){
      const score=bellCurve(mins,{lowEnd:5,optStart:30,optEnd:90,highEnd:150,plateauAfter:true});
      resolve({...Z,cerveau:Math.round(score*11),discipline:Math.round(score*6)});
      return;
    }

    // === SPECIAL CASE: Échecs/Jeux de réflexion (plateau after 45-60min mental fatigue) ===
    if(["echecs","chess","sudoku","puzzle","enigme","mots croises","scrabble"].some(w=>t.includes(w))){
      const score=bellCurve(mins,{lowEnd:5,optStart:20,optEnd:45,highEnd:60,plateauAfter:true});
      const isOnline=["echecs en ligne","chess.com","lichess"].some(w=>t.includes(w));
      resolve({...Z,cerveau:Math.round(score*10),discipline:Math.round(score*6),social:isOnline?Math.round(score*3):0});
      return;
    }

    // === SPECIAL CASE: Video games (nuanced by game type + duration + time of day) ===
    const competitiveGames=["fortnite","cod","call of duty","warzone","apex","valorant","lol","league of legends","overwatch","pubg"];
    const casualMobileGames=["brawl stars","clash royale","clash of clans","candy crush","subway surfer","mobile legends"];
    const gamingWords=["jeux video","jeux vidéo","gaming","gamer","ps5","ps4","xbox","switch","console","jouer a","jouer à","fifa","minecraft","roblox"];
    const isGaming=gamingWords.some(w=>t.includes(w))||competitiveGames.some(w=>t.includes(w))||casualMobileGames.some(w=>t.includes(w));
    if(isGaming){
      const isCompetitive=competitiveGames.some(w=>t.includes(w));
      const isCasualMobile=casualMobileGames.some(w=>t.includes(w));
      // base impact per 30 min — casual mobile games are mild, competitive console games hit harder
      let base=isCasualMobile?-2:isCompetitive?-6:-4;
      // duration makes it worse non-linearly for gaming specifically
      const gameMul=Math.min(Math.pow(mins/30,1.3),8);
      let discipline=base*gameMul;
      let corps=Math.min(0,-1*gameMul*0.4);
      let cerveau=isCasualMobile?0:Math.min(0,-1*gameMul*0.3);
      if(lateNight){discipline*=1.6;corps*=1.8;}
      resolve({
        corps:Math.round(Math.max(-20,corps)),
        nutrition:0,
        cerveau:Math.round(Math.max(-20,cerveau)),
        apparence:0,
        discipline:Math.round(Math.max(-20,discipline)),
        social:isCasualMobile?0:Math.round(Math.max(-10,-1*gameMul*0.2)),
      });
      return;
    }

    // === SPECIAL CASE: Pornography (always strongly negative) ===
    const pornWords=["porno","porn","pornographie","pornographique"];
    if(pornWords.some(w=>t.includes(w))){
      const m=Math.min(mins/15,8); // even short sessions count meaningfully
      resolve({
        corps:Math.round(Math.max(-20,-6*m)),
        nutrition:0,
        cerveau:Math.round(Math.max(-20,-7*m)),
        apparence:0,
        discipline:Math.round(Math.max(-20,-9*m)),
        social:Math.round(Math.max(-15,-3*m)),
      });
      return;
    }

    // === FOOD DATABASE (per 100g) — kcal, protein, carbs, fat, fiber, sugar. unit = avg grams for "1 of it" if countable ===
    const FOOD_DB=[
      {k:["poulet","blanc de poulet","escalope de poulet"],kcal:165,p:31,c:0,f:3.6,fi:0,su:0},
      {k:["dinde","escalope de dinde"],kcal:135,p:29,c:0,f:1,fi:0,su:0},
      {k:["boeuf","steak","boeuf hache","steak hache"],kcal:250,p:26,c:0,f:17,fi:0,su:0},
      {k:["saumon"],kcal:208,p:20,c:0,f:13,fi:0,su:0},
      {k:["thon"],kcal:132,p:28,c:0,f:1,fi:0,su:0},
      {k:["sardine","sardines"],kcal:208,p:24.6,c:0,f:11.5,fi:0,su:0,unit:22},
      {k:["oeuf","oeufs","œuf","œufs"],kcal:155,p:13,c:1.1,f:11,fi:0,su:1.1,unit:50},
      {k:["riz","riz blanc","riz complet","riz basmati"],kcal:130,p:2.7,c:28,f:0.3,fi:0.4,su:0.1},
      {k:["pates","pâtes","spaghetti","penne"],kcal:131,p:5,c:25,f:1.1,fi:1.8,su:0.6},
      {k:["pain","baguette","tranche de pain"],kcal:265,p:9,c:49,f:3.2,fi:2.7,su:5,unit:30},
      {k:["patate","pomme de terre","pommes de terre"],kcal:77,p:2,c:17,f:0.1,fi:2.2,su:0.8,unit:150},
      {k:["patate douce","pommes de terre douce"],kcal:86,p:1.6,c:20,f:0.1,fi:3,su:4.2,unit:150},
      {k:["quinoa"],kcal:120,p:4.4,c:21,f:1.9,fi:2.8,su:0.9},
      {k:["avoine","flocons d'avoine","porridge"],kcal:389,p:16.9,c:66,f:6.9,fi:10.6,su:0},
      {k:["fromage blanc","skyr"],kcal:75,p:11,c:4,f:0.5,fi:0,su:4},
      {k:["yaourt","yaourt nature"],kcal:61,p:3.5,c:4.7,f:3.3,fi:0,su:4.7,unit:125},
      {k:["lait"],kcal:42,p:3.4,c:5,f:1,fi:0,su:5},
      {k:["fromage"],kcal:350,p:25,c:1.3,f:28,fi:0,su:0.5,unit:30},
      {k:["banane"],kcal:89,p:1.1,c:23,f:0.3,fi:2.6,su:12,unit:120},
      {k:["pomme"],kcal:52,p:0.3,c:14,f:0.2,fi:2.4,su:10,unit:180},
      {k:["fraise","fraises"],kcal:32,p:0.7,c:7.7,f:0.3,fi:2,su:4.9,unit:12},
      {k:["orange"],kcal:47,p:0.9,c:12,f:0.1,fi:2.4,su:9.4,unit:200},
      {k:["kiwi","kiwis"],kcal:61,p:1.1,c:15,f:0.5,fi:3,su:9,unit:70},
      {k:["mangue"],kcal:60,p:0.8,c:15,f:0.4,fi:1.6,su:14,unit:200},
      {k:["poire","poires"],kcal:57,p:0.4,c:15,f:0.1,fi:3.1,su:10,unit:180},
      {k:["raisin","raisins"],kcal:69,p:0.7,c:18,f:0.2,fi:0.9,su:16},
      {k:["brocoli"],kcal:34,p:2.8,c:7,f:0.4,fi:2.6,su:1.7},
      {k:["carotte","carottes"],kcal:41,p:0.9,c:10,f:0.2,fi:2.8,su:4.7,unit:60},
      {k:["salade","laitue"],kcal:15,p:1.4,c:2.9,f:0.2,fi:1.3,su:0.8},
      {k:["tomate","tomates"],kcal:18,p:0.9,c:3.9,f:0.2,fi:1.2,su:2.6,unit:120},
      {k:["concombre","concombres"],kcal:15,p:0.7,c:3.6,f:0.1,fi:0.5,su:1.7,unit:250},
      {k:["haricot vert","haricots verts"],kcal:31,p:1.8,c:7,f:0.2,fi:3.4,su:3.3},
      {k:["lentilles"],kcal:116,p:9,c:20,f:0.4,fi:7.9,su:1.8},
      {k:["pois chiche","pois chiches"],kcal:164,p:8.9,c:27,f:2.6,fi:7.6,su:4.8},
      {k:["amande","amandes"],kcal:579,p:21,c:22,f:50,fi:12.5,su:4.4,unit:1.2},
      {k:["noix"],kcal:654,p:15,c:14,f:65,fi:6.7,su:2.6,unit:5},
      {k:["cacahuete","cacahuetes","beurre de cacahuete"],kcal:588,p:25,c:20,f:50,fi:8,su:5},
      {k:["huile d'olive","huile"],kcal:884,p:0,c:0,f:100,fi:0,su:0},
      {k:["avocat"],kcal:160,p:2,c:9,f:15,fi:6.7,su:0.7,unit:200},
      {k:["chocolat","chocolat noir"],kcal:546,p:4.9,c:61,f:31,fi:7,su:48},
      {k:["pizza"],kcal:266,p:11,c:33,f:10,fi:2.3,su:3.6,unit:700},
      {k:["burger"],kcal:295,p:17,c:24,f:14,fi:1.3,su:5,unit:250},
      {k:["frites","frite"],kcal:312,p:3.4,c:41,f:15,fi:3.8,su:0.3},
      {k:["kebab"],kcal:250,p:15,c:20,f:12,fi:1.5,su:2,unit:400},
      {k:["chips"],kcal:536,p:6.6,c:53,f:34,fi:4.4,su:0.2},
      {k:["glace"],kcal:207,p:3.5,c:24,f:11,fi:0.7,su:21},
      {k:["gateau","gâteau"],kcal:350,p:5,c:50,f:15,fi:1,su:30},
      {k:["bonbon","bonbons"],kcal:390,p:0,c:98,f:0.2,fi:0,su:75},
      {k:["shake proteine","whey","proteine en poudre"],kcal:400,p:80,c:8,f:5,fi:1,su:4},
      {k:["pate a tartiner","nutella"],kcal:539,p:6.3,c:57,f:31,fi:3.4,su:56},
      {k:["fanta","coca","coca cola","soda","limonade","sprite"],kcal:42,p:0,c:10.6,f:0,fi:0,su:10.6,unit:330},
      {k:["jus de fruit","jus d'orange","jus de pomme"],kcal:45,p:0.5,c:10,f:0.1,fi:0.2,su:9,unit:200},
    ];

    // === Detect food entries with grams/ml/portions/counts and compute macro totals ===
    // grams and ml (ml treated ~1g/ml, close enough for drinks/liquids)
    const gramMatches=[...t.matchAll(/(\d+[\.,]?\d*)\s*(?:g(?:r|rammes?)?|ml|millilitres?)\b/g)];
    // generic whole-unit words not tied to a specific food (part/tranche/portion/verre/canette)
    const genericUnitDefaults={
      "part":250,"parts":250,"tranche":80,"tranches":80,
      "verre":200,"verres":200,"canette":330,"cannette":330,"portion":150,"portions":150,
    };
    const genericUnitMatches=[...t.matchAll(/(\d+[\.,]?\d*)\s*(part|parts|tranche|tranches|verre|verres|canette|cannette|portion|portions)\b/g)];
    // bare counts near a food word: "3 œufs", "1 kiwi", "2 sardines" — any number directly followed by words, matched against food.unit
    const bareCountMatches=[...t.matchAll(/(\d+[\.,]?\d*)\s+/g)];

    let macroTotals=null;
    if(gramMatches.length>0||genericUnitMatches.length>0||bareCountMatches.length>0){
      macroTotals={kcal:0,p:0,c:0,f:0,fi:0,su:0,matched:false};
      for(const food of FOOD_DB){
        for(const kw of food.k){
          const idx=t.indexOf(kw);
          if(idx===-1)continue;
          let bestGram=null,bestDist=Infinity;
          // 1) explicit grams/ml — must PRECEDE the food word (French: "400g de pâtes"), closest one wins
          for(const gm of gramMatches){
            const gEnd=gm.index+gm[0].length;
            if(gEnd<=idx){
              const dist=idx-gEnd;
              if(dist<bestDist&&dist<15){bestDist=dist;bestGram=parseFloat(gm[1].replace(",","."));}
            }
          }
          // 2) generic unit words (part/tranche/verre/canette) — same preceding rule
          if(bestGram===null){
            for(const um of genericUnitMatches){
              const uEnd=um.index+um[0].length;
              if(uEnd<=idx){
                const dist=idx-uEnd;
                if(dist<bestDist&&dist<15){
                  const qty=parseFloat(um[1].replace(",","."));
                  bestDist=dist;bestGram=qty*(genericUnitDefaults[um[2]]||150);
                }
              }
            }
          }
          // 3) bare count + this food's own per-unit weight ("3 œufs" -> 3 * 50g) — same preceding rule, tighter window
          if(bestGram===null&&food.unit){
            for(const bm of bareCountMatches){
              const bEnd=bm.index+bm[0].length;
              if(bEnd<=idx){
                const dist=idx-bEnd;
                if(dist<bestDist&&dist<10){
                  const qty=parseFloat(bm[1].replace(",","."));
                  bestDist=dist;bestGram=qty*food.unit;
                }
              }
            }
          }
          // 4) food mentioned with a defined unit weight but no number at all nearby -> assume "1"
          if(bestGram===null&&food.unit){bestGram=food.unit;}
          if(bestGram){
            const ratio=bestGram/100;
            macroTotals.kcal+=food.kcal*ratio;
            macroTotals.p+=food.p*ratio;
            macroTotals.c+=food.c*ratio;
            macroTotals.f+=food.f*ratio;
            macroTotals.fi+=food.fi*ratio;
            macroTotals.su+=food.su*ratio;
            macroTotals.matched=true;
          }
        }
      }
    }

    if(macroTotals&&macroTotals.matched){
      // Daily targets for Amaury: 18yo, 1m87, 72kg, lean bulk
      const T={kcal:2800,p:155,c:325,f:80,fi:30,suMax:50};

      // Calorie share of a meal: optimal = 1/4 to 1/3 of daily needs (~700-933 kcal), tapers past 1300 (oversized meal)
      const kcalScore=bellCurve(macroTotals.kcal,{lowEnd:150,optStart:700,optEnd:933,highEnd:1300,plateauAfter:false});

      // Protein: scored against ~35% of daily target in one meal = full mark
      const pScore=Math.min(1,macroTotals.p/(T.p*0.35));

      // Fiber: more is basically always fine, scored the same way
      const fiScore=Math.min(1,macroTotals.fi/(T.fi*0.35));

      // Fat: tighter optimal window (12-25g), tapers past 40g rather than plateauing — a very high-fat meal is genuinely less ideal
      const fatScore=bellCurve(macroTotals.f,{lowEnd:5,optStart:12,optEnd:25,highEnd:40,plateauAfter:false});

      // Sugar: pure penalty past a reasonable single-meal threshold
      const sugarPenalty=macroTotals.su>20?-Math.min(15,(macroTotals.su-20)*0.5):0;

      // Junk/processed food flag: grams alone can't capture "this is fast food" — layer a qualitative penalty on top
      const junkWords=["pizza","burger","fast food","mcdo","kebab","frite","frites","nuggets","chips","hot dog"];
      const junkPenalty=junkWords.some(w=>t.includes(w))?14:0;

      const nutritionImpact=Math.round(Math.max(-15,Math.min(20,
        kcalScore*8 + pScore*9 + fiScore*4 + fatScore*3 + sugarPenalty - junkPenalty
      )));
      resolve({
        ...Z,
        nutrition:nutritionImpact,
        corps:Math.round(nutritionImpact*0.25),
        _macros:{kcal:Math.round(macroTotals.kcal),p:Math.round(macroTotals.p),c:Math.round(macroTotals.c),f:Math.round(macroTotals.f),fi:Math.round(macroTotals.fi),su:Math.round(macroTotals.su)},
      });
      return;
    }

    // Activity database: {keywords[], impacts per 30min}
    const DB=[
      // === SPORT & CORPS (fallback — gym/cardio/marche/étirements/sommeil handled above with bell curves) ===
      {k:["foot","football","futsal","match"],i:{...Z,corps:10,cerveau:3,apparence:1,discipline:6,social:5},sport:true},
      {k:["basket","basketball","tennis","badminton","ping","pong","boxe","mma","judo","karate"],i:{...Z,corps:9,cerveau:2,apparence:1,discipline:6},sport:true},
      {k:["danse","danser"],i:{...Z,corps:8,cerveau:2,apparence:3,discipline:4,social:4},sport:true},

      // === NUTRITION (fallback for text without grams) ===
      {k:["cuisine","cuisiné","prépare","repas","fait a manger","cook"],i:{...Z,corps:2,nutrition:8,cerveau:3,apparence:1,discipline:6},nutriFallback:true},
      {k:["legume","legumes","salade","brocoli","carotte","epinard","courgette","tomate","concombre","poivron"],i:{...Z,corps:2,nutrition:10,apparence:3,discipline:3},nutriFallback:true},
      {k:["fruit","pomme","banane","orange","fraise","myrtille","mangue","kiwi","raisin"],i:{...Z,corps:2,nutrition:9,apparence:3,discipline:2},nutriFallback:true},
      {k:["proteine","poulet","dinde","boeuf","poisson","saumon","thon","oeuf","fromage blanc","yaourt","shake"],i:{...Z,corps:3,nutrition:9,apparence:2,discipline:3},nutriFallback:true},
      {k:["pizza","burger","fast food","mcdo","kebab","frite","chips","nuggets"],i:{...Z,corps:-4,nutrition:-8,apparence:-3,discipline:-5},nutriFallback:true},
      {k:["sucre","bonbon","gateau","chocolat","glace","dessert","viennoiserie"],i:{...Z,corps:-2,nutrition:-6,apparence:-2,discipline:-4},nutriFallback:true},
      {k:["alcool","biere","bière","du vin","verre de vin","cocktail","soiree arrosee","soirée arrosée"],i:{...Z,corps:-5,nutrition:-7,cerveau:-4,apparence:-3,discipline:-6},nutriFallback:true},
      {k:["de l'eau","d'eau","hydrat","bu de l'eau"],i:{...Z,corps:3,nutrition:5,cerveau:1,apparence:3,discipline:2},nutriFallback:true},

      // === CERVEAU (fallback — lecture/japonais/codage/echecs/meditation/travail handled above with bell curves) ===
      {k:["documentaire","docu","reportage"],i:{...Z,cerveau:8,discipline:3}},
      {k:["podcast educatif","podcast eduquant"],i:{...Z,cerveau:9,discipline:5}},
      {k:["podcast","conference","ted","ted talk","cours en ligne","mooc","formation","webinaire"],i:{...Z,cerveau:8,discipline:5}},
      {k:["dessin","dessiner","sketch","croquis","illustrer","illustré","aquarelle","peinture","peindre"],i:{...Z,cerveau:7,apparence:2,discipline:5}},
      {k:["apprendre la guitare","apprentissage guitare","apprendre le piano","apprentissage piano","cours de musique","gamme","solfege"],i:{...Z,cerveau:9,apparence:1,discipline:7}},
      {k:["music","musique","guitare","piano","instrument","jouer de","batterie","violon","chant","chanter"],i:{...Z,cerveau:7,apparence:1,discipline:6}},
      {k:["prier","priere","spirituel"],i:{...Z,cerveau:4,discipline:5}},
      {k:["géographie","histoire","science","biologie","physique","chimie","maths"],i:{...Z,cerveau:9,discipline:5}},

      // === APPARENCE / STYLE (flat punctual actions — no duration scaling, doing it once counts regardless of time spent) ===
      {k:["shopping","achat","achete","magasin","vetement","fringues","habit","tenue"],i:{...Z,cerveau:1,apparence:7,discipline:2},flat:true},
      {k:["coiffeur","coupe","cheveux"],i:{...Z,apparence:8,discipline:2},flat:true},
      {k:["soin","skincare","creme","masque visage","nettoyant"],i:{...Z,corps:1,apparence:9,discipline:4},flat:true},
      {k:["rasage","raser","rasé"],i:{...Z,apparence:6,discipline:3},flat:true},
      {k:["parfum","cologne"],i:{...Z,apparence:5,discipline:2},flat:true},
      {k:["douche","bain","laver"],i:{...Z,corps:2,apparence:7,discipline:3},flat:true},

      // === DISCIPLINE / PRODUCTIVITE (flat punctual actions — travail/révisions handled above with bell curve) ===
      {k:["ranger","nettoyé","nettoyage","ménage","aspirateur","vaisselle","chambre"],i:{...Z,corps:1,cerveau:1,apparence:2,discipline:7},flat:true},
      {k:["planifier","planning","organisation","organiser","objectif","agenda","todo"],i:{...Z,cerveau:4,discipline:9},flat:true},

      // === SOCIAL ===
      {k:["famille","parent","frere","soeur","grand-mere","grand-pere","cousin"],i:{...Z,cerveau:2,discipline:1,social:9}},
      {k:["ami","amis","copain","copine","pote","sortie","soiree","quedal","resto","restaurant"],i:{...Z,cerveau:1,apparence:1,social:9}},
      {k:["parle","discute","appel","appelé","conversation","retrouve"],i:{...Z,cerveau:2,social:7}},
      {k:["date","rdv amoureux","rendez-vous","rencard"],i:{...Z,apparence:3,social:9}},
      {k:["voyage","visite","musee","expo","culture","tourisme"],i:{...Z,corps:2,cerveau:7,apparence:1,discipline:3,social:3}},

      // === ACTIVITES NEGATIVES ===
      {k:["scroll","scroller","instagram","tiktok","snapchat","twitter","x ","reseaux","réseaux","feed","explore"],i:{...Z,corps:-3,cerveau:-8,apparence:-1,discipline:-12,social:-3}},
      {k:["netflix","serie","film","youtube","video","watch","regardé","regarder"],i:{...Z,corps:-1,cerveau:-2,discipline:-4}},
      {k:["fumer","cigarette","clope","tabac","weed","cannabis","joint"],i:{...Z,corps:-8,nutrition:-3,cerveau:-3,apparence:-4,discipline:-6}},
      {k:["paresse","glander","glande","rien","trainé","trainer","procrastine","procrastination"],i:{...Z,corps:-3,cerveau:-4,apparence:-1,discipline:-9}},
      {k:["dormi trop","oversleep","grasse matinee","grasse matinée"],i:{...Z,corps:-1,cerveau:-2,apparence:-1,discipline:-6}},
    ];

    // Find matching activity — for nutrition fallback entries specifically, SUM all matches
    // (so "repas" + "pizza" both apply, rather than one arbitrarily winning a tie)
    let nutritionSum=null;
    for(const entry of DB){
      if(!entry.nutriFallback)continue;
      if(entry.k.some(kw=>t.includes(kw))){
        if(!nutritionSum)nutritionSum={...Z};
        Object.keys(entry.i).forEach(k=>{nutritionSum[k]=(nutritionSum[k]||0)+entry.i[k];});
      }
    }
    if(nutritionSum){
      // Clamp each category to the same -20..20 range as everything else
      const clamped={};
      Object.keys(Z).forEach(k=>{clamped[k]=Math.round(Math.max(-20,Math.min(20,nutritionSum[k]||0)));});
      resolve(clamped);
      return;
    }

    let bestMatch=null, bestScore=0;
    for(const entry of DB){
      let score=0;
      for(const kw of entry.k){
        if(t.includes(kw)) score+=kw.length; // longer keyword = more specific = better match
      }
      if(score>bestScore){bestScore=score;bestMatch=entry;}
    }

    if(!bestMatch){
      // Unknown activity — neutral with slight discipline bonus
      resolve({...Z,cerveau:1,discipline:2});
      return;
    }

    // Apply duration multiplier (and intensity for sport entries) and round
    const raw=bestMatch.i;
    const effMul=bestMatch.flat?1:(bestMatch.sport?mul*sportIntensityMul:mul);
    const result={};
    for(const k of Object.keys(Z)){
      const v=(raw[k]||0)*effMul;
      result[k]=Math.round(Math.max(-20,Math.min(20,v)));
    }
    resolve(result);
  });
}

