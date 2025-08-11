import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import multiparty from 'multiparty'
import { createReadStream } from 'fs'

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('[speech] Starting audio processing...')
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('[speech] OPENAI_API_KEY not found')
      return res.status(500).json({ error: 'OpenAI API key not configured' })
    }

    const form = new multiparty.Form()
    
    const result = await new Promise<{fields: any, files: any}>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })
    
    const audioFiles = result.files.audio
    if (!audioFiles || audioFiles.length === 0) {
      console.error('[speech] No audio file provided')
      return res.status(400).json({ error: 'No audio file provided' })
    }
    
    const audioFile = audioFiles[0]
    console.log('[speech] Processing audio file, size:', audioFile.size, 'type:', audioFile.headers['content-type'])
    
    // Convert audio to text using OpenAI Whisper
    console.log('[speech] Sending to OpenAI Whisper...')
    const response = await openai.audio.transcriptions.create({
      file: createReadStream(audioFile.path),
      model: 'whisper-1',
      language: 'en'
    })

    const transcript = response.text || ''
    console.log('[speech] Transcript received:', transcript)
    
    return res.json({ transcript: transcript.trim() })
  } catch (error: any) {
    console.error('[speech] Speech-to-text error:', error.message || error)
    console.error('[speech] Error stack:', error.stack)
    if (error.response) {
      console.error('[speech] API response error:', error.response.data)
    }
    return res.status(500).json({ 
      error: 'Speech-to-text conversion failed: ' + (error.message || 'Unknown error') 
    })
  }
}
