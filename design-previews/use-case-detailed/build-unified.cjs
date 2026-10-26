const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const sharp=require('C:/Users/Acer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source=fs.readFileSync(path.join(__dirname,'build.cjs'),'utf8').split('function svgStart')[0];
const pages=vm.runInNewContext(source+'\npages;', {require,__dirname});
const E=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const out=[],nodes=[],edges=[],actors=new Map(),actorRefs=[];
const W=4400;let H=0;
function text(x,y,s,size=24,anchor='middle'){s.split('\n').forEach((v,i)=>out.push(`<text x="${x}" y="${y+i*29}" text-anchor="${anchor}" font-size="${size}">${E(v)}</text>`));}
function edge(d,c='assoc'){out.push(`<path class="${c}" d="${d}"/>`);}
function canonical(s){return s==='Khách hàng đăng nhập'?'Khách hàng':s==='Khách hàng\n(người nhận)'?'Khách hàng':s;}
function actor(name,x,y){name=canonical(name);if(!actors.has(name))actors.set(name,{name,x,y,id:'A'+actors.size});return actors.get(name);}
function uc(label,x,y){const n={label,x,y,id:'U'+nodes.length};nodes.push(n);return n;}
function assoc(a,n){edges.push({from:a,to:n,type:'assoc'});}
function relation(a,b,type,condition=''){edges.push({from:a,to:b,type,condition});}
const user=actor('Người dùng hệ thống',185,320),guest=actor('Khách truy cập',185,740),web=actor('Người truy cập web',185,1670),customer=actor('Khách hàng',185,3220);
const staff=actor('Nhân viên',4215,320),admin=actor('Quản trị viên',4215,2380);
const headings=[],notes=[];let left=260,right=260;
function section(p,side){let y=side==='left'?left:right;headings.push({x:side==='left'?1250:3100,y,label:p.title});y+=85;
 for(const b of p.blocks){const start=y,rs=[];for(const r of b.rows){const h=r.secondary.length>1?290:135;rs.push({...r,y:y+h/2});y+=h;}let a=actors.get(canonical(b.actor));if(!a)a=actor(b.actor,side==='left'?185:4215,(start+y)/2);
 for(const r of rs){const x=side==='left'?770:3550,sx=side==='left'?1510:2810,n=uc(r.label,x,r.y);assoc(a,n);
 if(r.note)notes.push({x:sx,y:r.y,label:r.note,target:n});
 r.secondary.forEach((s,i)=>{const sy=r.y+(i-(r.secondary.length-1)/2)*150,t=uc(s.label,sx,sy);relation(s.relation==='include'?n:t,s.relation==='include'?t:n,s.relation,s.condition);if(s.actor){let ext=actors.get(s.actor)||actor(s.actor,side==='left'?185:4215,sy);assoc(ext,t);}});
 }y+=40;}if(side==='left')left=y+100;else right=y+100;
}
section(pages[0],'left');section(pages[1],'left');section(pages[2],'left');section(pages[4],'right');section(pages[5],'right');
// One continuous automation graph, with each use case drawn once.
let y=right;headings.push({x:3100,y,label:'Tiếp nhận dữ liệu và tự động hóa'});y+=110;
const receive=uc('Tiếp nhận dữ liệu\ncảm biến',3550,y),store=uc('Lưu dữ liệu cảm biến',2810,y),evaluate=uc('Đánh giá ngưỡng loài\nvà trạng thái mực nước',3550,y+165),alert=uc('Ghi nhận cảnh báo\nvào lịch sử',3550,y+355),notify=uc('Gửi thông báo cảnh báo',2810,y+355),email=uc('Gửi email cảnh báo',2810,y+535),push=uc('Gửi thông báo web / app',3550,y+535),scheduled=uc('Thực hiện lệnh theo lịch',3550,y+780),command=uc('Gửi lệnh qua MQTT',2810,y+700),log=uc('Cập nhật trạng thái\nvà ghi log AUTO',2810,y+865);
const iot=actors.get('Thiết bị IoT')||actor('Thiết bị IoT',4215,y+100);const iotRef={...iot,x:4215,y:receive.y,name:'Thiết bị IoT\n(cùng actor)'};actorRefs.push(iotRef);assoc(iotRef,receive);assoc(iotRef,scheduled);
relation(receive,store,'include');relation(receive,evaluate,'include');relation(alert,evaluate,'extend','[bất thường]');relation(notify,alert,'extend','[đúng bộ lọc, hết cooldown]');relation(email,notify,'extend','[bật email, có địa chỉ]');relation(push,notify,'extend','[bật kênh, có token]');relation(scheduled,command,'include');relation(scheduled,log,'include');
assoc(actor('Dịch vụ email',185,email.y),email);assoc(actor('Firebase FCM',4215,push.y),push);
right=y+1010;H=Math.max(left,right)+330;
out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><marker id="arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto"><path d="M1 1 L11 6 L1 11" fill="none" stroke="#42566b" stroke-width="1.5"/></marker><marker id="tri" viewBox="0 0 14 14" refX="13" refY="7" markerWidth="13" markerHeight="13" orient="auto"><path d="M1 1 L13 7 L1 13 Z" fill="white" stroke="#42566b" stroke-width="1.4"/></marker></defs><style>text{font-family:Arial,'Segoe UI',sans-serif;fill:#16354a}.assoc{stroke:#a3b4c0;stroke-width:1.7;fill:none}.include,.extend{stroke:#42566b;stroke-width:2;fill:none;stroke-dasharray:8 6;marker-end:url(#arrow)}.general{stroke:#42566b;stroke-width:2;fill:none;marker-end:url(#tri)}</style><rect width="100%" height="100%" fill="white"/><rect x="430" y="180" width="3540" height="${H-410}" rx="8" fill="#fbfefe" stroke="#35576b" stroke-width="3"/>`);
text(2200,58,'AQUACARE — USE CASE DIAGRAM CHI TIẾT',40);text(2200,100,'Một boundary duy nhất · Web, Mobile và Backend · Đối chiếu code 24/10/2026',24);text(2200,220,'HỆ THỐNG AQUACARE',30);
// All human generalization paths remain outside the system boundary.
relation(customer,user,'general');relation(staff,user,'general');relation(admin,user,'general');
for(const name of ['Nhân viên kho','Nhân viên giao hàng','Nhân viên hỗ trợ','Nhân viên bảo trì'])relation(actors.get(name),staff,'general');
for(const e of edges){const a=e.from,b=e.to;if(e.type==='general'&&a.name){if(a.x===185)edge(`M160 ${a.y} H35 V${b.y} H158`,'general');else if(b.x===185)edge(`M4240 ${a.y} H4370 V130 H185 V275`,'general');else edge(`M4240 ${a.y} H4340 V${b.y} H4242`,'general');continue;}
 if(e.type==='assoc'){const isleft=a.x<430;const tx=isleft?b.x-225:b.x+225;edge(`M${a.x+(isleft?25:-25)} ${a.y} L${tx} ${b.y}`);continue;}
 const dx=b.x-a.x,dy=b.y-a.y;let ax,ay,bx,by;
 if(Math.abs(dx)<10){ax=a.x;ay=a.y+Math.sign(dy)*46;bx=b.x;by=b.y-Math.sign(dy)*46;}else{ax=a.x+Math.sign(dx)*225;ay=a.y;bx=b.x-Math.sign(dx)*225;by=b.y;}
 edge(`M${ax} ${ay} L${bx} ${by}`,e.type);const mx=(ax+bx)/2,my=(ay+by)/2;
 if(e.type!=='general')text(mx+(Math.abs(dx)<10?145:0),my-12,`<<${e.type}>>`,20);
 if(e.condition)text(a.x,a.y+76,e.condition,19);
}
for(const n of nodes){out.push(`<ellipse cx="${n.x}" cy="${n.y}" rx="225" ry="46" fill="#effcf9" stroke="#0f766e" stroke-width="2"/>`);text(n.x,n.y+8-(n.label.split('\n').length-1)*14.5,n.label,24);}
for(const a of [...actors.values(),...actorRefs]){out.push(`<g stroke="#334155" stroke-width="2.8" fill="white"><circle cx="${a.x}" cy="${a.y-30}" r="14"/><path d="M${a.x} ${a.y-16}v44 m-27,-29 h54 m-27,29 l-24,31 m24,-31 l24,31" fill="none"/></g>`);text(a.x,a.y+88,a.name,22);}
for(const h of headings)text(h.x,h.y,h.label,h.size||27);
// UML comments use a folded corner and an unarrowed dashed attachment.
for(const n of notes){
 const lines=[];let line='';for(const word of n.label.split(' ')){if((line+' '+word).trim().length>49){lines.push(line);line=word;}else line=(line+' '+word).trim();}if(line)lines.push(line);
 const w=590,h=Math.max(76,lines.length*27+28),x=n.x-w/2,y=n.y-h/2,fold=20;
 const direction=Math.sign(n.target.x-n.x);
 out.push(`<path d="M${n.x+direction*w/2} ${n.y} L${n.target.x-direction*225} ${n.target.y}" fill="none" stroke="#a8945f" stroke-width="1.8" stroke-dasharray="7 6"/>`);
 out.push(`<path d="M${x} ${y} H${x+w-fold} L${x+w} ${y+fold} V${y+h} H${x} Z M${x+w-fold} ${y} V${y+fold} H${x+w}" fill="#fff8df" stroke="#b5a06a" stroke-width="1.8"/>`);
 text(n.x,y+27,lines.join('\n'),21);
}
text(2200,H-175,'Nét liền: liên kết · Nét đứt: include / extend · Tam giác rỗng: generalization',24);
text(2200,H-132,'Các tiêu đề chỉ sắp xếp chức năng; không tạo boundary con. Đăng nhập là tiền điều kiện của nghiệp vụ được bảo vệ.',23);
text(2200,H-90,'Lệnh theo lịch: đến hạn, thiết bị hoạt động, trạng thái cần đổi. Sửa / xóa gói cước: Mobile. Thanh toán tự động chưa triển khai.',22);
out.push('</svg>');const stem=path.join(__dirname,'aquacare-unified');fs.writeFileSync(stem+'.svg',out.join('\n'));
const uml=['@startuml','left to right direction','skinparam shadowing false','title AquaCare — toàn bộ use case trong một boundary'];for(const a of actors.values())uml.push(`actor "${a.name.replaceAll('\n','\\n')}" as ${a.id}`);uml.push('rectangle "AquaCare" {');for(const n of nodes)uml.push(`usecase "${n.label.replaceAll('\n','\\n')}" as ${n.id}`);for(const n of notes)uml.push(`note ${n.x<n.target.x?'left':'right'} of ${n.target.id}\n${n.label}\nend note`);uml.push('}');for(const e of edges)uml.push(`${e.from.id} ${e.type==='assoc'?'--':e.type==='general'?'--|>':'..>'} ${e.to.id}${['include','extend'].includes(e.type)?' : <<'+e.type+'>>'+(e.condition?'\\n'+e.condition:''):''}`);uml.push('@enduml');fs.writeFileSync(stem+'.puml',uml.join('\n'));
fs.writeFileSync(path.join(__dirname,'index.html'),`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AquaCare — một boundary</title><style>body{margin:0;font:16px Arial;background:#edf4f5;color:#17364a}header{position:sticky;top:0;background:white;padding:14px 24px;box-shadow:0 2px 8px #0002}button,a{margin-right:14px;color:#087d78}main{overflow:auto;height:calc(100vh - 100px);padding:20px}img{display:block;width:2200px;max-width:none;background:white}h1{font-size:21px;margin:0 0 10px}</style><header><h1>AquaCare — toàn bộ use case trong một boundary</h1><button onclick="zoom(.8)">− Thu nhỏ</button><button onclick="zoom(1.25)">+ Phóng to</button><button onclick="document.querySelector('img').style.width=(innerWidth-50)+'px'">Vừa chiều ngang</button><a href="aquacare-unified.svg">SVG</a><a href="aquacare-unified.png">PNG</a><a href="aquacare-unified.puml">PlantUML</a></header><main><img src="aquacare-unified.svg" alt="Toàn bộ use case AquaCare trong một boundary"></main><script>function zoom(f){const i=document.querySelector('img');i.style.width=(i.getBoundingClientRect().width*f)+'px'}</script></html>`);
sharp(Buffer.from(out.join('\n'))).png().toFile(stem+'.png').then(()=>console.log(JSON.stringify({useCases:nodes.length,actors:actors.size,width:W,height:H})));
