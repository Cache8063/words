// Debug: Check if Vue is loaded
console.log('Vue loaded:', typeof Vue !== 'undefined' ? 'Yes' : 'No');
console.log('Vue version:', typeof Vue !== 'undefined' ? Vue.version : 'Not loaded');

const parseQueryString = () => {
    const queryString = window.location.search;
    const query = {};
    const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
};

const queryStringParams = parseQueryString();

const isDarkModePreferred = () => {
    for (const cookie of document.cookie.split("; ")) {
        const [name, value] = cookie.split("=");
        if (name === "darkMode" && value === "true") {
            return true;
        } else if (name === "darkMode" && value === "false") {
            return false;
        }
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
    }

    return true; // Default to dark mode
};

const getStoredTheme = () => {
    for (const cookie of document.cookie.split("; ")) {
        const [name, value] = cookie.split("=");
        if (name === "selectedTheme") {
            return value;
        }
    }
    return 'default'; // Default theme
};

// Wait for DOM to be ready before initializing Vue
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Vue app...');
    
    // Add a try-catch to see any errors
    try {
        const app = new Vue({
            el: "#app",

            data: {
                allowedLetters: new Set("QWERTYUIOPASDFGHJKLZXCVBNM"),
                keyboard: [
                    [..."QWERTYUIOP"],
                    [..."ASDFGHJKL"],
                    ["ENTER", ..."ZXCVBNM", "⌫ "],
                ],

                gameState: undefined,
                error: undefined,
                darkMode: true,
                currentTheme: 'default',
                showThemeMenu: false,
                showDictionaryMenu: false,
                currentDictionary: { id: 'en-us-5', name: 'English' },
                availableDictionaries: [
                    {
                        id: 'en-us-5',
                        name: 'English',
                        description: 'Standard English words',
                        wordCount: '2,500+'
                    },
                    {
                        id: 'nerdy',
                        name: 'Nerdy',
                        description: 'Tech & science terms',
                        wordCount: '1,000+'
                    },
                    {
                        id: 'ro-ro-5',
                        name: 'Romanian',
                        description: 'Cuvinte românești',
                        wordCount: '1,500+'
                    },
                    {
                        id: 'sv-se-5',
                        name: 'Swedish',
                        description: 'Svenska ord',
                        wordCount: '1,200+'
                    },
                    {
                        id: 'nl-nl-5',
                        name: 'Dutch',
                        description: 'Nederlandse woorden',
                        wordCount: '1,100+'
                    }
                ],
                // Authentication state
                authState: {
                    user: null,
                    loading: false,
                    error: null
                },
                showLoginModal: false,
                showUserMenu: false,
                loginForm: {
                    identifier: '',
                    password: '',
                    useCustomService: false,
                    service: ''
                },
                
                availableThemes: [
                    {
                        id: 'default',
                        name: 'Default Dark',
                        preview: {
                            background: 'linear-gradient(45deg, #121213 50%, #538d4e 50%)'
                        },
                        colors: {
                            correct: '#538d4e',
                            present: '#b59f3b', 
                            absent: '#3a3a3c'
                        }
                    },
                    {
                        id: 'blue',
                        name: 'Blue Accent',
                        preview: {
                            background: 'linear-gradient(45deg, #0f1419 50%, #4299e1 50%)'
                        },
                        colors: {
                            correct: '#4299e1',
                            present: '#ed8936',
                            absent: '#2d3748'
                        }
                    },
                    {
                        id: 'purple',
                        name: 'Purple Violet',
                        preview: {
                            background: 'linear-gradient(45deg, #1a1625 50%, #9f7aea 50%)'
                        },
                        colors: {
                            correct: '#9f7aea',
                            present: '#f6ad55',
                            absent: '#553c9a'
                        }
                    },
                    {
                        id: 'green',
                        name: 'Green Nature',
                        preview: {
                            background: 'linear-gradient(45deg, #0f1f0f 50%, #48bb78 50%)'
                        },
                        colors: {
                            correct: '#48bb78',
                            present: '#ed8936',
                            absent: '#2d4a2d'
                        }
                    },
                    {
                        id: 'contrast',
                        name: 'High Contrast',
                        preview: {
                            background: 'linear-gradient(45deg, #000000 50%, #00ff00 50%)'
                        },
                        colors: {
                            correct: '#00ff00',
                            present: '#ffff00',
                            absent: '#333333'
                        }
                    }
                ]
            },

            methods: {

                startGame: async function() {
                    const response = await fetch("/game/start", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            dictName: this.currentDictionary.id
                        })
                    });
                    const newGameData = await response.json();
                    const {id, totalAttempts, wordLength} = newGameData;
                    this.gameState = {
                        id,
                        totalAttempts,
                        wordLength,
                        currentAttempt: 0,
                        board: [],
                        wrongKeys: new Set(),
                        presentKeys: new Set(),
                        correctKeys: new Set(),
                        finished: false,
                        won: false,
                        revealedWord: undefined
                    }

                    for (let i = 0; i < totalAttempts; i++) {
                        const row = [];
                        this.gameState.board.push(row);
                        for (let j = 0; j < wordLength; j++) {
                            row.push({
                                letter: undefined,
                                result: undefined
                            });
                        }
                    }

                    console.log(`Started new game with ${this.currentDictionary.name} dictionary`)
                },

                handleNewLetter: async function(key) {
                    if (key === "ENTER" && this.gameState && this.gameState.finished) {
                        this.startGame();
                    }

                    if (!this.gameState || this.gameState.finished) {
                        return;
                    }

                    if (key === "ENTER") {
                        await this.submitWord();
                    } else if (key === "⌫ " || key === "BACKSPACE") {
                        this.deleteLetter();
                    } else {
                        this.addLetter(key);
                    }
                },

                addLetter: function(letter) {
                    letter = (letter || "").toUpperCase();
                    if (!this.allowedLetters.has(letter)) {
                        return;
                    }

                    const {board, currentAttempt} = this.gameState;
                    const row = board[currentAttempt];
                    for (const tile of row) {
                        if (tile.letter === undefined) {
                            tile.letter = letter;
                            break;
                        }
                    }
                },

                deleteLetter: function() {
                    const {board, currentAttempt} = this.gameState;
                    const row = board[currentAttempt];
                    let lastTile;
                    for (const tile of row) {
                        if (tile.letter !== undefined) {
                            lastTile = tile;
                        } else {
                            break;
                        }
                    }
                    if (lastTile) {
                        lastTile.letter = undefined;
                    }
                },

                submitWord: async function() {
                    const {id, board, currentAttempt} = this.gameState;
                    const row = board[currentAttempt];
                    let guess = "";
                    for (const tile of row) {
                        if (tile.letter) {
                            guess += tile.letter;
                        } else {
                            return;
                        }
                    }

                    const response = await fetch("/game/submit", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            id: this.gameState.id,
                            guess,
                        })
                    });

                    const data = await response.json();

                    if (data.error) {
                        console.warn(data.error);
                        this.error = data.error;
                        window.setTimeout(() => {
                            this.error = undefined;
                        }, 1000);
                        return;
                    }

                    const {result} = data;

                    if (result) {
                        for (let i = 0; i < row.length; i++) {
                            const tile = row[i];
                            const tileResult = result[i];

                            if (tileResult === "2") {
                                tile.result = "correct";
                                this.gameState.correctKeys.add(tile.letter);
                                this.gameState.presentKeys.delete(tile.letter);
                            } else if (tileResult === "1") {
                                tile.result = "present";
                                if (!this.gameState.correctKeys.has(tile.letter)) {
                                    this.gameState.presentKeys.add(tile.letter);
                                }
                            } else {
                                this.gameState.wrongKeys.add(tile.letter);
                            }
                        }
                    }

                    if (data.won) {
                        this.gameState.finished = true;
                        this.gameState.won = true;
                        return;
                    }

                    if (data.finished) {
                        this.gameState.revealedWord = data.word;
                        this.gameState.finished = true;
                        return;
                    }

                    this.gameState.currentAttempt++;
                    const rowDom = document.getElementById(`board-row-${this.gameState.currentAttempt}`);
                    if (rowDom) {
                        if (rowDom.scrollIntoViewIfNeeded) {
                            rowDom.scrollIntoViewIfNeeded();
                        } else {
                            rowDom.scrollIntoView();
                        }
                    }
                },

                classForKey: function(key) {
                    return {
                        btn: true,
                        key: true,
                        right: this.gameState && this.gameState.correctKeys.has(key),
                        present: this.gameState && this.gameState.presentKeys.has(key),
                        wrong: this.gameState && this.gameState.wrongKeys.has(key),
                    };
                },

                formatKeyLabel: function(key) {
                    if (key === "⌫ ") return "⌫";
                    if (key === "ENTER") return "ENTER";
                    return key;
                },

                // Dictionary System Methods
                toggleDictionaryMenu: function() {
                    this.showDictionaryMenu = !this.showDictionaryMenu;
                    // Close theme menu if open
                    this.showThemeMenu = false;
                },

                selectDictionary: function(dictId) {
                    const selectedDict = this.availableDictionaries.find(d => d.id === dictId);
                    if (selectedDict) {
                        this.currentDictionary = selectedDict;
                        this.showDictionaryMenu = false;
                        
                        // Save dictionary preference
                        document.cookie = `selectedDictionary=${dictId}; path=/; max-age=31536000`;
                        
                        // Start new game with selected dictionary
                        this.startGame();
                    }
                },

                initializeDictionary: function() {
                    // Check URL parameter first
                    if (queryStringParams.dictName) {
                        const urlDict = this.availableDictionaries.find(d => d.id === queryStringParams.dictName);
                        if (urlDict) {
                            this.currentDictionary = urlDict;
                            return;
                        }
                    }
                    
                    // Check stored preference
                    for (const cookie of document.cookie.split("; ")) {
                        const [name, value] = cookie.split("=");
                        if (name === "selectedDictionary") {
                            const storedDict = this.availableDictionaries.find(d => d.id === value);
                            if (storedDict) {
                                this.currentDictionary = storedDict;
                                return;
                            }
                        }
                    }
                    
                    // Default to English
                    this.currentDictionary = this.availableDictionaries[0];
                },

                // Theme System Methods
                toggleThemeMenu: function() {
                    this.showThemeMenu = !this.showThemeMenu;
                    // Close dictionary menu if open
                    this.showDictionaryMenu = false;
                },

                selectTheme: function(themeId) {
                    this.currentTheme = themeId;
                    this.applyTheme(themeId);
                    this.showThemeMenu = false;
                    
                    // Save theme preference
                    document.cookie = `selectedTheme=${themeId}; path=/; max-age=31536000`; // 1 year
                },

                applyTheme: function(themeId) {
                    const body = document.body;
                    const container = document.getElementById('app');
                    
                    // Remove existing theme classes
                    body.removeAttribute('data-theme');
                    if (container) {
                        container.removeAttribute('data-theme');
                    }
                    
                    // Apply new theme
                    if (themeId !== 'default') {
                        body.setAttribute('data-theme', themeId);
                        if (container) {
                            container.setAttribute('data-theme', themeId);
                        }
                    }
                },

                initializeTheme: function() {
                    const storedTheme = getStoredTheme();
                    this.currentTheme = storedTheme;
                    this.applyTheme(storedTheme);
                    
                    // Force dark mode immediately to prevent light mode flash
                    document.querySelector("body").classList.add("dark");
                    this.darkMode = true;
                },

                toggleDarkMode: function() {
                    this.darkMode = !this.darkMode;
                    const body = document.querySelector("body");
                    if (this.darkMode) {
                        body.classList.add("dark");
                    } else {
                        body.classList.remove("dark");
                    }
                    document.cookie = `darkMode=${this.darkMode}`;
                },

                // Authentication methods
                toggleUserMenu: function() {
                    this.showUserMenu = !this.showUserMenu;
                },

                handleLogin: async function() {
                    this.authState.loading = true;
                    this.authState.error = null;
                    
                    try {
                        const payload = {
                            identifier: this.loginForm.identifier,
                            password: this.loginForm.password
                        };
                        
                        if (this.loginForm.useCustomService && this.loginForm.service) {
                            payload.service = this.loginForm.service;
                        }
                        
                        const response = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                            throw new Error(data.error || 'Login failed');
                        }
                        
                        this.authState.user = data.user;
                        this.showLoginModal = false;
                        
                        // Reset form
                        this.loginForm = {
                            identifier: '',
                            password: '',
                            useCustomService: false,
                            service: ''
                        };
                        
                    } catch (error) {
                        this.authState.error = error.message;
                    } finally {
                        this.authState.loading = false;
                    }
                },

                logout: async function() {
                    try {
                        await fetch('/api/auth/logout', {
                            method: 'POST'
                        });
                        
                        this.authState.user = null;
                        this.showUserMenu = false;
                    } catch (error) {
                        console.error('Logout error:', error);
                    }
                },

                checkSession: async function() {
                    try {
                        const response = await fetch('/api/auth/session');
                        
                        if (response.ok) {
                            const data = await response.json();
                            this.authState.user = data.user;
                        }
                    } catch (error) {
                        console.error('Session check error:', error);
                    }
                },

                viewStats: function() {
                    // TODO: Implement stats view
                    console.log('View stats - coming soon!');
                    this.showUserMenu = false;
                }

            },

            mounted: function() {
                // Initialize dictionary and theme first
                this.initializeDictionary();
                this.initializeTheme();
                
                // Set dark mode
                this.darkMode = true;
                document.querySelector("body").classList.add("dark");
                
                // Check authentication session
                this.checkSession();
                
                this.startGame();

                document.addEventListener("keyup", async (e) => {
                    if (e.ctrlKey || e.altKey || e.metaKey) {
                        return
                    }
                    await this.handleNewLetter(e.key.toUpperCase());
                });

                // Close menus when clicking outside
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.theme-selector')) {
                        this.showThemeMenu = false;
                    }
                    if (!e.target.closest('.dictionary-selector')) {
                        this.showDictionaryMenu = false;
                    }
                    if (!e.target.closest('.user-menu')) {
                        this.showUserMenu = false;
                    }
                });

                if (isDarkModePreferred()) {
                    this.toggleDarkMode();
                }
            },
        });
        
        console.log('Vue app initialized successfully');
        
    } catch (error) {
        console.error('Vue initialization error:', error);
    }
});