# Quick Fix for Vercel Deployment Error

## The Error
"Invalid request: should NOT have additional property `rootDirectory`"

## The Solution

### Option 1: Fix in Vercel Dashboard (Easiest)
When importing your project in Vercel:
1. **DO NOT** set a root directory
2. Leave the "Root Directory" field **empty**
3. The project root is already correct

### Option 2: Update vercel.json on GitHub

Go to: https://github.com/yndrdev/totalrecover/blob/main/vercel.json

Click "Edit" (pencil icon) and replace the entire content with:

```json
{
  "functions": {
    "app/api/chat/ai-response/route.ts": {
      "maxDuration": 30
    },
    "app/api/chat/ai-response-stream/route.ts": {
      "maxDuration": 30
    }
  }
}
```

Then commit directly to main branch.

### Option 3: Delete vercel.json completely
The file is optional. You can delete it and Vercel will use defaults.

## Why This Happened
The error suggests that either:
1. You set a "Root Directory" in Vercel's import settings (leave it empty)
2. Or there's a configuration conflict

## After Fixing
1. Go back to Vercel
2. Try importing again
3. Make sure "Root Directory" is empty
4. Deploy!

---
Your project structure is correct. The app is in the root directory, not in a subdirectory.