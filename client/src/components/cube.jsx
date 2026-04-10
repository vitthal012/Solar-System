import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Stars } from "@react-three/drei";
import { useRef } from "react";

function Sphere() {
  const ref = useRef();

  useFrame(({ clock }) => {
    ref.current.position.y = Math.sin(clock.getElapsedTime()) * 1.5;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="golden"/>
    </mesh>
  );
}

export default function CBE() {
  return (
    <div style={{height:"100vh"}}>
      <Canvas>
        <Sphere />
        <Stars
        
              radius={100}
              depth={50}
              count={5000}
              factor={4}
              fade
        />
        <ambientLight intensity={0.3} />
        <directionalLight position={[0, 0, 5]} intensity={1} />
        <OrbitControls autoRotate/>
      </Canvas>
    </div>
  );
}