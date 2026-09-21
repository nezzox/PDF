/* Shared document rules; browser and Node test runner. */
(function (root) {
  'use strict';
  const regular = (cols, rows, label) => ({ cols, rows, label, cells: Array.from({length:cols*rows}, (_,i)=>[i%cols,Math.floor(i/cols),1,1]) });
  const layouts = {
    '1x1': regular(1,1,'1 × 1'), '2x1': regular(2,1,'2 × 1'),
    '2x2': regular(2,2,'2 × 2'), '1x2': regular(1,2,'1 × 2'),
    '3x1': regular(3,1,'3 kolumner'), '1x3': regular(1,3,'3 rader'),
    '3x2': regular(3,2,'3 × 2'),
    'stack-left': {cols:2,rows:3,label:'Tre till vänster',cells:[[0,0,1,1],[0,1,1,1],[0,2,1,1],[1,0,1,3]]},
    'stack-right': {cols:2,rows:3,label:'Tre till höger',cells:[[0,0,1,3],[1,0,1,1],[1,1,1,1],[1,2,1,1]]}
  };
  const styles = {body:{label:'Brödtext',size:12,bold:false},title:{label:'Titel',size:30,bold:true},subtitle:{label:'Undertitel',size:19,bold:false}};
  const uid = () => crypto.randomUUID();
  const cell = () => ({type:'empty',text:'',src:'',size:12,bold:false,align:'left',fit:'cover',textStyle:'body',hyphens:false,lineHeight:1.45,zoom:1,posX:50,posY:50});
  const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
  const usedHeight = p => p.blocks.reduce((n,b)=>n+b.height,0)+Math.max(0,p.blocks.length-1)*5;
  const maxHeight = (p,b) => 257-(p.blocks.length-1)*5-p.blocks.filter(x=>x!==b).reduce((n,x)=>n+x.height,0);
  const weights = n => Array(n).fill(1/n);
  function createBlock(type, available) {
    const l=layouts[type]; if(!l)throw Error('Ogiltig layout');
    if(available<25)return null;
    return {id:uid(),type,height:Math.min(l.rows*58,available),cols:weights(l.cols),rows:weights(l.rows),cells:l.cells.map(cell)};
  }
  // Move a shared boundary without changing adjacent tracks' total size.
  function resizeTracks(tracks,index,delta,min=.08) {
    const result=[...tracks],total=tracks[index]+tracks[index+1];
    result[index]=clamp(tracks[index]+delta,min,total-min);
    result[index+1]=total-result[index];return result;
  }
  function validate(input) {
    const fail=()=>{throw Error('Ogiltig projektfil')};
    if(!input||![1,2].includes(input.version)||typeof input.title!=='string'||typeof input.footer!=='string'||typeof input.numbers!=='boolean'||!Array.isArray(input.pages)||!input.pages.length||input.pages.length>100)fail();
    const number=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
    const tracks=(v,n)=>Array.isArray(v)&&v.length===n&&v.every(x=>number(x,.079,1))&&Math.abs(v.reduce((a,b)=>a+b,0)-1)<.001;
    const pages=input.pages.map(p=>{
      if(!Array.isArray(p.blocks)||p.blocks.length>9)fail();
      const blocks=p.blocks.map(b=>{
        const l=layouts[b.type];if(!l||!number(b.height,25,257)||!Array.isArray(b.cells)||b.cells.length!==l.cells.length)fail();
        const cols=b.cols??weights(l.cols),rows=b.rows??weights(l.rows);if(!tracks(cols,l.cols)||!tracks(rows,l.rows))fail();
        const cells=b.cells.map(raw=>{
          const c={...cell(),...raw};
          if(!['empty','text','image'].includes(c.type)||typeof c.text!=='string'||typeof c.src!=='string'||!number(c.size,8,64)||typeof c.bold!=='boolean'||!['left','center','right','justify'].includes(c.align)||!['cover','contain','fill'].includes(c.fit)||!Object.hasOwn(styles,c.textStyle)||typeof c.hyphens!=='boolean'||!number(c.lineHeight,1,2)||!number(c.zoom,1,3)||!number(c.posX,0,100)||!number(c.posY,0,100))fail();
          if(c.type==='image'&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(c.src))fail();
          return Object.fromEntries(Object.keys(cell()).map(k=>[k,c[k]]));
        });return {id:uid(),type:b.type,height:b.height,cols:[...cols],rows:[...rows],cells};
      });const page={id:uid(),blocks};if(usedHeight(page)>257.01)fail();return page;
    });return {version:2,title:input.title,footer:input.footer,numbers:input.numbers,pages};
  }
  const api={layouts,styles,uid,cell,clamp,usedHeight,maxHeight,createBlock,resizeTracks,validate};
  if(typeof module!=='undefined')module.exports=api;else root.PDFModel=api;
})(typeof window!=='undefined'?window:globalThis);
