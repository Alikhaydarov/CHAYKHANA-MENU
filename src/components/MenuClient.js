"use client";
import {useEffect,useMemo,useState} from "react";
import {Calculator,Globe,MagnifyingGlass,Minus,Plus,X} from "@phosphor-icons/react";
const copy={
 uz:{welcome:"Xush kelibsiz",search:"Taom yoki kategoriya qidiring",all:"Barchasi",add:"Qo‘shish",selected:"Tanlangan",total:"Jami",view:"Hisobni ko‘rish",empty:"Hali taom tanlanmagan"},
 ko:{welcome:"환영합니다",search:"음식 또는 카테고리 검색",all:"전체",add:"추가",selected:"선택",total:"합계",view:"계산 보기",empty:"선택한 음식이 없습니다"},
 ru:{welcome:"Добро пожаловать",search:"Найти блюдо или категорию",all:"Все",add:"Добавить",selected:"Выбрано",total:"Итого",view:"Посмотреть счёт",empty:"Блюда не выбраны"},
 en:{welcome:"Welcome",search:"Search dishes or categories",all:"All",add:"Add",selected:"Selected",total:"Total",view:"View total",empty:"No dishes selected"}
};
const labels={uz:"UZ",ko:"한국어",ru:"RU",en:"EN"};
export default function MenuClient(){
 const [dishes,setDishes]=useState([]),[loading,setLoading]=useState(true),[lang,setLang]=useState("uz"),[query,setQuery]=useState(""),[category,setCategory]=useState("all"),[qty,setQty]=useState({}),[open,setOpen]=useState(false);
 useEffect(()=>{fetch("/api/dishes").then(r=>r.json()).then(d=>{setDishes(d);setTimeout(()=>setLoading(false),850)})},[]);
 const t=copy[lang],cats=[...new Set(dishes.map(d=>d.category))];
 const list=useMemo(()=>dishes.filter(d=>(category==="all"||d.category===category)&&(d.names[lang]||d.names.uz).toLowerCase().includes(query.toLowerCase())),[dishes,category,query,lang]);
 const count=Object.values(qty).reduce((a,b)=>a+b,0),total=dishes.reduce((sum,d)=>sum+(qty[d.id]||0)*d.price,0);
 const change=(id,n)=>setQty(q=>({...q,[id]:Math.max(0,(q[id]||0)+n)}));
 if(loading)return <div className="loader"><div className="loader-mark">✦</div><b>CHAYKAHANA</b><span>{t.welcome}</span></div>;
 return <main className="menu-page">
  <header className="menu-header"><div className="menu-brand"><span className="logo-mark">✦</span><div><b>CHAYKAHANA</b><small>O‘ZBEK TAOMLARI</small></div></div><div className="header-actions"><label><Globe/><select value={lang} onChange={e=>setLang(e.target.value)}>{Object.entries(labels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><button onClick={()=>setOpen(true)}><Calculator/> <span>{t.total}</span>{count>0&&<em>{count}</em>}</button></div><div className="menu-search"><MagnifyingGlass/><input placeholder={t.search} value={query} onChange={e=>setQuery(e.target.value)}/></div></header>
  <nav className="category-strip"><button className={category==="all"?"active":""} onClick={()=>setCategory("all")}>{t.all}</button>{cats.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</nav>
  <section className="dish-grid">{list.map(d=><article className="dish-card" key={d.id}><img src={d.image} alt={d.names[lang]||d.names.uz}/><div className="dish-meta"><div><h2>{d.names[lang]||d.names.uz}</h2><p>₩{d.price.toLocaleString()}</p></div>{qty[d.id]?<div className="stepper"><button onClick={()=>change(d.id,-1)}><Minus/></button><span>{qty[d.id]}</span><button onClick={()=>change(d.id,1)}><Plus/></button></div>:<button className="add" onClick={()=>change(d.id,1)}><Plus/> {t.add}</button>}</div></article>)}</section>
  {count>0&&<footer className="calc-bar"><div><Calculator/><span><small>{t.selected}</small><b>{count}</b></span></div><div><small>{t.total}</small><b>₩{total.toLocaleString()}</b></div><button onClick={()=>setOpen(true)}>{t.view}</button></footer>}
  {open&&<div className="sheet-backdrop" onClick={()=>setOpen(false)}><div className="calc-sheet" onClick={e=>e.stopPropagation()}><button className="sheet-close" onClick={()=>setOpen(false)}><X/></button><h2>{t.view}</h2>{count===0?<p>{t.empty}</p>:dishes.filter(d=>qty[d.id]).map(d=><div className="calc-row" key={d.id}><span>{d.names[lang]||d.names.uz} × {qty[d.id]}</span><b>₩{(d.price*qty[d.id]).toLocaleString()}</b></div>)}<div className="calc-total"><span>{t.total}</span><b>₩{total.toLocaleString()}</b></div></div></div>}
 </main>
}
