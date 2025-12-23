/* Netto bedrijfsuitgave via incentive - berekeningslogica (WG-last betaald door Veerenstael)
   Volgorde:
   1) Bijdrage van Veerenstael eraf van het aankoopbedrag (incl. btw)
   2) Btw verwijderen: excl = tussenstand / (1 + btw%)
   3) Werkgeverslasten (15%) worden door Veerenstael betaald (niet van netto af)
   4) Bijzonder tarief (BT-LH %) toepassen op excl. BTW bedrag
      Netto bijdrage medewerker = (1 - BT-LH%) * excl
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

  // Vast percentage werkgeverslasten (voor informatiedoeleinden)
  const WG_LAST_PCT = 15; // % conform personeelshandboek
  const wgLast = WG_LAST_PCT / 100;

  // 1) bijdrage eraf (clamp ondergrens 0)
  let naBijdrage = websiteBedrag - bijdrage;
  if (naBijdrage < 0) naBijdrage = 0;

  // 2) btw verwijderen
  const btwFactor = 1 + (btwTariefPct / 100);
  const exclBtw = btwTariefPct === 0 ? naBijdrage : naBijdrage / btwFactor;
  const btwBedrag = naBijdrage - exclBtw;

  // 3) Werkgeverslasten (betaald door Veerenstael, alleen ter info)
  const wgLastBedrag = exclBtw * wgLast;

  // 4) BT-LH toepassen op excl. BTW bedrag
  const btLh = btLhPct / 100;
  const btLhBedrag = exclBtw * btLh;
  const nettoPersoonlijk = (1 - btLh) * exclBtw;

  // Resultaat prominent
  document.getElementById("netto-bedrag").textContent = formatEuro(nettoPersoonlijk);

  // Uitleg in 2 kolommen (met min-bedragen en cursieve tussenstanden)
  const rows = [
    ["Aankoopbedrag (incl. btw)", `€ ${formatEuro(websiteBedrag)}`],
    ["Bijdrage van Veerenstael", `− € ${formatEuro(bijdrage)}`],
    ["<i>Na bijdrage</i>", `€ ${formatEuro(naBijdrage)}`],

    [`Omzetbelasting (btw) (${pctDisplay(btwTariefPct)}%)`, `− € ${formatEuro(btwBedrag)}`],
    ["<i>Bedrag exclusief btw <br>(bruto incentive op loonstrook)</i>", `€ ${formatEuro(exclBtw)}`],

    ["", ""],
    [`<i>Werkgeverslasten (${pctDisplay(WG_LAST_PCT)}%)</i>`, `<i>€ ${formatEuro(wgLastBedrag)}</i>`],
    ["<i>(wordt betaald door Veerenstael)</i>", ""],
    ["", ""],

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
