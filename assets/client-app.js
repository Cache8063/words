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
        availableThemes: [
            {
                id: 'default',
                name: 'Default Dark',
                preview: {
                    background: 'linear-gradient(45deg, #121213 50%, #538d4e 50%)'
                }
            },
            {
                id: 'blue',
                name: 'Blue Accent',
                preview: {
                    background: 'linear-gradient(45deg, #0f1419 50%, #4299e1 50%)'
                }
            },
            {
                id: 'purple',
                name: 'Purple Violet',
                preview: {
                    background: 'linear-gradient(45deg, #1a1625 50%, #9f7aea 50%)'
                }
            },
            {
                id: 'green',
                name: 'Green Nature',
                preview: {
                    background: 'linear-gradient(45deg, #0f1f0f 50%, #48bb78 50%)'
                }
            },
            {
                id: 'contrast',
                name: 'High Contrast',
                preview: {
                    background: 'linear-gradient(45deg, #000000 50%, #00ff00 50%)'
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
                    dictName: queryStringParams.dictName
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

            console.log(this.gameState)
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

        // Theme System Methods
        toggleThemeMenu: function() {
            this.showThemeMenu = !this.showThemeMenu;
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
        }

    },

    mounted: function() {
        // Initialize theme first
        this.initializeTheme();
        
        // Set dark mode
        this.darkMode = true;
        document.querySelector("body").classList.add("dark");
        
        this.startGame();

        document.addEventListener("keyup", async (e) => {
            if (e.ctrlKey || e.altKey || e.metaKey) {
                return
            }
            await this.handleNewLetter(e.key.toUpperCase());
        });

        // Close theme menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-selector')) {
                this.showThemeMenu = false;
            }
        });

        if (isDarkModePreferred()) {
            this.toggleDarkMode();
        }
    },
})