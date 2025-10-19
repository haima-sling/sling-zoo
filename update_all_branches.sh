#!/bin/bash

# Update All Branches with Enhanced Features
# This script updates all branches with the merged sling-zoo features

branches=(
    "lion-kingdom"
    "penguin-parade"
    "giraffe-tower"
    "monkey-manor"
    "tiger-territory"
    "bear-forest"
    "zebra-plains"
    "hippo-haven"
    "rhino-ridge"
    "kangaroo-court"
    "panda-palace"
    "wolf-pack"
    "eagle-eyrie"
    "otter-otters"
    "seal-sanctuary"
    "dolphin-dome"
    "shark-tank"
    "turtle-terrace"
    "snake-serenity"
    "bird-aviary"
    "butterfly-garden"
    "reptile-realm"
    "amphibian-arcade"
    "insect-institute"
    "fish-fantasy"
    "coral-kingdom"
    "jellyfish-junction"
    "starfish-station"
    "seahorse-stable"
)

echo "Starting branch update process..."

for branch in "${branches[@]}"; do
    echo "Updating branch: $branch"
    
    # Checkout branch
    git checkout "$branch"
    
    # Merge enhanced features
    git merge merge-sling-zoo
    
    # Push updated branch
    git push origin "$branch"
    
    echo "Completed branch: $branch"
done

echo "All branches updated successfully!"
echo "Total branches updated: ${#branches[@]}"
