/* Netto bedrijfsuitgave via bonus — berekeningslogica
   Volgorde (zoals gevraagd):
   1) Veerenstael-bijdrage eraf van het websitebedrag
   2) Btw verwijderen (bij incl-btw prijs gebruiken: netto = bedrag / (1 + btw))
   3) Verrekenen met BT-LH% (witte tabel): netto persoonlijk = bedrag_excl_btw × (1 − BT-LH%)
*/

function formatEuro(n) {
  if (!isFinite(n)) return "0,00";
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" }).replace("€", "").trim();
}

document.getElementById("bonus-tool-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const websiteBedrag = parseFloat(document.getElementById("website-bedrag").value) || 0;
  const btwTariefPct = parseFloat(document.getElementById("btw-tarief").value) || 0;
  const inclBtw = document.getElementById("incl-btw").value === "ja";
  const bijdrage = Math.max(0, parseFloat(document.getElementById("veerenstael-bijdrage").value) || 0);
  const btLhPct = Math.max(0, Math.min(100, parseFloat(document.getElementById("bt-lh").value)));

  // 1) bijdrage eraf (clamp ondergrens 0)
  let naBijdrage = websiteBedrag - bijdrage;
  if (naBijdrage < 0) naBijdrage = 0;

  // 2) btw verwijderen
  const btwFactor = 1 + (btwTariefPct / 100);
  let exclBtw, btwBedrag;
  if (inclBtw) {
    exclBtw = naBijdrage / btwFactor;
    btwBedrag = naBijdrage - exclBtw;
  } else {
    exclBtw = naBijdrage;
    btwBedrag = 0;
  }

  // 3) BT-LH verrekenen (je betaalt uit bruto bonus, dus je "bespaart" het BT-LH deel aan loonheffing)
  const btLh = btLhPct / 100;
  const nettoPersoonlijk = exclBtw * (1 - btLh);
  const besparingDoorBonus = exclBtw * btLh;

  // UI
  document.getElementById("netto-bedrag").textContent = formatEuro(nettoPersoonlijk);

  const regels = [
    `Websitebedrag: € ${formatEuro(websiteBedrag)}`,
    `Veerenstael-bijdrage: − € ${formatEuro(bijdrage)}`,
    `Tussenstand: € ${formatEuro(naBijdrage)}`,
    inclBtw
      ? `Btw (${btwTariefPct}%): − € ${formatEuro(btwBedrag)} (excl. btw: € ${formatEuro(exclBtw)})`
      : `Btw: n.v.t. (bedrag was al excl. btw)`,
    `BT-LH ${btLhPct.toFixed(3)}% → netto zelf te betalen: € ${formatEuro(nettoPersoonlijk)} (besparing door verrekening: € ${formatEuro(besparingDoorBonus)})`
  ];

  document.getElementById("info").innerHTML = regels.join("<br>");
});

// Reset ook de uitlegregel
document.getElementById("bonus-tool-form").addEventListener("reset", function () {
  setTimeout(() => {
    document.getElementById("netto-bedrag").textContent = "0,00";
    document.getElementById("info").textContent = "";
  }, 0);
});
