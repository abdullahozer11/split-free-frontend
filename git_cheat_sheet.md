# Git Cheat Sheet

## Setup
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## Create Repo
```bash
git init
git clone <url>
```

## Basic Commands
```bash
git status       # Check changes
git add <file>   # Stage file
git commit -m "Message"
git push         # Push to remote
git pull         # Fetch & merge
```

## Branching
```bash
git branch <name>   # Create branch
git checkout <name> # Switch branch
git merge <name>    # Merge branch
```

## Undo Changes
```bash
git reset --hard    # Discard all changes
git checkout -- <file> # Restore file
```

## Stash
```bash
git stash           # Save work
git stash pop       # Restore work
```

## Log
```bash
git log --oneline --graph --decorate --all
```
