const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const {chromium}=require('playwright');

test('selection formatting, cell geometry, project reopening and printing',async()=>{
 const server=http.createServer(async(req,res)=>{
  const name=req.url.split('?')[0].slice(1)||'index.html';
  if(!['index.html','app.js','model.js','style.css'].includes(name)){res.writeHead(404);res.end();return}
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':'text/html');
  res.end(await fs.readFile(name));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:1500,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);
  await page.getByRole('button',{name:'1 × 1',exact:true}).click();
  await page.getByRole('button',{name:'T Text'}).click();
  const text=page.getByRole('textbox',{name:'Text i ruta'});
  await text.fill('Alpha Beta Gamma');
  await text.evaluate(el=>{
   const range=document.createRange();range.setStart(el.firstChild,6);range.setEnd(el.firstChild,10);
   const s=getSelection();s.removeAllRanges();s.addRange(range);
   document.dispatchEvent(new Event('selectionchange'));
  });
  await page.getByLabel('Textstorlek (pt)',{exact:true}).fill('24');
  await page.getByLabel('Textstorlek (pt)',{exact:true}).press('Tab');
  await page.getByRole('button',{name:'Fetstil',exact:true}).click();
  await page.getByLabel('Textfärg',{exact:true}).fill('#e02030');
  let cell=await page.evaluate(()=>doc.pages[0].blocks[0].cells[0]);
  assert.equal(cell.text,'Alpha Beta Gamma');
  assert.equal(cell.runs.find(r=>r.text==='Beta').size,24);
  assert.equal(cell.runs.find(r=>r.text==='Beta').bold,true);
  assert.equal(cell.runs.find(r=>r.text==='Beta').color,'#e02030');
  assert.equal(cell.runs[0].size,12);
  assert.equal(cell.runs.at(-1).bold,false);
  for(const [label,value] of [['Uppe',2],['Höger',4],['Nere',6],['Vänster',8]]){
   const input=page.getByLabel(label+' (mm)',{exact:true});await input.fill(String(value));await input.press('Tab');
  }
  await page.getByLabel('Höjdjustering',{exact:true}).selectOption('bottom');
  cell=await page.evaluate(()=>doc.pages[0].blocks[0].cells[0]);
  assert.deepEqual(cell.padding,{top:2,right:4,bottom:6,left:8});
  const geometry=await text.evaluate(el=>{
   const parent=el.parentElement,r=el.getBoundingClientRect(),p=parent.getBoundingClientRect();
   return {bottom:p.bottom-r.bottom,padding:getComputedStyle(parent).paddingBottom,align:getComputedStyle(parent).justifyContent};
  });
  assert.equal(geometry.align,'flex-end');
  assert(Math.abs(geometry.bottom-parseFloat(geometry.padding)*.7)<1);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Spara projekt',exact:true}).click();
  const saved=JSON.parse(await fs.readFile(await (await download).path(),'utf8'));
  assert.equal(saved.version,4);
  await page.reload();
  await page.locator('#projectInput').setInputFiles({name:'test.pdfmaker.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved))});
  await text.waitFor();
  assert.equal(await text.textContent(),'Alpha Beta Gamma');
  const reopened=await page.evaluate(()=>doc.pages[0].blocks[0].cells[0]);
  assert.deepEqual(reopened.runs,cell.runs);
  assert.deepEqual(reopened.padding,cell.padding);
  assert.equal(reopened.verticalAlign,'bottom');
  await page.emulateMedia({media:'print'});
  assert.equal(await text.locator('span').filter({hasText:'Beta'}).evaluate(el=>getComputedStyle(el).color),'rgb(224, 32, 48)');
  await page.emulateMedia({media:'screen'});
  await page.evaluate(()=>{window.print=()=>window.didPrint=true});
  page.on('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Exportera PDF',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.didPrint),true);
  assert.deepEqual(errors,[]);
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
});
