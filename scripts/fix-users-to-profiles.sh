#!/bin/bash

# Fix all references from 'users' table to 'profiles' table in services

echo "🔧 Fixing 'users' table references to 'profiles' table..."

# Update content-service.ts
sed -i '' "s/from('users')/from('profiles')/g" lib/services/content-service.ts

# Update realtime-chat-service.ts
sed -i '' "s/from('users')/from('profiles')/g" lib/services/realtime-chat-service.ts

# Update practice-service.ts
sed -i '' "s/from('users')/from('profiles')/g" lib/services/practice-service.ts

# Update saas-admin-service.ts
sed -i '' "s/from('users')/from('profiles')/g" lib/services/saas-admin-service.ts

# Fix references in API routes
sed -i '' "s/from('users')/from('profiles')/g" app/api/patients/route.ts

# Fix any users! references to profiles!
find lib/services -name "*.ts" -exec sed -i '' 's/users!/profiles!/g' {} \;
find app/api -name "*.ts" -exec sed -i '' 's/users!/profiles!/g' {} \;

echo "✅ Fixed all 'users' table references to 'profiles'"