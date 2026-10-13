 'use strict';
// Small real 3D mesh, projected into the existing Canvas renderer.
// Local axes: X across wings, Y along hull, Z above the hull.
const PilotShip3D=(()=>{
 let faces=[];
 function face(points,color){faces.push({points,color});}
 function prism(outline,bottom,top,color){
   face(outline.map(([x,y])=>[x,y,top]),color);
   face([...outline].reverse().map(([x,y])=>[x,y,bottom]),color);
   outline.forEach(([x,y],i)=>{const [a,b]=outline[(i+1)%outline.length];face([[x,y,bottom],[a,b,bottom],[a,b,top],[x,y,top]],color);});
 }
 const metal=[137,163,185],wing=[94,123,148],dark=[36,58,80],glass=[63,195,229];
 prism([[-5,-42],[5,-42],[14,10],[10,29],[-10,29],[-14,10]],-5,3,metal);
 face([[0,-51,0],[-5,-42,3],[0,-33,9],[5,-42,3]],metal);
 face([[0,-33,9],[-5,-42,3],[-14,10,3],[0,23,10]],metal);
 face([[0,-33,9],[0,23,10],[14,10,3],[5,-42,3]],[174,194,209]);
 for(const side of [-1,1]){
  const outline=[[side*9,-10],[side*40,23],[side*37,33],[side*12,21]];
  if(side<0)outline.reverse();prism(outline,-4,0,wing);
  prism([[side*15,9],[side*23,14],[side*23,35],[side*15,35]],-4,5,dark);
  face([[side*16,35,-2],[side*22,35,-2],[side*22,35,3],[side*16,35,3]],[95,235,255]);
  face([[side*27,15,1],[side*34,23,1],[side*32,25,1],[side*24,17,1]],[173,218,237]);
 }
 face([[-6,-20,8],[0,-28,13],[0,0,16],[-7,4,9]],glass);
 face([[0,-28,13],[6,-20,8],[7,4,9],[0,0,16]],[111,229,247]);
 face([[-7,4,9],[0,0,16],[7,4,9],[0,9,10]],[29,87,112]);
 prism([[-2,14],[2,14],[2,31],[-2,31]],4,15,wing);

 const fleet=[faces];
 const colors=[[137,163,185],[126,192,115],[67,195,174],[76,163,220],[132,133,226],[169,100,211],[222,115,162],[231,156,76],[98,208,223],[234,197,102]];
 function hull(outline,color,height=8){
  prism(outline,-4,2,color);
  const cy=outline.reduce((v,p)=>v+p[1],0)/outline.length;
  outline.forEach(([x,y],i)=>{const [a,b]=outline[(i+1)%outline.length];face([[x,y,2],[a,b,2],[0,cy,height]],color);});
 }
 function cockpit(x,y,w=5,length=17){
  face([[x-w,y+length/2,8],[x,y-length/2,12],[x,y+length/2,17]],glass);
  face([[x,y-length/2,12],[x+w,y+length/2,8],[x,y+length/2,17]],[123,235,247]);
 }
 function pod(x,y,w=6,length=24){
  prism([[x-w,y-length/2],[x+w,y-length/2],[x+w,y+length/2],[x-w,y+length/2]],-5,5,dark);
  face([[x-w+1,y+length/2,-3],[x+w-1,y+length/2,-3],[x+w-1,y+length/2,4],[x-w+1,y+length/2,4]],[96,232,248]);
 }
 function wings(points,color){for(const sign of [-1,1]){const outline=points.map(([x,y])=>[x*sign,y]);if(sign<0)outline.reverse();prism(outline,-3,1,color);}}
 function ring(rx,ry,width,color){for(let i=0;i<12;i++){const a=i*Math.PI/6,b=(i+1)*Math.PI/6;prism([[Math.cos(a)*rx,Math.sin(a)*ry],[Math.cos(b)*rx,Math.sin(b)*ry],[Math.cos(b)*(rx-width),Math.sin(b)*(ry-width)],[Math.cos(a)*(rx-width),Math.sin(a)*(ry-width)]],-2,2,color);}}
 for(let index=1;index<10;index++){
  faces=[];const c=colors[index];
  if(index===1){ // Twin-boom scout: open centre, short bridging cockpit.
   for(const x of [-23,23]){prism([[x,-47],[x+6,-26],[x+6,27],[x-6,27],[x-6,-26]],-4,6,c);pod(x,28,6,18);}
   wings([[0,-6],[26,-17],[26,2],[0,10]],wing);hull([[-8,-16],[8,-16],[11,13],[-11,13]],c);cockpit(0,-5,5,14);
  }else if(index===2){ // Crescent, broad forward-curving arms.
   hull([[0,-27],[16,-10],[20,25],[-20,25],[-16,-10]],c);
   wings([[12,4],[28,-8],[44,-36],[45,12],[25,32],[12,20]],c);cockpit(0,-8);pod(-22,25);pod(22,25);
  }else if(index===3){ // Delta bomber with a broad triangular planform.
   hull([[0,-43],[49,32],[17,25],[0,37],[-17,25],[-49,32]],c,13);cockpit(0,-8,8,24);
   pod(-23,24,8,18);pod(23,24,8,18);prism([[-3,8],[3,8],[3,31],[-3,31]],6,19,wing);
  }else if(index===4){ // Four diagonal outriggers.
   hull([[0,-36],[12,-17],[12,26],[0,37],[-12,26],[-12,-17]],c);
   wings([[8,-15],[40,-36],[46,-29],[17,0]],c);wings([[10,8],[45,28],[42,39],[12,24]],wing);
   for(const x of [-39,39]){pod(x,-25,4,20);pod(x,29,5,19);}cockpit(0,-10);
  }else if(index===5){ // Stealth flying wing with a notched trailing edge.
   hull([[0,-31],[50,18],[35,25],[20,12],[11,31],[0,20],[-11,31],[-20,12],[-35,25],[-50,18]],c,7);
   cockpit(0,-8,7,15);pod(-12,18,5,16);pod(12,18,5,16);
  }else if(index===6){ // Armoured industrial cruiser, four engine pods.
   hull([[-16,-35],[16,-35],[25,-16],[25,25],[14,35],[-14,35],[-25,25],[-25,-16]],c,14);
   wings([[18,-20],[39,-12],[39,24],[18,20]],wing);
   for(const x of [-34,34]){pod(x,-8,8,24);pod(x,22,8,22);}cockpit(0,-17,9,18);
   for(const x of [-12,12])prism([[x-4,-4],[x+4,-4],[x+4,20],[x-4,20]],7,12,metal);
  }else if(index===7){ // Spearhead dreadnought with swept double wings.
   hull([[0,-55],[10,-20],[15,30],[0,40],[-15,30],[-10,-20]],c,16);
   wings([[9,-15],[37,-2],[47,31],[25,20],[12,7]],c);wings([[8,12],[30,39],[23,44],[8,26]],wing);
   pod(-28,22,7,25);pod(28,22,7,25);pod(0,32,7,20);cockpit(0,-14,5,24);
  }else if(index===8){ // Orbital halo and narrow central shuttle.
   ring(45,39,7,c);wings([[0,-5],[40,-5],[40,4],[0,4]],wing);
   hull([[0,-49],[10,-15],[9,32],[0,44],[-9,32],[-10,-15]],metal,11);cockpit(0,-12,5,23);
   pod(-32,25,5,20);pod(32,25,5,20);
  }else{ // Mythic six-fin crown, floating side hulls and raised core.
   hull([[0,-52],[13,-21],[19,15],[0,38],[-19,15],[-13,-21]],c,20);
   wings([[12,-17],[32,-43],[27,-8],[15,9]],c);wings([[15,0],[48,-15],[43,17],[19,22]],c);wings([[14,18],[37,31],[26,45],[8,31]],c);
   for(const x of [-39,39]){prism([[x,-22],[x+5,3],[x,29],[x-5,3]],-2,9,metal);pod(x,24,5,14);}
   cockpit(0,-14,6,27);face([[-7,7,17],[0,-2,24],[7,7,17],[0,19,23]],[165,250,255]);pod(0,32,8,14);
  }
  fleet.push(faces);
 }
 function transform(p,bank,time){
  const [x,y,z]=p,cb=Math.cos(bank),sb=Math.sin(bank);
  const xx=x*cb+z*sb,zz=z*cb-x*sb;
  const tilt=.43+Math.sin(time*.8)*.025,c=Math.cos(tilt),s=Math.sin(tilt);
  return [xx,y*c-zz*s,y*s+zz*c];
 }
 function mesh(bank,time,index=0){
 index=Math.max(0,Math.min(9,index));
 return fleet[index].map(f=>{
  const v=f.points.map(p=>transform(p,bank,time));
  const a=v[0],b=v[1],c=v[2],u=b.map((n,i)=>n-a[i]),w=c.map((n,i)=>n-a[i]);
  const n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],len=Math.hypot(...n)||1;
  const light=.32+.68*Math.max(0,(-.45*n[0]-.4*n[1]+.8*n[2])/len);
  return {points:v.map(([x,y,z])=>{const scale=240/(240-z);return [x*scale,y*scale];}),depth:v.reduce((n,p)=>n+p[2],0)/v.length,color:'rgb('+f.color.map(n=>Math.round(n*light)).join(',')+')'};
 }).sort((a,b)=>a.depth-b.depth);}
 function draw(ctx,bank,time,index=0){
  ctx.save();ctx.lineJoin='round';ctx.lineWidth=.65;
  for(const f of mesh(Math.max(-.65,Math.min(.65,bank)),time,index)){
   ctx.beginPath();f.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=f.color;ctx.strokeStyle=f.color;ctx.fill();ctx.stroke();
  }
  ctx.restore();
 }
 return {draw,mesh};
})();
