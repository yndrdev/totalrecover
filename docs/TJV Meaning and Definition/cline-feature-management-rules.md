# CLINE RULES: FEATURE MANAGEMENT AND EDITING

## 🎯 FEATURE EDITING PRINCIPLES

### **ALWAYS CREATE MODULAR, EDITABLE FEATURES**
- Every feature must have its own directory structure under `/features/`
- Each feature must include a `config.json` file for easy customization
- Components must be config-driven, not hardcoded
- All styling and behavior must be configurable through JSON
- Features must be toggleable (enable/disable) without breaking the app

### **FEATURE STRUCTURE REQUIREMENTS**
```
/features/[feature-name]/
├── config.json          # REQUIRED: Feature configuration
├── components/          # React components
├── hooks/              # Custom hooks
├── utils/              # Utility functions
├── types/              # TypeScript types
├── README.md           # REQUIRED: Feature documentation
└── tests/              # Feature-specific tests
```

### **CONFIGURATION-DRIVEN DEVELOPMENT**
- All UI elements (colors, spacing, layout) must be configurable
- All behavior (API settings, thresholds, toggles) must be configurable
- All text content must be configurable for easy editing
- All feature integrations must be configurable
- Never hardcode values that users might want to change

## 🔧 FEATURE CONFIGURATION STANDARDS

### **REQUIRED CONFIG.JSON STRUCTURE**
```json
{
  "feature": "feature-name",
  "enabled": true,
  "version": "1.0.0",
  "ui": {
    "colors": {},
    "layout": {},
    "styling": {}
  },
  "behavior": {
    "settings": {},
    "integrations": {},
    "thresholds": {}
  },
  "permissions": {
    "patient": [],
    "nurse": [],
    "surgeon": [],
    "admin": []
  },
  "dependencies": []
}
```

### **UI CONFIGURATION REQUIREMENTS**
- All colors must be configurable (primary, secondary, success, warning, error)
- All dimensions must be configurable (widths, heights, spacing)
- All layout options must be toggleable (show/hide elements)
- All animations and transitions must be configurable
- All text content must be configurable

### **BEHAVIOR CONFIGURATION REQUIREMENTS**
- All API integrations must be configurable (endpoints, keys, settings)
- All thresholds and limits must be configurable
- All feature toggles must be configurable
- All timing and intervals must be configurable
- All user preferences must be configurable

## 📝 COMPONENT DEVELOPMENT RULES

### **CONFIG-DRIVEN COMPONENTS**
```typescript
// GOOD: Config-driven component
const ChatSidebar = () => {
  const config = useFeatureConfig('chat-system');
  
  return (
    <div 
      style={{ 
        width: config.ui.sidebar.width,
        backgroundColor: config.ui.colors.background 
      }}
      className={config.ui.sidebar.className}
    >
      {config.ui.sidebar.showDayNavigation && <DayNavigation />}
      {config.ui.sidebar.showTaskIndicators && <TaskIndicators />}
    </div>
  );
};

// BAD: Hardcoded component
const ChatSidebar = () => {
  return (
    <div style={{ width: '280px', backgroundColor: '#f8f9fa' }}>
      <DayNavigation />
      <TaskIndicators />
    </div>
  );
};
```

### **FEATURE HOOK REQUIREMENTS**
```typescript
// REQUIRED: Feature config hook
export const useFeatureConfig = (featureName: string) => {
  const [config, setConfig] = useState<FeatureConfig>();
  
  useEffect(() => {
    loadFeatureConfig(featureName).then(setConfig);
  }, [featureName]);
  
  return config;
};

// REQUIRED: Feature toggle hook
export const useFeatureEnabled = (featureName: string) => {
  const config = useFeatureConfig(featureName);
  return config?.enabled ?? false;
};
```

## 🎨 UI CUSTOMIZATION RULES

### **STYLING MUST BE CONFIGURABLE**
- Never use hardcoded colors, use config values
- Never use hardcoded dimensions, use config values
- Never use hardcoded text, use config values
- All CSS classes must be configurable
- All inline styles must use config values

### **RESPONSIVE DESIGN CONFIGURATION**
```json
{
  "ui": {
    "responsive": {
      "mobile": {
        "sidebar": { "width": "100%", "position": "overlay" },
        "chat": { "maxWidth": "100%" }
      },
      "tablet": {
        "sidebar": { "width": "240px" },
        "chat": { "maxWidth": "600px" }
      },
      "desktop": {
        "sidebar": { "width": "280px" },
        "chat": { "maxWidth": "800px" }
      }
    }
  }
}
```

### **THEME SYSTEM REQUIREMENTS**
- Support multiple themes (light, dark, high-contrast)
- All themes must be configurable through JSON
- Theme switching must not require code changes
- All components must respect theme configuration

## 🔄 FEATURE LIFECYCLE MANAGEMENT

### **FEATURE CREATION WORKFLOW**
1. **Create Feature Directory Structure**
   ```bash
   mkdir -p features/[feature-name]/{components,hooks,utils,types,tests}
   ```

2. **Create Configuration File**
   - Start with template config.json
   - Define all customizable aspects
   - Set sensible defaults
   - Document all configuration options

3. **Implement Config-Driven Components**
   - Use feature config hook in all components
   - Make all UI elements configurable
   - Implement feature toggles
   - Add proper error handling

4. **Create Feature Documentation**
   - Document all configuration options
   - Provide usage examples
   - Include troubleshooting guide
   - Document integration points

### **FEATURE MODIFICATION WORKFLOW**
1. **Identify Configuration Changes**
   - Determine what needs to be configurable
   - Update config.json schema
   - Maintain backward compatibility

2. **Update Components**
   - Modify components to use new config options
   - Test with different configuration values
   - Ensure graceful fallbacks

3. **Update Documentation**
   - Document new configuration options
   - Update examples and usage guides
   - Test documentation accuracy

### **FEATURE TESTING REQUIREMENTS**
- Test with different configuration values
- Test feature enable/disable functionality
- Test with different user roles and permissions
- Test integration with other features
- Test configuration validation

## 🛡️ CONFIGURATION SAFETY RULES

### **CONFIGURATION VALIDATION**
```typescript
// REQUIRED: Config validation schema
const configSchema = {
  feature: { type: 'string', required: true },
  enabled: { type: 'boolean', required: true },
  version: { type: 'string', required: true },
  ui: { type: 'object', required: true },
  behavior: { type: 'object', required: true },
  permissions: { type: 'object', required: true }
};

// REQUIRED: Validate config before use
export const validateFeatureConfig = (config: any): FeatureConfig => {
  const validation = validate(config, configSchema);
  if (!validation.valid) {
    throw new Error(`Invalid feature config: ${validation.errors.join(', ')}`);
  }
  return config as FeatureConfig;
};
```

### **CONFIGURATION BACKUP AND RECOVERY**
- Always backup working configurations before changes
- Implement configuration versioning
- Provide rollback functionality
- Log all configuration changes
- Validate configurations before applying

### **SAFE DEFAULTS**
- All configurations must have safe default values
- Features must work with minimal configuration
- Invalid configurations must fall back to defaults
- Missing configuration values must not break features
- Configuration errors must be logged but not crash the app

## 📊 FEATURE MONITORING AND ANALYTICS

### **CONFIGURATION USAGE TRACKING**
```typescript
// Track which configuration options are used
export const trackConfigUsage = (featureName: string, configPath: string, value: any) => {
  analytics.track('feature_config_used', {
    feature: featureName,
    configPath,
    value: typeof value,
    timestamp: new Date().toISOString()
  });
};

// Track feature enable/disable events
export const trackFeatureToggle = (featureName: string, enabled: boolean) => {
  analytics.track('feature_toggled', {
    feature: featureName,
    enabled,
    timestamp: new Date().toISOString()
  });
};
```

### **PERFORMANCE MONITORING**
- Monitor feature performance impact
- Track configuration loading times
- Monitor feature-specific errors
- Track user interaction with configurable elements
- Alert on configuration-related issues

## 🎯 FEATURE EDITING BEST PRACTICES

### **USER-FRIENDLY CONFIGURATION**
- Provide visual configuration editors where possible
- Use descriptive names for configuration options
- Include helpful descriptions and examples
- Validate configuration inputs in real-time
- Provide preview functionality for changes

### **DEVELOPER-FRIENDLY FEATURES**
- Use TypeScript for all configuration interfaces
- Provide code completion for configuration options
- Include configuration examples in documentation
- Implement hot-reload for configuration changes
- Provide debugging tools for configuration issues

### **MAINTENANCE AND UPDATES**
- Regularly review and clean up unused configuration options
- Update documentation when configuration changes
- Test configuration changes across all supported scenarios
- Maintain backward compatibility for configuration files
- Plan migration strategies for breaking configuration changes

---

## 🚀 IMPLEMENTATION CHECKLIST

### **For Every New Feature:**
- [ ] Created proper directory structure under `/features/`
- [ ] Implemented comprehensive `config.json` with all customizable options
- [ ] All components use feature config hook
- [ ] All UI elements are configurable (colors, dimensions, text)
- [ ] All behavior is configurable (API settings, thresholds, toggles)
- [ ] Feature can be enabled/disabled without breaking the app
- [ ] Comprehensive README.md documentation created
- [ ] Configuration validation implemented
- [ ] Tests cover different configuration scenarios
- [ ] Feature integrates properly with existing features

### **For Feature Modifications:**
- [ ] Identified what new aspects need to be configurable
- [ ] Updated config.json schema with new options
- [ ] Updated components to use new configuration options
- [ ] Maintained backward compatibility with existing configs
- [ ] Updated documentation with new configuration options
- [ ] Tested with various configuration combinations
- [ ] Validated that changes don't break existing functionality

---

**Remember: The goal is to make every aspect of the TJV Recovery Platform easily customizable without requiring code changes. Every feature should be modular, configurable, and well-documented to enable rapid customization and iteration.**

