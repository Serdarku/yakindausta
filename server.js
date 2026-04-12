import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// .env dosyasındaki değişkenleri yükle
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Key kontrolü (Eğer .env dosyası okunamazsa terminalde hata verir)
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ HATA: GEMINI_API_KEY bulunamadı! .env dosyasını kontrol et.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/kategori", async (req, res) => {
    const { mesaj } = req.body;

    if (!mesaj) {
        return res.status(400).json({ error: "Mesaj boş olamaz" });
    }

    try {
        const prompt = `Sen YakındaUsta platformunun asistanısın. Kullanıcı mesajını analiz et ve SADECE şu JSON formatında cevap ver:
        {
          "kategori": "Tesisat|Elektrik|Temizlik|Nakliye|Boya|Tadilat|Bilinmiyor",
          "emoji": "🔧|⚡|🧹|🚛|🎨|🏠|❓",
          "yorum": "Kısa bir cümle",
          "emin": true
        }
        Kullanıcı mesajı: "${mesaj}"`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Markdown (```json) temizliği
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        const json = JSON.parse(cleanJson);

        res.json(json);

    } catch (err) {
        console.error("❌ AI Hatası:", err.message);
        res.status(500).json({ 
            kategori: "Tadilat", 
            emoji: "🏠", 
            yorum: "Şu an analiz yapamıyorum ama sizi genel bir ustaya yönlendirebilirim.",
            emin: false 
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} adresinde hazır!`);
});