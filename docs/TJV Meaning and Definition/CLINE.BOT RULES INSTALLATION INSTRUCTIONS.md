# CLINE.BOT RULES INSTALLATION INSTRUCTIONS

## 📁 FILE PLACEMENT

### **Step 1: Copy Rules Files to Your Project Root**
Place these files in the root directory of your TJV Recovery Platform project:

```
your-tjv-project/
├── .clinerules          # Main rules file
├── .clineworkflows      # Workflow guidelines  
├── .clineignore         # Files to ignore
├── package.json
├── next.config.js
└── src/
```

### **Step 2: File Locations**
Copy the files from this sandbox to your project:

1. **`.clinerules`** → `your-project-root/.clinerules`
2. **`.clineworkflows`** → `your-project-root/.clineworkflows` 
3. **`.clineignore`** → `your-project-root/.clineignore`

---

## 🚀 INSTALLATION METHODS

### **Method 1: Manual Copy (Recommended)**
1. **Download the files** from this sandbox:
   - `/home/ubuntu/.clinerules`
   - `/home/ubuntu/.clineworkflows`
   - `/home/ubuntu/.clineignore`

2. **Place in your project root** (same level as package.json):
   ```bash
   cp .clinerules /path/to/your/tjv-project/
   cp .clineworkflows /path/to/your/tjv-project/
   cp .clineignore /path/to/your/tjv-project/
   ```

### **Method 2: Create Files Directly**
Create these files directly in your project root and copy the content:

```bash
# In your project root directory
touch .clinerules
touch .clineworkflows  
touch .clineignore

# Then copy the content from the sandbox files
```

---

## 🔧 VERIFICATION

### **Check File Placement**
Verify the files are in the correct location:
```bash
ls -la your-project-root/
# Should show:
# .clinerules
# .clineworkflows
# .clineignore
```

### **Test Cline Recognition**
1. **Open your project** in VS Code with Cline extension
2. **Start a new Cline conversation**
3. **Ask Cline**: "What rules are you following for this project?"
4. **Cline should respond** with information about the TJV healthcare platform rules

---

## 📋 FILE CONTENTS SUMMARY

### **`.clinerules` (Main Rules)**
- 🚨 Critical protection rules (never delete env vars, API keys)
- 🏥 Healthcare platform requirements (professional appearance, HIPAA)
- 🎯 UI/UX design standards (Manus-style, 800px content, 280px sidebar)
- 📊 Database integrity rules (never modify schemas without instruction)
- 🔧 Development standards (TypeScript, error handling, testing)

### **`.clineworkflows` (Development Workflows)**
- 🚀 Project initialization and setup workflow
- 🏥 Healthcare feature development workflow
- 🔧 Bug fixing and maintenance workflow
- 💬 Chat system and AI integration workflow
- 📊 Database operations workflow
- 🎯 UI/UX development workflow
- 🔍 Testing and quality assurance workflow
- 📋 Deployment and maintenance workflow

### **`.clineignore` (Files to Ignore)**
- Environment variables and secrets
- Node modules and build outputs
- Healthcare-specific sensitive files
- API keys and configuration files
- Large data files and uploads

---

## 🎯 ADDITIONAL SETUP (OPTIONAL)

### **Supabase MCP Integration**
If you want to use Supabase MCP with Cline:

1. **Configure MCP in VS Code** (`.vscode/mcp.json`):
```json
{
  "servers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your-personal-access-token"
      },
      "type": "stdio"
    }
  }
}
```

### **Context7 Integration**
To use Context7 for up-to-date documentation:

1. **Add to your prompts**: "use context7" when you need current documentation
2. **Context7 will automatically** fetch relevant, up-to-date docs

### **Claude Task Master Integration**
For advanced task management:

1. **Install Task Master**:
```bash
npm install -g task-master-ai
```

2. **Initialize in your project**:
```bash
task-master init
```

---

## ✅ VERIFICATION CHECKLIST

### **Before Starting Development:**
- [ ] `.clinerules` file is in project root
- [ ] `.clineworkflows` file is in project root  
- [ ] `.clineignore` file is in project root
- [ ] Cline recognizes the rules when asked
- [ ] Project has proper environment variables set
- [ ] Supabase connection is working
- [ ] All documentation files are accessible

### **Test Cline Understanding:**
Ask Cline these questions to verify it understands the rules:

1. **"What are the critical protection rules for this project?"**
   - Should mention never deleting env vars, API keys, database schemas

2. **"What UI standards should I follow for the chat interface?"**
   - Should mention Manus-style, 280px sidebar, 800px content area

3. **"How should I handle healthcare data in this project?"**
   - Should mention HIPAA compliance, professional appearance, audit logging

4. **"What's the proper workflow for adding a new feature?"**
   - Should reference the comprehensive workflows in `.clineworkflows`

---

## 🚨 TROUBLESHOOTING

### **If Cline Doesn't Recognize Rules:**
1. **Check file names** - must be exactly `.clinerules`, `.clineworkflows`, `.clineignore`
2. **Check file location** - must be in project root, not in subdirectories
3. **Restart VS Code** - sometimes needed for Cline to pick up new rule files
4. **Check file permissions** - ensure files are readable

### **If Rules Seem Ignored:**
1. **Explicitly reference rules** in your prompts: "Following the project rules in .clinerules..."
2. **Ask Cline to confirm** it's following the rules
3. **Be specific** about which rules apply to your current task

### **Common Issues:**
- **Wrong file location** - files must be in project root
- **Typos in filenames** - must be exact: `.clinerules` not `.cline-rules`
- **File encoding** - ensure files are UTF-8 encoded
- **Hidden files** - make sure your editor shows hidden files (files starting with .)

---

## 🎯 NEXT STEPS

### **After Installation:**
1. **Start with a simple test** - ask Cline to create a basic component following the rules
2. **Verify healthcare styling** - ensure it uses proper colors and professional appearance
3. **Test database operations** - ensure it doesn't modify existing schemas
4. **Check feature modularity** - verify new features follow the modular structure

### **Ready to Begin Development:**
With the rules installed, you can now confidently use Cline.bot to:
- ✅ Build the TJV Recovery Platform without breaking existing functionality
- ✅ Maintain professional healthcare appearance and HIPAA compliance
- ✅ Follow established workflows for efficient development
- ✅ Create modular, easily editable features
- ✅ Protect sensitive data and environment variables

**You're all set! Cline.bot now has comprehensive guidance to build your TJV Recovery Platform correctly and efficiently.**

