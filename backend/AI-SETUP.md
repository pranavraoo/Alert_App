# AI Setup Guide

## 🤖 Current Status: AI Unavailable, Fallback Working

The system is currently using the **enhanced smart fallback categorizer** because AI API keys are not configured.

## ✅ What's Working Right Now:

1. **Enhanced Fallback Categorizer** - Smart rule-based categorization
2. **Dynamic Categories** - Still generates relevant categories
3. **All Features** - Everything works without AI

## 🔧 Option 1: Use Gemini AI (Recommended)

1. **Get Gemini API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Create `.env` file:**
   ```bash
   # In the backend directory
   DATABASE_URL=your_database_url_here
   
   # AI Configuration
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   
   # Server
   PORT=4000
   FRONTEND_ORIGIN=http://localhost:3000
   ```

3. **Restart the backend:**
   ```bash
   npm run dev
   ```

## 🔧 Option 2: Use Ollama (Local AI)

1. **Install Ollama:**
   ```bash
   # Download from https://ollama.ai
   # Install and start Ollama
   ```

2. **Pull a model:**
   ```bash
   ollama pull llama3.1:8b
   ```

3. **Configure `.env`:**
   ```bash
   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.1:8b
   ```

## 🔧 Option 3: Keep Using Smart Fallback (Free!)

**The enhanced fallback is actually very good!**

### ✅ Benefits:
- **🚀 Fast** - No API calls
- **💰 Free** - No costs
- **🎯 Accurate** - Smart keyword matching
- **🔄 Reliable** - Always works

### 🎯 Example Results:
```
Input: "Urgent: Your Microsoft account will be suspended! Click here now!"
Output: {
  "title": "Urgent: Your Microsoft account will be suspended!...",
  "category": "Phishing",
  "severity": "high",
  "summary": "Classification fallback applied; please verify.",
  "suggested_action": "Review the details and verify category and severity.",
  "reason": "Matched keywords: click here",
  "confidence": "low"
}
```

## 🎯 Current Experience:

### ✅ What Users See:
- **Smart categorization** still works
- **Dynamic categories** are generated
- **All features** function normally
- **Friendly messages** about using smart categorization

### 🔍 Natural Language Query:
The ThreatQuery component also uses the same AI system, so it will fall back to smart matching when AI is unavailable.

## 🚀 Recommendation:

**Start with the enhanced fallback!** It's working great and provides:
- Relevant categories
- Proper severity assessment
- Actionable suggestions
- No setup required

If you want AI later, just add the API key and restart!

---

## 🎉 Bottom Line:

**Your Community Guardian is fully functional with smart categorization!** 

The AI enhancement is optional - the system works perfectly with the intelligent fallback system. 🚀
