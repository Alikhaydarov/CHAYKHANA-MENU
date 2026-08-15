import { useMemo, useState } from 'react'
const dishes = [
	{
		id: 1,
		cat: 'popular',
		name: 'Samarqand palovi',
		desc: 'Mol go‘shti, sabzi, no‘xat va ziravorli an’anaviy osh.',
		price: 14000,
		img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=86',
	},
	{
		id: 2,
		cat: 'hot',
		name: 'Shashlik',
		desc: 'Ko‘mirda pishgan shirali mol go‘shti kabobi, piyoz bilan.',
		price: 16000,
		img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=900&q=86',
	},
	{
		id: 3,
		cat: 'popular',
		name: 'Manti (4 dona)',
		desc: 'Mayin xamirga o‘ralgan mol go‘shti va piyozli manti.',
		price: 9000,
		img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=900&q=86',
	},
	{
		id: 4,
		cat: 'noodle',
		name: 'Lag‘mon',
		desc: 'Qo‘lda cho‘zilgan lag‘mon, go‘sht va yangi sabzavotlar bilan.',
		price: 13000,
		img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=86',
	},
]
const locales = {
	uz: {
		tabs: ['Mashhur taomlar', 'Barchasi', 'Issiq', 'Lag‘mon'],
		menu: 'Menyu',
		title: 'Mashhur taomlar',
		service: 'Xizmatlar',
		cart: 'Savatcha',
		add: 'Savatga qo‘shish',
		detail: 'Taom haqida',
		waiter: 'Ofitsiant',
		bill: 'Hisob',
		tag: 'Koreyadagi haqiqiy o‘zbek oshxonasi',
	},
	ru: {
		tabs: ['Популярное', 'Все', 'Горячее', 'Лагман'],
		menu: 'Меню',
		title: 'Популярные блюда',
		service: 'Сервис',
		cart: 'Корзина',
		add: 'Добавить',
		detail: 'О блюде',
		waiter: 'Официант',
		bill: 'Счёт',
		tag: 'Настоящая узбекская кухня в Корее',
	},
	ko: {
		tabs: ['인기 메뉴', '전체', '따뜻한 요리', '라그만'],
		menu: '메뉴',
		title: '인기 메뉴',
		service: '서비스',
		cart: '장바구니',
		add: '담기',
		detail: '음식 정보',
		waiter: '직원 호출',
		bill: '계산서',
		tag: '한국에서 만나는 정통 우즈베키스탄 요리',
	},
}
export function App() {
	const [lang, setLang] = useState('uz'),
		[cat, setCat] = useState('popular'),
		[cart, setCart] = useState({ 1: 1, 2: 1, 3: 1 }),
		[food, setFood] = useState(null),
		[panel, setPanel] = useState(null),
		[entered, setEntered] = useState(false)
	const t = locales[lang]
	const shown = useMemo(
		() => (cat === 'all' ? dishes : dishes.filter(x => x.cat === cat)),
		[cat],
	)
	const total = dishes.reduce((s, x) => s + (cart[x.id] || 0) * x.price, 0),
		count = Object.values(cart).reduce((s, x) => s + x, 0)
	const add = id => setCart(v => ({ ...v, [id]: (v[id] || 0) + 1 }))
	return (
		<div className='qr-app'>
			<section className='qhero'>
				<img
					src='https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=90'
					alt='O‘zbek oshxonasi'
				/>
				<div className='qshade' />
				<div className='qtop'>
					<button className='back'>‹</button>
					<div className='language'>
						{['uz', 'ru', 'ko'].map(x => (
							<button
								key={x}
								className={lang === x ? 'on' : ''}
								onClick={() => setLang(x)}
							>
								{x.toUpperCase()}
							</button>
						))}
					</div>
					<button
						className='sound'
						onClick={() =>
							window.open('https://youtu.be/iWbxlrLnWp0', '_blank', 'noopener')
						}
					>
						♬
					</button>
				</div>
				<div className='qtitle'>
					<p>O‘ZBEKISTON TA’MI</p>
					<h1>CHAYKHANA</h1>
					<span>{t.tag}</span>
				</div>
			</section>
			<section className='place'>
				<div>
					<b>12-STOL</b>
					<h2>CHAYKHANA</h2>
					<p>Uzbek cuisine · Seoul</p>
				</div>
				<div className='service-icons'>
					<button onClick={() => setPanel('waiter')}>
						♧<small>{t.waiter}</small>
					</button>
					<button onClick={() => setPanel('bill')}>
						ⓘ<small>{t.bill}</small>
					</button>
				</div>
			</section>
			<main>
				<div className='heading'>
					<p>{t.menu}</p>
					<div>
						<h2>{t.title}</h2>
						<button onClick={() => setPanel('service')}>{t.service}</button>
					</div>
				</div>
				<div className='qcategories'>
					{[
						['popular', '🔥'],
						['all', '✦'],
						['hot', '🍢'],
						['noodle', '🍜'],
					].map(([id, icon], i) => (
						<button
							key={id}
							className={cat === id ? 'selected' : ''}
							onClick={() => setCat(id)}
						>
							<i>{icon}</i>
							<span>{t.tabs[i]}</span>
						</button>
					))}
				</div>
				<div className='qcards'>
					{shown.map(x => (
						<article key={x.id}>
							<button className='qimage' onClick={() => setFood(x)}>
								<img src={x.img} alt={x.name} />
							</button>
							<div>
								<h3>{x.name}</h3>
								<p>{x.desc}</p>
								<b>₩ {x.price.toLocaleString()}</b>
							</div>
							<button className='plus' onClick={() => add(x.id)}>
								+
							</button>
						</article>
					))}
				</div>
			</main>
			<button className='bottom-cart' onClick={() => setPanel('cart')}>
				<em>{count}</em>
				<span>{t.cart}</span>
				<b>₩ {total.toLocaleString()}</b>
			</button>
			{food && (
				<div className='sheet'>
					<div className='dialog'>
						<button className='close' onClick={() => setFood(null)}>
							×
						</button>
						<img src={food.img} alt='' />
						<div className='dialog-body'>
							<p>{t.detail}</p>
							<h2>{food.name}</h2>
							<b>₩ {food.price.toLocaleString()}</b>
							<p>{food.desc}</p>
							<a
								href='https://www.youtube.com/results?search_query=uzbek+food+recipe'
								target='_blank'
								rel='noreferrer'
							>
								▶ Tayyorlanish videosi
							</a>
							<button
								onClick={() => {
									add(food.id)
									setFood(null)
								}}
							>
								{t.add}
							</button>
						</div>
					</div>
				</div>
			)}
			{panel && (
				<div className='sheet' onClick={() => setPanel(null)}>
					<div className='dialog mini' onClick={e => e.stopPropagation()}>
						<button className='close' onClick={() => setPanel(null)}>
							×
						</button>
						{panel === 'cart' ? (
							<>
								<p>{t.cart}</p>
								<h2>{count} ta mahsulot</h2>
								{dishes
									.filter(x => cart[x.id])
									.map(x => (
										<div className='cartline' key={x.id}>
											<span>
												{x.name} × {cart[x.id]}
											</span>
											<b>₩ {(x.price * cart[x.id]).toLocaleString()}</b>
										</div>
									))}
								<button>{t.add}</button>
							</>
						) : (
							<>
								<p>
									{panel === 'waiter'
										? t.waiter
										: panel === 'bill'
											? t.bill
											: t.service}
								</p>
								<h2>12-STOL</h2>
								<span>So‘rovingiz ofitsiantga yuboriladi.</span>
								<button onClick={() => setPanel(null)}>Yuborish</button>
							</>
						)}
					</div>
				</div>
			)}
			{entered && (
				<iframe
					className='music-player'
					title='Uzbek national music'
					src='https://www.youtube.com/embed/iWbxlrLnWp0?autoplay=1&loop=1&playlist=iWbxlrLnWp0'
					allow='autoplay'
				/>
			)}
			{!entered && (
				<section className='welcome'>
					<div className='arch'>
						<span />
					</div>
					<p>SEOUL · UZBEK CUISINE</p>
					<h1>CHAYKHANA</h1>
					<strong>차이하나 우즈베크 레스토랑</strong>
					<span>Uy ta’mi, Seul markazida</span>
					<button onClick={() => setEntered(true)}>Kirish / 입장하기</button>
					<small>♫ Musiqa bilan davom etish uchun bosing</small>
				</section>
			)}
		</div>
	)
}
