#!/usr/bin/env node
/**
 * generate-services.js
 * Genererar alla tjänstesidor (huvudkategorier + underkategorier).
 * Kör: node scripts/generate-services.js
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// ---------------------------------------------------------------------------
// TJÄNSTER DATA
// ---------------------------------------------------------------------------

const SERVICES = [
  {
    slug: 'bygg',
    name: 'Bygg',
    image: '/images/Bygg-Image.jpg',
    sni: 'SNI 41.000 – Byggande av bostadshus och andra byggnader',
    intro: 'Vi hjälper privatpersoner och företag med byggprojekt i alla storlekar – från mindre ombyggnader till större nybyggnationer. Med erfarenhet och kvalitetsmedvetenhet levererar vi resultat som håller i generationer.',
    description: 'Byggande av bostadshus och andra byggnader är kärnan i vår verksamhet. Vi utför hela byggprocessen från grund till tak, alltid anpassad efter dina önskemål och förutsättningar.',
    subcategories: [
      {
        slug: 'nybyggnation',
        name: 'Nybyggnation',
        intro: 'Drömmer du om ett nytt hus? Vi bygger bostadshus och andra byggnader från grunden efter dina önskemål.',
        description: 'Nybyggnation innebär att bygga en helt ny byggnad från grunden. Vi ansöker om bygglov, planerar och utför hela byggprocessen. Vi samarbetar med dig genom hela projektet för att säkerställa att resultatet blir precis som du önskar.',
        tasks: [
          'Planering och projektering',
          'Ansökan om bygglov',
          'Grundarbete och markarbeten',
          'Stomme och tak',
          'Inredning och slutfinish',
          ' Slutbesiktning och överlämning',
        ],
      },
      {
        slug: 'renovering',
        name: 'Renovering',
        intro: 'Vill du förbättra ditt befintliga hem eller lokal? Vi utför renoveringar från mindre uppgraderingar till fullständiga renoveringar.',
        description: 'Renovering handlar om att förbättra och uppdatera en befintlig byggnad. Vi kan hjälpa till med allt från köks- och badrumsrenovering till större genomgripande förändringar av hela lokaler.',
        tasks: [
          'Renovering av kök och badrum',
          'Ytskikt och golvarbete',
          'Ommålning och tapetsering',
          'El- och VVS-arbeten',
          'Anpassning av rum och lokaler',
          'Förbättringar och uppgraderingar',
        ],
      },
      {
        slug: 'tillbyggnad',
        name: 'Tillbyggnad',
        intro: 'Behöver du mer utrymme? Vi bygger tillbyggnader som utökar ditt befintliga hem eller din lokal.',
        description: 'Tillbyggnad innebär att bygga till en befintlig byggnad. Det kan vara ett extra rum, en ny våning eller en utvidgning av befintliga utrymmen. Vi ser till att tillbyggnaden smälter in med den befintliga byggnaden.',
        tasks: [
          'Tillbyggnad av rum och våningar',
          'Bygglovshantering',
          'Anslutning till befintlig stomme',
          'Tak- och fönsterarbeten',
          'Inredning och slutfinish',
          'Koordinering med relevanta parter',
        ],
      },
      {
        slug: 'ombyggnad',
        name: 'Ombyggnad',
        intro: 'Vill du ändra på layouten eller funktionen i ditt hem? Vi utför ombyggnader som förbättrar ditt boende.',
        description: 'Ombyggnad handlar om att ändra eller förbättra en befintlig byggnads struktur eller funktion. Det kan handla om att flytta väggar, ändra rumfördelning eller anpassa lokaler för nya behov.',
        tasks: [
          'Rivning av väggar och inredning',
          'Ny rumfördelning',
          'Anpassning av lokaler',
          'Golvarbete och ytskikt',
          'El- och VVS-omläggning',
          'Slutfinish och städning',
        ],
      },
      {
        slug: 'altan-uterum',
        name: 'Altan & uterum',
        intro: 'Vi bygger altaner, uterum och terrasser som förstorar din utemiljö och ökar boendevärdet.',
        description: 'Altan och uterum ger dig mer plats att njuta av utemiljön. Vi bygger altaner, terrasser och uterum i material och stil som passar ditt befintliga hem.',
        tasks: [
          'Altaner i trä eller komposit',
          'Terrasser och platser',
          'Uterum med glas och markis',
          'Räcken och skydd',
          'Belysning och el',
          'Underhållsfasta material',
        ],
      },
    ],
  },
  {
    slug: 'mark-grund',
    name: 'Mark & grund',
    image: '/images/Mark-grund-Image.jpg',
    sni: 'SNI 43.120 – Mark- och grundarbeten',
    intro: 'Grundläggning och markarbeten är grunden i varje byggprojekt. Vi utför schaktning, markplanering och grundarbete med rätt maskiner och kompetens.',
    description: 'Mark- och grundarbeten utgör den viktigaste delen av ett byggprojekt. Vi ser till att grunden blir stabil och korrekt utförd, oavsett om det handlar om en nybyggnad eller en tillbyggnad.',
    subcategories: [
      {
        slug: 'markarbete',
        name: 'Markarbete',
        intro: 'Vi utför markarbeten som planering, fyllning och terränering för att skapa rätt förutsättningar för ditt projekt.',
        description: 'Markarbete innebär att forma och förbereda marken inför byggnation eller andra projekt. Vi utför planering, fyllning, terränering och annat markarbete med rätt maskiner.',
        tasks: [
          'Markplanering och nivellering',
          'Fyllnings- och avläggningsarbete',
          'Terränering och formning',
          'Bortforsling av jord och material',
          'Slutrengöring av mark',
        ],
      },
      {
        slug: 'grundarbete',
        name: 'Grundarbete',
        intro: 'Vi lägger grunden för ditt byggprojekt med stabilt och korrekt grundarbete.',
        description: 'Grundarbete är den viktigaste delen av ett byggprojekt. Vi utför platta på mark, pelargrund, schakt och annat grundarbete anpassat efter markens förutsättningar.',
        tasks: [
          'Platta på mark',
          'Pelargrund och fundamental',
          'Schakt för grund',
          'Markisolering och dränering',
          'Armering och betonggjutning',
        ],
      },
      {
        slug: 'dranering',
        name: 'Dränering',
        intro: 'Behöver du förbättra dräneringen runt din fastighet? Vi hjälper till med dränerings- och markarbeten.',
        description: 'Dränering förhindrar vattenskador genom att leda bort vatten från fastigheten. Vi utför dräneringsarbeten runt hus, källare och infarter.',
        tasks: [
          'Dränering runt hus och källare',
          'Planskål och dräneringsrör',
          'Drängrus och filtrering',
          'Kontroll- och inspektionsbrunnar',
          'Bortledning av dagvatten',
        ],
      },
      {
        slug: 'schaktning',
        name: 'Schaktning',
        intro: 'Vi utför schaktning för kablar, rör, gropar och fundament med rätt maskiner och precision.',
        description: 'Schaktning innebär att gräva schakt och gropar för kablar, rör, fundament och andra ändamål. Vi utför schaktningar i alla storlekar med modern utrustning.',
        tasks: [
          'Schaktning för VA och kabel',
          'Gropar för fundament och pelare',
          'Rutschning och ledningsdragning',
          'Schaktning för dränering',
          'Fyllning och komprimering efter schaktning',
        ],
      },
      {
        slug: 'stensattning',
        name: 'Stensättning',
        intro: 'Vi stensätter infarter, gångvägar, terrasser och andra ytor med noggrannhet och kvalitet.',
        description: 'Stensättning ger en slitstark och vacker yta. Vi stensätter infarter, gångvägar, terrasser och andra utemiljöer med natursten, tegel eller betongsten.',
        tasks: [
          'Stensättning av infarter',
          'Gångvägar och terrasser',
          'Kantsten och avgränsning',
          'Underlag och komprimering',
          'Slutfyllning och planering',
        ],
      },
    ],
  },
  {
    slug: 'rivning',
    name: 'Rivning',
    image: '/images/Rivning-image.jpg',
    sni: 'SNI 43.110 – Rivning',
    intro: 'Vi utför professionell rivning av byggnader, anläggningar och inredningar. Allt arbete sker med fokus på säkerhet och miljö.',
    description: 'Rivningsarbeten utförs av erfarna medarbetare med rätt maskiner och utrustning. Vi hanterar avfall på ett ansvarsfullt sätt och ser till att material återvänds eller bortskaffas korrekt.',
    subcategories: [
      {
        slug: 'byggnadsrivning',
        name: 'Byggnadsrivning',
        intro: 'Vi river hela byggnader och anläggningar på ett säkert och miljömedvetet sätt.',
        description: 'Byggnadsrivning innebär att riva hela byggnader från tak till fundament. Vi planerar och utför rivningen säkert med hänsyn till omgivningen.',
        tasks: [
          'Planering och förberedelse',
          'Rivning av tak och stomme',
          'Bortforsling av material',
          'Sortering och återvinning',
          'Slutrengöring av tomt',
        ],
      },
      {
        slug: 'invandig-rivning',
        name: 'Invändig rivning',
        intro: 'Vi utför invändig rivning av innerväggar, golv, tak och inredning inför renovering.',
        description: 'Invändig rivning handlar om att riva inomhus inför en renovering. Vi river väggar, golv, tak och inredning och ser till att avfallet hanteras korrekt.',
        tasks: [
          'Rivning av innerväggar',
          'Golvrivning och bortforsling',
          'Takrivning och borttagning',
          'Borttagning av inredning och kakel',
          'Sortering av avfall',
        ],
      },
      {
        slug: 'demontering',
        name: 'Demontering',
        intro: 'Vi demonterar inredning, vitvaror, VVS och andra installationer på ett noggrant sätt.',
        description: 'Demontering innebär att noggrant ta bort och demontera olika komponenter. Vi kan demontera allt från vitvaror och belysning till VVS och el-installationer.',
        tasks: [
          'Demontering av vitvaror',
          'Borttagning av belysning och el',
          'Demontering av VVS',
          'Borttagning av skåp och inredning',
          'Sortering och återvinning',
        ],
      },
      {
        slug: 'bortforsling',
        name: 'Bortforsling',
        intro: 'Vi transporterar bort rivningsavfall och skrot till godkända mottagningsplatser.',
        description: 'Bortforsling av rivningsavfall sker till godkända mottagningsplatser. Vi ser till att avfall sorteras och hanteras i enlighet med gällande regler.',
        tasks: [
          'Transport av rivningsavfall',
          'Sortering och återvinning',
          'Leverans till godkända mottagare',
          'Dokumentation av avfallsmängder',
          'Slutrengöring efter bortforsling',
        ],
      },
    ],
  },
  {
    slug: 'gronyteskotsel',
    name: 'Grönyteskötsel',
    image: '/images/Grönyteskötsel-Image.jpg',
    sni: 'SNI 81.300 – Skötsel och underhåll av grönytor',
    intro: 'Vi sköter och underhåller grönytor för bostadsområden, företag och kommuner. Anpassat efter dina behov och året runt.',
    description: 'Grönyteskötsel handlar om att sköta och underhålla utemiljöer. Vi erbjuder regelbunden skötsel och tillfälliga insatser för att hålla dina grönytor snygga och funktionella.',
    subcategories: [
      {
        slug: 'grasklippning',
        name: 'Gräsklippning',
        intro: 'Vi klipper gräset på tomter, parker och grönområden med professionell utrustning.',
        description: 'Gräsklippning är en grundläggande del av grönyteskötsel. Vi klipper gräset regelbundet och anpassar klippfrekvensen efter säsong och dina önskemål.',
        tasks: [
          'Regelmässig gräsklippning',
          'Klippning av parker och grönområden',
          'Kanter och svåråtkomliga ställen',
          'Klippfrekvens anpassad efter säsong',
          'Bortforsling av gräsklipp',
        ],
      },
      {
        slug: 'hackklippning',
        name: 'Häckklippning',
        intro: 'Vi klipper och formar häckar, buskar och prydnads växtlighet.',
        description: 'Häckklippning handlar om att klippa och formar häckar, buskar och andra växter. Vi anpassar klippningen efter växtens art och önskad form.',
        tasks: [
          'Klippning av häckar och buskar',
          'Formning och beskärning',
          'Bortforsling av klippavfall',
          'Skötsel av prydnadsväxtlighet',
          'Anpassning efter växtart',
        ],
      },
      {
        slug: 'tradgardsskotsel',
        name: 'Trädgårdsskötsel',
        intro: 'Vi sköter trädgårdar och utemiljöer med planting, beskärning och underhåll.',
        description: 'Trädgårdsskötsel omfattar skötsel av hela trädgården – från blommor och buskar till träd och grusgångar. Vi anpassar skötseln efter din trädgårds speciella behov.',
        tasks: [
          'Plantering och omskapning',
          'Beskärning av träd och buskar',
          'Ogräsbekämpning',
          'Gödsling och jordförbättring',
          'Säsongsanpassad skötsel',
        ],
      },
      {
        slug: 'marksotsel',
        name: 'Markskötsel',
        intro: 'Vi sköter mark och grönområden med gräsklippning, ogräskontroll och underhåll.',
        description: 'Markskötsel handlar om att sköta och underhålla mark och grönområden. Vi ser till att områdena ser snygga ut och fungerar bra.',
        tasks: [
          'Ogräsbekämpning',
          'Markplanering och slätning',
          'Gödsling och sådd',
          'Underhåll av grönområden',
          'Slutrengöring och underhåll',
        ],
      },
      {
        slug: 'gronyteunderhall',
        name: 'Underhåll av grönytor',
        intro: 'Vi erbjuder komplett underhåll av grönytor – från planering till regelbunden skötsel.',
        description: 'Underhåll av grönytor handlar om att bibehålla och förbättra grönområden över tid. Vi erbjuder skötselkontrakt och tillfälliga insatser.',
        tasks: [
          'Regelmässigt underhåll',
          'Säsongsanpassade insatser',
          'Beskärning och klippning',
          'Ogräskontroll och bekämpning',
          'Rapportering och uppföljning',
        ],
      },
    ],
  },
  {
    slug: 'snorojning',
    name: 'Snöröjning',
    image: '/images/snörröjning-Image.jpg',
    sni: 'SNI 81.230 – Annan rengöring / snöröjning',
    intro: 'Under vinterhalvåret erbjuder vi tillförlitlig snöröjning och halkbekämpning för fastigheter, parkeringsplatser och infarter.',
    description: 'Snöröjning och vinterunderhåll är avgörande för säkerhet och tillgänglighet under vintern. Vi är på plats när det behövs för att du ska kunna röra dig säkert.',
    subcategories: [
      {
        slug: 'snorojning',
        name: 'Snöröjning',
        intro: 'Vi plogar och skottar snö från infarter, parkeringsplatser och gångvägar.',
        description: 'Snöröjning handlar om att ta bort snö från ytor som behöver vara framkomliga. Vi plogar och skottar med rätt utrustning för snabb och effektiv snöröjning.',
        tasks: [
          'Plogning av infarter och parkering',
          'Skottning av gångvägar',
          'Snöröjning vid fastigheter',
          'Snöröjning av platta tak',
          'Bortforsling av snö vid behov',
        ],
      },
      {
        slug: 'halkbekampning',
        name: 'Halkbekämpning',
        intro: 'Vi strör och behandlar halka för att förebygga fall och olyckor på dina ytor.',
        description: 'Halkbekämpning handlar om att förebygga och behandla halka. Vi strör salt, sand och andra medel för att göra ytor säkra att färdas på.',
        tasks: [
          'Saltning och sandning',
          'Förebyggande behandling',
          'Halkbekämpning av gångvägar',
          'Halkbekämpning av parkering',
          'Behandling vid kritiska förhållanden',
        ],
      },
      {
        slug: 'sandning',
        name: 'Sandning',
        intro: 'Vi strör sand på halka ytor för att förbättra greppet och minska risken för fall.',
        description: 'Sandning är ett miljövänligt alternativ till salt för halkbekämpning. Vi strör sand på gångvägar, infarter och parkeringsytor.',
        tasks: [
          'Sandning av gångvägar',
          'Sandning av infarter',
          'Sandning av parkeringsytor',
          'Förebyggande sandning',
          'Anpassning efter förhållanden',
        ],
      },
      {
        slug: 'parkering',
        name: 'Parkering',
        intro: 'Vi ser till att dina parkeringsytor är snöröjda och framkomliga hela vintern.',
        description: 'Parkeringsytor kräver snabb och effektiv snöröjning för att vara tillgängliga. Vi plogar, skottar och strör för att hålla parkeringsytor fria från snö och halka.',
        tasks: [
          'Plogning av parkeringsytor',
          'Skottning och strörning',
          'Halkbekämpning av rampar',
          'Markering och avgränsning',
          'Kontrollrundor vid behov',
        ],
      },
      {
        slug: 'gangvagar',
        name: 'Gångvägar',
        intro: 'Vi håller gångvägar och trottoarer snöröjda och framkomliga under vintern.',
        description: 'Gångvägar och trottoarer behöver vara säkra och framkomliga. Vi plogar, skottar och strör för att skapa säkra förutsättningar för fotgängare.',
        tasks: [
          'Plogning av gångvägar',
          'Skottning av trottoarer',
          'Sandning och saltning',
          'Halkbekämpning av trappor',
          'Regelbundna kontroller',
        ],
      },
    ],
  },
  {
    slug: 'lokalvard',
    name: 'Lokalvård',
    image: '/images/About-Image.jpg',
    sni: 'SNI 81.210 – Lokalvård/städning',
    intro: 'Vi erbjuder grundlig städning och lokalvård för kontor, butiker, bostäder och andra lokaler. Anpassat efter dina behov.',
    description: 'Lokalvård och städning handlar om att skapa rena och trivsamma miljöer. Vi anpassar städningen efter dina behov och frekvens.',
    subcategories: [
      {
        slug: 'kontorsstadning',
        name: 'Kontorsstädning',
        intro: 'Vi städar kontor och arbetsplatser med fokus på hygiene och trivsel.',
        description: 'Kontorsstädning handlar om att hålla kontorsloaler rena och hygieniska. Vi anpassar städningen efter kontorets storlek, antal anställda och önskad frekvens.',
        tasks: [
          'Daglig, veckovis eller månadsvis städning',
          'Dammsugning och moppning',
          'Rengöring av toaletter och pannrum',
          'Rengöring av kök och pausutrymmen',
          'Fönsterputsning',
        ],
      },
      {
        slug: 'foretagsstadning',
        name: 'Företagsstädning',
        intro: 'Vi städar företagslokaler, butiker och verksamheter anpassat efter behov.',
        description: 'Företagsstädning inkluderar städning av hela företagslokalen. Vi anpassar städningen efter typ av verksamhet och kundens specifika behov.',
        tasks: [
          'Städning av butikslokaler',
          'Städning av lager och magasin',
          'Städning av produktion',
          'Golvvård och polering',
          'Avfallshantering och återvinning',
        ],
      },
      {
        slug: 'trappstadning',
        name: 'Trappstädning',
        intro: 'Vi städar trapphus och ingångar i bostads- och företagsfastigheter.',
        description: 'Trappstädning handlar om att rengöra trapphus, trappor och ingångar. Vi ser till att trapphusen alltid är rena och inbjudande.',
        tasks: [
          'Dammsugning och moppning av trappor',
          'Rengöring av dörrar och handläggare',
          'Rengöring av postlådor och ingångar',
          'Fönsterputsning i trapphus',
          'Kontroll av belysning',
        ],
      },
      {
        slug: 'byggstadning',
        name: 'Byggstädning',
        intro: 'Vi utför slutstädning efter bygg- och renoveringsprojekt.',
        description: 'Byggstädning utförs efter ett bygg- eller renoveringsprojekt för att göra lokalerna redo för användning. Det inkluderar grundlig rengöring av alla ytor.',
        tasks: [
          'Slutstädning efter byggprojekt',
          'Rengöring av fönster och rutor',
          'Borttagning av damm och byggsmuts',
          'Golvvård och polering',
          'Kontroll och slutinspektion',
        ],
      },
      {
        slug: 'grovstadning',
        name: 'Grovstädning',
        intro: 'Vi utför grovstädning och djuprengöring av lokaler som behöver extra skötsel.',
        description: 'Grovstädning är en mer omfattande rengöring än ordinarie städning. Det handlar om djuprengöring av ytor som inte ingår i den regelbundna städningen.',
        tasks: [
          'Djuprengöring av golv och ytor',
          'Rengöring av väggar och tak',
          'Rengöring av ventiler och filter',
          'Rengöring av maskiner och utrustning',
          'Avfettning och desinficering',
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// HTML TEMPLATES
// ---------------------------------------------------------------------------

const NAVHTML = `
  <nav class="navbar">
    <a href="/" class="navbar-brand"><img src="/images/PMEntre.jpg" alt="PMEntreprenad AB" class="navbar-logo"></a>
    <a href="tel:0722897560" class="navbar-phone" aria-label="Ring oss">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      072-289 75 60
    </a>
    <div class="nav-links">
      <a href="/">Hem</a>
      <div class="nav-dropdown">
        <button class="nav-dropdown-toggle" aria-expanded="false" aria-haspopup="true">Tjänster <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>
        <div class="mega-menu">
          <div class="mega-menu-inner">
            ${SERVICES.map(cat => `
            <div class="mega-col">
              <a href="/tjanster/${cat.slug}/" class="mega-heading">${cat.name}</a>
              <ul>
                ${cat.subcategories.map(sub => `<li><a href="/tjanster/${cat.slug}/${sub.slug}/">${sub.name}</a></li>`).join('')}
              </ul>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <a href="/om-oss.html">Om oss</a>
      <a href="/projekt.html">Projekt</a>
      <a href="/kontakt.html">Kontakt</a>
      <a href="/begar-offert.html" class="btn-primary">Begär offert <span class="btn-arrow">&rarr;</span></a>
    </div>
    <div class="hamburger" aria-label="Öppna meny" role="button" tabindex="0">
      <span></span><span></span><span></span>
    </div>
  </nav>`;

function getFooter() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h3>PMEntreprenad AB</h3>
          <p>Din pålitliga partner inom bygg, mark och service. Vi levererar kvalitet i varje projekt.</p>
        </div>
        <div class="footer-col">
          <h3>Tjänster</h3>
          <ul>
            ${SERVICES.map(cat => `<li><a href="/tjanster/${cat.slug}/">${cat.name}</a></li>`).join('')}
          </ul>
        </div>
        <div class="footer-col">
          <h3>Länkar</h3>
          <ul>
            <li><a href="/">Hem</a></li>
            <li><a href="/om-oss.html">Om oss</a></li>
            <li><a href="/projekt.html">Projekt</a></li>
            <li><a href="/kontakt.html">Kontakt</a></li>
            <li><a href="/begar-offert.html">Begär offert</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Kontakt</h3>
          <ul>
            <li><a href="tel:0722897560">072-289 75 60</a></li>
            <li><a href="mailto:PM.Entreprenad@hotmail.com">PM.Entreprenad@hotmail.com</a></li>
            <li>Stockholmsregionen</li>
          </ul>
          <div class="response-badge" style="margin-top: 16px;">
            <span class="response-badge-dot"></span>
            Svar inom 24 timmar
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 PMEntreprenad AB. Alla rättigheter förbehållna.</p>
      </div>
    </div>
  </footer>`;
}

function getStickyCta() {
  return `
  <div class="sticky-cta">
    <span class="sticky-cta-text">Redo att komma igång?</span>
    <a href="tel:0722897560" class="sticky-cta-phone" aria-label="Ring oss">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    </a>
    <a href="/begar-offert.html" class="btn-primary">Begär offert <span class="btn-arrow">&rarr;</span></a>
  </div>`;
}

function getHead(title, description, extraMeta) {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="sv_SE">
  ${extraMeta || ''}
  <link rel="stylesheet" href="/css/style.css?v=5">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
</head>`;
}

function writePage(filePath, content) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ ${path.relative(PUBLIC_DIR, filePath)}`);
}

// ---------------------------------------------------------------------------
// GENERATE HUVUDKATEGORISIDOR
// ---------------------------------------------------------------------------

SERVICES.forEach(cat => {
  const title = `${cat.name} | PMEntreprenad AB`;
  const desc = `PMEntreprenad AB erbjuder ${cat.name.toLowerCase()}-tjänster. Vi utför ${cat.subcategories.map(s => s.name.toLowerCase()).join(', ')} med fokus på kvalitet och pålitlighet.`;
  const breadcrumb = `<nav class="breadcrumb" aria-label="Brödsmulor"><a href="/">Hem</a> <span>›</span> <a href="/tjanster.html">Tjänster</a> <span>›</span> <span aria-current="page">${cat.name}</span></nav>`;

  const html = `${getHead(title, desc)}
<body>
${NAVHTML}

  <section class="page-header">
    <div class="container">
      ${breadcrumb}
      <h1>${cat.name}</h1>
      <p>${cat.intro}</p>
    </div>
  </section>

  <section class="section fade-in">
    <div class="container">
      <div class="about-layout">
        <div class="about-text">
          <h2>${cat.description.split('.')[0]}.</h2>
          <p>${cat.description}</p>
          <p class="sni-code" style="margin-top:16px;color:var(--c-accent-hover);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:0.85rem;">${cat.sni}</p>
        </div>
        <div class="about-image">
          <img src="${cat.image}" alt="${cat.name} – PMEntreprenad AB" loading="lazy">
        </div>
      </div>
    </div>
  </section>

  <section class="section fade-in">
    <div class="container">
      <div class="section-header">
        <h2>Våra ${cat.name.toLowerCase()}-tjänster</h2>
        <p>Välj en tjänst för att läsa mer.</p>
      </div>
      <div class="services-bento">
        ${cat.subcategories.map((sub, i) => `
        <a href="/tjanster/${cat.slug}/${sub.slug}/" class="service-card${i === 0 ? ' featured' : ''}">
          <span class="service-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </span>
          <div>
            <h3>${sub.name}</h3>
            <p>${sub.intro}</p>
            <span class="service-link btn-ghost">Läs mer <span class="btn-arrow">&rarr;</span></span>
          </div>
        </a>`).join('')}
      </div>
    </div>
  </section>

  <section class="cta-section fade-in">
    <div class="container">
      <h2>Har du ett projekt på gång?</h2>
      <p>Beskriv vad du behöver hjälp med så återkommer vi med en offert anpassad efter ditt projekt.</p>
      <div style="margin-top:24px;">
        <a href="/begar-offert.html" class="btn-primary">Begär offert <span class="btn-arrow">&rarr;</span></a>
      </div>
    </div>
  </section>

${getFooter()}
${getStickyCta()}
  <script src="/js/script.js"></script>
</body>
</html>`;

  writePage(path.join(PUBLIC_DIR, 'tjanster', cat.slug, 'index.html'), html);
});

// ---------------------------------------------------------------------------
// GENERATE UNDERKATEGORISIDOR
// ---------------------------------------------------------------------------

SERVICES.forEach(cat => {
  cat.subcategories.forEach(sub => {
    const title = `${sub.name} – ${cat.name} | PMEntreprenad AB`;
    const desc = `${sub.intro} PMEntreprenad AB utför ${sub.name.toLowerCase()}-arbeten med kvalitet och pålitlighet.`;
    const breadcrumb = `<nav class="breadcrumb" aria-label="Brödsmulor"><a href="/">Hem</a> <span>›</span> <a href="/tjanster.html">Tjänster</a> <span>›</span> <a href="/tjanster/${cat.slug}/">${cat.name}</a> <span>›</span> <span aria-current="page">${sub.name}</span></nav>`;

    const html = `${getHead(title, desc)}
<body>
${NAVHTML}

  <section class="page-header">
    <div class="container">
      ${breadcrumb}
      <h1>${sub.name}</h1>
      <p>${sub.intro}</p>
    </div>
  </section>

  <section class="section fade-in">
    <div class="container">
      <div class="about-layout">
        <div class="about-text">
          <h2>Om ${sub.name.toLowerCase()}</h2>
          <p>${sub.description}</p>
        </div>
        <div class="about-image">
          <img src="${cat.image}" alt="${sub.name} – PMEntreprenad AB" loading="lazy">
        </div>
      </div>
    </div>
  </section>

  <section class="section fade-in">
    <div class="container">
      <div class="section-header">
        <h2>Det här kan vi hjälpa till med</h2>
      </div>
      <div class="features-grid">
        ${sub.tasks.map(task => `
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3>${task}</h3>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section fade-in">
    <div class="container">
      <div class="cta-split">
        <div class="cta-split-text">
          <h2>Behöver du hjälp med ${sub.name.toLowerCase()}?</h2>
          <p>Skicka en offertförfrågan så återkommer vi med en bedömning och förslag.</p>
          <div class="response-badge" style="margin-top:16px;">
            <span class="response-badge-dot"></span>
            Svarar vanligtvis inom 24 timmar
          </div>
          <div style="margin-top:24px;">
            <a href="/begar-offert.html" class="btn-primary">Begär offert <span class="btn-arrow">&rarr;</span></a>
          </div>
        </div>
        <div class="cta-split-visual">
          <img src="${cat.image}" alt="${sub.name} – PMEntreprenad AB" loading="lazy">
        </div>
      </div>
    </div>
  </section>

${getFooter()}
${getStickyCta()}
  <script src="/js/script.js"></script>
</body>
</html>`;

    writePage(path.join(PUBLIC_DIR, 'tjanster', cat.slug, sub.slug, 'index.html'), html);
  });
});

console.log(`\n✓ ${SERVICES.length} huvudkategorier + ${SERVICES.reduce((a, c) => a + c.subcategories.length, 0)} underkategorier genererade.\n`);
