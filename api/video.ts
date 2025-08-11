import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt } = req.body
    console.log('[video] Video requested with prompt:', prompt)
    console.log('[video] Using placeholder video')
    return res.json({ url: '/video1.mp4' })
  } catch (error) {
    console.error('Video error', error)
    res.status(500).json({ error: 'Video generation failed' })
  }
}
