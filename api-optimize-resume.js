// pages/api/optimize-resume.js
// Place this in: pages/api/optimize-resume.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resume, jobDescription } = req.body;

  if (!resume || !jobDescription) {
    return res.status(400).json({ error: 'Resume and job description required' });
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
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: `You are an ATS optimization expert. Analyze this resume against the job description and return ONLY a valid JSON object (no markdown, no code blocks, just raw JSON).

MASTER RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Return this exact JSON structure:
{
  "atsScore": <number 0-100>,
  "analysis": "<brief analysis of fit>",
  "matchedKeywords": [<array of keywords found in resume>],
  "missingKeywords": [<array of keywords missing from resume>],
  "optimizedResume": "<full optimized resume incorporating missing keywords naturally>",
  "coverLetter": "<personalized cover letter>",
  "recommendations": [<array of 3-5 specific recommendations>]
}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error });
    }

    // Extract the text response from Claude
    const textContent = data.content[0].text;

    // Parse the JSON response
    const result = JSON.parse(textContent);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
