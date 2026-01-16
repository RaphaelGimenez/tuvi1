# Commit Changes

Commit all staged and unstaged changes following conventional commits and granularity rules.

## Instructions

1. Run `git status` to see all changed files (staged and unstaged)

2. Run `git diff` to understand what changed in each file

3. Analyze and group changes by logical unit:
   - Each group = one commit
   - Related files go together (e.g., feature + its test)
   - Unrelated changes must be separate commits

4. For each logical group, in order:
   - Stage only the files for that change: `git add <files>`
   - Commit with conventional commit message: `git commit -m "<type>(<scope>): <description>"`

5. After all commits, run `git log --oneline -10` to show the commits created

## Conventional Commit Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting (no code change)
- `refactor` - Code restructuring (no feature/fix)
- `perf` - Performance improvement
- `test` - Adding/updating tests
- `chore` - Build, deps, tooling
- `ci` - CI/CD changes

## Rules

- One logical change per commit
- Use scope when clear: `feat(auth):`, `fix(posts):`
- Keep description under 72 chars, lowercase, no period
- If a file has multiple unrelated changes, note this and ask how to proceed
- Never combine unrelated changes in one commit
