import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Center, Environment } from '@react-three/drei';
import { useFarmItems } from '@/hooks/useFarmItems';

interface Farm3DItemProps {
  slot: any;
  position: [number, number, number];
}

const Farm3DItem: React.FC<Farm3DItemProps> = ({ slot, position }) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      
      <Center position={[0, 0.5, 0]}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.3}
          height={0.1}
          curveSegments={12}
        >
          {slot.icon}
          <meshStandardMaterial color="#ffffff" />
        </Text3D>
      </Center>
      
      {/* Ground shadow */}
      <mesh position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const Farm3DGrid = () => {
  const { getGridLayout, loading } = useFarmItems();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Lade 3D Farm...</p>
        </div>
      </div>
    );
  }

  const gridLayout = getGridLayout();
  const farmItems: JSX.Element[] = [];

  // Convert 2D grid to 3D positions
  gridLayout.forEach((row, rowIndex) => {
    row.forEach((slot, colIndex) => {
      if (slot && slot.isOwned) {
        const position: [number, number, number] = [
          colIndex * 2 - 5, // Center horizontally
          0,
          rowIndex * 2 - 3  // Center vertically
        ];
        farmItems.push(
          <Farm3DItem
            key={`${rowIndex}-${colIndex}`}
            slot={slot}
            position={position}
          />
        );
      }
    });
  });

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-green-300">
      <Canvas
        camera={{ position: [10, 8, 10], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB, #98FB98)' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />

          {/* Environment */}
          <Environment preset="sunset" />

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#90EE90" />
          </mesh>

          {/* Farm items */}
          {farmItems}

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Farm3DGrid;