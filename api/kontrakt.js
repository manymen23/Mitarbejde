import formidable from "formidable";

// Vercel: disable bodyParser, så vi kan modtage filer
export const config = {
  api: { bodyParser: false },
};

// Hovedfunktion
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Kun POST tilladt" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Fejl ved upload" });

    const file = files.file;
    if (!file) return res.status(400).json({ error: "Ingen fil fundet" });

    // 1️⃣ Få tekst fra filen
    const text = await extractTextFromFile(file); // Vi laver funktionen nedenfor

    // 2️⃣ Send teksten til AI / Resume-generator
    const summary = await generateResume(text); // Vi laver funktionen nedenfor

    // 3️⃣ Send resume tilbage til app
    res.status(200).json({ summary });
  });
}
