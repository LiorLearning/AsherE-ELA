import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers to support local development
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
    const { text, voice_id = 'cgSgspJ2msm6clMCkdW9' } = req.body // Default to Jessica voice

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' })
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: 'ElevenLabs API key not configured' })
    }

    // Sanitize and guard text length (ElevenLabs may error on very long / odd unicode)
    const sanitized = String(text)
      .replace(/[\uD800-\uDFFF]/g, '') // strip unpaired surrogates
      .replace(/[\u0000-\u001F\u007F]/g, ' ') // strip control chars
      .trim()
      .slice(0, 600) // soft cap

    // Call ElevenLabs TTS API
    const callEleven = async (vid: string, body: any) => fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY as string
      },
      body: JSON.stringify(body)
    })

    // First attempt with provided/default voice
    let response = await callEleven(voice_id, {
      text: sanitized,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true
      }
    })

    // If it fails, try minimal payload (some accounts/models reject extra fields)
    if (!response.ok) {
      const minimal = await callEleven(voice_id, { text: sanitized })
      if (minimal.ok) {
        response = minimal
      } else if (voice_id !== 'cgSgspJ2msm6clMCkdW9') {
        // Fallback to Jessica with minimal body
        const fallback = await callEleven('cgSgspJ2msm6clMCkdW9', { text: sanitized })
        if (fallback.ok) {
          response = fallback
        } else {
          // Keep original failed response for error surface
        }
      }
    }

    // (additional fallback handled above)

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || ''
      let errorBody: any = undefined
      try {
        errorBody = contentType.includes('application/json') ? await response.json() : await response.text()
      } catch {
        errorBody = 'unknown'
      }
      console.error('ElevenLabs API error:', response.status, errorBody)
      return res.status(response.status).json({ 
        error: 'ElevenLabs API error',
        status: response.status,
        details: errorBody
      })
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()
    
    // Convert to base64 for JSON response
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')
    
    res.json({ 
      audioData: audioBase64,
      audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
      voice_id: voice_id
    })

  } catch (error: any) {
    console.error('Text-to-speech error:', error)
    res.status(500).json({ error: 'Failed to generate speech. Please try again.' })
  }
}
