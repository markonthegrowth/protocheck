// Vercel Serverless Function for AI
// Using Groq API (free tier: 30 requests/minute)

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, type } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Groq API 호출
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: '당신은 사업 아이디어 검증을 돕는 전문 컨설턴트입니다. 항상 한국어로 응답하고, 요청된 JSON 형식을 정확히 따라주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API Error:', error);
      throw new Error(`Groq API 오류: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    return res.status(200).json({ 
      result,
      type,
      success: true 
    });

  } catch (error) {
    console.error('AI API Error:', error);
    return res.status(500).json({ 
      error: 'AI 처리 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
}
