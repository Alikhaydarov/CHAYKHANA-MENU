"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {BowlFood,CheckCircle,DotsSixVertical,Eye,EyeSlash,FloppyDisk,Gear,Globe,GridFour,ImageSquare,MagnifyingGlass,Plus,Trash} from "@phosphor-icons/react";
const empty={category:"Osh",price:0,image:"/assets/osh.png",visible:true,position:0,names:{uz:"Yangi taom",ko:"",ru:"",en:""},descriptions:{uz:"",ko:"",ru:"",en:""}};
const langs={uz:"UZ",ko:"한국어",ru:"RU",en:"EN"};
export default function AdminClient(){
 const router=useRouter();
 const [items,setItems]=useState([]),[selectedId,setSelectedId]=useState(null),[draft,setDraft]=useState(null),[query,setQuery]=useState(""),[lang,setLang]=useState("uz"),[notice,setNotice]=useState("");
 const api=async(url,options)=>{const r=await fetch(url,options);const d=await r.json();if(!r.ok)throw new Error(d.error||"Server xatosi");return d};
 const load=useCallback(()=>api("/api/dishes?admin=1",{cache:"no-store"}).then(d=>{setItems(d);return d}),[]);
 useEffect(()=>{load().then(d=>{if(d[0]){setSelectedId(d[0].id);setDraft(structuredClone(d[0]))}})},[load]);
 const grouped=useMemo(()=>items.filter(i=>i.names.uz.toLowerCase().includes(query.toLowerCase())).reduce((a,x)=>((a[x.category]??=[]).push(x),a),{}),[items,query]);
 const toast=m=>{setNotice(m);setTimeout(()=>setNotice(""),1800)};
 const act=async(fn,success)=>{try{await fn();toast(success)}catch(error){toast(error.message)}};
 const save=()=>act(async()=>{await api("/api/dishes/"+draft.id,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify(draft)});await load()},"Saqlandi");
 const add=()=>act(async()=>{const d=await api("/api/dishes",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(empty)});await load();setSelectedId(d.id);setDraft(d)},"Yangi taom qo‘shildi");
 const remove=async()=>{if(!confirm("Taom o‘chirilsinmi?"))return;act(async()=>{await api("/api/dishes/"+draft.id,{method:"DELETE"});const next=await load();setSelectedId(next[0]?.id??null);setDraft(next[0]?structuredClone(next[0]):null)},"O‘chirildi")};
 const logout=async()=>{await fetch("/api/auth/logout",{method:"POST"});router.push("/admin/login")};
 const image=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>setDraft(x=>({...x,image:r.result}));r.readAsDataURL(f)};
 if(!draft)return <div className="admin-loading">Admin panel yuklanmoqda…</div>;
 return <main className="admin-shell">
  <aside className="admin-side"><div className="admin-brand"><span>✦</span><b>CHAYKAHANA</b></div><nav><button className="active"><BowlFood/>Taomlar</button><button><GridFour/>Kategoriyalar</button><button><Globe/>Tillar</button><button><Gear/>Sozlamalar</button></nav><Link href="/">← Menyuni ko‘rish</Link><button className="logout" onClick={logout}>Chiqish</button></aside>
  <section className="admin-list"><header><h1>Taomlar</h1><button onClick={add}><Plus/>Yangi taom</button></header><label className="admin-search"><MagnifyingGlass/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Qidirish"/></label><div className="admin-items">{Object.entries(grouped).map(([cat,foods])=><div key={cat}><h3>{cat}<em>{foods.length}</em></h3>{foods.map(d=><button className={d.id===selectedId?"selected":""} key={d.id} onClick={()=>{setSelectedId(d.id);setDraft(structuredClone(d))}}><img src={d.image} alt=""/><span><b>{d.names.uz}</b><small>₩{d.price.toLocaleString()}</small></span><i className={d.visible?"on":""}>{d.visible?<Eye/>:<EyeSlash/>}</i><DotsSixVertical/></button>)}</div>)}</div></section>
  <section className="admin-editor"><header><div><h2>{draft.names.uz}</h2><small>Taom ma’lumotlarini tahrirlash</small></div><div><button className="save" onClick={save}><FloppyDisk/>Saqlash</button><button className="delete" onClick={remove}><Trash/>O‘chirish</button></div></header>{notice&&<div className="notice"><CheckCircle/>{notice}</div>}
   <div className="editor-body"><h3>Asosiy ma’lumotlar</h3><div className="editor-basic"><div><label>Rasm</label><div className="admin-preview"><img src={draft.image} alt=""/><label><ImageSquare/>Rasmni o‘zgartirish<input type="file" accept="image/*" onChange={image}/></label></div></div><div className="admin-fields"><label>Kategoriya<select value={draft.category} onChange={e=>setDraft(x=>({...x,category:e.target.value}))}><option>Osh</option><option>Manti</option><option>Lag‘mon</option><option>Shashlik</option><option>Somsa</option></select></label><label>Narx (₩)<input type="number" value={draft.price} onChange={e=>setDraft(x=>({...x,price:Number(e.target.value)}))}/></label><label>Ko‘rinish<button onClick={()=>setDraft(x=>({...x,visible:!x.visible}))}>{draft.visible?<Eye/>:<EyeSlash/>}{draft.visible?"Ko‘rinadi":"Yashirin"}</button></label></div></div>
   <div className="admin-tabs">{Object.entries(langs).map(([k,v])=><button key={k} className={lang===k?"active":""} onClick={()=>setLang(k)}>{v}</button>)}</div><div className="locale-grid"><label>Nomi ({langs[lang]})<input value={draft.names[lang]} onChange={e=>setDraft(x=>({...x,names:{...x.names,[lang]:e.target.value}}))}/></label><label>Tavsif ({langs[lang]})<textarea value={draft.descriptions[lang]} onChange={e=>setDraft(x=>({...x,descriptions:{...x.descriptions,[lang]:e.target.value}}))}/></label></div></div>
  </section>
 </main>
}

