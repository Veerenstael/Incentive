/* Netto bedrijfsuitgave via incentive — berekeningslogica (aangepast op verzoek)
   Volgorde:
   1) Bijdrage van Veerenstael eraf van het aankoopbedrag (incl. btw)
   2) Btw verwijderen: excl = tussenstand / (1 + btw%)
   3) Werkgeverslasten toepassen: bruto op loonstrook = (1 - WG%) * excl
   4) Bijzonder tarief (BT-LH %) toepassen op brutobedrag van de loonstrook
      Netto bijdrage medewerker = (1 - BT-LH%) * (1 - WG%) * excl
*/

function formatEuro(n) {
  if (!isFinite(n)) return "0,00";
  // We laten het euroteken los in de value-weergave (consistent met bestaande UI)
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" }).replace("€", "").trim();
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
  const wgLastPct = Math.max(0, Math.min(100, parseFloat(document.getElementById("wg-last").value)));
  const btLhPct = Math.max(0, Math.min(100, parseFloat(document.getElementById("bt-lh").value)));

  // 1) bijdrage eraf (clamp ondergrens 0)
  let naBijdrage = websiteBedrag - bijdrage;
  if (naBijdrage < 0) naBijdrage = 0;

  // 2) btw verwijderen
  const btwFactor = 1 + (btwTariefPct / 100);
  const exclBtw = btwTariefPct === 0 ? naBijdrage : naBijdrage / btwFactor;
  const btwBedrag = naBijdrage - exclBtw;

  // 3) Werkgeverslasten
  const wgLast = wgLastPct / 100;
  const brutoOpStrook = (1 - wgLast) * exclBtw; // dit is wat als "bruto bonus" op de loonstrook terecht komt

  // 4) BT-LH toepassen
  const btLh = btLhPct / 100;
  const nettoPersoonlijk = (1 - btLh) * brutoOpStrook;

  // Extra: marginale factor per €1 aankoop incl. btw
  const marginaleNettoFactorPerEuroIncl = (1 - btLh) * (1 - wgLast) / (1 + (btwTariefPct / 100));
  const nettoEffectPer1000 = marginaleNettoFactorPerEuroIncl * 1000;

  // Resultaatbedrag
  document.getElementById("netto-bedrag").textContent = formatEuro(nettoPersoonlijk);

  // Uitlijning in 2 kolommen met volledig uitgeschreven labels
  const rows = [
    ["Aankoopbedrag (incl. btw)", `€ ${formatEuro(websiteBedrag)}`],
    ["Bijdrage van Veerenstael", `− € ${formatEuro(bijdrage)}`],
    ["<i>Na bijdrage</i>", `€ ${formatEuro(naBijdrage)}`],
    [`Omzetbelasting (btw) (${btwTariefPct}%)`, `− € ${formatEuro(btwBedrag)}`],
    ["<i>Bedrag exclusief btw</i>", `€ ${formatEuro(exclBtw)}`],
    [`Werkgeverslasten`, `€ ${formatEuro(brutoOpStrook)}`],
    [`Bijzonder tarief, `€ ${formatEuro(nettoPersoonlijk)}`],
    ["—", "—"],
    ["Netto bijdrage medewerker", `€ ${formatEuro(nettoEffectPer1000)}`]
  ];

  let html = '<div class="kv-grid">';
  for (const [label, value] of rows) {
    html += `<div class="kv-row"><div class="kv-label">${label}:</div><div class="kv-value">${value}</div></div>`;
  }
  html += '</div>';
  document.getElementById("info").innerHTML = html;
});

document.getElementById("bonus-tool-form").addEventListener("reset", function () {
  setTimeout(() => {
    document.getElementById("netto-bedrag").textContent = "0,00";
    document.getElementById("info").textContent = "";
  }, 0);
});

