import formidable from "formidable";
import fs from "fs";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false, // vigtigt for filupload
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = formidable({ keepExtensions: true });
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: err.message });

      const filePath = files.contract.filepath; // hent filen
      const fileContent = fs.readFileSync(filePath, "utf-8");

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: fileContent }],
      });

      res.status(200).json({ result: aiResponse.choices[0].message.content });
    });
  } else {
    res.status(405).json({ error: "POST only" });
  }
}
// fil: /api/kontrakt.js
import formidable from "formidable";
import fs from "fs";

// Vercel API handler
export const config = {
  api: {
    bodyParser: false, // vi bruger formidable, ikke default parser
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(500).json({ error: "Error parsing file" });
    }

    try {
      // Her får du filen fra brugeren
      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Læs indholdet af filen (hvis det er tekst eller PDF du kan parse)
      const data = fs.readFileSync(file.filepath, "utf8");

      // TODO: Kald din AI eller kontrakt-analyse her
      // f.eks: const result = await analyzeContract(data);

      const result = {
        message: "Fil modtaget og klar til analyse",
        fileName: file.originalFilename,
        // analyseResult: result
      };

      return res.status(200).json(result);
    } catch (error) {
      console.error("Handler error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}
