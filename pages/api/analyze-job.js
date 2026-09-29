// pages/api/analyze-job.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Analyze this job description deeply. Return ONLY valid JSON:

${jobDescription}

{
  "jobTitle": "<extracted title>",
  "company": "<extracted company if available>",
  "level": "<entry/mid/senior>",
  "keySkills": [<array of technical skills>],
  "softSkills": [<array of soft skills>],
  "experience": "<required years>",
  "cultureFit": "<what type of person they want>",
  "redFlags": [<potential issues>],
  "advantages": [<what will stand out>],
  "resumeTips": [<specific tips for this role>]
}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error });
    }

    const result = JSON.parse(data.content[0].text);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
