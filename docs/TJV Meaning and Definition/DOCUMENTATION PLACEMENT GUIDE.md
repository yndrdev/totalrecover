# DOCUMENTATION PLACEMENT GUIDE

## 📁 FILE TYPES AND LOCATIONS

### **CLINE CONFIGURATION FILES** (Project Root)
These files configure Cline.bot behavior and go in your **project root**:

```
your-tjv-project/
├── .clinerules          ← Cline configuration
├── .clineworkflows      ← Cline configuration  
├── .clineignore         ← Cline configuration
├── package.json
└── src/
```

### **PROJECT DOCUMENTATION FILES** (docs/ Directory)
These files are project documentation and go in your **docs/** directory:

```
your-tjv-project/
├── docs/
│   ├── features/
│   │   ├── feature-editing-system.md           ← Put here
│   │   ├── comprehensive-tjv-feature-documentation.md  ← Put here
│   │   └── cline-feature-management-rules.md   ← Put here
│   ├── setup/
│   │   └── cline-installation-instructions.md  ← Put here
│   └── README.md
├── .clinerules
├── package.json
└── src/
```

---

## 🎯 SPECIFIC FILE PLACEMENT

### **Feature Editing System Documentation**
**File**: `feature-editing-system.md`
**Location**: `docs/features/feature-editing-system.md`

This document contains:
- Modular feature architecture guidelines
- Feature configuration system documentation
- Component-level editing workflows
- Feature management dashboard specifications

### **Comprehensive TJV Feature Documentation**
**File**: `comprehensive-tjv-feature-documentation.md`
**Location**: `docs/features/comprehensive-tjv-feature-documentation.md`

This document contains:
- Complete feature overview and specifications
- Patient chat system requirements (Manus-style)
- Provider dashboard system details
- Protocol builder system specifications
- Individual patient protocol editing requirements

### **Cline Feature Management Rules**
**File**: `cline-feature-management-rules.md`
**Location**: `docs/development/cline-feature-management-rules.md`

This document contains:
- Feature editing principles for Cline
- Configuration-driven development rules
- Component development standards
- Feature lifecycle management guidelines

---

## 📋 RECOMMENDED DIRECTORY STRUCTURE

### **Complete Documentation Organization**
```
your-tjv-project/
├── docs/
│   ├── features/                           # Feature specifications
│   │   ├── feature-editing-system.md
│   │   ├── comprehensive-tjv-feature-documentation.md
│   │   ├── chat-system-specs.md
│   │   ├── provider-dashboard-specs.md
│   │   └── protocol-builder-specs.md
│   ├── development/                        # Development guidelines
│   │   ├── cline-feature-management-rules.md
│   │   ├── coding-standards.md
│   │   └── testing-guidelines.md
│   ├── setup/                             # Setup and installation
│   │   ├── cline-installation-instructions.md
│   │   ├── environment-setup.md
│   │   └── database-setup.md
│   ├── api/                               # API documentation
│   │   ├── endpoints.md
│   │   └── authentication.md
│   └── README.md                          # Main documentation index
├── .clinerules                            # Cline configuration
├── .clineworkflows                        # Cline configuration
├── .clineignore                           # Cline configuration
├── package.json
└── src/
```

---

## 🚀 SETUP COMMANDS

### **Create Documentation Structure**
```bash
# Create documentation directories
mkdir -p docs/features
mkdir -p docs/development  
mkdir -p docs/setup
mkdir -p docs/api

# Move documentation files
mv feature-editing-system.md docs/features/
mv comprehensive-tjv-feature-documentation.md docs/features/
mv cline-feature-management-rules.md docs/development/
mv cline-installation-instructions.md docs/setup/
```

### **Create Documentation Index**
Create `docs/README.md`:
```markdown
# TJV Recovery Platform Documentation

## Features
- [Feature Editing System](features/feature-editing-system.md)
- [Comprehensive Feature Documentation](features/comprehensive-tjv-feature-documentation.md)

## Development
- [Cline Feature Management Rules](development/cline-feature-management-rules.md)

## Setup
- [Cline Installation Instructions](setup/cline-installation-instructions.md)
```

---

## ✅ SUMMARY

### **Cline Configuration Files** (Project Root):
- `.clinerules` → `your-project/.clinerules`
- `.clineworkflows` → `your-project/.clineworkflows`  
- `.clineignore` → `your-project/.clineignore`

### **Documentation Files** (docs/ Directory):
- `feature-editing-system.md` → `docs/features/feature-editing-system.md`
- `comprehensive-tjv-feature-documentation.md` → `docs/features/comprehensive-tjv-feature-documentation.md`
- `cline-feature-management-rules.md` → `docs/development/cline-feature-management-rules.md`
- `cline-installation-instructions.md` → `docs/setup/cline-installation-instructions.md`

### **Why This Separation?**
- **Configuration files** tell Cline.bot how to behave
- **Documentation files** provide reference information for developers
- **Organized docs** make it easy to find and maintain project information
- **Version control** tracks both configuration and documentation changes

**This organization keeps your project clean, professional, and easy to navigate for both Cline.bot and human developers!**

