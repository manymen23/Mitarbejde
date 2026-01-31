import formidable from "formidable";
import fs from "fs";

// For at Vercel ikke parser body automatisk
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Opret formidable form
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(500).json({ error: "Failed to parse file" });
    }

    try {
      // files.file afhænger af key i Postman
      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Læs filens indhold som tekst
      const fileContent = fs.readFileSync(file.filepath, "utf8");

      // Her kan du sende fileContent til AI til analyse
      // Eksempel: dummy response indtil AI er sat op
      const analysisResult = {
        message: "File received and parsed",
        contentLength: fileContent.length,
        first100Chars: fileContent.slice(0, 100),
      };

      res.status(200).json(analysisResult);
    } catch (error) {
      console.error("Processing error:", error);
      res.status(500).json({ error: "Failed to process file" });
    }
  });
}
