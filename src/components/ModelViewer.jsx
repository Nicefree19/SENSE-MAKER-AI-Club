import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

const Model = ({ url }) => {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
};

const ModelViewer = ({ modelUrl }) => {
    if (!modelUrl) return null;

    return (
        <div className="w-full h-[400px] bg-gray-900 rounded-lg overflow-hidden relative">
            <Suspense
                fallback={
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                        <Loader2 className="animate-spin mr-2" />
                        Loading 3D Model...
                    </div>
                }
            >
                <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                    <Stage environment="city" intensity={0.6}>
                        <Model url={modelUrl} />
                    </Stage>
                    <OrbitControls autoRotate />
                </Canvas>
            </Suspense>
            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
                Interactive 3D View
            </div>
        </div>
    );
};

export default ModelViewer;
