# Dynamit Bygg

Professionell företagshemsida för ett svenskt bygg- och serviceföretag.

## Funktioner

- **6 sidor**: Startsida, Tjänster, Om oss, Projekt, Kontakt, Begär offert
- **Responsiv design**: Fungerar på mobil, surfplatta och desktop
- **Kontaktformulär**: Skickar meddelande till företagets e-post
- **Offertförfrågan**: Kunden beskriver projektet och skickar in
- **Bifogade bilder**: Möjlighet att ladda upp bilder med offertförfrågan
- **SEO**: meta-tags, Open Graph, robots.txt, sitemap.xml
- **Hamburgermeny** på mobil

## Installation

```bash
# 1. Clone eller ladda ner projektet
cd dynamit-bygg

# 2. Installera beroenden
npm install

# 3. Kopiera och konfigurera .env
cp .env.example .env
# Redigera .env med dina uppgifter

# 4. Starta servern
npm start
```

Servern körs på `http://localhost:3000`.

## .env-konfiguration

Redigera `.env` med följande:

| Variabel | Beskrivning |
|----------|-------------|
| `PORT` | Port att köra på (standard: 3000) |
| `COMPANY_NAME` | Företagets namn |
| `COMPANY_PHONE` | Telefonnummer |
| `COMPANY_EMAIL` | E-postadress |
| `COMPANY_ADDRESS` | Adress |
| `COMPANY_ORG_NR` | Organizationsnummer |
| `COMPANY_AREA` | Arbetsområde |
| `SMTP_HOST` | SMTP-värd (t.ex. smtp.gmail.com) |
| `SMTP_PORT` | SMTP-port (587) |
| `SMTP_USER` | E-postadress för utgående post |
| `SMTP_PASS` | Lösenord / app-lösenord |
| `NOTIFY_EMAIL` | Vart offertförfrågningar skickas |

### Gmail

För Gmail behöver du ett [app-lösenord](https://myaccount.google.com/apppasswords):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=din-epost@gmail.com
SMTP_PASS=dit-app-losenord
```

## Placeholders

Sök och ersätt följande i alla HTML-filer:

| Placeholder | Ersätt med |
|-------------|------------|
| `[FÖRETAGSNAMN]` | Företagets namn |
| `[TELEFON]` | Telefonnummer |
| `[E-POST]` | E-postadress |
| `[ADRESS]` | Full adress |
| `[ORG.NR]` | Organizationsnummer |
| `[ARBETSOMRÅDE]` | T.ex. "Stockholm och omnejd" |
| `[POSTNUMMER]` | Postnummer |
| `[ORT]` | Ort |

## Projektstruktur

```
dynamit-bygg/
├── public/              # Statiska filer
│   ├── css/
│   │   └── style.css   # Huvudstylesheet
│   ├── js/
│   │   └── script.js   # JavaScript
│   ├── index.html       # Startsida
│   ├── tjanster.html    # Tjänster
│   ├── om-oss.html      # Om oss
│   ├── projekt.html     # Projekt
│   ├── kontakt.html     # Kontakt
│   ├── begar-offert.html # Offertförfrågan
│   ├── robots.txt
│   └── sitemap.xml
├── server/
│   └── server.js        # Express-server
├── uploads/             # Uppladdade bilder
├── .env                 # Konfiguration (ej i repo)
├── .env.example         # Exempelkonfiguration
├── package.json
└── README.md
```

## Ändra callback URL (domän)

I `public/sitemap.xml` och `public/robots.txt`, byt ut `https://www.dynamitbygg.se` mot din faktiska domän.

## Deploy

### Enkeltalternativ

Ladda upp hela mappen till en webbhotell som stöder Node.js (t.ex. Railway, Render, DigitalOcean, eller ett VPS).

### Med pm2

```bash
npm install -g pm2
pm2 start server/server.js --name dynamit-bygg
pm2 save
pm2 startup
```

### Docker (valfritt)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p uploads
EXPOSE 3000
CMD ["node", "server/server.js"]
```

## Vidareutveckling

Hemsidan är byggd för att vara enkel att vidareutveckla:

- **Byt ut bilder**: Lägg till faktiska bilder i `public/images/` och referera till dem i HTML
- **Lägg till sidor**: Skapa ny HTML-fil i `public/` och lägg till länk i navigationen
- **Ändra färger**: Redigera CSS-variablerna i `:root` i `style.css`
- **E-post**: Konfigurera SMTP-uppgifter i `.env`
