# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (runs on port 3333 by default)
npm start

# Start with custom port
PORT=8080 npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode for TDD
npm run test:watch
```

### Docker
```bash
# Build Docker image
docker build -t word-mastermind .

# Run Docker container locally
docker run -d -p 3333:80 word-mastermind

# Run with docker-compose
docker compose up -d
```

## Architecture

### Backend (Node.js/Fastify)
- **src/server.js**: Fastify server with two main API endpoints:
  - `POST /game/start` - Initialize new game with selected dictionary
  - `POST /game/submit` - Submit word guess and receive feedback
- **src/game.js**: Core game logic including word validation and guess evaluation
- **src/dictionary.js**: Dictionary management for multiple languages
- Environment variables: `PORT` (default: 3333), `LISTEN_ADDRESS`, `TOTAL_ATTEMPTS` (default: 7)

### Frontend (Vue.js 2)
- **assets/index.html**: Main HTML with Vue app mount point
- **assets/client-app.js**: Vue.js application handling game UI, API calls, and theme switching
- **assets/style.css**: CSS with custom properties for 5 different color themes
- Uses Bootstrap 5 for responsive layout and Bootstrap Icons for UI elements

### Game State Management
The frontend maintains game state including:
- Current game ID and selected dictionary
- Grid of guesses with letter states (correct/present/absent)
- Keyboard state tracking used letters
- Theme preferences persisted in localStorage

### Dictionary System
Word lists stored in `/dict/` directory:
- English (`en-us-5`): 2,500+ words
- Nerdy (`nerdy`): 1,000+ tech/science terms
- Romanian (`ro-ro-5`, `ro-ro-6`): 1,500+ words
- Swedish (`sv-se-5`): 1,200+ words
- Dutch (`nl-nl-5`): 1,100+ words

## Testing Approach
Tests use Jest and are co-located with source files (`*.spec.js`). Test coverage includes:
- Game creation and word selection
- Guess validation and feedback logic
- Dictionary loading and word validation
- API endpoint behavior