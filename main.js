/* Netto bedrijfsuitgave via incentive — berekeningslogica (vast WG-last 15%)
   Volgorde:
   1) Bijdrage van Veerenstael eraf van het aankoopbedrag (incl. btw)
   2) Btw verwijderen: excl = tussenstand / (1 + btw%)
   3) Werkgeverslasten toepassen: bruto op loonstrook = (1 - 15%) * excl
   4) Bijzonder tarief (BT-LH %) toepassen op brutobedrag van de loonstrook
      Netto bijdrage medewerker = (1 - BT-LH%) * (1 - 15%) * excl
*/

function formatEuro(n) {
  if (!isFinite(n)) return "0,00";
  return n
    .toLocaleString("nl-NL", { style: "currency", currency: "EUR" })
    .replace("€", "")
    .trim();
}

function pctDisplay(p) {
  // Toon altijd 3 decimalen, NL-notatie
  return (Number(p).toFixed(3) + "").replace(".", ",");
}

document.getElementById("bonus-tool-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const websiteBedrag = parseFloat(document.getElementById("website-bedrag").value) || 0;
  const btwTariefPct = parseFloat(document.getElementById("btw-tarief").value) || 0;
  const bijdrage = Math.max(0, parseFloat(document.getElementById("veerenstael-bijdrage").value) || 0);
  const btLhPct = Math.max(0, Math.min(100, parseFloat(document.getElementById("bt-lh").value)));

  // Vast percentage werkgeverslasten
  const WG_LAST_PCT = 15; // % conform personeelshandboek
  const wgLast = WG_LAST_PCT / 100;

  // 1) bijdrage eraf (clamp ondergrens 0)
  let naBijdrage = websiteBedrag - bijdrage;
  if (naBijdrage < 0) naBijdrage = 0;

  // 2) btw verwijderen
  const btwFactor = 1 + (btwTariefPct / 100);
  const exclBtw = btwTariefPct === 0 ? naBijdrage : naBijdrage / btwFactor;
  const btwBedrag = naBijdrage - exclBtw;

  // 3) Werkgeverslasten (vast 15%)
  const brutoOpStrook = (1 - wgLast) * exclBtw; // “bruto bonus” op loonstrook
  const wgLastBedrag = exclBtw * wgLast;        // aftrek werkgeverslasten

  // 4) BT-LH toepassen
  const btLh = btLhPct / 100;
  const btLhBedrag = brutoOpStrook * btLh;       // aftrek bijzonder tarief
  const nettoPersoonlijk = (1 - btLh) * brutoOpStrook;

  // Resultaat prominent
  document.getElementById("netto-bedrag").textContent = formatEuro(nettoPersoonlijk);

  // Uitleg in 2 kolommen (met min-bedragen en cursieve tussenstanden)
  const rows = [
    ["Aankoopbedrag (incl. btw)", `€ ${formatEuro(websiteBedrag)}`],
    ["Bijdrage van Veerenstael", `− € ${formatEuro(bijdrage)}`],
    ["<i>Na bijdrage</i>", `€ ${formatEuro(naBijdrage)}`],

    [`Omzetbelasting (btw) (${pctDisplay(btwTariefPct)}%)`, `− € ${formatEuro(btwBedrag)}`],
    ["<i>Bedrag exclusief btw</i>", `€ ${formatEuro(exclBtw)}`],

    [`Werkgeverslasten (${pctDisplay(WG_LAST_PCT)}%)`, `− € ${formatEuro(wgLastBedrag)}`],
    ["<i>Na werkgeverslasten (bruto op loonstrook)</i>", `€ ${formatEuro(brutoOpStrook)}`],

    [`Heffing bijzonder tarief (${pctDisplay(btLhPct)}%)`, `− € ${formatEuro(btLhBedrag)}`],
    ["<b>Netto bijdrage medewerker</b>", `<b>€ ${formatEuro(nettoPersoonlijk)}</b>`]
  ];

  let html = '<div class="kv-grid">';
  for (const [label, value] of rows) {
    html += `<div class="kv-row"><div class="kv-label">${label}:</div><div class="kv-value">${value}</div></div>`;
  }
  html += "</div>";
  document.getElementById("info").innerHTML = html;
});

document.getElementById("bonus-tool-form").addEventListener("reset", function () {
  setTimeout(() => {
    document.getElementById("netto-bedrag").textContent = "0,00";
    document.getElementById("info").textContent = "";
  }, 0);
});
