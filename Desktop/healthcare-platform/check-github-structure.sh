#!/bin/bash

# Check GitHub Repository Structure
echo "🔍 Checking GitHub Repository Structure"
echo "======================================"

# Use GitHub API to check repository structure
echo "📡 Fetching repository contents from GitHub API..."

# Check root directory
curl -s https://api.github.com/repos/yndrdev/totalrecover/contents/ | python3 -c "
import json, sys
data = json.load(sys.stdin)
if isinstance(data, list):
    print('\\n📁 Root directory contents:')
    print('-' * 40)
    for item in data:
        icon = '📁' if item['type'] == 'dir' else '📄'
        print(f'{icon} {item[\"name\"]}')
    
    # Check if Desktop folder exists
    desktop_exists = any(item['name'] == 'Desktop' for item in data)
    package_exists = any(item['name'] == 'package.json' for item in data)
    
    print('\\n📊 Analysis:')
    if desktop_exists and not package_exists:
        print('❌ Files are nested in Desktop folder')
        print('   → Need to restructure repository')
    elif package_exists:
        print('✅ package.json found at root level')
        print('   → Repository structure is correct!')
    else:
        print('⚠️  Unexpected structure - no package.json found')
else:
    print('❌ Error:', data.get('message', 'Unknown error'))
"

echo ""
echo "🔗 Direct Links to Check:"
echo "   Root: https://github.com/yndrdev/totalrecover"
echo "   Package.json (if at root): https://github.com/yndrdev/totalrecover/blob/main/package.json"
echo "   Package.json (if nested): https://github.com/yndrdev/totalrecover/blob/main/Desktop/healthcare-platform/package.json"