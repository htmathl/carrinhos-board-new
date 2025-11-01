import React from 'react';

export default function GhostLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="relative scale-[0.8]">
        <div className="ghost-body animate-upNDown relative w-[140px] h-[140px]">
          {/* Pupils - precisam estar primeiro para z-index funcionar */}
          <div className="absolute top-[50px] left-[10px] w-[20px] h-[20px] bg-blue-600 z-10 animate-eyesMovement" />
          <div className="absolute top-[50px] right-[50px] w-[20px] h-[20px] bg-blue-600 z-10 animate-eyesMovement" />
          
          {/* Eyes */}
          <div className="absolute top-[30px] left-[10px] w-[40px] h-[50px]">
            <div className="absolute bg-white w-[20px] h-[50px] translate-x-[10px]" />
            <div className="absolute bg-white w-[40px] h-[30px] translate-y-[10px]" />
          </div>
          <div className="absolute top-[30px] right-[30px] w-[40px] h-[50px]">
            <div className="absolute bg-white w-[20px] h-[50px] translate-x-[10px]" />
            <div className="absolute bg-white w-[40px] h-[30px] translate-y-[10px]" />
          </div>

          {/* Body parts - usando grid-area inline */}
          <div className="bg-red-600" style={{ gridArea: 'top0' }} />
          <div className="bg-red-600" style={{ gridArea: 'top1' }} />
          <div className="bg-red-600" style={{ gridArea: 'top2' }} />
          <div className="bg-red-600" style={{ gridArea: 'top3' }} />
          <div className="bg-red-600" style={{ gridArea: 'top4' }} />
          
          {/* Static bottom parts */}
          <div className="bg-red-600" style={{ gridArea: 'st0' }} />
          <div className="bg-red-600" style={{ gridArea: 'st1' }} />
          <div className="bg-red-600" style={{ gridArea: 'st2' }} />
          <div className="bg-red-600" style={{ gridArea: 'st3' }} />
          <div className="bg-red-600" style={{ gridArea: 'st4' }} />
          <div className="bg-red-600" style={{ gridArea: 'st5' }} />

          {/* Animated parts - flicker0 */}
          <div className="animate-flicker0" style={{ gridArea: 'an1' }} />
          <div className="animate-flicker0" style={{ gridArea: 'an6' }} />
          <div className="animate-flicker0" style={{ gridArea: 'an7' }} />
          <div className="animate-flicker0" style={{ gridArea: 'an8' }} />
          <div className="animate-flicker0" style={{ gridArea: 'an11' }} />
          <div className="animate-flicker0" style={{ gridArea: 'an12' }} />
          <div className="animate-flicker0" style={{ gridArea: 'an13' }} />
          <div className="animate-flicker0" style={{ gridArea: 'an18' }} />

          {/* Animated parts - flicker1 */}
          <div className="animate-flicker1" style={{ gridArea: 'an2' }} />
          <div className="animate-flicker1" style={{ gridArea: 'an3' }} />
          <div className="animate-flicker1" style={{ gridArea: 'an4' }} />
          <div className="animate-flicker1" style={{ gridArea: 'an5' }} />
          <div className="animate-flicker1" style={{ gridArea: 'an9' }} />
          <div className="animate-flicker1" style={{ gridArea: 'an10' }} />
          <div className="animate-flicker1" style={{ gridArea: 'an14' }} />
          <div className="animate-flicker1" style={{ gridArea: 'an15' }} />
          <div className="animate-flicker1" style={{ gridArea: 'an16' }} />
          <div className="animate-flicker1" style={{ gridArea: 'an17' }} />
        </div>

        {/* Shadow */}
        <div 
          className="absolute bg-black w-[140px] h-[140px] rounded-full blur-[20px] animate-shadowMovement" 
          style={{ 
            transform: 'rotateX(80deg)',
            top: '80%'
          }} 
        />
      </div>

      <style jsx>{`
        .ghost-body {
          display: grid;
          grid-template-columns: repeat(14, 1fr);
          grid-template-rows: repeat(14, 1fr);
          grid-column-gap: 0px;
          grid-row-gap: 0px;
          grid-template-areas:
            "a1  a2  a3  a4  a5  top0  top0  top0  top0  a10 a11 a12 a13 a14"
            "b1  b2  b3  top1 top1 top1 top1 top1 top1 top1 top1 b12 b13 b14"
            "c1 c2 top2 top2 top2 top2 top2 top2 top2 top2 top2 top2 c13 c14"
            "d1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 d14"
            "e1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 e14"
            "f1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 f14"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "st0 st0 an4 st1 an7 st2 an10 an10 st3 an13 st4 an16 st5 st5"
            "an1 an2 an3 an5 an6 an8 an9 an9 an11 an12 an14 an15 an17 an18";
        }
      `}</style>
    </div>
  );
}