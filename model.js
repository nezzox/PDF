/* Document model shared by the editor and its regression checks. */
(function(root){
'use strict';
const regular=(cols,rows,label)=>({cols,rows,label,cells:Array.from({length:cols*rows},(_,i)=>[i%cols,Math.floor(i/cols),1,1])});
const layouts={
 '1x1':regular(1,1,'1 × 1'),'2x1':regular(2,1,'2 × 1'),'2x2':regular(2,2,'2 × 2'),'1x2':regular(1,2,'1 × 2'),
 '3x1':regular(3,1,'3 kolumner'),'1x3':regular(1,3,'3 rader'),'3x2':regular(3,2,'3 × 2'),
 'stack-left':{cols:2,rows:3,label:'Tre till vänster',cells:[[0,0,1,1],[0,1,1,1],[0,2,1,1],[1,0,1,3]]},
 'stack-right':{cols:2,rows:3,label:'Tre till höger',cells:[[0,0,1,3],[1,0,1,1],[1,1,1,1],[1,2,1,1]]},
 '4x1':regular(4,1,'4 kolumner'),
 'hero-top':{cols:2,rows:2,label:'Stor ruta överst',cells:[[0,0,2,1],[0,1,1,1],[1,1,1,1]]},
 'hero-bottom':{cols:2,rows:2,label:'Stor ruta nederst',cells:[[0,0,1,1],[1,0,1,1],[0,1,2,1]]},
 'sidebar-left':{cols:3,rows:2,label:'Sidokolumn vänster',cells:[[0,0,1,2],[1,0,1,1],[2,0,1,1],[1,1,1,1],[2,1,1,1]]},
 'sidebar-right':{cols:3,rows:2,label:'Sidokolumn höger',cells:[[0,0,1,1],[1,0,1,1],[0,1,1,1],[1,1,1,1],[2,0,1,2]]},
 'feature-center':{cols:3,rows:2,label:'Stor mittruta',cells:[[0,0,1,1],[0,1,1,1],[1,0,1,2],[2,0,1,1],[2,1,1,1]]}
};
const styles={body:{label:'Brödtext',size:12,bold:false},title:{label:'Titel',size:30,bold:true},subtitle:{label:'Undertitel',size:19,bold:false}};
const uid=()=>crypto.randomUUID(),clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const cell=()=>({type:'empty',text:'',src:'',size:12,bold:false,align:'left',fit:'cover',textStyle:'body',hyphens:false,lineHeight:1.45,zoom:1,posX:50,posY:50});
const band=(enabled=false)=>({enabled,text:'',logo:'',logoWidth:30,logoPosition:'left'});
const contentTop=d=>d.header.enabled?40:15;
const contentHeight=d=>297-contentTop(d)-(d.footer.enabled?25:15);
const usedHeight=(p,d)=>p.blocks.reduce((n,b)=>n+b.height,0)+Math.max(0,p.blocks.length-1)*(d?.blockGap??5);
const maxHeight=(p,b,d)=>contentHeight(d)-(p.blocks.length-1)*d.blockGap-p.blocks.filter(x=>x!==b).reduce((n,x)=>n+x.height,0);
const weights=n=>Array(n).fill(1/n);
function createBlock(type,available){const l=layouts[type];if(!l)throw Error('Ogiltig layout');if(available<.1)return null;const b={id:uid(),type,height:Math.min(l.rows*58,available),gapX:4,gapY:4,cols:weights(l.cols),rows:weights(l.rows),cells:l.cells.map(cell)};fitGaps(b);return b}
function gapLimit(b,axis){const n=b[axis==='x'?'cols':'rows'].length,total=axis==='x'?180:b.height;return n>1?Math.max(0,Math.min(20,(total-.05)/(n-1))):20}
function fitGaps(b){b.gapX=clamp(b.gapX,0,gapLimit(b,'x'));b.gapY=clamp(b.gapY,0,gapLimit(b,'y'))}
function resizeTracks(tracks,index,delta,min=.0001){const result=[...tracks],total=tracks[index]+tracks[index+1],safe=Math.min(min,total/3);result[index]=clamp(tracks[index]+delta,safe,total-safe);result[index+1]=total-result[index];return result}
// Only draw handles where no merged cell crosses the boundary.
function dividerSegments(layout,axis,index){const isCols=axis==='cols',count=isCols?layout.rows:layout.cols,blocked=Array(count).fill(false);for(const [x,y,w,h] of layout.cells){const start=isCols?x:y,span=isCols?w:h;if(start<=index&&start+span>index+1){const other=isCols?y:x,len=isCols?h:w;for(let j=other;j<other+len;j++)blocked[j]=true}}const segments=[];for(let j=0;j<count;){if(blocked[j]){j++;continue}const start=j;while(j<count&&!blocked[j])j++;segments.push([start,j-start])}return segments}
const imageOK=s=>typeof s==='string'&&(!s||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s));
function validate(input){
 const fail=()=>{throw Error('Ogiltig projektfil')},number=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 if(!input||![1,2,3].includes(input.version)||typeof input.title!=='string'||typeof input.numbers!=='boolean'||!Array.isArray(input.pages)||!input.pages.length||input.pages.length>100)fail();
 const readBand=(raw,enabled)=>{if(!raw||typeof raw!=='object'||typeof raw.enabled!=='boolean'||typeof raw.text!=='string'||!imageOK(raw.logo)||!number(raw.logoWidth,5,70)||!['left','right'].includes(raw.logoPosition))fail();return {enabled:raw.enabled,text:raw.text,logo:raw.logo,logoWidth:raw.logoWidth,logoPosition:raw.logoPosition}};
 let header,footer;if(input.version<3){if(typeof input.footer!=='string')fail();header=band(false);footer={...band(true),text:input.footer}}else{header=readBand(input.header);footer=readBand(input.footer)}
 const d={version:3,title:input.title,numbers:input.numbers,header,footer,blockGap:input.version<3?5:input.blockGap,pages:[]};if(!number(d.blockGap,0,20))fail();
 const tracks=(v,n)=>Array.isArray(v)&&v.length===n&&v.every(x=>number(x,.000001,1))&&Math.abs(v.reduce((a,b)=>a+b,0)-1)<.00001;
 d.pages=input.pages.map(p=>{if(!p||!Array.isArray(p.blocks)||p.blocks.length>500)fail();const blocks=p.blocks.map(b=>{
  const l=layouts[b.type];if(!l||!number(b.height,.1,282)||!Array.isArray(b.cells)||b.cells.length!==l.cells.length)fail();const cols=b.cols??weights(l.cols),rows=b.rows??weights(l.rows);if(!tracks(cols,l.cols)||!tracks(rows,l.rows))fail();
  const gapX=input.version<3?4:b.gapX,gapY=input.version<3?4:b.gapY;if(!number(gapX,0,20)||!number(gapY,0,20)||gapX*(l.cols-1)>=180||gapY*(l.rows-1)>=b.height)fail();
  const cells=b.cells.map(raw=>{const c={...cell(),...raw};if(!['empty','text','image'].includes(c.type)||typeof c.text!=='string'||typeof c.src!=='string'||!number(c.size,8,64)||typeof c.bold!=='boolean'||!['left','center','right','justify'].includes(c.align)||!['cover','contain','fill'].includes(c.fit)||!Object.hasOwn(styles,c.textStyle)||typeof c.hyphens!=='boolean'||!number(c.lineHeight,1,2)||!number(c.zoom,1,3)||!number(c.posX,0,100)||!number(c.posY,0,100))fail();if(c.type==='image'&&(!c.src||!imageOK(c.src)))fail();return Object.fromEntries(Object.keys(cell()).map(k=>[k,c[k]]))});
  return {id:uid(),type:b.type,height:b.height,gapX,gapY,cols:[...cols],rows:[...rows],cells};
 });const page={id:uid(),blocks};if(usedHeight(page,d)>contentHeight(d)+.01)fail();return page});return d;
}
const api={layouts,styles,uid,cell,band,clamp,contentTop,contentHeight,usedHeight,maxHeight,createBlock,gapLimit,fitGaps,resizeTracks,dividerSegments,validate};if(typeof module!=='undefined')module.exports=api;else root.PDFModel=api;
})(typeof window!=='undefined'?window:globalThis);
