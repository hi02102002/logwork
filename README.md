# Logwork

A CLI tool to manage and export work log reports from Linear.

## Features

- Fetch work logs from Linear comments
- Support multiple date formats (DD/MM/YYYY, DD/MM, DD-MM, YYYY-MM-DD)
- Multiple time range options (today, yesterday, 7 days, 30 days, custom)
- Interactive mode by default
- Auto-format for Slack in markdown code blocks
- Beautiful display with colors and hour summaries

## Installation

```bash
# Clone repository
git clone <repo-url>
cd logwork

# Install dependencies
pnpm install

# Build
pnpm build

# Link globally to use anywhere
pnpm link --global
```

## Configuration

Create a `.env` file in one of the following locations (in priority order):

1. **`~/.config/logwork/.env`** (recommended)
2. **`~/.logwork/.env`**
3. **`.env`** in current directory

```env
LINEAR_API_KEY=your_linear_api_key_here
```

Get your Linear API key at: https://linear.app/settings/api

### Quick Setup

```bash
# Create config folder
mkdir -p ~/.config/logwork

# Create .env file
echo "LINEAR_API_KEY=your_key_here" > ~/.config/logwork/.env
```

## Usage

### Interactive Mode (Default)

```bash
logwork
```

Will display a menu to choose:
- Today
- Yesterday
- Last 2 days
- Last 7 days
- Last 30 days
- Last 2 weeks
- Custom date range

### Command Line Options

```bash
# View today's logs
logwork --today

# View yesterday's logs
logwork --yesterday

# View last 7 days logs
logwork --range 7d

# View last 2 days logs
logwork --range 2d

# View last 30 days logs
logwork --range 30d

# View last 2 weeks logs
logwork --range 2w

# View logs from specific date to today
logwork --from 25/12/2025

# View logs in date range
logwork --from 20/12/2025 --to 30/12/2025

# Supported date formats
logwork --from 2025-12-20 --to 2025-12-30
logwork --from 20/12/2025 --to 30/12/2025
logwork --from 20-12-2025 --to 30-12-2025
```

## Work Log Format in Linear

For the CLI to recognize work logs, comments in Linear should follow these formats:

```
log 2h
log work 3.5h
worklog: 4h
logged 1.5h
```

Optional: Add specific date (if not provided, comment creation date will be used):

```
25/12/2025 log 2h
log 3h 26/12/2025
```

## Output

### 1. Detailed Format

```
29/12/2025:
  https://linear.app/workspace/issue/NOW-23531: 2h
  https://linear.app/workspace/issue/NOW-23724: 1.5h
  Daily total: 3.5h

30/12/2025:
  https://linear.app/workspace/issue/NOW-23935: 3h
  Daily total: 3h

Total hours: 6.5h
```

### 2. Slack Format (ready to copy)

```
Format for Slack (copy below):
29/12/2025
```
https://linear.app/workspace/issue/NOW-23531
https://linear.app/workspace/issue/NOW-23724
```

30/12/2025
```
https://linear.app/workspace/issue/NOW-23935
```
```

## Project Structure

```
src/
├── index.ts                 # Entry point & CLI setup
├── constants.ts            # Regex patterns & constants
├── env.ts                  # Environment configuration
├── linear.ts               # Linear API client
├── funcs/
│   └── get-work-logs.ts   # Core logic for fetching & grouping logs
└── utils/
    ├── index.ts           # Re-export all utils
    ├── cli-handler.ts     # CLI options handler
    ├── date-parser.ts     # Parse dates & date ranges
    ├── date-utils.ts      # Date extraction from text
    ├── display.ts         # Display & formatting
    ├── interactive.ts     # Interactive mode
    ├── regex-utils.ts     # Regex matching & extraction
    └── url-utils.ts       # Linear URL processing
```

## Development

```bash
# Run in dev mode
pnpm dev

# Build
pnpm build

# Type check
pnpm typecheck

# Format & lint
pnpm check
```

## Scripts

- `pnpm build` - Build project
- `pnpm dev` - Watch mode
- `pnpm typecheck` - Type checking
- `pnpm check` - Format & lint with Biome
- `pnpm start` - Run built version

## Contributing

Pull requests are welcome!

## License

MIT
