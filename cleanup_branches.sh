#!/bin/bash

# Cleanup All Branches Script
# This script removes files from other branches and keeps only branch-specific files

branches=(
    "elephant-exhibit"
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

echo "Starting branch cleanup process..."

for branch in "${branches[@]}"; do
    echo "Cleaning up branch: $branch"
    
    # Checkout branch
    git checkout "$branch"
    
    # Remove all files that don't belong to this branch
    case "$branch" in
        "elephant-exhibit")
            # Keep only elephant files
            find src/exhibits/ -name "*.js" ! -name "elephant-*" -delete
            ;;
        "lion-kingdom")
            # Keep only lion files
            find src/exhibits/ -name "*.js" ! -name "lion-*" -delete
            ;;
        "penguin-parade")
            # Keep only penguin files
            find src/exhibits/ -name "*.js" ! -name "penguin-*" -delete
            ;;
        "giraffe-tower")
            # Keep only giraffe files
            find src/exhibits/ -name "*.js" ! -name "giraffe-*" -delete
            ;;
        "monkey-manor")
            # Keep only monkey files
            find src/exhibits/ -name "*.js" ! -name "monkey-*" -delete
            ;;
        "tiger-territory")
            # Keep only tiger files
            find src/exhibits/ -name "*.js" ! -name "tiger-*" -delete
            ;;
        "bear-forest")
            # Keep only bear files
            find src/exhibits/ -name "*.js" ! -name "bear-*" -delete
            ;;
        "zebra-plains")
            # Keep only zebra files
            find src/exhibits/ -name "*.js" ! -name "zebra-*" -delete
            ;;
        "hippo-haven")
            # Keep only hippo files
            find src/exhibits/ -name "*.js" ! -name "hippo-*" -delete
            ;;
        "rhino-ridge")
            # Keep only rhino files
            find src/exhibits/ -name "*.js" ! -name "rhino-*" -delete
            ;;
        "kangaroo-court")
            # Keep only kangaroo files
            find src/exhibits/ -name "*.js" ! -name "kangaroo-*" -delete
            ;;
        "panda-palace")
            # Keep only panda files
            find src/exhibits/ -name "*.js" ! -name "panda-*" -delete
            ;;
        "wolf-pack")
            # Keep only wolf files
            find src/exhibits/ -name "*.js" ! -name "wolf-*" -delete
            ;;
        "eagle-eyrie")
            # Keep only eagle files
            find src/exhibits/ -name "*.js" ! -name "eagle-*" -delete
            ;;
        "otter-otters")
            # Keep only otter files
            find src/exhibits/ -name "*.js" ! -name "otter-*" -delete
            ;;
        "seal-sanctuary")
            # Keep only seal files
            find src/exhibits/ -name "*.js" ! -name "seal-*" -delete
            ;;
        "dolphin-dome")
            # Keep only dolphin files
            find src/exhibits/ -name "*.js" ! -name "dolphin-*" -delete
            ;;
        "shark-tank")
            # Keep only shark files
            find src/exhibits/ -name "*.js" ! -name "shark-*" -delete
            ;;
        "turtle-terrace")
            # Keep only turtle files
            find src/exhibits/ -name "*.js" ! -name "turtle-*" -delete
            ;;
        "snake-serenity")
            # Keep only snake files
            find src/exhibits/ -name "*.js" ! -name "snake-*" -delete
            ;;
        "bird-aviary")
            # Keep only bird files
            find src/exhibits/ -name "*.js" ! -name "bird-*" -delete
            ;;
        "butterfly-garden")
            # Keep only butterfly files
            find src/exhibits/ -name "*.js" ! -name "butterfly-*" -delete
            ;;
        "reptile-realm")
            # Keep only reptile files
            find src/exhibits/ -name "*.js" ! -name "reptile-*" -delete
            ;;
        "amphibian-arcade")
            # Keep only amphibian files
            find src/exhibits/ -name "*.js" ! -name "amphibian-*" -delete
            ;;
        "insect-institute")
            # Keep only insect files
            find src/exhibits/ -name "*.js" ! -name "insect-*" -delete
            ;;
        "fish-fantasy")
            # Keep only fish files
            find src/exhibits/ -name "*.js" ! -name "fish-*" -delete
            ;;
        "coral-kingdom")
            # Keep only coral files
            find src/exhibits/ -name "*.js" ! -name "coral-*" -delete
            ;;
        "jellyfish-junction")
            # Keep only jellyfish files
            find src/exhibits/ -name "*.js" ! -name "jellyfish-*" -delete
            ;;
        "starfish-station")
            # Keep only starfish files
            find src/exhibits/ -name "*.js" ! -name "starfish-*" -delete
            ;;
        "seahorse-stable")
            # Keep only seahorse files
            find src/exhibits/ -name "*.js" ! -name "seahorse-*" -delete
            ;;
    esac
    
    # Commit the cleanup
    git add .
    git commit -m "Clean up $branch branch: Remove files from other branches, keep only $branch-specific files"
    
    # Force push the cleaned branch
    git push --force origin "$branch"
    
    echo "Completed cleanup for branch: $branch"
done

echo "All branches cleaned up successfully!"
echo "Total branches cleaned: ${#branches[@]}"
