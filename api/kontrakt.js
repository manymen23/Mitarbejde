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
