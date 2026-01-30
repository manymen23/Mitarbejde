export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Kun POST tilladt" })
    return
  }

  const body = req.body || {}

  const timer = body.timer || 0
  const timeløn = body.timeløn || 0
  const tillæg = body.tillæg || 0
  const skatProcent = body.skatProcent || 0
  const amBidragProcent = body.amBidragProcent || 0
  const ferieProcent = body.ferieProcent || 0

  const brutto = timer * timeløn + tillæg
  const amBidrag = brutto * (amBidragProcent / 100)
  const skat = (brutto - amBidrag) * (skatProcent / 100)
  const feriepenge = brutto * (ferieProcent / 100)
  const udbetaling = brutto - amBidrag - skat

  res.status(200).json({
    brutto,
    amBidrag,
    skat,
    feriepenge,
    udbetaling
  })
}
