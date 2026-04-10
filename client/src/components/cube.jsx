import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Stars } from "@react-three/drei";
import { useRef } from "react";

function Planet({ radius, speed, size }) {
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
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial  color="skyBlue" />
    </mesh>
  );
}
function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[3, 32, 32]} />
      <meshBasicMaterial color="orange" />
    </mesh>
  );
}
export default function CBE() {
  return (
    <div style={{ height: "100vh" }}>
      <Canvas>
        
        <Sun />

        
        <Planet radius={6} speed={1} size={0.7} />
        <Planet radius={9} speed={0.6} size={1} />
        <Planet radius={12} speed={0.4} size={1.2} />
        <Planet radius={15} speed={0.3} size={1.5} />

        
        <Stars radius={100} depth={50} count={5000} factor={4} fade />

       
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={12} />

        <OrbitControls />
      </Canvas>
    </div>
  );
}