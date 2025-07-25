# Claude Code Subagents for Healthcare Platform

This directory contains specialized subagents configured for the healthcare platform project. These subagents provide focused expertise in specific areas of the application.

## Available Subagents

### 1. healthcare-database-expert
**Purpose**: Database architecture and Supabase RLS specialist
**Use when**:
- Designing new database schemas
- Implementing Row Level Security policies
- Optimizing database queries
- Ensuring HIPAA compliance in data models

**Example usage**:
```
"I need help designing a secure multi-tenant schema for patient data"
"Review my RLS policies for the messages table"
```

### 2. supabase-specialist
**Purpose**: Supabase platform configuration and optimization
**Use when**:
- Setting up authentication flows
- Configuring real-time subscriptions
- Writing edge functions
- Debugging Supabase-specific issues

**Example usage**:
```
"Help me set up magic link authentication with custom claims"
"Optimize our real-time chat subscriptions for scale"
```

### 3. nextjs-performance-optimizer
**Purpose**: Next.js 14+ performance and optimization
**Use when**:
- Improving page load times
- Optimizing bundle sizes
- Implementing proper caching strategies
- Setting up Server Components

**Example usage**:
```
"Analyze and improve the performance of our patient dashboard"
"Help me implement proper code splitting for the chat interface"
```

### 4. test-automation-specialist
**Purpose**: Comprehensive testing strategy and implementation
**Use when**:
- Writing E2E tests for critical flows
- Setting up test infrastructure
- Improving test coverage
- Testing HIPAA compliance

**Example usage**:
```
"Create E2E tests for the patient invitation flow"
"Help me set up component testing for our chat interface"
```

## How Subagents Work

1. **Automatic Invocation**: Claude Code will automatically delegate to the appropriate subagent based on your request context.

2. **Explicit Invocation**: You can explicitly request a specific subagent by mentioning it:
   - "Ask the healthcare-database-expert about..."
   - "Have the supabase-specialist review..."

3. **Focused Context**: Each subagent operates in its own context window with specialized knowledge and limited tool access for efficiency.

## GitHub Integration

The `.github/workflows/claude-code.yml` workflow is configured to use these subagents in CI/CD:
- Database changes trigger healthcare-database-expert review
- Supabase configuration changes trigger supabase-specialist validation
- Performance impacts are analyzed by nextjs-performance-optimizer
- Test coverage is reviewed by test-automation-specialist

## Adding New Subagents

To add a new subagent:

1. Create a new `.md` file in `.claude/agents/`
2. Add YAML frontmatter with:
   - `name`: Unique identifier
   - `description`: Purpose and expertise
   - `tools`: Comma-separated list of allowed tools
3. Write a detailed system prompt describing the agent's expertise

Example:
```markdown
---
name: security-auditor
description: Security and compliance specialist for healthcare applications
tools: Read, Grep, Glob
---

You are a security expert specializing in healthcare applications...
```

## Best Practices

1. **Use subagents for complex, focused tasks** - They excel at specialized problems
2. **Provide context** - Include relevant code snippets or error messages
3. **Be specific** - Clear questions get better responses
4. **Chain subagents** - Complex problems may benefit from multiple specialists

## Troubleshooting

If a subagent isn't working as expected:
1. Check the agent file exists in `.claude/agents/`
2. Verify the YAML frontmatter is valid
3. Ensure the requested tools are properly listed
4. Try explicitly invoking the subagent by name