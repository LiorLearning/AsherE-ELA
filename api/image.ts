import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
})

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
    const { prompt, style = 'vivid' } = req.body

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' })
    }

    // Create a more descriptive prompt for Captain Asher's adventure
    const enhancedPrompt = `A vibrant, family-friendly illustration for a children's story featuring Captain Asher's space adventure: ${prompt}. Style: colorful, adventurous, suitable for kids, with a sci-fi fantasy theme.`

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      style: style as "vivid" | "natural",
      quality: "standard"
    })

    const imageUrl = response.data[0]?.url
    
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E')
    }

    res.json({ 
      imageUrl,
      prompt: enhancedPrompt,
      originalPrompt: prompt
    })

  } catch (error: any) {
    console.error('DALL-E image generation error:', error)
    
    // Return specific error messages for different scenarios
    if (error.code === 'content_policy_violation') {
      res.status(400).json({ error: 'Content not suitable for image generation. Please try a different description.' })
    } else if (error.code === 'rate_limit_exceeded') {
      res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' })
    } else {
      res.status(500).json({ error: 'Failed to generate image. Please try again.' })
    }
  }
}
