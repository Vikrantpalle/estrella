'use client';
import { Canvas, useLoader } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import * as THREE from 'three';
import React, { useEffect, useState } from 'react';


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
  gl_Position = projectionMatrix * modelViewMatrix * vec4(normalize(position), 1.);
}
`

const FRAGMENT_SHADER = `
uniform sampler2D pointTexture;
varying float b;

void main() {
  gl_FragColor = vec4(1., 1., 1., 1.) * texture2D(pointTexture, gl_PointCoord);
}
`

export default function Goggles({params}: {params: {name: string}}) {
    const pointTexture = useLoader(THREE.TextureLoader, '/spark1.png'); 
    const [data, setData] = useState<drawContext | null>(null);

    useEffect(() => {
        fetch('https://exoplanet_stars.storage.googleapis.com/'+params.name+'.json')
        .then(res => res.json())
        .then(dat => {
            const position = new THREE.Float32BufferAttribute(dat.flatMap((val: number[]) => [val[1], val[2], val[3]]), 3);
            const size = new THREE.Float32BufferAttribute(dat.map((val: number[]) => interpolate(-val[4])), 1);      
            setData({position, size});
        })
      }, [params.name]);
    
    return (
    data && <Canvas camera={{ position: [0, 0, 0] }}>
        <PointerLockControls />
        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={0.4} intensity={7}  />
          <ToneMapping />
        </EffectComposer>
        <points>
        <bufferGeometry>
          <bufferAttribute attach={"attributes-position"} {...data.position}/>
          <bufferAttribute attach={"attributes-size"} {...data.size}/>
        </bufferGeometry>
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
      </points>
    </Canvas>
    )
}