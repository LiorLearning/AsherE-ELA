import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { IncomingForm } from 'formidable'

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
})

export const config = {
  api: {
    bodyParser: false, // We handle form data ourselves
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = new IncomingForm()
    const [fields, files] = await form.parse(req)
    
    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio
    
    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    console.log('[speech] Processing audio file, size:', audioFile.size, 'type:', audioFile.mimetype)
    
    // Convert audio to text using OpenAI Whisper
    console.log('[speech] Sending to OpenAI Whisper...')
    const response = await openai.audio.transcriptions.create({
      file: audioFile as any,
      model: 'whisper-1',
      language: 'en'
    })

    const transcript = response.text || ''
    console.log('[speech] Transcript received:', transcript)
    
    return res.json({ transcript: transcript.trim() })
  } catch (error: any) {
    console.error('[speech] Speech-to-text error:', error.message || error)
    if (error.response) {
      console.error('[speech] API response error:', error.response.data)
    }
    return res.status(500).json({ 
      error: 'Speech-to-text conversion failed: ' + (error.message || 'Unknown error') 
    })
  }
}
