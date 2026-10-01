const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const PORT=process.env.PORT||3000;
const ADMIN_USER=process.env.ADMIN_USER||'admin';
const ADMIN_PASS=process.env.ADMIN_PASS||'POISE@2026';
const root=__dirname, pub=path.join(root,'public'), dataDir=path.join(root,'data'), uploadDir=path.join(dataDir,'payment-screenshots');
const dbFile=path.join(dataDir,'registrations.json');
if(!fs.existsSync(dataDir))fs.mkdirSync(dataDir,{recursive:true});
if(!fs.existsSync(uploadDir))fs.mkdirSync(uploadDir,{recursive:true});
if(!fs.existsSync(dbFile))fs.writeFileSync(dbFile,'[]');

function readDB(){try{return JSON.parse(fs.readFileSync(dbFile,'utf8'))}catch{return[]}}
function writeDB(x){fs.writeFileSync(dbFile,JSON.stringify(x,null,2))}
function token(){return crypto.randomBytes(32).toString('hex')}
function regId(){return 'POISE-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+crypto.randomBytes(3).toString('hex').toUpperCase()}
const sessions=new Map();
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json'};
function json(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS'});res.end(JSON.stringify(obj))}
function body(req,limit=12e6){return new Promise((resolve,reject)=>{let d='';req.on('data',c=>{d+=c;if(d.length>limit){reject(new Error('Payload too large'));req.destroy()}});req.on('end',()=>{try{resolve(JSON.parse(d||'{}'))}catch(e){reject(e)}});req.on('error',reject)})}
function auth(req){const t=(req.headers.authorization||'').replace(/^Bearer\s+/,'');return sessions.has(t)}
function safe(s){return String(s||'').trim()}
function now(){return new Date().toISOString()}

const server=http.createServer(async(req,res)=>{
 try{
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS'});return res.end()}

  if(req.url==='/api/login'&&req.method==='POST'){
   const b=await body(req,100000);
   if(safe(b.username)===ADMIN_USER&&safe(b.password)===ADMIN_PASS){const t=token();sessions.set(t,Date.now());return json(res,200,{ok:true,token:t})}
   return json(res,401,{ok:false,message:'Invalid login'});
  }
  if(req.url==='/api/logout'&&req.method==='POST'){const t=(req.headers.authorization||'').replace(/^Bearer\s+/,'');sessions.delete(t);return json(res,200,{ok:true})}

  if(req.url==='/api/registrations'&&req.method==='POST'){
   const b=await body(req);
   for(const k of ['name','mobile','course','amount','utr']) if(!safe(b[k])) return json(res,400,{ok:false,message:`Missing ${k}`});
   const rows=readDB();
   const r={
    id:regId(), createdAt:now(),
    name:safe(b.name), mobile:safe(b.mobile), email:safe(b.email), className:safe(b.className),
    course:safe(b.course), amount:safe(b.amount), utr:safe(b.utr),
    paymentScreenshot:'', paymentStatus:'Pending Verification', admissionStatus:'New', notes:''
   };
   if(typeof b.paymentScreenshot==='string'&&b.paymentScreenshot.startsWith('data:image/')){
    const m=b.paymentScreenshot.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if(m){
      const ext=m[1]==='jpeg'?'jpg':m[1];
      const file=path.join(uploadDir,r.id+'.'+ext);
      fs.writeFileSync(file,Buffer.from(m[2],'base64'));
      r.paymentScreenshot='/uploads/payment-screenshots/'+path.basename(file);
    }
   }
   rows.unshift(r);writeDB(rows);
   return json(res,201,{ok:true,registrationId:r.id,receivedAt:r.createdAt,message:'Registration received'});
  }

  if(req.url==='/api/registrations'&&req.method==='GET'){
   if(!auth(req))return json(res,401,{ok:false});
   return json(res,200,{ok:true,registrations:readDB()});
  }
  if(req.url==='/api/registrations.csv'&&req.method==='GET'){
   if(!auth(req))return json(res,401,{ok:false});
   const rows=readDB();
   const esc=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
   const cols=['id','createdAt','name','mobile','email','className','course','amount','utr','paymentStatus','admissionStatus','notes'];
   const csv=[cols.join(','),...rows.map(r=>cols.map(c=>esc(r[c])).join(','))].join('\n');
   res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="poise-registrations.csv"'});return res.end(csv);
  }
  if(req.url.startsWith('/api/registrations/')&&req.method==='PATCH'){
   if(!auth(req))return json(res,401,{ok:false});
   const idv=req.url.split('/').pop();const b=await body(req,100000);const rows=readDB();const r=rows.find(x=>x.id===idv);if(!r)return json(res,404,{ok:false});
   if(['Pending Verification','Verified','Rejected'].includes(b.paymentStatus))r.paymentStatus=b.paymentStatus;
   if(['New','Confirmed','Rejected'].includes(b.admissionStatus))r.admissionStatus=b.admissionStatus;
   if(typeof b.notes==='string')r.notes=b.notes;
   r.updatedAt=now();writeDB(rows);return json(res,200,{ok:true,registration:r});
  }

  let u=new URL(req.url,'http://localhost');let p=decodeURIComponent(u.pathname);
  if(p.startsWith('/uploads/')){
   const f=path.normalize(path.join(dataDir,p.replace(/^\/uploads\//,'')));
   if(!f.startsWith(dataDir)||!fs.existsSync(f))return json(res,404,{ok:false});
   if(!auth(req))return json(res,401,{ok:false});
   res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Cache-Control':'private, no-store'});return fs.createReadStream(f).pipe(res);
  }
  if(p==='/')p='/index.html';
  const f=path.normalize(path.join(pub,p));
  if(!f.startsWith(pub))return json(res,403,{ok:false});
  if(fs.existsSync(f)&&fs.statSync(f).isFile()){res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});return fs.createReadStream(f).pipe(res)}
  res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');
 }catch(e){console.error(e);if(!res.headersSent)json(res,500,{ok:false,message:'Server error'})}
});
server.listen(PORT,()=>console.log(`POISE CLASSES running on port ${PORT}`));
