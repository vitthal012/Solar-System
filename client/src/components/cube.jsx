import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";


function PlanetInfo({ targetRef, data }) {
  if (!targetRef || !data) return null;

  return (
    <Html position={[0, 0, -5]} center>
      <div
        style={{
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "10px",
          width: "200px",
        }}
      >
        <h3>{data.name}</h3>
        <p>Diameter: {data.diameter_km} km</p>
        <p>Distance: {data.distance_from_sun_million_km||0}Million km</p>
        <p>Moons: {data.moons}</p>
      </div>
    </Html>
  );
}


function Planet({ radius, speed, size, color, setfocus, setname, name}) {
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;

    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;

      ref.current.rotation.y += 0.01;

    }
  });

  return (
    <mesh
      ref={ref}
      onClick={() => {setfocus(ref) ;setname(name) }}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
      />
    </mesh>
  );
}

function Saturn({ radius, speed, setfocus, setname }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;

    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
    }
  });

  return (
    <group ref={ref} onClick={() => {setfocus(ref);setname("Saturn")}}>
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.2, 16, 100]} />
        <meshStandardMaterial color="gold" />
      </mesh>
    </group>
  );
}


function Sun({ setfocus ,setsunfocused, setname}) {
  const ref = useRef();
  

  return (
    <mesh ref={ref} onClick={() => {setfocus(ref);setsunfocused(true);setname("Sun")}}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshStandardMaterial
        emissive="orange"
        emissiveIntensity={3}
        color="orange"
      />
    </mesh>
  );
}

function CameraController({ targetRef }) {
  const { camera } = useThree();

  useFrame(() => {
  
  if (targetRef?.current) {
      const target = targetRef.current.position;

      const desired = new THREE.Vector3(
        target.x + 6,
        target.y + 4,
        target.z + 6
      );

      camera.position.lerp(desired, 0.02);
      camera.lookAt(target);
    }})

  return null;
}

export default function CBE({data}) {
  const [focus, setfocus] = useState(null);
  const [sunfocused, setsunfocused] = useState(false);
  const [name,setname]=useState("Earth");
  
  return (
    <div style={{ height: "100vh" }}>
      
      <Canvas
        onPointerMissed={() => {setfocus(null); setsunfocused(false); setname("Earth");}}
        camera={{ position: [0, 10, 25] }}
      >
        
        <CameraController targetRef={focus} />
        {focus && <PlanetInfo targetRef={focus} data={data[name]}/>}

        <Sun  setfocus={setfocus} setsunfocused={setsunfocused} setname={setname} />

        
        <Planet radius={6}  speed={1}   size={0.6} color="skyblue"setfocus={setfocus} setname={setname}  name={"Earth"}/>
        <Planet radius={9}  speed={0.6} size={0.9} color="green"  setfocus={setfocus} setname={setname}  name={"Mercury"}/>
        <Planet radius={12} speed={0.4} size={1.2} color="red"    setfocus={setfocus} setname={setname}  name={"Venus"}/>
        <Planet radius={10} speed={0.9} size={1}   color="yellow" setfocus={setfocus} setname={setname}  name={"Mars"}/>
        <Planet radius={14} speed={0.8} size={1.1} color="blue"   setfocus={setfocus} setname={setname}  name={"Uranus"}/>
        <Planet radius={8}  speed={0.68}size={1.1} color="blue"   setfocus={setfocus} setname={setname}  name={"Neptune"}/>

        
        <Saturn radius={18} speed={0.3} setfocus={setfocus}  data={data.Saturn} setname={setname}/>

        
        <Stars
          radius={150}
          depth={60}
          count={8000}
          factor={6}
          fade
          speed={1}
        />

        
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={15} />

        
        {sunfocused?<OrbitControls autoRotate autoRotateSpeed={0.5} />:<OrbitControls enabled={!focus} autoRotate autoRotateSpeed={0.5} />}
      </Canvas>
    </div>
  );
}