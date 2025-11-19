# Feedback Widget - GitHub Issues Integration

The feedback widget is **fully integrated with GitHub Issues** via a Netlify Function. When users submit feedback, it automatically creates an issue in your repository.

## 🚀 Quick Setup

### Step 1: Create a GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. Give it a name: "Interledger Docs Feedback"
3. Select expiration (recommend: 90 days or No expiration)
4. Select scopes: **`public_repo`** (for public repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

### Step 2: Add Token to Netlify Environment Variables

#### For Local Development

Create a `.env` file in the `/docs` directory:

```env
GITHUB_TOKEN=ghp_your_actual_token_here
```

⚠️ **Important:** Make sure `.env` is in your `.gitignore` (it should be by default)

#### For Production (Netlify)

1. Go to your site in the Netlify dashboard
2. Navigate to **Site settings > Environment variables**
3. Click **Add a variable**
4. Set:
   - **Key:** `GITHUB_TOKEN`
   - **Value:** Your GitHub personal access token
   - **Scopes:** All scopes (or specific deploy contexts if needed)
5. Click **Create variable**
6. Trigger a new deploy for the changes to take effect

## 🏗️ Architecture

The feedback system uses a **Netlify Function** (serverless) to securely handle GitHub API authentication:

```
User clicks feedback → FeedbackWidget.astro → /.netlify/functions/feedback → GitHub API
```

**Files:**
- `/docs/netlify/functions/feedback.ts` - Netlify Function that creates GitHub issues
- `/docs/src/components/FeedbackWidget.astro` - Frontend widget component
- `/docs/src/components/Footer.astro` - Conditionally displays the widget
- `/docs/netlify.toml` - Netlify configuration

## 🧪 Testing Locally

To test the feedback widget with Netlify Functions locally:

```bash
# Install Netlify CLI if you haven't already
npm install -g netlify-cli

# Run the dev server with Netlify Functions
cd docs
netlify dev
```

This will start the Astro dev server and make the Netlify Functions available at `/.netlify/functions/feedback`.

## 📝 How It Works

1. User clicks "Yes" or "No" on a documentation page
2. Widget shows a textarea for optional feedback
3. On submit, JavaScript sends POST request to `/.netlify/functions/feedback`
4. Netlify Function authenticates with GitHub using `GITHUB_TOKEN` env var
5. Function creates an issue in `interledger/open-payments-docs-feedback` repository
6. Issue is automatically labeled with `feedback`, `docs`, and sentiment label
7. Widget shows success message

## 🔒 Security

- ✅ GitHub token is stored securely in Netlify environment variables
- ✅ Token is never exposed to the client/browser
- ✅ Function runs server-side only
- ✅ CORS is handled automatically by Netlify

## 🎯 Fallback Behavior

If the GitHub token is not configured or the API fails, the widget will:
1. Open a pre-filled GitHub issue creation page in a new tab
2. User can manually submit the feedback
3. This ensures feedback is never lost