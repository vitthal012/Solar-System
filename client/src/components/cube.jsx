import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

function seededRng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function makeMercuryTexture() {
  const W = 512, H = 512;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const rng = seededRng(1);

  const bg = ctx.createRadialGradient(W*.35,H*.35,10,W*.5,H*.5,W*.6);
  bg.addColorStop(0, "#c8c4bc"); bg.addColorStop(0.5, "#9a9690"); bg.addColorStop(1, "#3a3830");
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

  for (let i=0;i<18;i++) {
    const x=rng()*W, y=rng()*H, r=rng()*55+20;
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,`rgba(50,45,40,${rng()*.25})`); g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  for (let i=0;i<60;i++) {
    const x=rng()*W, y=rng()*H, r=rng()*14+2;
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,`rgba(40,38,35,0.9)`);
    g.addColorStop(0.6,`rgba(80,75,70,0.5)`);
    g.addColorStop(0.85,`rgba(190,185,175,0.4)`);
    g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  
    ctx.strokeStyle=`rgba(215,210,200,${rng()*.35})`; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(x,y,r*.85,0,Math.PI*2); ctx.stroke();
  }
  const t=new THREE.CanvasTexture(cv); t.needsUpdate=true; return t;
}

function makeVenusTexture() {
  const W=512,H=512;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  const rng=seededRng(2);

  ctx.fillStyle="#c07820"; ctx.fillRect(0,0,W,H);

  for (let band=0;band<28;band++) {
    const y=band*(H/28);
    const thick=rng()*22+8;
    const alpha=rng()*.55+.15;
    const hue=rng()*25+25;
    const light=rng()*25+50;
    ctx.fillStyle=`hsla(${hue},70%,${light}%,${alpha})`;
    ctx.beginPath();
    ctx.rect(0,y,W,thick);
    ctx.fill();
  }
 
  for (let i=0;i<12;i++) {
    const x=rng()*W, y=rng()*H;
    ctx.save();
    ctx.translate(x,y); ctx.rotate(rng()*.4-.2);
    const g=ctx.createLinearGradient(-W*.4,0,W*.4,0);
    g.addColorStop(0,"rgba(255,220,120,0)");
    g.addColorStop(.5,`rgba(255,220,100,${rng()*.3+.1})`);
    g.addColorStop(1,"rgba(255,220,120,0)");
    ctx.fillStyle=g; ctx.fillRect(-W*.4,-10,W*.8,rng()*18+6);
    ctx.restore();
  }
  
  const ld=ctx.createRadialGradient(W*.5,H*.5,W*.32,W*.5,H*.5,W*.65);
  ld.addColorStop(0,"rgba(0,0,0,0)"); ld.addColorStop(1,"rgba(20,5,0,0.65)");
  ctx.fillStyle=ld; ctx.fillRect(0,0,W,H);

  const t=new THREE.CanvasTexture(cv); t.needsUpdate=true; return t;
}

function makeEarthTexture() {
  const W=512,H=512;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  const rng=seededRng(3);

  
  const ocean=ctx.createLinearGradient(0,0,0,H);
  ocean.addColorStop(0,"#0a2a6e"); ocean.addColorStop(.5,"#1155aa"); ocean.addColorStop(1,"#0a3a7e");
  ctx.fillStyle=ocean; ctx.fillRect(0,0,W,H);

  
  const continents=[
    {x:120,y:160,rx:90,ry:70,rot:-.3,c:"#3a7a30"},
    {x:290,y:150,rx:80,ry:65,rot:.2,c:"#4a8a38"},
    {x:380,y:200,rx:65,ry:55,rot:.5,c:"#5a7a28"},
    {x:420,y:310,rx:45,ry:35,rot:-.1,c:"#4a6a20"},
    {x:200,y:310,rx:50,ry:30,rot:.3,c:"#557a28"},
  ];
  continents.forEach(({x,y,rx,ry,rot,c}) => {
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
    const g=ctx.createRadialGradient(0,0,0,0,0,Math.max(rx,ry));
    g.addColorStop(0,c); g.addColorStop(.7,c+"cc"); g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2); ctx.fill();
    
    for(let i=0;i<8;i++){
      const nx=(rng()-.5)*rx*.8, ny=(rng()-.5)*ry*.8;
      ctx.fillStyle=`rgba(${rng()>0.5?"80,100,40":"60,50,20"},${rng()*.3+.1})`;
      ctx.beginPath(); ctx.ellipse(nx,ny,rng()*25+8,rng()*18+5,rng()*Math.PI,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  });

  
  const northIce=ctx.createRadialGradient(W*.5,-20,0,W*.5,-20,H*.38);
  northIce.addColorStop(0,"rgba(240,248,255,0.92)"); northIce.addColorStop(.6,"rgba(220,235,255,0.5)"); northIce.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=northIce; ctx.fillRect(0,0,W,H);
  const southIce=ctx.createRadialGradient(W*.5,H+20,0,W*.5,H+20,H*.35);
  southIce.addColorStop(0,"rgba(240,248,255,0.88)"); southIce.addColorStop(.6,"rgba(220,235,255,0.45)"); southIce.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=southIce; ctx.fillRect(0,0,W,H);


  for(let i=0;i<20;i++){
    const x=rng()*W, y=rng()*H, l=rng()*120+40;
    ctx.save(); ctx.translate(x,y); ctx.rotate(rng()*.5-.25);
    const g=ctx.createLinearGradient(-l/2,0,l/2,0);
    g.addColorStop(0,"rgba(255,255,255,0)"); g.addColorStop(.5,`rgba(255,255,255,${rng()*.35+.1})`); g.addColorStop(1,"rgba(255,255,255,0)");
    ctx.fillStyle=g; ctx.fillRect(-l/2,-rng()*8-3,l,rng()*16+6);
    ctx.restore();
  }
  
  const ld=ctx.createRadialGradient(W*.5,H*.5,W*.3,W*.5,H*.5,W*.62);
  ld.addColorStop(0,"rgba(0,0,0,0)"); ld.addColorStop(1,"rgba(0,0,20,0.6)");
  ctx.fillStyle=ld; ctx.fillRect(0,0,W,H);

  const t=new THREE.CanvasTexture(cv); t.needsUpdate=true; return t;
}

function makeMarsTexture() {
  const W=512,H=512;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  const rng=seededRng(4);


  const base=ctx.createRadialGradient(W*.4,H*.4,20,W*.5,H*.5,W*.6);
  base.addColorStop(0,"#d4512a"); base.addColorStop(.5,"#b03a18"); base.addColorStop(1,"#6a1e08");
  ctx.fillStyle=base; ctx.fillRect(0,0,W,H);


  for(let i=0;i<30;i++){
    const x=rng()*W, y=rng()*H, r=rng()*70+20;
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    const dark=rng()>.5;
    g.addColorStop(0,dark?`rgba(80,25,8,${rng()*.4})`:`rgba(210,130,60,${rng()*.3})`);
    g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }

  for(let i=0;i<6;i++){
    const y=H*.3+rng()*H*.25;
    ctx.save(); ctx.translate(W*.2,y); ctx.rotate((rng()-.5)*.15);
    const g=ctx.createLinearGradient(0,-4,0,4);
    g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(.5,`rgba(50,10,0,${rng()*.5+.2})`); g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g; ctx.fillRect(0,-5,W*.6,10);
    ctx.restore();
  }
  
  const ice=ctx.createRadialGradient(W*.5,-30,0,W*.5,-30,H*.3);
  ice.addColorStop(0,"rgba(240,235,225,0.85)"); ice.addColorStop(.5,"rgba(220,210,195,0.4)"); ice.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=ice; ctx.fillRect(0,0,W,H);

  for(let i=0;i<25;i++){
    const x=rng()*W, y=rng()*H, r=rng()*10+2;
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,"rgba(50,15,5,0.8)"); g.addColorStop(.7,"rgba(90,30,10,0.3)"); g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
 
  const ld=ctx.createRadialGradient(W*.5,H*.5,W*.3,W*.5,H*.5,W*.62);
  ld.addColorStop(0,"rgba(0,0,0,0)"); ld.addColorStop(1,"rgba(30,5,0,0.65)");
  ctx.fillStyle=ld; ctx.fillRect(0,0,W,H);

  const t=new THREE.CanvasTexture(cv); t.needsUpdate=true; return t;
}

function makeJupiterTexture() {
  const W=512,H=512;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  const rng=seededRng(5);

  
  ctx.fillStyle="#c8965a"; ctx.fillRect(0,0,W,H);


  const bands=[
    {y:0,   h:30, c:"#e8c88a", a:.8},
    {y:28,  h:22, c:"#8a4820", a:.85},
    {y:48,  h:18, c:"#d4a060", a:.7},
    {y:64,  h:28, c:"#6a3015", a:.9},
    {y:90,  h:35, c:"#e0b870", a:.75},
    {y:123, h:20, c:"#7a3818", a:.88},
    {y:141, h:15, c:"#c89050", a:.7},
    {y:154, h:28, c:"#5a2810", a:.9},
    {y:180, h:18, c:"#d8a860", a:.75},
    {y:196, h:25, c:"#8a4820", a:.85},
    {y:219, h:32, c:"#e4bc78", a:.7},
    {y:249, h:20, c:"#6a3015", a:.88},
    {y:267, h:18, c:"#c88848", a:.75},
    {y:283, h:28, c:"#7a3818", a:.85},
    {y:309, h:35, c:"#deb068", a:.7},
    {y:342, h:22, c:"#8a4820", a:.88},
    {y:362, h:30, c:"#e8c88a", a:.75},
    {y:390, h:25, c:"#6a3015", a:.9},
    {y:413, h:40, c:"#c89050", a:.7},
    {y:451, h:30, c:"#e0b870", a:.8},
    {y:479, h:33, c:"#8a4820", a:.85},
  ];
  bands.forEach(({y,h,c,a})=>{

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0,y);
    for(let x=0;x<=W;x+=8){
      const wave=Math.sin(x*.04+rng()*2)*3;
      ctx.lineTo(x,y+wave);
    }
    for(let x=W;x>=0;x-=8){
      const wave=Math.sin(x*.04+rng()*2)*3;
      ctx.lineTo(x,y+h+wave);
    }
    ctx.closePath();
    ctx.fillStyle=c+Math.round(a*255).toString(16).padStart(2,"0");
    ctx.fill();
    ctx.restore();
  });


  const grsX=W*.62, grsY=H*.54;
  const grsRx=52, grsRy=32;

  const grsHalo=ctx.createRadialGradient(grsX,grsY,0,grsX,grsY,grsRx*1.6);
  grsHalo.addColorStop(0,"rgba(160,60,20,0.5)"); grsHalo.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=grsHalo; ctx.beginPath(); ctx.ellipse(grsX,grsY,grsRx*1.6,grsRy*1.6,0,0,Math.PI*2); ctx.fill();

  const grs=ctx.createRadialGradient(grsX-10,grsY-8,0,grsX,grsY,grsRx);
  grs.addColorStop(0,"#e87840"); grs.addColorStop(.4,"#c84818"); grs.addColorStop(.8,"#962808"); grs.addColorStop(1,"rgba(80,20,5,0)");
  ctx.fillStyle=grs; ctx.beginPath(); ctx.ellipse(grsX,grsY,grsRx,grsRy,-.15,0,Math.PI*2); ctx.fill();

  ctx.strokeStyle="rgba(220,120,50,0.5)"; ctx.lineWidth=2;
  for(let i=1;i<=3;i++){
    ctx.beginPath(); ctx.ellipse(grsX,grsY,grsRx*.25*i,grsRy*.25*i,-.15,0,Math.PI*2); ctx.stroke();
  }


  const ld=ctx.createRadialGradient(W*.5,H*.5,W*.28,W*.5,H*.5,W*.6);
  ld.addColorStop(0,"rgba(0,0,0,0)"); ld.addColorStop(1,"rgba(20,8,0,0.55)");
  ctx.fillStyle=ld; ctx.fillRect(0,0,W,H);

  const t=new THREE.CanvasTexture(cv); t.needsUpdate=true; return t;
}

function makeSaturnTexture() {
  const W=512,H=512;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  const rng=seededRng(6);

  ctx.fillStyle="#c8a050"; ctx.fillRect(0,0,W,H);

  const bands=[
    {y:0,h:40,c:"#e8cc80",a:.6},{y:38,h:25,c:"#a07828",a:.7},
    {y:61,h:30,c:"#d8b060",a:.65},{y:89,h:20,c:"#906020",a:.75},
    {y:107,h:35,c:"#e0bc70",a:.6},{y:140,h:22,c:"#a07830",a:.7},
    {y:160,h:40,c:"#c8a048",a:.65},{y:198,h:18,c:"#885818",a:.75},
    {y:214,h:50,c:"#dab860",a:.6},{y:262,h:25,c:"#a07828",a:.7},
    {y:285,h:35,c:"#e0c070",a:.65},{y:318,h:22,c:"#907020",a:.75},
    {y:338,h:40,c:"#d0aa50",a:.6},{y:376,h:28,c:"#a07830",a:.7},
    {y:402,h:50,c:"#e0bc68",a:.65},{y:450,h:30,c:"#887020",a:.75},
    {y:478,h:34,c:"#d8b458",a:.6},
  ];
  bands.forEach(({y,h,c,a})=>{
    ctx.fillStyle=c+Math.round(a*255).toString(16).padStart(2,"0");
    ctx.fillRect(0,y,W,h);
  });

  const ld=ctx.createRadialGradient(W*.5,H*.5,W*.28,W*.5,H*.5,W*.6);
  ld.addColorStop(0,"rgba(0,0,0,0)"); ld.addColorStop(1,"rgba(15,8,0,0.5)");
  ctx.fillStyle=ld; ctx.fillRect(0,0,W,H);
  const t=new THREE.CanvasTexture(cv); t.needsUpdate=true; return t;
}

function makeUranusTexture() {
  const W=512,H=512;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  const rng=seededRng(7);


  const base=ctx.createRadialGradient(W*.38,H*.38,0,W*.5,H*.5,W*.58);
  base.addColorStop(0,"#aee8e8"); base.addColorStop(.4,"#5dc8c8"); base.addColorStop(.75,"#2a9898"); base.addColorStop(1,"#0a4848");
  ctx.fillStyle=base; ctx.fillRect(0,0,W,H);


  for(let i=0;i<12;i++){
    const y=(i/12)*H;
    ctx.fillStyle=`rgba(${rng()>0.5?"200,240,240":"30,100,100"},${rng()*.08+.02})`;
    ctx.fillRect(0,y,W,H/14);
  }

  for(let i=0;i<8;i++){
    const x=rng()*W, y=rng()*H;
    const g=ctx.createRadialGradient(x,y,0,x,y,rng()*60+30);
    g.addColorStop(0,`rgba(180,240,240,${rng()*.15+.05})`); g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(x,y,rng()*80+40,rng()*30+15,rng(),0,Math.PI*2); ctx.fill();
  }
  const ld=ctx.createRadialGradient(W*.5,H*.5,W*.25,W*.5,H*.5,W*.6);
  ld.addColorStop(0,"rgba(0,0,0,0)"); ld.addColorStop(1,"rgba(0,20,30,0.72)");
  ctx.fillStyle=ld; ctx.fillRect(0,0,W,H);
  const t=new THREE.CanvasTexture(cv); t.needsUpdate=true; return t;
}

function makeNeptuneTexture() {
  const W=512,H=512;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  const rng=seededRng(8);


  const base=ctx.createRadialGradient(W*.38,H*.38,0,W*.5,H*.5,W*.58);
  base.addColorStop(0,"#4488ee"); base.addColorStop(.4,"#1a50c0"); base.addColorStop(.75,"#0a2880"); base.addColorStop(1,"#020c30");
  ctx.fillStyle=base; ctx.fillRect(0,0,W,H);


  for(let i=0;i<14;i++){
    const y=(i/14)*H;
    ctx.fillStyle=`rgba(${rng()>.5?"80,140,220":"10,30,100"},${rng()*.12+.03})`;
    ctx.fillRect(0,y,W,H/16);
  }

  const dsX=W*.42, dsY=H*.42;
  const ds=ctx.createRadialGradient(dsX,dsY,0,dsX,dsY,45);
  ds.addColorStop(0,"rgba(5,15,60,0.9)"); ds.addColorStop(.6,"rgba(10,25,80,0.5)"); ds.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=ds; ctx.beginPath(); ctx.ellipse(dsX,dsY,45,30,-.2,0,Math.PI*2); ctx.fill();

  for(let i=0;i<6;i++){
    const x=dsX+(rng()-.5)*80, y=dsY+(rng()-.5)*40;
    ctx.save(); ctx.translate(x,y); ctx.rotate(rng()*.4-.2);
    const g=ctx.createLinearGradient(-40,0,40,0);
    g.addColorStop(0,"rgba(200,220,255,0)"); g.addColorStop(.5,`rgba(200,220,255,${rng()*.4+.15})`); g.addColorStop(1,"rgba(200,220,255,0)");
    ctx.fillStyle=g; ctx.fillRect(-40,-4,80,rng()*8+3);
    ctx.restore();
  }
  const ld=ctx.createRadialGradient(W*.5,H*.5,W*.25,W*.5,H*.5,W*.6);
  ld.addColorStop(0,"rgba(0,0,0,0)"); ld.addColorStop(1,"rgba(0,5,30,0.75)");
  ctx.fillStyle=ld; ctx.fillRect(0,0,W,H);
  const t=new THREE.CanvasTexture(cv); t.needsUpdate=true; return t;
}

const TEXTURE_MAKERS = {
  Mercury: makeMercuryTexture,
  Venus:   makeVenusTexture,
  Earth:   makeEarthTexture,
  Mars:    makeMarsTexture,
  Jupiter: makeJupiterTexture,
  Saturn:  makeSaturnTexture,
  Uranus:  makeUranusTexture,
  Neptune: makeNeptuneTexture,
};

function OrbitRing({ a, b, incline = 0 }) {
  const geometry = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 512; i++) {
      const angle = (i / 512) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * a,
        Math.sin(angle) * b * Math.sin(incline),
        Math.sin(angle) * b * Math.cos(incline)
      ));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [a, b, incline]);
  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#1e3a5f" transparent opacity={0.5} />
    </line>
  );
}

function Sun({ onClick }) {
  const coronaRef = useRef(), glowRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coronaRef.current) coronaRef.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.04);
    if (glowRef.current)   glowRef.current.scale.setScalar(1 + Math.sin(t * 0.7 + 1) * 0.025);
  });
  return (
    <group onClick={onClick}>
      <mesh><sphereGeometry args={[2.8,64,64]}/><meshStandardMaterial emissive="#ff7700" emissiveIntensity={5} color="#ffaa00" roughness={0.1} metalness={0}/></mesh>
      <mesh ref={glowRef}><sphereGeometry args={[3.3,32,32]}/><meshStandardMaterial color="#ffcc44" transparent opacity={0.12} roughness={1} side={THREE.BackSide}/></mesh>
      <mesh ref={coronaRef}><sphereGeometry args={[4.2,32,32]}/><meshStandardMaterial color="#ff5500" transparent opacity={0.05} roughness={1} side={THREE.BackSide}/></mesh>
    </group>
  );
}

function Planet({ a, b, incline = 0, speed, size, name, onClick, initialAngle = 0 }) {
  const ref = useRef();
  const texture = useMemo(() => TEXTURE_MAKERS[name]?.() || makeMercuryTexture(), [name]);

  useFrame(({ clock }) => {
    const angle = clock.getElapsedTime() * speed + initialAngle;
    if (ref.current) {
      ref.current.position.x = Math.cos(angle) * a;
      ref.current.position.y = Math.sin(angle) * b * Math.sin(incline);
      ref.current.position.z = Math.sin(angle) * b * Math.cos(incline);
      ref.current.rotation.y += 0.006;
    }
  });

  return (
    <mesh ref={ref} onClick={(e) => { e.stopPropagation(); onClick(ref, name); }}>
      <sphereGeometry args={[size, 96, 96]} />
      <meshStandardMaterial map={texture} bumpMap={texture} bumpScale={name==="Mercury"?0.06:0.025} roughness={0.65} metalness={0.05} />
    </mesh>
  );
}

function Saturn({ a, b, incline = 0, speed, onClick, initialAngle = 0 }) {
  const ref = useRef();
  const texture = useMemo(() => makeSaturnTexture(), []);

  const { ringGeo, ringMat } = useMemo(() => {
    const innerR = 1.85, outerR = 3.3;
    const geo = new THREE.RingGeometry(innerR, outerR, 256, 6);
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const r = Math.sqrt(x*x+z*z);
      uv.setXY(i, (r-innerR)/(outerR-innerR), 0.5);
    }
    const c = document.createElement("canvas"); c.width=256; c.height=1;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0,0,256,0);
    g.addColorStop(0,    "rgba(235, 232, 226, 0.54)");
    g.addColorStop(0.08, "rgba(235, 232, 226, 0.54)");
    g.addColorStop(0.2,  "rgba(235, 232, 226, 0.54)");
    g.addColorStop(0.38, "rgba(235, 232, 226, 0.54)");
    g.addColorStop(0.55, "rgba(235, 232, 226, 0.54)");
    g.addColorStop(0.72, "rgba(235, 232, 226, 0.54)");
    g.addColorStop(0.88, "rgba(235, 232, 226, 0.54)");
    g.addColorStop(1,    "rgba(235, 232, 226, 0.54)");
    ctx.fillStyle=g; ctx.fillRect(0,0,256,1);
    const tex=new THREE.CanvasTexture(c); tex.needsUpdate=true;
    const mat=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:true});
    return { ringGeo: geo, ringMat: mat };
  }, []);

  useFrame(({ clock }) => {
    const angle = clock.getElapsedTime() * speed + initialAngle;
    if (ref.current) {
      ref.current.position.x = Math.cos(angle) * a;
      ref.current.position.y = Math.sin(angle) * b * Math.sin(incline);
      ref.current.position.z = Math.sin(angle) * b * Math.cos(incline);
      ref.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={ref} onClick={(e) => { e.stopPropagation(); onClick(ref, "Saturn"); }}>
      <mesh><sphereGeometry args={[1.35,64,64]}/><meshStandardMaterial map={texture} bumpMap={texture} bumpScale={0.025} roughness={0.55} metalness={0.05}/></mesh>
      <mesh geometry={ringGeo} material={ringMat} rotation={[1.1,0.15,0.3]}/>
    </group>
  );
}

function CameraController({ targetRef, planetSize = 1 }) {
  const { camera } = useThree();
  useFrame(() => {
    if (targetRef?.current) {
      const target = targetRef.current.position;
      const offset = Math.max(planetSize * 6 + 3, 6);
      const desired = new THREE.Vector3(target.x+offset, target.y+offset*.5, target.z+offset);
      camera.position.lerp(desired, 0.05);
      camera.lookAt(target);
    }
  });
  return null;
}


const TAG_COLORS = {
  "Terrestrial": { bg:"rgba(34,197,94,0.15)", text:"#4ade80" },
  "Gas Giant":   { bg:"rgba(251,146,60,0.15)", text:"#fb923c" },
  "Ice Giant":   { bg:"rgba(96,165,250,0.15)", text:"#60a5fa" },
  "G-type main-sequence star (Yellow Dwarf)": { bg:"rgba(250,204,21,0.15)", text:"#fbbf24" },
};
function Badge({ label, color }) {
  return <span style={{ display:"inline-block", background:color?.bg||"rgba(148,163,184,0.15)", color:color?.text||"#94a3b8", fontSize:"0.7rem", fontWeight:600, padding:"3px 10px", borderRadius:"999px", letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</span>;
}
function StatRow({ label, value }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:12, padding:"7px 0", borderBottom:"1px solid rgba(148,163,184,0.08)" }}>
      <span style={{ color:"#64748b", fontSize:"0.82rem" }}>{label}</span>
      <span style={{ color:"#e2e8f0", fontWeight:600, fontSize:"0.88rem", textAlign:"right" }}>{value}</span>
    </div>
  );
}
function InfoPanel({ selected, allData, onSelect, allPlanets }) {
  const [tab, setTab] = useState("stats");
  useEffect(() => { setTab("stats"); }, [selected]);
  const isSun = selected === "Sun";
  const body = useMemo(() => {
    if (!selected || !allData) return null;
    if (isSun) return allData?.star || allData?.Sun || null;
    if (Array.isArray(allData?.planets)) return allData.planets.find(p => p.name === selected) || null;
    return allData?.[selected] || null;
  }, [selected, allData, isSun]);
  const stats = !body ? [] : isSun ? [
    ["Type", body.type||"—"], ["Age", body.age_billion_years?`${body.age_billion_years}B years`:"—"],
    ["Diameter", body.diameter_km?`${body.diameter_km.toLocaleString()} km`:"—"],
    ["Surface temp", body.surface_temperature_celsius!=null?`${Number(body.surface_temperature_celsius).toLocaleString()}°C`:"—"],
    ["Core temp", body.core_temperature_celsius?`${body.core_temperature_celsius.toLocaleString()}°C`:"—"],
    ["Gravity", body.gravity_m_s2?`${body.gravity_m_s2} m/s²`:"—"], ["Luminosity", body.luminosity_watts??"—"],
  ] : [
    ["Type", body.type||"—"], ["Order from Sun", body.order_from_sun??"—"],
    ["Diameter", body.diameter_km?`${body.diameter_km.toLocaleString()} km`:"—"],
    ["Distance", body.distance_from_sun_million_km?`${body.distance_from_sun_million_km}M km`:"—"],
    ["Mass", body.mass_kg??"—"], ["Orbital period", body.orbital_period_days?`${body.orbital_period_days} days`:"—"],
    ["Rotation", body.rotation_period_hours?`${body.rotation_period_hours}h`:"—"],
    ["Moons", body.moons??0], ["Has rings", body.has_rings?"Yes":"No"],
    ["Gravity", body.gravity_m_s2?`${body.gravity_m_s2} m/s²`:"—"],
  ];
  const atmosphereItems = isSun ? Object.entries(body?.composition_percent||{}).map(([k,v])=>`${k} (${v}%)`) : (body?.atmosphere||[]);
  const tabs = body ? ["stats","facts",...(atmosphereItems.length?["atmo"]:[])]: [];
  return (
    <div style={{ background:"rgba(2,8,23,0.97)", border:"1px solid rgba(148,163,184,0.1)", borderRadius:20, overflow:"hidden", backdropFilter:"blur(20px)" }}>
      <div style={{ padding:"16px 18px 12px", borderBottom:"1px solid rgba(148,163,184,0.08)" }}>
        {body ? (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <div style={{ width:36,height:36,borderRadius:"50%",flexShrink:0,background:isSun?"radial-gradient(circle at 35% 35%, #ffe066, #ff7700)":"rgba(148,163,184,0.12)",display:"grid",placeItems:"center",fontSize:"0.9rem",color:"#f8fafc",fontWeight:700,boxShadow:isSun?"0 0 16px rgba(255,140,0,0.6)":"none" }}>
                {isSun?"☀":body.order_from_sun}
              </div>
              <div>
                <p style={{ margin:0,fontSize:"0.65rem",color:"#475569",textTransform:"uppercase",letterSpacing:"0.18em" }}>{isSun?"Host star":"Planet"}</p>
                <h2 style={{ margin:0,fontSize:"1.4rem",color:"#f8fafc",fontWeight:700,letterSpacing:"-0.02em" }}>{body.name}</h2>
              </div>
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
              {TAG_COLORS[body.type]&&<Badge label={body.type} color={TAG_COLORS[body.type]}/>}
              {!isSun&&body.has_rings&&<Badge label="Rings" color={{bg:"rgba(167,139,250,0.15)",text:"#a78bfa"}}/>}
              {!isSun&&body.moons>0&&<Badge label={`${body.moons} moon${body.moons!==1?"s":""}`} color={{bg:"rgba(148,163,184,0.12)",text:"#94a3b8"}}/>}
              {isSun&&<Badge label="Solar wind" color={{bg:"rgba(251,146,60,0.12)",text:"#fb923c"}}/>}
            </div>
          </>
        ) : (
          <><h2 style={{ margin:"0 0 4px",fontSize:"1.2rem",color:"#f8fafc",fontWeight:700 }}>Solar System</h2>
          <p style={{ margin:0,fontSize:"0.82rem",color:"#475569" }}>Click a planet or the Sun to explore</p></>
        )}
      </div>
      {tabs.length>0&&(
        <div style={{ display:"flex",borderBottom:"1px solid rgba(148,163,184,0.08)" }}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ flex:1,padding:"9px 0",background:"none",border:"none",color:tab===t?"#60a5fa":"#475569",fontSize:"0.75rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",cursor:"pointer",borderBottom:tab===t?"2px solid #60a5fa":"2px solid transparent",transition:"color 0.2s" }}>
              {t==="atmo"?"Atmosphere":t}
            </button>
          ))}
        </div>
      )}
      <div style={{ padding:"12px 18px 16px",maxHeight:360,overflowY:"auto" }}>
        {!body&&(
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7 }}>
            {["Sun",...allPlanets].map(n=>(
              <button key={n} onClick={()=>onSelect(n)} style={{ background:"rgba(148,163,184,0.06)",border:"1px solid rgba(148,163,184,0.12)",color:n==="Sun"?"#fbbf24":"#cbd5e1",padding:"9px 8px",borderRadius:10,cursor:"pointer",fontSize:"0.86rem",fontWeight:600 }}
              onMouseOver={e=>e.currentTarget.style.background="rgba(148,163,184,0.14)"}
              onMouseOut={e=>e.currentTarget.style.background="rgba(148,163,184,0.06)"}>{n}</button>
            ))}
          </div>
        )}
        {body&&tab==="stats"&&stats.map(([l,v])=><StatRow key={l} label={l} value={String(v)}/>)}
        {body&&tab==="facts"&&<ul style={{ margin:0,padding:"0 0 0 16px",lineHeight:1.75 }}>{body.fun_facts?.map((f,i)=><li key={i} style={{ marginBottom:7,color:"#cbd5e1",fontSize:"0.86rem" }}>{f}</li>)}</ul>}
        {body&&tab==="atmo"&&(
          <div style={{ display:"flex",flexWrap:"wrap",gap:7,paddingTop:4 }}>
            {atmosphereItems.map((a,i)=><span key={i} style={{ background:"rgba(96,165,250,0.1)",color:"#93c5fd",padding:"5px 12px",borderRadius:999,fontSize:"0.8rem",fontWeight:500,border:"1px solid rgba(96,165,250,0.2)" }}>{a}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

const DEG = Math.PI / 180;
const PLANET_CONFIG = [
  { name:"Mercury", a:5.5,  b:4.4,   incline:7.0*DEG,  speed:1.20, size:0.32, initialAngle:0.5 },
  { name:"Venus",   a:7.5,  b:6.9,   incline:3.4*DEG,  speed:0.85, size:0.62, initialAngle:2.1 },
  { name:"Earth",   a:10,   b:9.5,   incline:0,         speed:0.65, size:0.66, initialAngle:4.2 },
  { name:"Mars",    a:13,   b:12.0,  incline:1.85*DEG, speed:0.45, size:0.44, initialAngle:1.0 },
  { name:"Jupiter", a:18,   b:17.2,  incline:1.3*DEG,  speed:0.22, size:1.85, initialAngle:3.5 },
  { name:"Uranus",  a:27,   b:26.4,  incline:0.77*DEG, speed:0.11, size:1.05, initialAngle:0.8 },
  { name:"Neptune", a:33,   b:32.2,  incline:1.77*DEG, speed:0.07, size:1.00, initialAngle:5.5 },
];
const SATURN_CFG = { a:22, b:21.0, incline:2.49*DEG, speed:0.16, initialAngle:2.8 };



export default function SolarSystemExplorer({ data, error }) {
  const [focusRef, setFocusRef]   = useState(null);
  const [selected, setSelected]   = useState(null);
  const [focusSize, setFocusSize] = useState(1);
  const [panelOpen, setPanelOpen] = useState(true);
  const allPlanets = useMemo(()=>[...PLANET_CONFIG.map(p=>p.name),"Saturn"],[]);

  const handleClick = (ref, name) => {
    const cfg = name==="Saturn"?{size:1.35}:PLANET_CONFIG.find(p=>p.name===name);
    setFocusRef(ref); setSelected(name); setFocusSize(cfg?.size||1);
  };
  const handleSunClick = (e) => {
    e.stopPropagation();
    setFocusRef({ current: e.object.parent });
    setSelected("Sun"); setFocusSize(2.8);
  };

  return (
    <div style={{ position:"relative",width:"100%",height:"100vh",overflow:"hidden",background:"#020810" }}>
      {!panelOpen&&(
        <button onClick={()=>setPanelOpen(true)} style={{ position:"absolute",top:16,left:16,zIndex:20,background:"rgba(2,8,23,0.92)",border:"1px solid rgba(148,163,184,0.16)",color:"#f8fafc",width:42,height:42,borderRadius:"50%",cursor:"pointer",fontSize:"1.1rem",display:"grid",placeItems:"center",backdropFilter:"blur(12px)" }}>☰</button>
      )}
      {panelOpen&&(
        <div style={{ position:"absolute",top:16,left:16,zIndex:20,width:"min(90vw, 310px)",maxHeight:"calc(100vh - 32px)",overflowY:"auto",display:"flex",flexDirection:"column",gap:10 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(2,8,23,0.97)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:16,padding:"11px 15px",backdropFilter:"blur(20px)" }}>
            <div>
              <p style={{ margin:0,fontSize:"0.65rem",color:"#334155",textTransform:"uppercase",letterSpacing:"0.18em" }}>Interactive</p>
              <h1 style={{ margin:0,fontSize:"1rem",color:"#f8fafc",fontWeight:700 }}>Solar System Explorer</h1>
            </div>
            <button onClick={()=>setPanelOpen(false)} style={{ background:"none",border:"none",color:"#475569",fontSize:"1.3rem",cursor:"pointer",padding:4,borderRadius:6 }}
            onMouseOver={e=>e.currentTarget.style.color="#f8fafc"} onMouseOut={e=>e.currentTarget.style.color="#475569"}>×</button>
          </div>
          {error?(
            <div style={{ color:"#fca5a5",padding:14,background:"rgba(2,8,23,0.9)",borderRadius:14,fontSize:"0.88rem" }}>{error}</div>
          ):(
            <InfoPanel selected={selected} allData={data} onSelect={(n)=>{setSelected(n);setFocusRef(null);}} allPlanets={allPlanets}/>
          )}
        </div>
      )}
      <Canvas camera={{ position:[0,28,50],fov:50 }} onPointerMissed={()=>{setFocusRef(null);setSelected(null);}}>
        <CameraController targetRef={focusRef} planetSize={focusSize}/>
        <ambientLight intensity={0.12}/>
        <pointLight position={[0,0,0]} intensity={20} color="#ffeecc" decay={1.6}/>
        <pointLight position={[0,5,0]} intensity={3} color="#ffddaa" decay={2}/>
        <Stars radius={220} depth={90} count={12000} factor={4.5} fade speed={0.4}/>
        <Sun onClick={handleSunClick}/>
        {PLANET_CONFIG.map(p=><OrbitRing key={p.name} a={p.a} b={p.b} incline={p.incline}/>)}
        <OrbitRing a={SATURN_CFG.a} b={SATURN_CFG.b} incline={SATURN_CFG.incline}/>
        {PLANET_CONFIG.map(p=><Planet key={p.name} {...p} onClick={handleClick}/>)}
        <Saturn {...SATURN_CFG} onClick={handleClick}/>
        <OrbitControls  autoRotate autoRotateSpeed={0.2} enablePan={false} minDistance={8} maxDistance={100}/>
      </Canvas>
    </div>
  );
}