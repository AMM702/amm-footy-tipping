# AMM Footy Tipping

A web application for NRL and AFL tipping competitions with multi-state support.

## Features

- Multi-competition support (QLD, NSW, VIC, WA)
- User registration and authentication
- Weekly tipping for NRL/AFL games
- Live leaderboards
- Admin panel for managing games and scores
- Email notifications

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL database, Auth, Edge Functions)
- **Deployment**: GitHub Actions for automated database migrations

## Setup

### Prerequisites

- Node.js (for development dependencies)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- GitHub account with access to repository secrets

### Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your Supabase credentials:**
   
   Get these from your [Supabase Dashboard](https://supabase.com/dashboard):
   
   - `SUPABASE_PROJECT_ID`: Your project reference ID (found in Project Settings)
   - `SUPABASE_ACCESS_TOKEN`: Personal access token (generate at [Account Tokens](https://supabase.com/dashboard/account/tokens))
   - `SUPABASE_URL`: Your project URL (e.g., `https://xxxxx.supabase.co`)
   - `SUPABASE_ANON_KEY`: Your project's anon/public key (found in Project Settings > API)

3. **Configure VS Code MCP (if using Supabase MCP server):**
   
   Create `.vscode/mcp.json`:
   ```json
   {
     "servers": {
       "supabase amm-footy": {
         "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_ID",
         "type": "http"
       }
     },
     "inputs": []
   }
   ```
   
   Replace `YOUR_PROJECT_ID` with your actual project reference ID.

### Local Development

1. **Link to your Supabase project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

2. **Pull the current database schema:**
   ```bash
   supabase db pull
   ```

3. **Start local development:**
   ```bash
   # Run local Supabase instance (optional)
   supabase start
   
   # Serve your application
   # (Add your preferred development server command here)
   ```

## Database Management

This project uses Supabase migrations for database schema management. See `.github/instructions/supabase.instructions.md` for detailed workflow.

### Quick Commands

```bash
# Create a new migration
supabase migration new migration_name

# Test migration locally
supabase db push --dry-run

# Apply migration to production (via GitHub Actions)
git add supabase/migrations/XXX_migration_name.sql
git commit -m "feat(db): description"
git push origin main
```

### GitHub Secrets

For automated deployment, configure these secrets in your GitHub repository:

```bash
gh secret set SUPABASE_ACCESS_TOKEN
gh secret set SUPABASE_PROJECT_ID
```

## Project Structure

```
.
├── src/
│   ├── admin/          # Admin panel (user management, game data upload)
│   ├── footy_tipping/  # Main tipping interface
│   ├── login/          # Authentication pages
│   └── register/       # User registration
├── supabase/
│   ├── migrations/     # Database migrations (versioned)
│   └── schema/         # Reference schema (read-only)
├── .github/
│   ├── workflows/      # CI/CD pipelines
│   └── instructions/   # Development guidelines
└── dist/               # Compiled assets
```

## Security

⚠️ **Important**: Never commit sensitive information to the repository.

- `.env` files are gitignored
- Use GitHub Secrets for CI/CD credentials
- The `.vscode/mcp.json` file is gitignored (contains project references)
- Access tokens and API keys should be stored in `.env`

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

## License

[Add your license here]
