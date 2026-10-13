 'use strict';
// Small real 3D mesh, projected into the existing Canvas renderer.
// Local axes: X across wings, Y along hull, Z above the hull.
const PilotShip3D=(()=>{
 const faces=[];
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
 function transform(p,bank,time){
  const [x,y,z]=p,cb=Math.cos(bank),sb=Math.sin(bank);
  const xx=x*cb+z*sb,zz=z*cb-x*sb;
  const tilt=.43+Math.sin(time*.8)*.025,c=Math.cos(tilt),s=Math.sin(tilt);
  return [xx,y*c-zz*s,y*s+zz*c];
 }
 function mesh(bank,time,index=0){
 const palettes=[[137,163,185],[126,192,115],[67,195,174],[76,163,220],[132,133,226],[169,100,211],[222,115,162],[231,156,76],[98,208,223],[234,197,102]];
 const widths=[1,.83,1.12,1.25,1.05,.9,1.3,1.42,1.2,1.5],lengths=[1,1.2,1.04,.94,1.17,1.3,1.06,1.1,1.3,1.22];
 index=Math.max(0,Math.min(9,index));
 return faces.map(f=>{
  const v=f.points.map(([x,y,z])=>transform([x*widths[index],y*lengths[index]+(Math.abs(x)>24?index*1.4:0),z*(1+index*.04)],bank,time));
  const a=v[0],b=v[1],c=v[2],u=b.map((n,i)=>n-a[i]),w=c.map((n,i)=>n-a[i]);
  const n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],len=Math.hypot(...n)||1;
  const light=.32+.68*Math.max(0,(-.45*n[0]-.4*n[1]+.8*n[2])/len);
  return {points:v.map(([x,y,z])=>{const scale=240/(240-z);return [x*scale,y*scale];}),depth:v.reduce((n,p)=>n+p[2],0)/v.length,color:'rgb('+(index&&f.color===metal?palettes[index]:f.color).map(n=>Math.round(n*light)).join(',')+')'};
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
