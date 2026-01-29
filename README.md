api/calculate.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Kun POST tilladt" })
  }

  const {
    timer = 0,
    timeløn = 0,
    tillæg = 0,
    skatProcent = 0,
    amBidragProcent = 0,
    ferieProcent = 0
  } = req.body

  const brutto = timer * timeløn + tillæg
  const amBidrag = brutto * (amBidragProcent / 100)
  const skat = (brutto - amBidrag) * (skatProcent / 100)
  const feriepenge = brutto * (ferieProcent / 100)
  const udbetaling = brutto - amBidrag - skat

  res.json({
    brutto,
    amBidrag,
    skat,
    feriepenge,
    udbetaling
  })
}
