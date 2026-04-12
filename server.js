import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/kategori", async (req, res) => {
  const { mesaj } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `
Sen bir usta yönlendirme sistemisin.

Kullanıcının mesajına göre sadece şu kategorilerden birini döndür:
- Tesisat
- Elektrik
- Temizlik
- Nakliye
- Boya

SADECE kategori adı yaz. Başka hiçbir şey yazma.
`
        },
        {
          role: "user",
          content: mesaj
        }
      ]
    });

    const kategori = response.choices[0].message.content.trim();

    res.json({ kategori });

  } catch (err) {
    res.status(500).json({ error: "AI hatası" });
  }
});

app.listen(3000, () => {
  console.log("Server çalışıyor 🚀");
});