import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/videos', express.static(path.join(process.cwd(), 'videos')));

// Configure multer for audio uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Serve the local video1.mp4 file
app.get('/video1.mp4', (req, res) => {
  const videoPath = path.join(process.cwd(), 'video1.mp4');
  res.sendFile(videoPath);
});

const port = process.env.PORT ? Number(process.env.PORT) : 8787;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/chat', async (req, res) => {
  try {
    const messages = req.body?.messages ?? [];
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
    });
    const reply = completion.choices[0]?.message?.content ?? '';
    res.json({ reply });
  } catch (error: any) {
    console.error('Chat error', error);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

// Speech-to-text endpoint using OpenAI Whisper
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('[speech] Processing audio file, size:', req.file.size, 'type:', req.file.mimetype);
    
    // Write audio buffer to a temporary file for OpenAI API
    const tempFilePath = path.join(process.cwd(), 'temp_audio.wav');
    
    try {
      // Write the buffer to a temporary file
      fs.writeFileSync(tempFilePath, req.file.buffer);
      
      // Convert audio to text using OpenAI Whisper
      console.log('[speech] Sending to OpenAI Whisper...');
      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'en'
      });

      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);

      const transcript = response.text || '';
      console.log('[speech] Transcript received:', transcript);
      
      res.json({ transcript: transcript.trim() });
    } catch (innerError: any) {
      // Clean up temp file if it exists
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw innerError; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error('[speech] Speech-to-text error:', error.message || error);
    if (error.response) {
      console.error('[speech] API response error:', error.response.data);
    }
    res.status(500).json({ error: 'Speech-to-text conversion failed: ' + (error.message || 'Unknown error') });
  }
});

// Generate a short progress video (using local video1.mp4)
app.post('/api/video', async (req, res) => {
  try {
    const prompt: string = (req.body?.prompt ?? 'A heroic sci‑fi jungle scene showing Captain Asher\'s progress.').toString();
    console.log('[video] Video requested with prompt:', prompt);
    console.log('[video] Using local video1.mp4');
    return res.json({ url: '/video1.mp4' });
  } catch (error) {
    console.error('Video error', error);
    res.status(500).json({ error: 'Video generation failed' });
  }
});

app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});