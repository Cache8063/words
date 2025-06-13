# Words

A modern, themeable word guessing game built for the AT Protocol ecosystem. Like Wordle, but endless and with beautiful themes.

## Features

- **Endless gameplay** - No daily limits
- **Multiple themes** - 5 beautiful color schemes including high contrast mode
- **Mobile optimized** - Touch-friendly responsive design
- **Multiple languages** - English, Romanian, Swedish, Dutch, and Nerdy dictionaries
- **Easy deployment** - Docker, Kubernetes, or bare metal
- **AT Protocol ready** - Built for decentralized social features

## Quick Start

### Docker (Recommended)

```bash
docker run -d -p 3333:80 ghcr.io/cache8063/words:latest
```

Visit http://localhost:3333

### Docker Compose

```yaml
version: '3.8'
services:
  words:
    image: ghcr.io/cache8063/words:latest
    ports:
      - "3333:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### Local Development

```bash
git clone https://github.com/Cache8063/words.git
cd words
npm install
npm start
```

## Themes

- **Default Dark** - Classic wordle colors
- **Blue Accent** - Cool ocean tones
- **Purple Violet** - Rich royal colors
- **Green Nature** - Fresh forest palette
- **High Contrast** - Accessibility focused

## Dictionaries

- **English** - Standard dictionary (2,500+ words)
- **Nerdy** - Tech and science terms (1,000+ words)
- **Romanian** - Cuvinte românești (1,500+ words)
- **Swedish** - Svenska ord (1,200+ words)
- **Dutch** - Nederlandse woorden (1,100+ words)

## Technology

- **Backend**: Node.js, Fastify
- **Frontend**: Vue.js 2, Bootstrap 5
- **Styling**: CSS Custom Properties for theming
- **Mobile**: Touch-optimized, responsive design
- **CI/CD**: GitHub Actions with container registry

## Deployment

Multiple deployment options available:

- [Docker Compose](docs/deploy/docker-compose.md)
- [Kubernetes](docs/deploy/kubernetes.md)
- [Railway](docs/deploy/railway.md)
- [Self-hosted](docs/deploy/self-hosted.md)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and development process.

### Branching Strategy

We use a tiered branching model for development:

- **`main`** - Production-ready code (protected)
- **`staging`** - Pre-production testing environment
- **`develop`** - Active development branch
- **`feature/*`** - New features (branch from develop)
- **`hotfix/*`** - Emergency fixes (branch from main)

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed workflow instructions.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## AT Protocol Integration

This application is designed to integrate with the AT Protocol ecosystem:

- Social game sharing and results
- Cross-platform leaderboards
- Game replay and analysis system
- Decentralized user authentication

## Development

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Cache8063/words.git
cd words

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm start
```

### Available Scripts

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build Docker image
docker build -t words .

# Run with Docker
docker run -d -p 3333:80 words
```

### Environment Configuration

Different environments use different configuration files:
- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Copy `.env.example` to `.env` for local development.

## Support

- **Issues**: Report bugs and request features via [GitHub Issues](https://github.com/Cache8063/words/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/Cache8063/words/discussions)

---

Made by [Cache8063](https://github.com/Cache8063)