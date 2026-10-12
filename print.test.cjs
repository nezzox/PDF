const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const helper = source.slice(source.indexOf('function hasTextOverflow('), source.indexOf('function renderBand('));
const hasTextOverflow = new Function(helper + ';return hasTextOverflow;')();
const exportCode = source.slice(source.indexOf("$('#export').onclick="), source.indexOf("window.addEventListener('beforeunload'"));
for (const [name,text,height,width,expected] of [
  ['empty placeholder', '', 40, 50, false],
  ['whitespace-only cell', '  ', 40, 50, false],
  ['pixel rounding', 'Hej', 23, 103, false],
  ['vertical overflow', 'Hej', 30, 100, true],
  ['horizontal overflow', 'Hej', 20, 110, true]
]) test(name, () => {
  assert.equal(hasTextOverflow({textContent:text,clientHeight:20,scrollHeight:height,clientWidth:100,scrollWidth:width}),expected);
});
for (const [name,overflow,accept,prints] of [
  ['no overflow prints immediately',false,false,1],
  ['overflow can still print',true,true,1],
  ['cancel returns without printing',true,false,0]
]) test(name, () => {
  const button={}, calls={print:0,confirm:0,blur:0};
  const document={title:'',activeElement:{blur:()=>calls.blur++}};
  const window={confirm:()=>{calls.confirm++;return accept},print:()=>calls.print++};
  new Function('$','document','window','checkOverflow','doc',exportCode)(()=>button,document,window,()=>overflow,{title:'Prov'});
  button.onclick();
  assert.equal(calls.print,prints);
  assert.equal(calls.confirm,overflow?1:0);
  assert.equal(calls.blur,1);
  if(prints)assert.equal(document.title,'Prov');
});
