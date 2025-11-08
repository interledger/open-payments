import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { type, page, message } = data;

    // Get GitHub token from environment variable
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = 'interledger/open-payments-docs-feedback';

    if (!GITHUB_TOKEN) {
      console.error('GITHUB_TOKEN not configured');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'GitHub token not configured'
        })
      };
    }

    // Create issue title and body
    const emoji = type === 'yes' ? '👍' : '👎';
    const sentiment = type === 'yes' ? 'Positive' : 'Negative';
    const issueTitle = `[Feedback] ${emoji} ${page}`;

    const issueBody = `**Page:** ${page}
**Feedback Type:** ${sentiment} ${emoji}
**User Message:**

${message || '_No additional feedback provided_'}

---
_Submitted via feedback widget on ${new Date().toISOString()}_`;

    // Create GitHub issue
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Interledger-Docs-Feedback-Widget'
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: [
            'feedback',
            'docs',
            type === 'yes' ? 'feedback-positive' : 'feedback-negative'
          ]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('GitHub API error:', errorData);
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const issue = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        issueUrl: issue.html_url,
        issueNumber: issue.number
      })
    };

  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };

