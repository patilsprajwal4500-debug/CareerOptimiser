// pages/api/optimize-resume.js

export const config = { maxDuration: 60 };

const SYSTEM_PROMPT = `You are an experienced recruiter and resume writer. You tailor resumes so they pass ATS screening and read like a real person wrote them.

TRUTHFULNESS
- Only use facts that appear in the candidate's resume. Never invent employers, titles, dates, degrees, tools, metrics, or achievements.
- If the job asks for something the candidate doesn't have, list it as a missing keyword. Do not add it to the resume.
- Keep every number and date exactly as given. Do not add new numbers.

RESUME EDITING
- Keep the candidate's original structure, section order, and voice. Edit; don't rewrite from scratch.
- Reword bullets to reflect the job posting's language only where the candidate's experience genuinely supports it.
- Lead bullets with plain, specific verbs and say what was actually done. Prefer concrete detail over general claims.
- Use standard section headings (Summary, Experience, Education, Skills) and plain text with simple "-" bullets. No tables, columns, or special characters.
- Mirror the exact wording of key terms from the job posting (for example, "project management" rather than "managing projects") where truthful.

NATURAL WRITING
- Avoid words and phrases that sound machine-written: spearheaded, leveraged, utilized, synergy, dynamic, passionate, results-driven, proven track record, seasoned, adept, robust, cutting-edge, "in today's fast-paced world", "I am excited to", "I am writing to express my interest".
- Vary sentence length and bullet structure. Not every bullet should follow the same pattern.
- No em dashes. Use commas, periods, or parentheses.
- Do not stuff keywords. Each keyword should appear where it makes sense, usually once or twice.

COVER LETTER
- 180 to 250 words, three short paragraphs, plain and direct.
- Open with the specific role and one concrete reason the candidate fits, taken from their resume.
- Middle: two or three real examples from the resume that match the job's needs.
- Close simply, with a clear next step. No clichés.
- Write as the candidate, in first person. Use the company name if it appears in the job posting.

SCORING
- atsScore is an honest 0-100 estimate of keyword and requirement match between the ORIGINAL resume and the job. Do not inflate it.

OUTPUT
Return ONLY one valid JSON object with no markdown and no text before or after it. Escape line breaks inside strings as \\n.`;

function extractJson(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Model did not return JSON');
  return JSON.parse(cleaned.slice(start, end + 1));
}

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
        model: 'claude-sonnet-5-5',
        max_tokens: 4096,
        temperature: 0.6,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `MASTER RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Return this exact JSON structure:
{
  "atsScore": <number 0-100>,
  "analysis": "<2-3 sentences on how well the candidate fits and the biggest gaps>",
  "matchedKeywords": [<important terms from the job posting already in the resume>],
  "missingKeywords": [<important terms from the job posting not supported by the resume>],
  "optimizedResume": "<the full tailored resume as plain text>",
  "coverLetter": "<the cover letter>",
  "recommendations": [<3-5 specific, practical suggestions, including real experience the candidate could add if they have it>]
}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error });
    }

    const result = extractJson(data.content[0].text);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
