Words

A modern word guessing game inspired by Wordle, featuring multiple themes and endless gameplay.
✨ Features

    Endless gameplay - Play as many games as you want
    Multiple themes - 5 beautiful color schemes including high contrast mode
    Mobile optimized - Perfect touch experience on all devices
    Multiple languages - Support for different dictionaries
    Responsive design - Works seamlessly on desktop and mobile
    Dark mode by default - Easy on the eyes

🎨 Themes

    Default Dark - Classic wordle colors
    Blue Accent - Cool blue tones
    Purple Violet - Rich purple hues
    Green Nature - Natural green palette
    High Contrast - Accessibility-focused design

🚀 Quick Start
Using Docker

bash

docker run -d -p 3333:80 words:latest

Local Development

bash

# Clone the repository
git clone https://gitea.cloudforest-basilisk.ts.net/Arcnode.xyz/words.git
cd words

# Install dependencies
npm install

# Start the server
npm start

# Open http://localhost:3333

🎮 How to Play

    Guess the word - Enter a 5-letter word
    Get feedback - Letters are colored based on correctness:
        🟩 Green - Correct letter in correct position
        🟨 Yellow - Correct letter in wrong position
        ⬛ Gray - Letter not in the word
    Win the game - Guess the word in 6 tries or less!

🌍 Supported Languages

    English (en-us-5)
    Romanian (ro-ro-5, ro-ro-6)
    Swedish (sv-se-5)
    Dutch (nl-nl-5)

🛠️ Technology Stack

    Backend: Node.js, Fastify
    Frontend: Vue.js 2, Bootstrap 5
    Styling: CSS Custom Properties for theming
    Icons: Bootstrap Icons
    Mobile: Touch-optimized, responsive design

📱 Mobile Features

    No zoom on button taps
    Large touch targets (44px+)
    Landscape mode support
    Responsive tile sizing
    Optimized keyboard layout

🔧 Configuration

You can customize the game by adding URL parameters:

    ?dictName=ro-ro-5 - Use Romanian dictionary
    ?dictName=sv-se-5 - Use Swedish dictionary

🐳 Docker

bash

# Build from source
docker build -t words .

# Run container
docker run -d -p 3333:80 words

# Using docker-compose
docker-compose up -d

🎯 Development

bash

# Run tests
npm test

# Watch mode
npm run test:watch

# Start development server
npm start

📄 License

MIT License - feel free to use this project for anything!
🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
🔮 Future Features

    AT Protocol integration for social features
    Leaderboards and statistics
    Game replay system
    More language packs
    Custom word lists

