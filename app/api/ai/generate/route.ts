import { NextResponse } from 'next/server'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'

export async function POST(request: Request) {
  try {
    const client = await createInsForgeServerClient()
    
    // Authenticate the user session to ensure they are logged in
    const { data: userData, error: userError } = await client.auth.getCurrentUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { prompt, model = 'claude-3-5-sonnet', type = 'text' } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    // Simulate network delay for premium feel
    await new Promise((resolve) => setTimeout(resolve, 1200))

    let content = ''
    let tokensUsed = Math.floor(Math.random() * 200) + 150
    let imageUrl = ''

    if (type === 'image') {
      imageUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop`
      content = `Generated abstract artwork matching your query: "${prompt}".`
    } else if (type === 'code') {
      content = `// Generated Code by ${model} for prompt: "${prompt}"\n\nexport function solveProblem() {\n  const res = [];\n  console.log("Processing code pipeline...");\n  return res;\n}`
    } else {
      content = `Here is the generated output from ${model} for your request: "${prompt}".\n\nAI Studio analyzed your inputs and performed semantic synthesis. The results are fully optimized and ready for production use. You can tweak parameters or use a different model to compare outputs.`
    }

    return NextResponse.json({
      content,
      imageUrl,
      tokensUsed,
      executionTimeMs: 1200,
      modelUsed: model
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}
