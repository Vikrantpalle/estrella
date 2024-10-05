'use client';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import Link from "next/link";

import exoPlanets from '@/../public/exoplanets.json';



export default function Home() {

  const [search, setSearch] = useState("");
  
  return (
    <div className='flex flex-col h-full items-center'>
      <h1 className='font-bold text-7xl'>ESTRELLA</h1>
      <input type="text" onChange={(e) => setSearch(e.target.value)} className='bg-transparent border-2 rounded-xl m-2 p-2 focus:outline-none' />
      <div className="flex overflow-scroll flex-col h-full w-3/6 p-8  w-80 border-solid border-2 rounded border-white">
            {exoPlanets.filter((name) => name.startsWith(search)).map(name => <Link key={name} href={'goggles/'+name} className="font-bold bg-transparent border-2 hover:bg-slate-700 p-2 m-1 rounded">{name}</Link>)}
      </div>
    </div>
  );
}
