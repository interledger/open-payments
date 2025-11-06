# Feedback Widget - GitHub Issues Integration

The feedback widget is **fully integrated with GitHub Issues**. When users submit feedback, it automatically creates an issue in your repository.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create a GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. Give it a name: "Interledger Docs Feedback"
3. Select expiration (recommend: 90 days or No expiration)
4. Select scopes: **`public_repo`** (for public repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

### Step 2: Add Token to Environment Variables

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Edit `.env` and add your token:

```env
GITHUB_TOKEN=ghp_your_actual_token_here
```

⚠️ **Important:** Make sure `.env` is in your `.gitignore` (it should be by default)