const formidable = require('formidable');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Kun POST tilladt' });
  }

  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Fejl ved fil parsing' });

    try {
      const file = files.file;
      if (!file) return res.status(400).json({ error: 'Ingen fil sendt' });

      const ext = file.originalFilename.split('.').pop().toLowerCase();
      let content = '';

      if (ext === 'txt') {
        content = fs.readFileSync(file.filepath, 'utf-8');
      } else if (ext === 'pdf') {
        const dataBuffer = fs.readFileSync(file.filepath);
        const pdfData = await pdfParse(dataBuffer);
        content = pdfData.text;
      } else if (ext === 'docx') {
        const docxData = await mammoth.extractRawText({ path: file.filepath });
        content = docxData.value;
      } else {
        return res.status(400).json({ error: 'Filtype ikke understøttet' });
      }

      // Send til OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Du er en kontrakt-assistent.' },
          { role: 'user', content: `Analysér og lav et resumé af denne kontrakt:\n\n${content}` }
        ]
      });

      const summary = completion.choices[0].message.content;

      res.status(200).json({
        message: 'Kontrakt analyseret!',
        summary
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Fejl ved AI analyse' });
    }
  });
};
