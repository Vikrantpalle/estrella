'use client';
import { Canvas, useLoader, Vector3 } from '@react-three/fiber';
import { Line, OrbitControls, Point, Points } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import * as THREE from 'three';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


function interpolate(x: number) {
  return ((x+6)/(3 + 6))*(20);
}

export interface drawContext {
    position: THREE.Float32BufferAttribute
    size: THREE.Float32BufferAttribute
}


const VERTEX_SHADER = `
attribute float size;
varying float b;

void main() {
  b = size;
  gl_PointSize = size;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(normalize(position)*100., 1.);
}
`

const FRAGMENT_SHADER = `
uniform sampler2D pointTexture;
varying float b;

void main() {
  gl_FragColor = vec4(1., 1., 1., 1.) * texture2D(pointTexture, gl_PointCoord);
}
`

enum Modes {
  DRAWING = "DRAWING",
  VIEWING = "VIEWING",
  MENU = "MENU"
}

const helpText = {
  "DRAWING": "select pairs of stars by long pressing to draw lines between them; press 'm' for menu, 'v' for view mode",
  "VIEWING": "360 view of star map; press 'm' for menu, 'd' for draw mode",
  "MENU": "redirecting to menu"
}

export default function Goggles({params}: {params: {name: string}}) {
    const pointTexture = useLoader(THREE.TextureLoader, '/spark1.png'); 
    const [starPoints, setStarPoints] = useState<number[][] | null>(null);
    const [points, setPoints] = useState<Vector3[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<Vector3 | null>(null);
    const [mode, setMode] = useState<Modes>(Modes.VIEWING);
    const router = useRouter();

    useEffect(() => {
        fetch('https://exoplanet_stars.storage.googleapis.com/'+params.name+'.json')
        .then(res => res.json())
        .then(data => setStarPoints(data));
      }, [params.name]);

    useEffect(() => {
      if (mode === Modes.DRAWING) setSelectedPoint(null);
    }, [mode])

    const handleStarClick = (ev: THREE.Object3D<THREE.Object3DEventMap>) => {
      if (mode !== Modes.DRAWING) return;
      if (!selectedPoint) setSelectedPoint(ev.position.normalize());
      else {
        const newPoints = points.concat(...[selectedPoint, ev.position.normalize()]);
        setPoints(newPoints)
        setSelectedPoint(null);
      }
    }

    const handleKey = (ev: KeyboardEvent) => {
      switch(ev.key) {
        case "d":
          setMode(Modes.DRAWING)
          break
        case "v":
          setMode(Modes.VIEWING)
          break
        case "m":
          router.push('/')
      }
    }

    useEffect(() => {
      window.addEventListener('keydown', handleKey);

      return () => {
        window.removeEventListener('keydown', handleKey);
      }
    })
    
    return (
      <div className='h-full w-full'>
        <div className='absolute bottom-0 w-full text-center'>{helpText[mode]}</div>
        {starPoints && <Canvas camera={{ position: [0, 0, 0.01] }}>
            <OrbitControls enabled={mode === Modes.VIEWING} enableZoom={false} enablePan={false} rotateSpeed={-0.35} maxPolarAngle={Math.PI/2} minPolarAngle={-Math.PI/2}/>
            <EffectComposer>
              <Bloom mipmapBlur luminanceThreshold={0.4} intensity={7}  />
              <ToneMapping />
            </EffectComposer>
            <Line 
              points={points}
              color={'white'} 
              lineWidth={1}
              segments
              onClick={(ev) => console.log(ev)}
            />
            <Points limit={55000}>
              <shaderMaterial 
                transparent={true}
                depthTest={false}
                uniforms = {
                  {pointTexture: { value: pointTexture }}
                }
                blending={THREE.AdditiveBlending}
                vertexShader={VERTEX_SHADER}
                fragmentShader={FRAGMENT_SHADER}
              />
              {starPoints.map((row, idx) => <Point key={idx} userData={{source_id: row[0]}} position={[row[1], row[2], row[3]]} size={interpolate(-row[4])} onClick={(ev) => handleStarClick(ev.eventObject)}/>)}
              {selectedPoint && <Point key="sel" position={selectedPoint} size={10} color="red" />}  
            </Points>
        </Canvas>}
      </div>
    )
}