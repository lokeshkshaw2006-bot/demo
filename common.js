/* ====== helpers ====== */
const S={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v===null?d:v}catch{return d}},set(k,v){localStorage.setItem(k,JSON.stringify(v))}};
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iso=d=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const money=n=>'₹'+Number(n).toLocaleString('en-IN');
const toMin=t=>{const[h,m]=t.split(':').map(Number);return h*60+m};
const fmtDate=d=>new Date(d+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
if(S.get('theme','light')==='dark')document.documentElement.dataset.theme='dark';

function toast(msg){
  let t=$('#toast');
  if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}
  t.textContent=msg;t.classList.add('show');
  clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),3200);
}
function notify(title,body){
  toast('🔔 '+title+': '+body);
  if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body});
}

/* ====== demo data (apne hisaab se badal lena) ====== */
const MENU=[
  {id:'attendance',icon:'📊',name:'Attendance',href:'attendance.html'},
  {id:'lpulive',icon:'🎥',name:'LPU Live',href:'lpulive.html'},
  {id:'ums',icon:'🏛️',name:'UMS',href:'https://ums.lpu.in',ext:true},
  {id:'myclass',icon:'🏫',name:'My Class',href:'myclass.html'},
  {id:'fee',icon:'💳',name:'Fee Payment',href:'fee.html'},
  {id:'leave',icon:'🧑‍🏫',name:'Teacher on Leave',href:'teacher-leave.html'},
  {id:'portals',icon:'🌐',name:'Portals',href:'portals.html'},
  {id:'rms',icon:'🎫',name:'RMS',href:'rms.html'},
  {id:'edurev',icon:'📚',name:'Edu Rev',href:'https://edurev.in',ext:true},
  {id:'holiday',icon:'🎉',name:'Holiday',href:'holiday.html'},
  {id:'marks',icon:'🎯',name:'Marks',href:'marks.html'},
  {id:'timetable',icon:'🗓️',name:'Time Table',href:'timetable.html'}
];
const TEACHERS=[
  {id:1,name:'Dr. Anil Sharma',dept:'CSE'},{id:2,name:'Prof. Neha Verma',dept:'CSE'},
  {id:3,name:'Dr. Rajiv Malhotra',dept:'Mathematics'},{id:4,name:'Ms. Simran Kaur',dept:'CSE'},
  {id:5,name:'Mr. Gurpreet Singh',dept:'Languages'},{id:6,name:'Dr. Pooja Mehta',dept:'CSE'}
];
const teacherName=id=>TEACHERS.find(t=>t.id===id).name;
const SUBJECTS=[
  {code:'CSE310',name:'Data Structures',t:1,credits:4,held:42,att:37,gp:9,cur:41,room:'34-201'},
  {code:'CSE326',name:'Internet Programming',t:2,credits:3,held:38,att:36,gp:10,cur:46,room:'34-305'},
  {code:'MTH201',name:'Discrete Mathematics',t:3,credits:3,held:36,att:24,gp:7,cur:30,room:'33-110'},
  {code:'CSE325',name:'Operating Systems',t:4,credits:4,held:40,att:31,gp:8,cur:36,room:'34-208'},
  {code:'PEL121',name:'Communication Skills',t:5,credits:2,held:30,att:28,gp:9,cur:42,room:'32-402'},
  {code:'INT306',name:'Database Lab',t:6,credits:2,held:28,att:22,gp:8,cur:38,room:'Lab-5'}
]; // cur = CA+MTE marks (out of 50), gp = grade point

const SLOTS=[['09:00','09:50'],['09:50','10:40'],['10:40','11:30'],['11:30','12:20'],['12:20','13:10'],['13:10','14:00'],['14:00','14:50'],['14:50','15:40']];
const TT={ // null = free period, BREAK = lunch
  Mon:['CSE310','CSE326','MTH201',null,'BREAK','CSE325','INT306','INT306'],
  Tue:['CSE326','CSE325','CSE310','PEL121','BREAK','MTH201',null,null],
  Wed:['MTH201','CSE310','CSE326',null,'BREAK','INT306','INT306','PEL121'],
  Thu:['CSE325','CSE326','PEL121','MTH201','BREAK','CSE310',null,null],
  Fri:['INT306','CSE325','CSE310','CSE326','BREAK','MTH201','PEL121',null],
  Sat:['CSE326','CSE326','CSE325',null,'BREAK',null,null,null]
};
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const FEE_ITEMS=[['Tuition Fee',70000],['Exam Fee',5000],['Other Charges',3000],['Previous Balance (pehle se bacha hua)',7000]];
const FEE_DUE='2026-12-15';
const HOLIDAYS=[
  {date:'2026-12-25',name:'Christmas',type:'regular'},{date:'2027-01-01',name:'New Year',type:'regular'},
  {date:'2027-01-26',name:'Republic Day',type:'regular'},{date:'2027-08-15',name:'Independence Day',type:'regular'},
  {date:'2027-10-02',name:'Gandhi Jayanti',type:'regular'}
];
const PORTALS=[
  {name:'LPU Official Website',url:'https://www.lpu.in'},{name:'UMS',url:'https://ums.lpu.in'},
  {name:'LPU Live',url:'https://lpulive.lpu.in'},{name:'Edu Rev',url:'https://edurev.in'},
  {name:'NPTEL',url:'https://nptel.ac.in'},{name:'Google Classroom',url:'https://classroom.google.com'},
  {name:'DigiLocker',url:'https://www.digilocker.gov.in'}
];
const DEF_TICKETS=[
  {id:'RMS1001',cat:'Hostel',desc:'Room ka fan kharab hai',step:2},
  {id:'RMS1002',cat:'Academic',desc:'Marks correction request',step:4}
];

/* ====== calculations ====== */
const overallAtt=()=>{const a=SUBJECTS.reduce((s,x)=>s+x.att,0),h=SUBJECTS.reduce((s,x)=>s+x.held,0);return +(a/h*100).toFixed(1)};
const attColor=p=>p>=85?'ok':p>=75?'warn':'bad';
const cgpa=()=>{const c=SUBJECTS.reduce((s,x)=>s+x.credits,0);return (SUBJECTS.reduce((s,x)=>s+x.gp*x.credits,0)/c).toFixed(2)};
const feeTotal=()=>FEE_ITEMS.reduce((s,x)=>s+x[1],0);
const feeState=()=>{const total=feeTotal(),paid=S.get('feePaid',60000);return{total,paid,due:Math.max(total-paid,0)}};
const allHolidays=()=>HOLIDAYS.concat(S.get('emHol',[])).sort((a,b)=>a.date.localeCompare(b.date));
const nextHoliday=()=>allHolidays().find(h=>h.date>=iso(new Date()));
const getTickets=()=>S.get('tickets',DEF_TICKETS);
const getMsgs=()=>S.get('msgs',[]);
const leaves=()=>S.get('leaves',{2:[addDays(0),addDays(1)],4:[addDays(2)]});
const onLeave=(id,date)=>(leaves()[id]||[]).includes(date);

function currentOrNext(){
  const n=new Date(),row=TT[DAYS[n.getDay()]],m=n.getHours()*60+n.getMinutes();
  if(!row)return null;
  for(let i=0;i<SLOTS.length;i++){
    if(row[i]&&row[i]!=='BREAK'&&m<toMin(SLOTS[i][1]))
      return{sub:SUBJECTS.find(x=>x.code===row[i]),slot:SLOTS[i],live:m>=toMin(SLOTS[i][0])};
  }
  return null;
}

/* ====== common layout: top bar + side menu ====== */
function initLayout(active){
  const user=S.get('user',null);
  if(!user){location.replace('index.html');return false}
  const unread=getMsgs().filter(m=>!m.read&&m.from!=='me').length;
  const av=user.photo?`<img src="${user.photo}" alt="">`:esc(user.name[0].toUpperCase());
  document.body.insertAdjacentHTML('afterbegin',`
  <div class="overlay" id="ov"></div>
  <aside class="side" id="side">
    <div class="side-head">
      <div class="avatar" id="sAv" title="Photo badalne ke liye click karo">${av}</div>
      <h3 id="sName" title="Naam badalne ke liye click karo">${esc(user.name)} ✏️</h3>
      <small>Reg No: ${esc(user.reg)}</small>
    </div>
    <a href="dashboard.html" class="${active===''?'active':''}">🏠 Dashboard</a>
    ${MENU.map(m=>`<a href="${m.href}" ${m.ext?'target="_blank" rel="noopener"':''} class="${m.id===active?'active':''}">${m.icon} ${m.name}${m.ext?' ↗':''}${m.id==='lpulive'&&unread?` <span class="badge bad">${unread}</span>`:''}</a>`).join('')}
    <a href="#" id="logout">🚪 Logout</a>
  </aside>
  <header class="topbar">
    <button class="icon-btn" id="menuBtn" aria-label="Menu">☰</button>
    <div class="brand">Student<span>Hub</span></div>
    <div class="right">
      <button class="icon-btn" id="themeBtn" title="Dark / Light">🌙</button>
      <div class="userbox"><div class="avatar" id="tAv">${av}</div><small>${esc(user.name)}</small></div>
    </div>
  </header>
  <input type="file" id="photoIn" accept="image/*" hidden>`);

  const side=$('#side'),ov=$('#ov');
  const toggle=o=>{side.classList.toggle('open',o);ov.classList.toggle('show',o)};
  $('#menuBtn').onclick=()=>toggle(!side.classList.contains('open'));
  ov.onclick=()=>toggle(false);
  $('#themeBtn').onclick=()=>{const d=document.documentElement.dataset.theme==='dark';document.documentElement.dataset.theme=d?'light':'dark';S.set('theme',d?'light':'dark')};
  $('#logout').onclick=e=>{e.preventDefault();S.set('lastUser',user);localStorage.removeItem('user');location.href='index.html'};
  $('#sName').onclick=()=>{const n=prompt('Apna naam likho:',user.name);if(n&&n.trim()){user.name=n.trim().slice(0,30);S.set('user',user);location.reload()}};
  $('#sAv').onclick=$('#tAv').onclick=()=>$('#photoIn').click();
  $('#photoIn').onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=()=>{const img=new Image();img.onload=()=>{
      const c=document.createElement('canvas');c.width=c.height=200;
      const s=Math.min(img.width,img.height);
      c.getContext('2d').drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,200,200);
      user.photo=c.toDataURL('image/jpeg',.8);S.set('user',user);location.reload()};img.src=r.result};
    r.readAsDataURL(f);
  };
  return true;
}