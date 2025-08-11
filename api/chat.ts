import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages } = req.body
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
    })
    const reply = completion.choices[0]?.message?.content ?? ''
    res.json({ reply })
  } catch (error: any) {
    console.error('Chat error', error)
    res.status(500).json({ error: 'OpenAI request failed' })
  }
}
