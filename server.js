import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Gemini Kurulumu
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Render için gerekli
    }
});

// QR Kod Oluşturma
client.on('qr', (qr) => {
    console.log('BURAYI TELEFONUNDAN OKUT:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('🚀 WhatsApp Botu Hazır, Giresun emrinde!');
});

// Mesaj Gelince Çalışan Kısım
client.on('message', async (msg) => {
    // Sadece kişisel mesajlara cevap ver (Grupları karıştırma)
    const chat = await msg.getChat();
    if (chat.isGroup) return;

    try {
        const prompt = `Sen YakindaUsta botusun. Kullanıcı: "${msg.body}". 
        Kategoriler: Tesisat, Elektrik, Temizlik, Nakliye, Boya. 
        Kısa ve samimi bir cevap ver, kategoriyi belirt.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        msg.reply(response.text());
        
    } catch (error) {
        console.error('Hata oluştu:', error);
    }
});

client.initialize();