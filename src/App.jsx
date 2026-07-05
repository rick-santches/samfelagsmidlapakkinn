import { useState } from 'react'
import {
  CalendarDays,
  FileText,
  Palette,
  Hash,
  Coffee,
  Scissors,
  Dumbbell,
  ShoppingBag,
  Clock,
  Lightbulb,
  CalendarX,
  ChevronDown,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Check,
} from 'lucide-react'

const CHECKOUT_URL = 'https://CHANGE-ME.lemonsqueezy.com/checkout'

function BuyButton({ label = 'Kaupa núna – 9.900 kr.', className = '' }) {
  return (
    <a
      href={CHECKOUT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-primary ${className}`}
    >
      {label}
    </a>
  )
}

function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''} mb-14`}>
      {eyebrow && <p className="section-label mb-3">{eyebrow}</p>}
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-lg text-slate-400">{subtitle}</p>}
    </div>
  )
}

function Hero() {
  return (
    <header className="relative overflow-hidden bg-radial-fade">
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-ember-400 to-ember-600 font-black text-navy-950">
            S
          </div>
          <span className="font-bold text-white">Samfélagsmiðlapakkinn</span>
        </div>
        <a
          href="#faq"
          className="hidden text-sm font-medium text-slate-400 transition hover:text-white sm:block"
        >
          Spurt og svarað
        </a>
      </nav>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-10 text-center sm:pb-32 sm:pt-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-ember-400" />
          Fyrir lítil, staðbundin fyrirtæki á Íslandi
        </div>

        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white text-balance sm:text-6xl">
          Aldrei aftur hugmyndalaus á
          <span className="bg-gradient-to-r from-ember-400 to-ember-600 bg-clip-text text-transparent"> samfélagsmiðlum</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
          90 dagar af tilbúnu efni fyrir Instagram og Facebook – íslenskir textar, Canva
          sniðmát og efnisdagatal. Settu inn, birtu og haltu áfram með reksturinn.
        </p>

        <div className="mt-10">
          <BuyButton />
        </div>
        <p className="mt-4 text-sm text-slate-500">Stafræn vara · Samstundis niðurhal · Engin áskrift</p>
      </div>

      {/* decorative shapes */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-ember-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-64 w-64 rotate-12 rounded-[3rem] border border-white/5" />
      <div className="pointer-events-none absolute -left-16 top-64 h-40 w-40 -rotate-12 rounded-[2rem] border border-white/5" />
    </header>
  )
}

function Pain() {
  const points = [
    {
      icon: Clock,
      title: 'Enginn tími',
      body: 'Þú rekur fyrirtæki, ekki efnisveitu. Klukkutímarnir sem fara í að hugsa upp færslur eru klukkutímar sem þú færð aldrei til baka.',
    },
    {
      icon: Lightbulb,
      title: 'Engar hugmyndir',
      body: 'Þú starir á myndavélarrúlluna, kveikir á skrifforritinu – og veist samt ekki hvað þú átt að segja. Aftur.',
    },
    {
      icon: CalendarX,
      title: 'Óregluleg birting',
      body: 'Þú birtir þegar þér dettur það í hug, sem þýðir sjaldan. Reikniritið – og viðskiptavinirnir – taka eftir því.',
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Kannastu við þetta?"
        title="Samfélagsmiðlar eiga ekki að vera vinnan þín"
        subtitle="Þrjú vandamál sem flestir eigendur lítilla fyrirtækja glíma við í hverri viku."
      />
      <div className="grid gap-6 sm:grid-cols-3">
        {points.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-ember-500/10 text-ember-400">
              <Icon size={24} strokeWidth={2} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
            <p className="text-slate-400">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function WhatsInside() {
  const items = [
    {
      icon: CalendarDays,
      title: '90 daga efnisdagatal',
      body: 'Nákvæmlega hvað á að birta hvern dag, skipulagt eftir mánuðum og árstíðum.',
    },
    {
      icon: FileText,
      title: 'Færslutextar á íslensku',
      body: 'Tilbúnir textar, skrifaðir fyrir lítil íslensk fyrirtæki – engin þýðing, engin vandræði.',
    },
    {
      icon: Palette,
      title: 'Ritstýranleg Canva sniðmát',
      body: 'Falleg sniðmát sem þú aðlagar á 5 mínútum. Engin hönnunarkunnátta þarf.',
    },
    {
      icon: Hash,
      title: 'Myllumerkjaleiðbeiningar',
      body: 'Réttu myllumerkin fyrir íslenskan markað, flokkuð eftir tegund fyrirtækis.',
    },
  ]

  return (
    <section className="border-y border-white/5 bg-navy-900/50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Innihald pakkans"
          title="90 dagar af efni, tilbúið til að birta"
          subtitle="Allt sem þú þarft til að fylla samfélagsmiðlana þína í heilan ársfjórðung."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card p-7 transition hover:border-ember-500/30 hover:bg-white/[0.05]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-ember-400 to-ember-600 text-navy-950">
                <Icon size={22} strokeWidth={2.5} />
              </div>
              <h3 className="mb-2 font-bold text-white">{title}</h3>
              <p className="text-sm text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhoItsFor() {
  const audiences = [
    { icon: Coffee, title: 'Kaffihús' },
    { icon: Scissors, title: 'Hárgreiðslustofur' },
    { icon: Dumbbell, title: 'Líkamsræktarstöðvar' },
    { icon: ShoppingBag, title: 'Litlar verslanir' },
  ]

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Fyrir hvern?"
        title="Búið til fyrir lítil, staðbundin fyrirtæki"
        subtitle="Ef þú sinnir viðskiptavinum í eigin persónu, þá er þessi pakki fyrir þig."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {audiences.map(({ icon: Icon, title }) => (
          <div
            key={title}
            className="card flex flex-col items-center gap-4 p-8 text-center transition hover:-translate-y-1"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-ember-500/20 bg-ember-500/10 text-ember-400">
              <Icon size={26} />
            </div>
            <p className="font-semibold text-white">{title}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function InstagramMock({ handle, avatarLetter, caption, likes }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-ember-400 to-ember-600 text-sm font-bold text-navy-950">
          {avatarLetter}
        </div>
        <p className="text-sm font-semibold text-white">{handle}</p>
      </div>

      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-ember-500/10 blur-2xl" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-ember-500/10 blur-2xl" />
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl font-black text-ember-400">
          {avatarLetter}
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 pt-3 text-slate-300">
        <Heart size={20} />
        <MessageCircle size={20} />
        <Send size={20} />
        <Bookmark size={20} className="ml-auto" />
      </div>

      <div className="px-4 pb-4 pt-2">
        <p className="text-sm font-semibold text-white">{likes} líkar við þetta</p>
        <p className="mt-1 text-sm text-slate-400">
          <span className="font-semibold text-white">{handle}</span> {caption}
        </p>
      </div>
    </div>
  )
}

function Preview() {
  const posts = [
    {
      handle: 'kaffihusid_torg',
      avatarLetter: 'K',
      likes: '48',
      caption:
        '☕ Mánudagsmorgnar eru erfiðir – en kaffibollinn þarf ekki að vera það. Kíktu við fyrir fyrsta kaffið og segðu okkur hvernig helgin var. Opið frá kl. 8! #kaffihús #morgunrútína #akureyri',
    },
    {
      handle: 'stofan_hargreidsla',
      avatarLetter: 'S',
      likes: '73',
      caption:
        '✂️ Ný klipping, nýtt sjálfstraust. Það eru lausir tímar í vikunni – smelltu á tengilinn í prófílnum og bókaðu áður en þeir klárast. 💇‍♀️ #hárgreiðslustofa #nýttlúkk',
    },
    {
      handle: 'form_likamsraekt',
      avatarLetter: 'F',
      likes: '61',
      caption:
        '💪 Mánudagur = nýtt upphaf. Mættu á 6:00 morgunæfinguna og byrjaðu vikuna almennilega. Fyrsta æfingin er frí fyrir nýja meðlimi – ekkert mál að kíkja við. #líkamsrækt #hreyfing',
    },
  ]

  return (
    <section className="border-y border-white/5 bg-navy-900/50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Sýnishorn"
          title="Svona lítur efnið út í raunveruleikanum"
          subtitle="Þrjú dæmi um færslur sem koma beint úr pakkanum – bara settu inn þína mynd."
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <InstagramMock key={post.handle} {...post} />
          ))}
        </div>
      </div>
    </section>
  )
}

function AccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-semibold text-white">{question}</span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-ember-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-slate-400">{answer}</p>
        </div>
      </div>
    </div>
  )
}

function Faq() {
  const faqs = [
    {
      question: 'Hvernig fæ ég efnið eftir að ég kaupi?',
      answer:
        'Um leið og greiðslan hefur verið staðfest færðu tengil á niðurhal með öllu efninu – samstundis. Engin bið, engin tölvupóstsamskipti fram og til baka.',
    },
    {
      question: 'Þarf ég að kunna á hönnun eða Photoshop?',
      answer:
        'Nei, alls ekki. Öll sniðmátin eru gerð í Canva, sem er ókeypis og einfalt í notkun. Þú skiptir bara um mynd og texta – tekur nokkrar mínútur á hverja færslu.',
    },
    {
      question: 'Hver er endurgreiðslustefnan?',
      answer:
        'Þar sem um stafræna vöru er að ræða sem er afhent samstundis, bjóðum við ekki upp á endurgreiðslu eftir að niðurhal hefur átt sér stað. Ef þú lendir í vandræðum með skjölin skaltu hafa samband og við leysum málið.',
    },
    {
      question: 'Virkar þetta fyrir hvaða fyrirtæki sem er?',
      answer:
        'Pakkinn er hannaður sérstaklega með lítil, staðbundin fyrirtæki í huga – kaffihús, hárgreiðslustofur, líkamsræktarstöðvar og verslanir – en textana og sniðmátin er auðvelt að aðlaga að flestum rekstri.',
    },
    {
      question: 'Hvernig virkar efnisdagatalið?',
      answer:
        'Dagatalið sýnir þér nákvæmlega hvað á að birta hvern dag í 90 daga, með tillögu að texta, myllumerkjum og sniðmáti. Þú fylgir bara planinu – engar vangaveltur.',
    },
  ]

  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <SectionHeading eyebrow="Spurt og svarað" title="Það sem flestir spyrja um" />
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={faq.question}
            {...faq}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
          />
        ))}
      </div>
    </section>
  )
}

function FinalCta() {
  const bullets = [
    '90 daga efnisdagatal',
    'Færslutextar á íslensku',
    'Ritstýranleg Canva sniðmát',
    'Myllumerkjaleiðbeiningar',
  ]

  return (
    <section className="relative overflow-hidden bg-radial-fade py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white text-balance sm:text-4xl">
          Hættu að finna upp á efni frá grunni í hvert skipti
        </h2>
        <p className="mt-4 text-lg text-slate-400">
          Fáðu 90 daga af tilbúnu efni og einbeittu þér að því sem skiptir máli – rekstrinum.
        </p>

        <ul className="mx-auto mt-8 grid max-w-md gap-3 text-left sm:grid-cols-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm text-slate-300">
              <Check size={16} className="shrink-0 text-ember-400" />
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <BuyButton />
        </div>
        <p className="mt-4 text-sm text-slate-500">9.900 kr. · Ein greiðsla · Samstundis niðurhal</p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center text-sm text-slate-500">
        <p>Rekið af Marinerus ehf. – Akureyri, Ísland</p>
        <a href="mailto:netfang@marinerus.is" className="transition hover:text-slate-300">
          netfang@marinerus.is
        </a>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Pain />
      <WhatsInside />
      <WhoItsFor />
      <Preview />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  )
}
