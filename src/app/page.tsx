'use client';
import React, { useState } from 'react';
import Link from "next/link";

import exoPlanets from '@/../public/exoplanets.json';
import Image from 'next/image';



export default function Home() {

  const [search, setSearch] = useState("");
  
  return (
    <div className='flex flex-col h-full w-full items-center'>
      <Image 
      src='/paul-volkmer-qVotvbsuM_c-unsplash.jpg'
      alt='night sky background'
      layout='fill'
      objectFit='cover'
      quality={100}
      className='-z-10'
      />
      <div className='absolute bottom-0 w-full text-center'>renderer might take a minute to load, please be patient</div>
      <h1 className='font-bold text-7xl m-2'>ESTRELLA</h1>
      <div className="flex overflow-scroll flex-col h-full w-4/5 p-4 bg-black  w-80 border-solid border-2 m-5 rounded border-white">
        <h1 className='font-bold text-3xl'>Choose from {exoPlanets.length} exoplanets to view star maps</h1>
        <input type="text" placeholder='Search' onChange={(e) => setSearch(e.target.value)} className='bg-transparent border-2 rounded-xl m-2 p-2 focus:outline-none' />
        <div className="flex overflow-scroll flex-col h-full w-full p-4  w-80 rounded border-white">
        {exoPlanets.filter((name) => name.startsWith(search)).map(name => <Link key={name} href={'goggles/'+name} className="font-bold bg-transparent border-2 hover:bg-slate-700 p-2 m-1 rounded">{name}</Link>)}
        </div>
      </div>
    </div>
  );
}
