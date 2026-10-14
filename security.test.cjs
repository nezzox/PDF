const test=require('node:test'),assert=require('node:assert/strict'),M=require('./model.js');
const project=()=>({version:4,title:'Test',header:M.band(false),footer:M.band(true),numbers:true,blockGap:5,pages:[{blocks:[M.createBlock('1x1',257)]}]});
test('reject inherited layout names and malformed objects',()=>{
 for(const type of ['__proto__','constructor','toString']){assert.throws(()=>M.createBlock(type,257));const d=project();d.pages[0].blocks[0].type=type;assert.throws(()=>M.validate(d))}
 for(const value of [null,[],0,'x']){const d=project();d.pages[0].blocks[0].cells[0]=value;assert.throws(()=>M.validate(d))}
});
test('reject remote, SVG and executable sources even in unused image fields',()=>{
 for(const src of ['https://example.com/tracker.png','javascript:alert(1)','data:image/svg+xml;base64,PHN2Zz4=']){
  const d=project();d.pages[0].blocks[0].cells[0].src=src;assert.throws(()=>M.validate(d));
  d.pages[0].blocks[0].cells[0].src='';d.header.logo=src;assert.throws(()=>M.validate(d));
 }
});
test('reject excessive text, runs and aggregate blocks',()=>{
 let d=project();d.title='a'.repeat(501);assert.throws(()=>M.validate(d));
 d=project();d.pages[0].blocks[0].cells[0].text='a'.repeat(200001);assert.throws(()=>M.validate(d));
 d=project();const c=d.pages[0].blocks[0].cells[0];c.runs=Array(50001).fill({text:'',size:12,bold:false,color:'#202638',lineHeight:1});assert.throws(()=>M.validate(d));
 d=project();const b=d.pages[0].blocks[0];b.height=.1;d.blockGap=0;d.pages=Array.from({length:3},()=>({blocks:Array(400).fill(b)}));assert.throws(()=>M.validate(d));
});
test('project data stays plain text; unexpected keys are removed',()=>{
 const d=project(),c=d.pages[0].blocks[0].cells[0];c.type='text';c.text='<img src=x onerror=alert(1)>';c.html='<script>alert(1)</script>';
 const clean=M.validate(d).pages[0].blocks[0].cells[0];assert.equal(clean.text,c.text);assert.equal(clean.html,undefined);
 assert.equal({}.polluted,undefined);
});
