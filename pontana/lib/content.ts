/**
 * ═══════════════════════════════════════════════════════════════════
 *  TO RE-SKIN FOR A NEW CLIENT: edit this file only.
 *
 *  Every visible word, color, menu item, review, opening hour and
 *  contact detail on the site lives in the `siteConfig` object below.
 *  Swap the values, replace the image URLs, and the site becomes a
 *  brand-new client site — no component changes needed.
 * ═══════════════════════════════════════════════════════════════════
 */

export interface MenuItem {
  name: string
  description: string
  price: number // in ISK, formatted as "X.XXX kr." by the UI
  /** Optional highlight chip, e.g. "Vinsælast" or "Nýtt" */
  tag?: string
}

export interface MenuCategory {
  title: string
  items: MenuItem[]
}

export interface Review {
  name: string
  rating: 1 | 2 | 3 | 4 | 5
  text: string
  date: string // human-readable, e.g. "fyrir 2 vikum"
}

export interface OpeningHour {
  /** Display label, e.g. "Mánudagur – Fimmtudagur" */
  days: string
  /** Display value, e.g. "11:30 – 21:00" */
  hours: string
  /** Machine-readable weekdays: 0 = sunnudagur … 6 = laugardagur.
   *  Drives the live "Opið núna" badge and JSON-LD opening hours. */
  dayNumbers: number[]
  open: string // "HH:MM"
  close: string // "HH:MM"
}

export interface GalleryImage {
  src: string
  alt: string
}

export interface SiteConfig {
  /** Business identity */
  name: string
  tagline: string
  description: string
  /** Absolute URL of the deployed site (used in metadata / JSON-LD) */
  url: string

  /**
   * Brand colors — injected as CSS variables and mapped to the Tailwind
   * classes `bg-base`, `bg-surface`, `text-accent`, `border-line` etc.
   * (see tailwind.config.ts). base/surface/accent/ink/inkMuted must be
   * HEX values (they get converted to RGB channels so Tailwind opacity
   * modifiers work); accentSoft/line can be any CSS color incl. rgba().
   */
  colors: {
    base: string // page background (deep navy/charcoal) — hex
    surface: string // raised cards / nav — hex
    accent: string // warm amber highlight — hex
    accentSoft: string // accent at low intensity (badges, glows)
    ink: string // primary text — hex
    inkMuted: string // secondary text — hex
    line: string // hairline borders
  }

  images: {
    hero: string
    about: string
  }

  /** Optional announcement pill in the hero — set to null to hide */
  announcement: { text: string } | null

  nav: { label: string; href: string }[]

  hero: {
    kicker: string
    cta: string
    ctaHref: string
    secondaryCta: string
    secondaryCtaHref: string
  }

  about: {
    heading: string
    kicker: string
    paragraphs: string[]
    highlights: { value: string; label: string }[]
  }

  menu: {
    heading: string
    kicker: string
    note: string
    categories: MenuCategory[]
  }

  gallery: {
    heading: string
    kicker: string
    images: GalleryImage[]
  }

  reviews: {
    heading: string
    kicker: string
    widgetTitle: string
    widgetSubtitle: string
    poweredBy: string
    items: Review[]
  }

  hours: {
    heading: string
    kicker: string
    /** Labels for the live open/closed badge */
    badge: {
      open: string // "Opið núna"
      closed: string // "Lokað"
      closesAt: string // "lokar kl."
      opensAt: string // "opnar kl."
    }
    schedule: OpeningHour[]
    address: {
      street: string
      postalCode: string
      city: string
      country: string
    }
    /** Google Maps embed URL for the iframe */
    mapEmbedUrl: string
    mapLabel: string
  }

  contact: {
    heading: string
    kicker: string
    intro: string
    phone: string
    phoneHref: string
    email: string
    form: {
      nameLabel: string
      emailLabel: string
      messageLabel: string
      submitLabel: string
      sendingLabel: string
      successMessage: string
      errorMessage: string
    }
  }

  booking: {
    heading: string
    kicker: string
    intro: string
    form: {
      dateLabel: string
      timeLabel: string
      guestsLabel: string
      guestsSuffix: string
      nameLabel: string
      phoneLabel: string
      submitLabel: string
      sendingLabel: string
      successHeading: string
      successMessage: string
      errorMessage: string
    }
    backLabel: string
  }

  footer: {
    note: string
    madeBy: string
    madeByUrl: string
  }

  social: { label: string; href: string }[]
}

export const siteConfig: SiteConfig = {
  name: 'Pontana',
  tagline: 'Ferskt úr Eyjafirði — á hverjum degi',
  description:
    'Pontana er nútímalegt sjávarréttabistró á Akureyri. Ferskur fiskur úr Eyjafirði, hlý stemning og norðlensk gestrisni.',
  url: 'https://pontana.example.is',

  colors: {
    base: '#0b1220',
    surface: '#111a2c',
    accent: '#e8a24b',
    accentSoft: 'rgba(232, 162, 75, 0.18)',
    ink: '#f4f1ea',
    inkMuted: '#9aa5b8',
    line: 'rgba(244, 241, 234, 0.08)',
  },

  images: {
    hero: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80',
    about:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
  },

  announcement: {
    text: 'Sumartilboð — 3ja rétta matseðill á 8.900 kr. alla virka daga',
  },

  nav: [
    { label: 'Um okkur', href: '/#um-okkur' },
    { label: 'Matseðill', href: '/#matsedill' },
    { label: 'Umsagnir', href: '/#umsagnir' },
    { label: 'Opnunartímar', href: '/#opnunartimar' },
    { label: 'Hafa samband', href: '/#hafa-samband' },
  ],

  hero: {
    kicker: 'Sjávarréttabistró · Akureyri',
    cta: 'Panta borð',
    ctaHref: '/pontun',
    secondaryCta: 'Skoða matseðil',
    secondaryCtaHref: '/#matsedill',
  },

  about: {
    heading: 'Fjölskyldufyrirtæki við Eyjafjörð',
    kicker: 'Um okkur',
    paragraphs: [
      'Pontana er fjölskyldufyrirtæki við Eyjafjörð, stofnað árið 2014. Við trúum á einfalda hluti: ferskan fisk beint frá bryggjunni, hráefni úr héraði og hlýja norðlenska gestrisni.',
      'Kokkurinn okkar, Elvar, byrjar hvern morgun á spjalli við sjómennina á höfninni — og matseðillinn ræðst af því sem kom upp úr sjónum þá nótt. Þess vegna er hann aldrei alveg eins tvo daga í röð.',
      'Hvort sem þú kemur í hádeginu eftir gönguferð eða á kvöldin með fjölskyldunni, þá viljum við að þér líði eins og heima hjá þér — bara með betra útsýni yfir fjörðinn.',
    ],
    highlights: [
      { value: '2014', label: 'Stofnað á Akureyri' },
      { value: '100%', label: 'Fiskur úr Eyjafirði' },
      { value: '4,9★', label: 'Meðaleinkunn gesta' },
    ],
  },

  menu: {
    heading: 'Matseðill',
    kicker: 'Ferskt í dag',
    note: 'Matseðillinn breytist eftir árstíðum og afla dagsins. Verð innihalda vsk.',
    categories: [
      {
        title: 'Forréttir',
        items: [
          {
            name: 'Plokkfiskur í brauðskál',
            description: 'Klassískur plokkfiskur með reyktum þorski og rúgbrauði',
            price: 2490,
          },
          {
            name: 'Grafinn lax',
            description: 'Heimagrafinn lax með sinnepssósu og dilli',
            price: 2890,
          },
          {
            name: 'Bláskel úr Hrísey',
            description: 'Gufusoðin bláskel með hvítvíni, hvítlauk og steinselju',
            price: 3190,
            tag: 'Nýtt',
          },
          {
            name: 'Humarsúpa',
            description: 'Rjómakennd humarsúpa með koníaki og nýbökuðu brauði',
            price: 2990,
          },
        ],
      },
      {
        title: 'Aðalréttir',
        items: [
          {
            name: 'Þorskur dagsins',
            description: 'Léttsteiktur þorskhnakki með brúnu smjöri, kartöflum og grænmeti',
            price: 4990,
            tag: 'Vinsælast',
          },
          {
            name: 'Grillaður lax',
            description: 'Lax af grillinu með byggotto, spergilkáli og sítrónusmjöri',
            price: 5290,
          },
          {
            name: 'Fiskur í raspi',
            description: 'Djúpsteikt ýsa með heimagerðri remúlaði og frönskum',
            price: 4290,
          },
          {
            name: 'Lambafillet',
            description: 'Norðlenskt lambafillet með rótargrænmeti og bláberjasósu',
            price: 6490,
          },
          {
            name: 'Grænmetisbuff',
            description: 'Byggbuff með sveppum, seljurótarmauki og grasker',
            price: 3990,
          },
        ],
      },
      {
        title: 'Eftirréttir',
        items: [
          {
            name: 'Skyrmús',
            description: 'Létt skyrmús með bláberjum úr Kjarnaskógi og hafrakurli',
            price: 1890,
          },
          {
            name: 'Súkkulaðikaka',
            description: 'Volg súkkulaðikaka með saltkaramellu og vanilluís',
            price: 2190,
          },
          {
            name: 'Ostabakki',
            description: 'Norðlenskir ostar með heimagerðu kexi og berjasultu',
            price: 2790,
          },
        ],
      },
    ],
  },

  gallery: {
    heading: 'Svipmyndir',
    kicker: 'Stemningin hjá okkur',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=800&q=75',
        alt: 'Fallega framreiddur sjávarréttur á diski',
      },
      {
        src: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=75',
        alt: 'Laxaréttur með fersku grænmeti',
      },
      {
        src: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=75',
        alt: 'Hlýleg stemning í veitingasalnum',
      },
      {
        src: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=75',
        alt: 'Réttur kvöldsins framreiddur af kokki',
      },
    ],
  },

  reviews: {
    heading: 'Umsagnir gesta',
    kicker: 'Það sem fólk segir',
    widgetTitle: 'Ummæli',
    widgetSubtitle: 'Staðfestar umsagnir gesta',
    poweredBy: 'Ummæli — umsagnakerfi frá Marinerus',
    items: [
      {
        name: 'Guðrún Sigurðardóttir',
        rating: 5,
        text: 'Besti fiskur sem ég hef fengið á Akureyri, punktur. Þorskurinn bráðnaði í munni og þjónustan var einstaklega hlý. Við komum aftur strax í næstu viku.',
        date: 'fyrir 3 dögum',
      },
      {
        name: 'Jón Þór Arnarson',
        rating: 5,
        text: 'Fórum með alla fjölskylduna á laugardagskvöldi. Frábært verð miðað við gæði og krakkarnir elskuðu fiskinn í raspi. Útsýnið yfir fjörðinn er bónus.',
        date: 'fyrir viku',
      },
      {
        name: 'Anna María Jóhannsdóttir',
        rating: 5,
        text: 'Humarsúpan er sú besta á Norðurlandi. Notaleg stemning, fallegt umhverfi og starfsfólkið man eftir manni. Mæli innilega með.',
        date: 'fyrir 2 vikum',
      },
      {
        name: 'Stefán Gunnarsson',
        rating: 4,
        text: 'Mjög góður matur og skemmtileg vínlisti. Það var smá bið eftir borði á föstudagskvöldi — pantið tímanlega! Bláskelin úr Hrísey var hápunkturinn.',
        date: 'fyrir 3 vikum',
      },
      {
        name: 'Hulda Björk Pétursdóttir',
        rating: 5,
        text: 'Héldum upp á afmæli mömmu hér og allt var fullkomið. Starfsfólkið kom með kerti á eftirréttinn án þess að við bæðum um það. Svona staðir eru sjaldgæfir.',
        date: 'fyrir mánuði',
      },
    ],
  },

  hours: {
    heading: 'Opnunartímar & staðsetning',
    kicker: 'Finndu okkur',
    badge: {
      open: 'Opið núna',
      closed: 'Lokað',
      closesAt: 'lokar kl.',
      opensAt: 'opnar kl.',
    },
    schedule: [
      {
        days: 'Mánudagur – Fimmtudagur',
        hours: '11:30 – 21:00',
        dayNumbers: [1, 2, 3, 4],
        open: '11:30',
        close: '21:00',
      },
      {
        days: 'Föstudagur – Laugardagur',
        hours: '11:30 – 22:30',
        dayNumbers: [5, 6],
        open: '11:30',
        close: '22:30',
      },
      {
        days: 'Sunnudagur',
        hours: '12:00 – 21:00',
        dayNumbers: [0],
        open: '12:00',
        close: '21:00',
      },
    ],
    address: {
      street: 'Strandgata 11',
      postalCode: '600',
      city: 'Akureyri',
      country: 'Ísland',
    },
    mapEmbedUrl:
      'https://www.google.com/maps?q=Strandgata%2011%2C%20600%20Akureyri%2C%20Iceland&output=embed',
    mapLabel: 'Kort sem sýnir staðsetningu Pontana á Akureyri',
  },

  contact: {
    heading: 'Hafa samband',
    kicker: 'Við svörum fljótt',
    intro:
      'Sendu okkur línu vegna hópbókana, veisluhalda eða bara til að segja hæ. Þú getur líka hringt beint.',
    phone: '462 7100',
    phoneHref: 'tel:+3544627100',
    email: 'pontana@pontana.is',
    form: {
      nameLabel: 'Nafn',
      emailLabel: 'Netfang',
      messageLabel: 'Skilaboð',
      submitLabel: 'Senda skilaboð',
      sendingLabel: 'Sendi…',
      successMessage: 'Takk fyrir! Skilaboðin eru móttekin — við svörum eins fljótt og við getum.',
      errorMessage: 'Úps — eitthvað fór úrskeiðis. Reyndu aftur eða hringdu í okkur.',
    },
  },

  booking: {
    heading: 'Panta borð',
    kicker: 'Borðapöntun',
    intro:
      'Fylltu út formið og við staðfestum pöntunina símleiðis eða með SMS. Fyrir hópa stærri en 10 manns, hringdu beint í okkur.',
    form: {
      dateLabel: 'Dagsetning',
      timeLabel: 'Tími',
      guestsLabel: 'Fjöldi gesta',
      guestsSuffix: 'gestir',
      nameLabel: 'Nafn',
      phoneLabel: 'Símanúmer',
      submitLabel: 'Senda pöntun',
      sendingLabel: 'Sendi…',
      successHeading: 'Pöntun móttekin!',
      successMessage:
        'Takk fyrir! Við höfum móttekið beiðnina og staðfestum borðið eins fljótt og hægt er.',
      errorMessage: 'Úps — eitthvað fór úrskeiðis. Reyndu aftur eða hringdu í okkur.',
    },
    backLabel: 'Til baka á forsíðu',
  },

  footer: {
    note: 'Sjávarréttabistró við Eyjafjörð',
    madeBy: 'Vefsíða frá Marinerus',
    madeByUrl: 'https://marinerus.is',
  },

  social: [
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'Instagram', href: 'https://instagram.com' },
  ],
}
