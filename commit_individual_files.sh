#!/bin/bash

# Script to create individual commits for each file in files/ directory
# and push to challenge branch

echo "🚀 Starting individual file commits..."

# Change to files directory
cd files

# Get all files (excluding directories)
files=($(find . -type f -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.sh" | sort))

echo "📁 Found ${#files[@]} files to commit"

# Commit each file individually
for file in "${files[@]}"; do
    # Remove leading ./ from filename
    clean_file="${file#./}"
    
    echo "📝 Committing: $clean_file"
    
    # Add and commit the specific file
    git add "$file"
    git commit -m "feat: add $clean_file

- Individual commit for $clean_file
- Part of files directory organization
- Enhances zoo management system functionality"
    
    echo "✅ Committed: $clean_file"
done

# Handle config directory files separately
echo "📁 Committing config directory files..."

# Database configs
git add config/development/database.js
git commit -m "config: add development database configuration

- Database configuration for development environment
- Part of files directory organization
- Enhances zoo management system database setup"

git add config/production/database.js
git commit -m "config: add production database configuration

- Database configuration for production environment
- Part of files directory organization
- Enhances zoo management system database setup"

git add config/testing/database.js
git commit -m "config: add testing database configuration

- Database configuration for testing environment
- Part of files directory organization
- Enhances zoo management system database setup"

echo "🎉 All individual commits completed!"
echo "📊 Total commits created: $((${#files[@]} + 3))"
