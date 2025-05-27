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

    // If no cookie for dark mode exists fallback to CSS Media-Queries for system-wide dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
    }

    // Default to dark mode
    return true;
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
        currentTheme: 'dark'
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
                absentKeys: new Set(),
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
            if (key === "ENTER" && this.gameState?.finished) {
                this.startGame();
                return;
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
                }, 1500);
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
                        // Remove from present keys if it was there
                        this.gameState.presentKeys.delete(tile.letter);
                    } else if (tileResult === "1") {
                        tile.result = "present";
                        // Only add to present if not already in correct
                        if (!this.gameState.correctKeys.has(tile.letter)) {
                            this.gameState.presentKeys.add(tile.letter);
                        }
                    } else {
                        this.gameState.absentKeys.add(tile.letter);
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
                // In case of many attemps, if there's a scrollbar
                // make sure the current row is visible.
                if (rowDom.scrollIntoViewIfNeeded) {
                    rowDom.scrollIntoViewIfNeeded();
                } else {
                    rowDom.scrollIntoView();
                }
            }
        },

        classForKey: function(key) {
            const baseClasses = {
                btn: true,
                key: true
            };
            
            if (key === "ENTER") {
                baseClasses.enter = true;
            } else if (key === "⌫ ") {
                baseClasses.backspace = true;
            }
            
            if (this.gameState) {
                if (this.gameState.correctKeys.has(key)) {
                    baseClasses.correct = true;
                } else if (this.gameState.presentKeys.has(key)) {
                    baseClasses.present = true;
                } else if (this.gameState.absentKeys.has(key)) {
                    baseClasses.absent = true;
                }
            }
            
            return baseClasses;
        },

        formatKeyLabel: function(key) {
            if (key === "⌫ ") return "⌫";
            if (key === "ENTER") return "ENTER";
            return key;
        },

        toggleTheme: function() {
            // Placeholder for theme switching - Phase 2
            console.log('Theme toggle clicked - Phase 2 feature');
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
        this.startGame();

        document.addEventListener("keyup", async (e) => {
            if (e.ctrlKey || e.altKey || e.metaKey) {
                return
            }
            
            let key = e.key.toUpperCase();
            if (key === "BACKSPACE") key = "⌫ ";
            
            await this.handleNewLetter(key);
        });

        // Set dark mode as default
        if (isDarkModePreferred()) {
            this.toggleDarkMode();
        } else {
            // Force dark mode as default
            this.darkMode = true;
            document.querySelector("body").classList.add("dark");
        }
    },
})