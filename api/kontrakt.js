import formidable from "formidable";
import fs from "fs";
import OpenAI from "openai";

// Vercel config – vi håndterer filen selv
export const config = {
  api: {
    bodyParser: false,
  },
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Husk at gem OPENAI_API_KEY i Vercel
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Failed to parse file" });

    try {
      const file = files.file;
      if (!file) return res.status(400).json({ error: "No file uploaded" });

      const fileContent = fs.readFileSync(file.filepath, "utf8");

      // Send til OpenAI for analyse
      const response = await client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "Du er en kontraktexpert. Analysér kontrakten og giv: 1) Resume, 2) Sikkerhedsvurdering, 3) Overblik over løn og vigtige vilkår.",
          },
          { role: "user", content: fileContent },
        ],
        temperature: 0.2,
      });

      const analysis = response.choices[0].message.content;

      res.status(200).json({
        message: "Kontrakten er analyseret",
        analysis,
      });
    } catch (error) {
      console.error("AI Processing error:", error);
      res.status(500).json({ error: "Failed to process file with AI" });
    }
  });
}
