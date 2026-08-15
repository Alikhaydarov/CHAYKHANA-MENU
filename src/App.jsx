import { useMemo, useState } from 'react'
const dishes = [
	{ id: 1, cat: 'popular', name: 'Samarqand palovi', desc: 'Mol go‘shti, sabzi, no‘xat va ziravorli an’anaviy osh.', price: 14000, img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=86' },
	{ id: 2, cat: 'hot', name: 'Shashlik', desc: 'Ko‘mirda pishgan shirali mol go‘shti kabobi, piyoz bilan.', price: 16000, img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=900&q=86' },
	{ id: 3, cat: 'popular', name: 'Manti (4 dona)', desc: 'Mayin xamirga o‘ralgan mol go‘shti va piyozli manti.', price: 9000, img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=900&q=86' },
	{ id: 4, cat: 'noodle', name: 'Lag‘mon', desc: 'Qo‘lda cho‘zilgan lag‘mon, go‘sht va yangi sabzavotlar bilan.', price: 13000, img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=86' },
	{ id: 5, cat: 'hot', name: 'Qozon kabob', desc: 'Kartoshka va piyoz bilan qozonda qovurilgan shirali go‘sht.', price: 18000, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=86' },
	{ id: 6, cat: 'hot', name: 'Somsa (2 dona)', desc: 'Tandirda pishirilgan, go‘shtli va piyozli issiq somsa.', price: 8000, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=86' },
	{ id: 7, cat: 'noodle', name: 'Qovurma lag‘mon', desc: 'Qovurilgan lag‘mon, go‘sht, tuxum va yangi sabzavotlar.', price: 15000, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=86' },
	{ id: 8, cat: 'popular', name: 'Norin', desc: 'Mayin kesilgan xamir, ot go‘shti va piyoz bilan an’anaviy norin.', price: 14000, img: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=86' },
	{ id: 9, cat: 'drinks', name: 'Ko‘k choy', desc: 'An’anaviy o‘zbekcha ko‘k choy.', price: 4000, img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=86' },
	{ id: 10, cat: 'drinks', name: 'Qora choy', desc: 'Issiq va xushbo‘y qora choy.', price: 4000, img: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=900&q=86' },
	{ id: 11, cat: 'drinks', name: 'Kompot', desc: 'Uy uslubida tayyorlangan mevali kompot.', price: 5000, img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=86' },
	{ id: 12, cat: 'drinks', name: 'Limon choy', desc: 'Limon va asal bilan iliq choy.', price: 6000, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=86' },
]
const locales = {
	uz: { tabs: ['Mashhur taomlar', 'Barchasi', 'Issiq', 'Lag‘mon', 'Ichimliklar'], menu: 'Menyu', title: 'Mashhur taomlar', service: 'Xizmatlar', cart: 'Savatcha', total: 'Jami', add: 'Savatga qo‘shish', detail: 'Taom haqida', waiter: 'Ofitsiant', bill: 'Hisob', tag: 'Koreyadagi haqiqiy o‘zbek oshxonasi' },
	ru: { tabs: ['Популярное', 'Все', 'Горячее', 'Лагман', 'Напитки'], menu: 'Меню', title: 'Популярные блюда', service: 'Сервис', cart: 'Корзина', total: 'Итого', add: 'Добавить', detail: 'О блюде', waiter: 'Официант', bill: 'Счёт', tag: 'Настоящая узбекская кухня в Корее' },
	ko: { tabs: ['인기 메뉴', '전체', '따뜻한 요리', '라그만', '음료'], menu: '메뉴', title: '인기 메뉴', service: '서비스', cart: '장바구니', total: '합계', add: '담기', detail: '음식 정보', waiter: '직원 호출', bill: '계산서', tag: '한국에서 만나는 정통 우즈베키스탄 요리' },
}
export function App() {
	const [lang, setLang] = useState('uz'), [cat, setCat] = useState('popular'), [cart, setCart] = useState({ 1: 1, 2: 1, 3: 1 }), [food, setFood] = useState(null), [panel, setPanel] = useState(null), [entered, setEntered] = useState(false)
	const t = locales[lang]
	const shown = useMemo(() => (cat === 'all' ? dishes : dishes.filter(x => x.cat === cat)), [cat])
	const total = dishes.reduce((s, x) => s + (cart[x.id] || 0) * x.price, 0), count = Object.values(cart).reduce((s, x) => s + x, 0)
	const add = id => setCart(v => ({ ...v, [id]: (v[id] || 0) + 1 }))
	return (
		<div className='qr-app'>
			<section className='qhero'><nav className='qtop'><div className='brand'>CHAYKHANA</div><div className='language' aria-label='Language selector'>{[['uz', 'O‘zbekcha'], ['ru', 'Русский'], ['ko', '한국어']].map(([x, label]) => <button key={x} className={lang === x ? 'on' : ''} onClick={() => setLang(x)}>{label}</button>)}</div></nav></section>
			<section className='place'><div><h2>CHAYKHANA</h2><p>Uzbek cuisine · Seoul</p></div><div className='service-icons'><button onClick={() => setPanel('waiter')}>♧<small>{t.waiter}</small></button><button onClick={() => setPanel('bill')}>ⓘ<small>{t.bill}</small></button></div></section>
			<main>
				<div className='heading'><p>{t.menu}</p><div><h2>{t.title}</h2><button onClick={() => setPanel('service')}>{t.service}</button></div></div>
				<div className='qcategories'>{[['popular', '🔥'], ['all', '✦'], ['hot', '🍢'], ['noodle', '🍜'], ['drinks', '🥤']].map(([id, icon], i) => <button key={id} className={cat === id ? 'selected' : ''} onClick={() => setCat(id)}><i>{icon}</i><span>{t.tabs[i]}</span></button>)}</div>
				<div className='qcards'>{shown.map(x => <article key={x.id} className='food-card' role='button' tabIndex='0' aria-label={`${t.detail}: ${x.name}`} onClick={() => setFood(x)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFood(x) } }}><button className='qimage' onClick={e => { e.stopPropagation(); setFood(x) }}><img src={x.img} alt={x.name} /></button><div><h3>{x.name}</h3><p>{x.desc}</p><b>₩ {x.price.toLocaleString()}</b></div><button className='plus' aria-label={`${t.add}: ${x.name}`} onClick={e => { e.stopPropagation(); add(x.id) }}>+</button></article>)}</div>
			</main>
			<button className='bottom-cart' onClick={() => setPanel('cart')}><em>{count}</em><span>{t.cart}</span><b>₩ {total.toLocaleString()}</b></button>
			{food && <div className='sheet' onClick={() => setFood(null)}><div className='dialog' onClick={e => e.stopPropagation()}><button className='close' onClick={() => setFood(null)}>×</button><img src={food.img} alt='' /><div className='dialog-body'><p>{t.detail}</p><h2>{food.name}</h2><b>₩ {food.price.toLocaleString()}</b><p>{food.desc}</p><a href='https://www.youtube.com/results?search_query=uzbek+food+recipe' target='_blank' rel='noreferrer'>▶ Tayyorlanish videosi</a><button onClick={() => { add(food.id); setFood(null) }}>{t.add}</button></div></div></div>}
			{panel && <div className='sheet' onClick={() => setPanel(null)}><div className='dialog mini' onClick={e => e.stopPropagation()}><button className='close' onClick={() => setPanel(null)}>×</button>{panel === 'cart' ? <><p>{t.cart}</p><h2>{count} ta mahsulot</h2>{dishes.filter(x => cart[x.id]).map(x => <div className='cartline' key={x.id}><span>{x.name} × {cart[x.id]}</span><b>₩ {(x.price * cart[x.id]).toLocaleString()}</b></div>)}<div className='cart-total'><span>{t.total}</span><strong>₩ {total.toLocaleString()}</strong></div><button>{t.add}</button></> : <><p>{panel === 'waiter' ? t.waiter : panel === 'bill' ? t.bill : t.service}</p><h2>CHAYKHANA</h2><span>So‘rovingiz ofitsiantga yuboriladi.</span><button onClick={() => setPanel(null)}>Yuborish</button></>}</div></div>}
			{entered && <iframe className='music-player' title='Uzbek national music' src='https://www.youtube.com/embed/iWbxlrLnWp0?autoplay=1&loop=1&playlist=iWbxlrLnWp0' allow='autoplay' />}
			{!entered && <section className='welcome'><div className='arch'><span /></div><p>SEOUL · UZBEK CUISINE</p><h1>CHAYKHANA</h1><strong>차이하나 우즈베크 레스토랑</strong><span>Uy ta’mi, Seul markazida</span><button onClick={() => setEntered(true)}>Kirish / 입장하기</button><small>♫ Musiqa bilan davom etish uchun bosing</small></section>}
		</div>
	)
}
