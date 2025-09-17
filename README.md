# Netto Uitgave (via Incentive)

Een kleine webtool die berekent hoeveel je **netto** zelf betaalt wanneer een aankoop
voor het bedrijf wordt verrekend met jouw **incentive**.

## Logica

Volgorde van rekenen:
1. **Bijdrage Veerenstael** eraf van het ingevoerde websitebedrag.
2. **BTW verwijderen** (als het bedrag inclusief btw is): `excl = bedrag / (1 + btw%)`.
3. **Verrekening met BT-LH%** (witte tabel): `netto = excl × (1 − BT-LH%)`.

> Voorbeeld: websitebedrag €1000, 21% btw, bijdrage Veerenstael €400, BT-LH 50,330%  
> Tussenstand na bijdrage = €600 → excl. btw = €495,87 → netto = €245,92.

## Gebruik

Open `index.html` lokaal of host het via GitHub Pages / Netlify.
De tool draait volledig client-side (vanilla HTML/CSS/JS).

## Bestanden

- `index.html` — UI en formulier
- `style.css` — opmaak
- `main.js` — rekenlogica
- `favicon.png` — optioneel icoon

## Ontwikkelen

Pas de teksten of standaardwaarden aan in `index.html`. De rekenlogica staat in `main.js`.
