/* Netto bedrijfsuitgave via incentive — berekeningslogica
   Volgorde:
   1) Bijdrage van Veerenstael eraf van het aankoopbedrag (incl. btw)
   2) Btw verwijderen: excl = tussenstand / (1 + btw%)
   3) Verrekenen met BT-LH% (witte tabel): netto = excl × (1 − BT-LH%)
*/

function formatEuro(n) {
  if (!isFinite(n)) return "0,00";
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" }).replace("€", "").trim();
}

function pctDisplay(p) {
  return (Number(p).toFixed(3) + "").replace(".", ",");
}

document.getElementById("bonus-tool-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const websiteBedrag = parseFloat(document.getElementById("website-bedrag").value) || 0;
  const btwTariefPct = parseFloat(document.getElementById("btw-tarief").value) || 0;
  const bijdrage = Math.max(0, parseFloat(document.getElementById("veerenstael-bijdrage").value) || 0);
  const btLhPct = Math.max(0, Math.min(100, parseFloat(document.getElementById("bt-lh").value)));

  // 1) bijdrage eraf (clamp ondergrens 0)
  let naBijdrage = websiteBedrag - bijdrage;
  if (naBijdrage < 0) naBijdrage = 0;

  // 2) btw verwijderen
  const btwFactor = 1 + (btwTariefPct / 100);
  let exclBtw = btwTariefPct === 0 ? naBijdrage : naBijdrage / btwFactor;
  let btwBedrag = naBijdrage - exclBtw;

  // 3) BT-LH verrekenen
  const btLh = btLhPct / 100;
  const nettoPersoonlijk = exclBtw * (1 - btLh);
  const besparingDoorBonus = exclBtw * btLh;

  // Resultaatbedrag
  document.getElementById("netto-bedrag").textContent = formatEuro(nettoPersoonlijk);

  // Uitlijning in 2 kolommen met volledig uitgeschreven labels
  const rows = [
    ["Aankoopbedrag", `€ ${formatEuro(websiteBedrag)}`],
    ["Bijdrage van Veerenstael", `− € ${formatEuro(bijdrage)}`],
    ["<i>Na bijdrage</i>", `€ ${formatEuro(naBijdrage)}`],
    [`Omzetbelasting (btw) (${btwTariefPct}%)`, `− € ${formatEuro(btwBedrag)}`],
    ["<i>Bedrag exclusief btw</i>", `€ ${formatEuro(exclBtw)}`],
    [`Netto bijdrage medewerker`, `€ ${formatEuro(nettoPersoonlijk)}`]   
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

