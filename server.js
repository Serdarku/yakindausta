import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const prompt = `Sen YakindaUsta platformunun asistanısın. Kullanıcının şu mesajını analiz et: "${message}". 
    Eğer bir usta/hizmet arıyorsa şu kategorilerden birine yönlendir: Tesisat, Elektrik, Temizlik, Nakliye, Boya. 
    Kısa, samimi ve Giresun şivesine yakın (isteğe bağlı) yardımcı bir cevap ver.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (error) {
    console.error("AI Hatası:", error);
    res.status(500).json({ reply: "Bir hata oluştu, usta yolda ama sistem takıldı! :)" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda eski düzeninde çalışıyor! 🚀`);
});
