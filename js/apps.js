/**
 * Kids Learning Adventure
 * Main application and game logic
 */

const $ = (id) => document.getElementById(id);

const appState = {
    stars: Number(localStorage.getItem("kla_stars") || 0),

    completed: JSON.parse(
        localStorage.getItem("kla_completed") || "[]"
    ),

    player: localStorage.getItem("kla_player") || "",

    speed: localStorage.getItem("kla_speed") || "slow",

    filter: "typing",

    currentGameIndex: 0,

    score: 0,

    attempts: 0,

    correct: 0,

    continuous: false,

    cleanup: []
};

const elements = {
    homeScreen: $("homeScreen"),
    gameScreen: $("gameScreen"),
    gameGrid: $("gameGrid"),
    gameStage: $("gameStage"),
    gameTitle: $("gameTitle"),
    roundScore: $("roundScore"),
    accuracyValue: $("accuracyValue"),
    levelProgress: $("levelProgress"),
    encouragement: $("encouragement"),
    totalStars: $("totalStars"),
    completedGames: $("completedGames"),
    playerName: $("playerName"),
    speedMode: $("speedMode"),
    soundToggle: $("soundToggle"),
    continuousMode: $("continuousMode"),
    homeButton: $("homeButton"),
    nextGameButton: $("nextGameButton"),
    celebration: $("celebration")
};

/**
 * Initial settings
 */

if (elements.playerName) {
    elements.playerName.value = appState.player;
}

if (elements.speedMode) {
    elements.speedMode.value = appState.speed;
}

if (elements.soundToggle) {
    elements.soundToggle.textContent =
        window.GameSounds && window.GameSounds.enabled
            ? "🔊"
            : "🔇";
}

/**
 * Main event listeners
 */

elements.playerName?.addEventListener("input", (event) => {
    appState.player = event.target.value.trim();

    localStorage.setItem(
        "kla_player",
        appState.player
    );
});

elements.speedMode?.addEventListener("change", (event) => {
    appState.speed = event.target.value;

    localStorage.setItem(
        "kla_speed",
        appState.speed
    );
});

elements.soundToggle?.addEventListener("click", () => {
    if (!window.GameSounds) {
        return;
    }

    const enabled = window.GameSounds.toggle();

    elements.soundToggle.textContent =
        enabled ? "🔊" : "🔇";

    if (enabled) {
        window.GameSounds.play("click");
    }
});

elements.continuousMode?.addEventListener("click", () => {
    const visibleGames = getVisibleGames();

    if (!visibleGames.length) {
        return;
    }

    const firstGameIndex = window.GAME_LIBRARY.findIndex(
        (game) => game.id === visibleGames[0].id
    );

    startGame(firstGameIndex, true);
});

elements.homeButton?.addEventListener(
    "click",
    showHome
);

elements.nextGameButton?.addEventListener(
    "click",
    nextGame
);

document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(
            (item) => item.classList.remove("active")
        );

        tab.classList.add("active");

        appState.filter = tab.dataset.tab || "all";

        renderGameGrid();

        window.GameSounds?.play("click");
    });
});

/**
 * Dashboard rendering
 */

function getVisibleGames() {
    return window.getGamesByType(appState.filter);
}

function renderGameGrid() {
    const games = getVisibleGames();

    elements.gameGrid.innerHTML = games.map((game) => {
        const completedClass =
            appState.completed.includes(game.id)
                ? "done"
                : "";

        return `
            <button
                class="game-card ${completedClass}"
                data-game-id="${game.id}"
            >
                <div class="icon">${game.icon}</div>

                <h3>${game.title}</h3>

                <p>${game.description}</p>

                <span class="badge">
                    ${game.concept}
                </span>
            </button>
        `;
    }).join("");

    document
        .querySelectorAll("[data-game-id]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const gameId = button.dataset.gameId;

                const index = window.GAME_LIBRARY.findIndex(
                    (game) => game.id === gameId
                );

                window.GameSounds?.play("click");

                startGame(index, false);
            });
        });

    updateHeader();
}

function updateHeader() {
    elements.totalStars.textContent = appState.stars;

    elements.completedGames.textContent =
        appState.completed.length;
}

/**
 * Game navigation
 */

function startGame(index, continuous = false) {
    clearCurrentGame();

    appState.currentGameIndex = index;
    appState.score = 0;
    appState.attempts = 0;
    appState.correct = 0;
    appState.continuous = continuous;

    elements.homeScreen.classList.remove("active");
    elements.gameScreen.classList.add("active");

    loadCurrentGame();
}

function loadCurrentGame() {
    clearCurrentGame();

    const game =
        window.GAME_LIBRARY[appState.currentGameIndex];

    if (!game) {
        showHome();
        return;
    }

    elements.gameTitle.textContent = game.title;
    elements.roundScore.textContent = "0";
    elements.accuracyValue.textContent = "100%";
    elements.levelProgress.style.width = "0%";
    elements.encouragement.textContent =
        "You can do it!";

    window.speakGameIntroduction(game.id);

    const gameFunction =
        window[`${game.id}Game`];

    if (typeof gameFunction !== "function") {
        elements.gameStage.innerHTML = `
            <div class="center">
                <div>
                    <div class="big">🛠️</div>

                    <h2>Game is being prepared</h2>

                    <p class="helper">
                        The function ${game.id}Game()
                        was not found.
                    </p>
                </div>
            </div>
        `;

        return;
    }

    gameFunction();
}

function nextGame() {
    appState.currentGameIndex =
        (appState.currentGameIndex + 1) %
        window.GAME_LIBRARY.length;

    appState.score = 0;
    appState.attempts = 0;
    appState.correct = 0;

    window.GameSounds?.play("click");

    loadCurrentGame();
}

function showHome() {
    clearCurrentGame();

    elements.gameScreen.classList.remove("active");
    elements.homeScreen.classList.add("active");

    renderGameGrid();
}

window.showHome = showHome;
window.loadCurrentGame = loadCurrentGame;

/**
 * Shared game helpers
 */

function clearCurrentGame() {
    appState.cleanup.forEach((cleanupFunction) => {
        try {
            cleanupFunction();
        } catch (error) {
            console.warn(
                "Game cleanup failed:",
                error
            );
        }
    });

    appState.cleanup = [];

    window.onkeydown = null;

    elements.gameStage.innerHTML = "";
}

function registerCleanup(cleanupFunction) {
    appState.cleanup.push(cleanupFunction);
}

function addScore(
    points,
    message = "Great job!"
) {
    appState.score += points;

    elements.roundScore.textContent =
        appState.score;

    elements.encouragement.textContent =
        message;

    updateAccuracy();
}

function markCorrect(
    gameId,
    action = "success",
    message = "Great job!"
) {
    appState.correct += 1;

    window.playGameSound(gameId, action);

    elements.encouragement.textContent =
        message;

    updateAccuracy();
}

function markWrong(
    gameId,
    message = "Nice try. Look again."
) {
    window.playGameSound(gameId, "wrong");

    elements.encouragement.textContent =
        message;

    updateAccuracy();
}

function updateAccuracy() {
    const accuracy = appState.attempts
        ? Math.round(
            (
                appState.correct /
                appState.attempts
            ) * 100
        )
        : 100;

    elements.accuracyValue.textContent =
        `${accuracy}%`;
}

function updateProgress(value) {
    elements.levelProgress.style.width =
        `${Math.min(100, value)}%`;
}

function completeGame(
    note = "Game complete!"
) {
    const game =
        window.GAME_LIBRARY[appState.currentGameIndex];

    if (!game) {
        return;
    }

    appState.stars += 3;

    if (!appState.completed.includes(game.id)) {
        appState.completed.push(game.id);
    }

    localStorage.setItem(
        "kla_stars",
        appState.stars
    );

    localStorage.setItem(
        "kla_completed",
        JSON.stringify(appState.completed)
    );

    window.playGameSound(
        game.id,
        "complete"
    );

    window.GameSounds?.speak(note);

    showCelebration();

    const accuracy = appState.attempts
        ? Math.round(
            (
                appState.correct /
                appState.attempts
            ) * 100
        )
        : 100;

    const progressRecord = {
        gameId: game.id,
        title: game.title,
        type: game.type,
        concept: game.concept,
        score: appState.score,
        stars: 3,
        accuracy,
        player:
            appState.player || "Player",
        completedAt:
            new Date().toISOString()
    };

    window.dispatchEvent(
        new CustomEvent(
            "kids-learning-progress",
            {
                detail: progressRecord
            }
        )
    );

    console.info(
        "Game completion:",
        progressRecord
    );

    setTimeout(() => {
        if (appState.continuous) {
            nextGame();
            return;
        }

        showCompletionPanel(note);
    }, 1300);
}

function showCompletionPanel(note) {
    clearCurrentGame();

    elements.gameStage.innerHTML = `
        <div class="center">
            <div>
                <div class="big">🏆</div>

                <h2>${note}</h2>

                <p class="helper">
                    You learned something important today.
                </p>

                <button
                    id="replayGameButton"
                    class="primary-button"
                >
                    Play Again
                </button>

                <button
                    id="returnLibraryButton"
                    class="secondary-button"
                >
                    Game Library
                </button>
            </div>
        </div>
    `;

    $("replayGameButton")
        ?.addEventListener(
            "click",
            loadCurrentGame
        );

    $("returnLibraryButton")
        ?.addEventListener(
            "click",
            showHome
        );
}

function showCelebration() {
    const symbols = [
        "🎉",
        "⭐",
        "✨",
        "💡",
        "🧩"
    ];

    for (let index = 0; index < 34; index += 1) {
        const confetti =
            document.createElement("span");

        confetti.className = "confetti";

        confetti.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];

        confetti.style.left =
            `${Math.random() * 100}vw`;

        confetti.style.animationDelay =
            `${Math.random() * 0.7}s`;

        elements.celebration.appendChild(
            confetti
        );

        setTimeout(
            () => confetti.remove(),
            2400
        );
    }
}

function getSpeedConfig() {
    const settings = {
        "extra-slow": {
            movementDuration: 24000,
            spawnInterval: 3500,
            maximumItems: 3
        },
        slow: {
            movementDuration: 18000,
            spawnInterval: 2500,
            maximumItems: 4
        },
        normal: {
            movementDuration: 11000,
            spawnInterval: 1500,
            maximumItems: 6
        }
    };

    return settings[appState.speed] ||
        settings.slow;
}

function shuffle(array) {
    return [...array].sort(
        () => Math.random() - 0.5
    );
}

function commandIcon(command) {
    const icons = {
        U: "⬆️",
        D: "⬇️",
        L: "⬅️",
        R: "➡️",
        RUN: "▶ Run",
        CLEAR: "🧹 Clear"
    };

    return icons[command] || command;
}

function escapeHtml(value) {
    return value.replace(
        /[&<>"']/g,
        (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]
    );
}

/**
 * Typing game 1: Balloon Pop
 */

window.balloonGame = function balloonGame() {
    const gameId = "balloon";
    const config = getSpeedConfig();

    const letters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    let hits = 0;

    elements.gameStage.style.background =
        "linear-gradient(#b8eaff,#fff 72%,#8bd47a 72%)";

    function spawnBalloon() {
        const currentBalloons =
            elements.gameStage.querySelectorAll(
                ".balloon"
            ).length;

        if (
            currentBalloons >=
            config.maximumItems
        ) {
            return;
        }

        const letter =
            letters[
                Math.floor(
                    Math.random() *
                    letters.length
                )
            ];

        const balloon =
            document.createElement("div");

        balloon.className = "balloon";
        balloon.textContent = letter;
        balloon.dataset.value = letter;

        balloon.style.left =
            `${Math.random() * 82}%`;

        const colours = [
            "#ff6b6b",
            "#7357ff",
            "#31c48d",
            "#ff9f43",
            "#e056fd"
        ];

        balloon.style.background =
            colours[
                Math.floor(
                    Math.random() *
                    colours.length
                )
            ];

        balloon.style.animationDuration =
            `${config.movementDuration}ms`;

        elements.gameStage.appendChild(
            balloon
        );

        balloon.addEventListener(
            "animationend",
            () => balloon.remove(),
            { once: true }
        );
    }

    spawnBalloon();
    setTimeout(spawnBalloon, 500);

    const timer = setInterval(
        spawnBalloon,
        config.spawnInterval
    );

    registerCleanup(
        () => clearInterval(timer)
    );

    window.onkeydown = (event) => {
        if (event.key.length !== 1) {
            return;
        }

        const key = event.key.toUpperCase();

        appState.attempts += 1;

        const matchingBalloon = [
            ...elements.gameStage
                .querySelectorAll(".balloon")
        ].find(
            (balloon) =>
                balloon.dataset.value === key
        );

        if (!matchingBalloon) {
            markWrong(
                gameId,
                "Look for that letter on a balloon."
            );

            return;
        }

        appState.correct += 1;
        hits += 1;

        matchingBalloon.classList.add("pop");

        setTimeout(
            () => matchingBalloon.remove(),
            220
        );

        window.playGameSound(
            gameId,
            "success"
        );

        addScore(
            2,
            `Pop! You found ${key}.`
        );

        updateProgress(
            (hits / 12) * 100
        );

        if (hits >= 12) {
            clearInterval(timer);

            completeGame(
                "Balloon Pop complete!"
            );
        }
    };
};

/**
 * Typing game 2: Falling Letters
 */

window.fallingGame = function fallingGame() {
    const gameId = "falling";
    const config = getSpeedConfig();

    const letters =
        "abcdefghijklmnopqrstuvwxyz".split("");

    let hits = 0;

    elements.gameStage.style.background =
        "linear-gradient(#dff6ff,#fff 80%,#82d07a 80%)";

    function spawnLetter() {
        const itemCount =
            elements.gameStage.querySelectorAll(
                ".falling"
            ).length;

        if (
            itemCount >=
            config.maximumItems
        ) {
            return;
        }

        const letter =
            letters[
                Math.floor(
                    Math.random() *
                    letters.length
                )
            ];

        const item =
            document.createElement("div");

        item.className = "falling";
        item.textContent = letter;
        item.dataset.value = letter;

        item.style.left =
            `${Math.random() * 86}%`;

        item.style.animationDuration =
            `${config.movementDuration}ms`;

        elements.gameStage.appendChild(item);

        item.addEventListener(
            "animationend",
            () => item.remove(),
            { once: true }
        );
    }

    spawnLetter();
    setTimeout(spawnLetter, 600);

    const timer = setInterval(
        spawnLetter,
        config.spawnInterval
    );

    registerCleanup(
        () => clearInterval(timer)
    );

    window.onkeydown = (event) => {
        if (event.key.length !== 1) {
            return;
        }

        const key =
            event.key.toLowerCase();

        appState.attempts += 1;

        const matchingLetter = [
            ...elements.gameStage
                .querySelectorAll(".falling")
        ].find(
            (item) =>
                item.dataset.value === key
        );

        if (!matchingLetter) {
            markWrong(
                gameId,
                "Look carefully at the falling letters."
            );

            return;
        }

        appState.correct += 1;
        hits += 1;

        matchingLetter.classList.add("pop");

        setTimeout(
            () => matchingLetter.remove(),
            220
        );

        addScore(
            2,
            `You caught ${key}!`
        );

        window.playGameSound(
            gameId,
            "success"
        );

        updateProgress(
            (hits / 12) * 100
        );

        if (hits >= 12) {
            clearInterval(timer);

            completeGame(
                "Falling Letters complete!"
            );
        }
    };
};

/**
 * Typing game 3: Word Builder
 */

window.wordGame = function wordGame() {
    const gameId = "word";

    const words = [
        "cat",
        "dog",
        "sun",
        "mum",
        "dad",
        "car",
        "bus",
        "cup",
        "pen",
        "bag",
        "hat",
        "bed",
        "run",
        "sit",
        "big",
        "fish",
        "bird",
        "tree",
        "moon",
        "book"
    ];

    let completedWords = 0;

    function showWord() {
        const word =
            words[
                Math.floor(
                    Math.random() *
                    words.length
                )
            ];

        let typed = "";

        elements.gameStage.innerHTML = `
            <div class="center">
                <div>
                    <div class="big">🌟</div>

                    <p class="helper">
                        Type the word slowly.
                    </p>

                    <div class="word">
                        ${word}
                    </div>

                    <div class="letter-boxes">
                        ${[...word].map(
                            (letter, index) => `
                                <span data-letter-index="${index}">
                                    ${letter}
                                </span>
                            `
                        ).join("")}
                    </div>
                </div>
            </div>
        `;

        window.GameSounds?.speak(
            `Type ${word}`
        );

        window.onkeydown = (event) => {
            if (event.key.length !== 1) {
                return;
            }

            appState.attempts += 1;

            const expected =
                word[typed.length];

            if (
                event.key.toLowerCase() !==
                expected
            ) {
                markWrong(
                    gameId,
                    "Try that letter again."
                );

                return;
            }

            appState.correct += 1;
            typed += event.key.toLowerCase();

            elements.gameStage
                .querySelector(
                    `[data-letter-index="${typed.length - 1}"]`
                )
                ?.classList.add("done");

            if (typed.length === word.length) {
                completedWords += 1;

                window.playGameSound(
                    gameId,
                    "success"
                );

                addScore(
                    word.length,
                    `Wonderful! You typed ${word}.`
                );

                updateProgress(
                    (completedWords / 8) * 100
                );

                if (completedWords >= 8) {
                    completeGame(
                        "Word Builder complete!"
                    );

                    return;
                }

                setTimeout(showWord, 700);
            }
        };
    }

    showWord();
};

/**
 * Typing game 4: Sentence Practice
 */

window.sentenceGame = function sentenceGame() {
    const gameId = "sentence";

    const sentences = [
        "I am six.",
        "I can type.",
        "I like cats.",
        "The sun is hot.",
        "I love my mum.",
        "I can code."
    ];

    let completedSentences = 0;

    function showSentence() {
        const sentence =
            sentences[
                completedSentences %
                sentences.length
            ];

        elements.gameStage.innerHTML = `
            <div class="center">
                <div style="width:min(850px,95%)">
                    <p class="helper">
                        Copy the sentence.
                        Use Backspace to correct mistakes.
                    </p>

                    <div
                        class="word"
                        style="font-size:clamp(2rem,6vw,4rem)"
                    >
                        ${sentence}
                    </div>

                    <textarea
                        id="sentenceInput"
                        class="code-input"
                        spellcheck="false"
                    ></textarea>
                </div>
            </div>
        `;

        const input = $("sentenceInput");

        input.focus();

        window.GameSounds?.speak(sentence);

        let previousValue = "";

        input.addEventListener("input", () => {
            const currentValue = input.value;

            if (
                currentValue.length >
                previousValue.length
            ) {
                appState.attempts += 1;

                const position =
                    currentValue.length - 1;

                if (
                    currentValue[position] ===
                    sentence[position]
                ) {
                    appState.correct += 1;
                } else {
                    window.playGameSound(
                        gameId,
                        "wrong"
                    );
                }
            }

            previousValue = currentValue;

            updateAccuracy();

            if (currentValue !== sentence) {
                return;
            }

            completedSentences += 1;

            window.playGameSound(
                gameId,
                "success"
            );

            addScore(
                sentence.length,
                "Excellent sentence!"
            );

            updateProgress(
                (
                    completedSentences /
                    sentences.length
                ) * 100
            );

            if (
                completedSentences >=
                sentences.length
            ) {
                completeGame(
                    "Sentence Practice complete!"
                );

                return;
            }

            setTimeout(
                showSentence,
                800
            );
        });
    }

    showSentence();
};

/**
 * Typing game 5: Rocket Typing
 */

window.rocketGame = function rocketGame() {
    const gameId = "rocket";

    const words = [
        "STAR",
        "MOON",
        "SPACE",
        "ROCKET",
        "ALIEN",
        "PLANET"
    ];

    let fuel = 0;
    let wordIndex = 0;

    function showRocketWord() {
        const word =
            words[wordIndex % words.length];

        let typed = "";

        elements.gameStage.innerHTML = `
            <div
                class="center"
                style="
                    background:
                    radial-gradient(
                        circle at 30% 25%,
                        #274b75,
                        #07111f 70%
                    );
                    color:white;
                "
            >
                <div>
                    <div class="big">🚀</div>

                    <p
                        class="helper"
                        style="color:#cfe7ff"
                    >
                        Type the space word to add fuel.
                    </p>

                    <div class="word">
                        ${word}
                    </div>

                    <div class="letter-boxes">
                        ${[...word].map(
                            (letter, index) => `
                                <span data-letter-index="${index}">
                                    ${letter}
                                </span>
                            `
                        ).join("")}
                    </div>

                    <div
                        class="progress-track"
                        style="width:min(520px,80vw)"
                    >
                        <div style="width:${fuel}%"></div>
                    </div>

                    <strong>
                        Fuel ${fuel}%
                    </strong>
                </div>
            </div>
        `;

        window.GameSounds?.speak(
            `Type ${word}`
        );

        window.onkeydown = (event) => {
            if (event.key.length !== 1) {
                return;
            }

            appState.attempts += 1;

            const expected =
                word[typed.length];

            if (
                event.key.toUpperCase() !==
                expected
            ) {
                markWrong(
                    gameId,
                    "Check the next rocket letter."
                );

                return;
            }

            appState.correct += 1;
            typed += event.key.toUpperCase();

            elements.gameStage
                .querySelector(
                    `[data-letter-index="${typed.length - 1}"]`
                )
                ?.classList.add("done");

            if (typed.length !== word.length) {
                return;
            }

            fuel += 20;
            wordIndex += 1;

            window.playGameSound(
                gameId,
                "success"
            );

            addScore(
                4,
                "Fuel added!"
            );

            if (fuel >= 100) {
                window.playGameSound(
                    gameId,
                    "launch"
                );

                completeGame(
                    "Rocket launched!"
                );

                return;
            }

            setTimeout(
                showRocketWord,
                700
            );
        };
    }

    showRocketWord();
};

/**
 * Typing game 6: Type and Colour
 */

window.colourGame = function colourGame() {
    const gameId = "colour";

    const colours = [
        {
            name: "RED",
            value: "#ff5d73"
        },
        {
            name: "BLUE",
            value: "#4f8cff"
        },
        {
            name: "GREEN",
            value: "#32c48d"
        },
        {
            name: "YELLOW",
            value: "#ffd166"
        },
        {
            name: "PURPLE",
            value: "#8c65ff"
        },
        {
            name: "ORANGE",
            value: "#ff9f43"
        }
    ];

    let completedColours = 0;

    function showColour() {
        const colour =
            colours[
                Math.floor(
                    Math.random() *
                    colours.length
                )
            ];

        let typed = "";

        elements.gameStage.innerHTML = `
            <div class="center">
                <div>
                    <p class="helper">
                        Type the colour word.
                    </p>

                    <div class="word">
                        ${colour.name}
                    </div>

                    <div class="letter-boxes">
                        ${[...colour.name].map(
                            (letter, index) => `
                                <span data-letter-index="${index}">
                                    ${letter}
                                </span>
                            `
                        ).join("")}
                    </div>

                    <div
                        id="paintBall"
                        style="
                            width:220px;
                            height:220px;
                            border-radius:50%;
                            margin:20px auto;
                            background:#eef3f7;
                            display:grid;
                            place-items:center;
                            font-size:6rem;
                        "
                    >
                        ⚽
                    </div>
                </div>
            </div>
        `;

        window.GameSounds?.speak(
            `Type ${colour.name}`
        );

        window.onkeydown = (event) => {
            if (event.key.length !== 1) {
                return;
            }

            appState.attempts += 1;

            const expected =
                colour.name[typed.length];

            if (
                event.key.toUpperCase() !==
                expected
            ) {
                markWrong(
                    gameId,
                    "Try that colour letter again."
                );

                return;
            }

            appState.correct += 1;
            typed += event.key.toUpperCase();

            elements.gameStage
                .querySelector(
                    `[data-letter-index="${typed.length - 1}"]`
                )
                ?.classList.add("done");

            if (
                typed.length !==
                colour.name.length
            ) {
                return;
            }

            $("paintBall").style.background =
                colour.value;

            completedColours += 1;

            window.playGameSound(
                gameId,
                "reward"
            );

            addScore(
                3,
                `Beautiful ${colour.name.toLowerCase()}!`
            );

            updateProgress(
                (completedColours / 6) * 100
            );

            if (completedColours >= 6) {
                completeGame(
                    "Type and Colour complete!"
                );

                return;
            }

            setTimeout(
                showColour,
                900
            );
        };
    }

    showColour();
};

/**
 * Typing game 7: Magic Garden
 */

window.gardenGame = function gardenGame() {
    const gameId = "garden";

    const words = [
        "BEE",
        "SUN",
        "RAIN",
        "TREE",
        "SEED",
        "LEAF",
        "ROSE",
        "BIRD"
    ];

    const flowers = [
        "🌻",
        "🌷",
        "🌹",
        "🌼",
        "🌺",
        "🪻"
    ];

    let completedWords = 0;

    function showGardenWord() {
        const word =
            words[
                completedWords %
                words.length
            ];

        let typed = "";

        elements.gameStage.innerHTML = `
            <div class="center">
                <div style="width:min(850px,95%)">
                    <p class="helper">
                        Type the garden word
                        to grow a flower.
                    </p>

                    <div class="word">
                        ${word}
                    </div>

                    <div class="letter-boxes">
                        ${[...word].map(
                            (letter, index) => `
                                <span data-letter-index="${index}">
                                    ${letter}
                                </span>
                            `
                        ).join("")}
                    </div>

                    <div
                        style="
                            min-height:260px;
                            background:
                            linear-gradient(
                                #b9ebff 0 58%,
                                #76cc77 58%
                            );
                            border-radius:24px;
                            display:flex;
                            align-items:end;
                            justify-content:center;
                            gap:10px;
                            flex-wrap:wrap;
                            padding:30px;
                        "
                    >
                        ${Array.from(
                            {
                                length:
                                    completedWords
                            },
                            (_, index) => `
                                <span style="font-size:4rem">
                                    ${flowers[
                                        index %
                                        flowers.length
                                    ]}
                                </span>
                            `
                        ).join("")}
                    </div>
                </div>
            </div>
        `;

        window.GameSounds?.speak(
            `Type ${word}`
        );

        window.onkeydown = (event) => {
            if (event.key.length !== 1) {
                return;
            }

            appState.attempts += 1;

            const expected =
                word[typed.length];

            if (
                event.key.toUpperCase() !==
                expected
            ) {
                markWrong(
                    gameId,
                    "The flower is waiting for the right letter."
                );

                return;
            }

            appState.correct += 1;
            typed += event.key.toUpperCase();

            elements.gameStage
                .querySelector(
                    `[data-letter-index="${typed.length - 1}"]`
                )
                ?.classList.add("done");

            if (typed.length !== word.length) {
                return;
            }

            completedWords += 1;

            window.playGameSound(
                gameId,
                "success"
            );

            addScore(
                3,
                "A new flower grew!"
            );

            updateProgress(
                (
                    completedWords /
                    words.length
                ) * 100
            );

            if (
                completedWords >=
                words.length
            ) {
                completeGame(
                    "Magic Garden complete!"
                );

                return;
            }

            setTimeout(
                showGardenWord,
                700
            );
        };
    }

    showGardenWord();
};

/**
 * Typing game 8: Mini Coding
 */

window.codeGame = function codeGame() {
    const gameId = "code";

    const snippets = [
        "<h1>Hello</h1>",
        "<p>I can code</p>",
        "<button>Click Me</button>",
        'alert("Hello");'
    ];

    let completedSnippets = 0;

    function showCode() {
        const code =
            snippets[completedSnippets];

        elements.gameStage.innerHTML = `
            <div class="center">
                <div class="code-box">
                    <p
                        class="helper"
                        style="color:#b9d2e3"
                    >
                        Copy the code exactly.
                    </p>

                    <div class="code-target">
                        ${escapeHtml(code)}
                    </div>

                    <textarea
                        id="codeInput"
                        class="code-input"
                        spellcheck="false"
                    ></textarea>

                    <div
                        id="codePreview"
                        class="preview"
                    >
                        Your result appears here.
                    </div>
                </div>
            </div>
        `;

        const input = $("codeInput");

        input.focus();

        let previousValue = "";

        input.addEventListener("input", () => {
            const currentValue = input.value;

            if (
                currentValue.length >
                previousValue.length
            ) {
                appState.attempts += 1;

                const position =
                    currentValue.length - 1;

                if (
                    currentValue[position] ===
                    code[position]
                ) {
                    appState.correct += 1;
                } else {
                    window.playGameSound(
                        gameId,
                        "wrong"
                    );
                }
            }

            previousValue = currentValue;

            updateAccuracy();

            if (currentValue !== code) {
                return;
            }

            completedSnippets += 1;

            window.playGameSound(
                gameId,
                "success"
            );

            addScore(
                code.length,
                "You typed real code!"
            );

            if (code.startsWith("<")) {
                $("codePreview").innerHTML =
                    code;
            } else {
                $("codePreview").textContent =
                    "JavaScript typed correctly!";
            }

            updateProgress(
                (
                    completedSnippets /
                    snippets.length
                ) * 100
            );

            if (
                completedSnippets >=
                snippets.length
            ) {
                completeGame(
                    "Mini Coding complete!"
                );

                return;
            }

            setTimeout(
                showCode,
                1000
            );
        });
    }

    showCode();
};

/**
 * Coding game 1: Robot Path
 */

window.robotGame = function robotGame() {
    const gameId = "robot";

    const correctCommands = [
        "U",
        "U",
        "U",
        "R",
        "R",
        "R"
    ];

    let selectedCommands = [];

    function drawBoard() {
        elements.gameStage.innerHTML = `
            <div class="center">
                <div>
                    <p class="helper">
                        Build commands to move
                        the robot to the star.
                    </p>

                    <div
                        class="robot-board"
                        style="
                            grid-template-columns:
                            repeat(4,1fr)
                        "
                    >
                        ${Array.from(
                            { length: 16 },
                            (_, index) => `
                                <div
                                    class="cell ${
                                        index === 3
                                            ? "goal"
                                            : ""
                                    }"
                                >
                                    ${
                                        index === 12
                                            ? "🤖"
                                            : index === 3
                                            ? "⭐"
                                            : ""
                                    }
                                </div>
                            `
                        ).join("")}
                    </div>

                    <div class="sequence">
                        ${
                            selectedCommands.length
                                ? selectedCommands.map(
                                    (command) => `
                                        <span class="command">
                                            ${commandIcon(command)}
                                        </span>
                                    `
                                ).join("")
                                : "Commands appear here"
                        }
                    </div>

                    <div class="command-bank">
                        ${[
                            "U",
                            "R",
                            "CLEAR",
                            "RUN"
                        ].map(
                            (command) => `
                                <button
                                    class="command"
                                    data-command="${command}"
                                >
                                    ${commandIcon(command)}
                                </button>
                            `
                        ).join("")}
                    </div>
                </div>
            </div>
        `;

        document
            .querySelectorAll("[data-command]")
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        window.playGameSound(
                            gameId,
                            "command"
                        );

                        const command =
                            button.dataset.command;

                        if (command === "CLEAR") {
                            selectedCommands = [];
                            drawBoard();
                            return;
                        }

                        if (command === "RUN") {
                            appState.attempts += 1;

                            const correct =
                                selectedCommands.join() ===
                                correctCommands.join();

                            if (!correct) {
                                markWrong(
                                    gameId,
                                    "Try 3 up moves, then 3 right moves."
                                );

                                return;
                            }

                            appState.correct += 1;

                            window.playGameSound(
                                gameId,
                                "success"
                            );

                            addScore(
                                12,
                                "The robot reached the star!"
                            );

                            updateProgress(100);

                            completeGame(
                                "Robot Path complete!"
                            );

                            return;
                        }

                        selectedCommands.push(
                            command
                        );

                        drawBoard();
                    }
                );
            });
    }

    drawBoard();
};

/**
 * Coding game 2: Sequence Train
 */

window.trainGame = function trainGame() {
    const gameId = "train";

    const rounds = [
        [
            "Wake up",
            "Get dressed",
            "Eat breakfast",
            "Go to school"
        ],
        [
            "Dig a hole",
            "Put in seed",
            "Cover with soil",
            "Add water"
        ],
        [
            "Turn on computer",
            "Open browser",
            "Choose game",
            "Start playing"
        ]
    ];

    let roundIndex = 0;

    function showRound() {
        const correctOrder =
            rounds[roundIndex];

        const chosenSteps = [];

        elements.gameStage.innerHTML = `
            <div class="center">
                <div style="width:min(760px,95%)">
                    <div class="big">🚂</div>

                    <h2>
                        Click the steps in order
                    </h2>

                    <div
                        class="sequence"
                        id="sequenceTrainResult"
                    ></div>

                    <div class="choice-grid">
                        ${shuffle(correctOrder).map(
                            (step) => `
                                <button
                                    class="choice"
                                    data-step="${step}"
                                >
                                    ${step}
                                </button>
                            `
                        ).join("")}
                    </div>
                </div>
            </div>
        `;

        document
            .querySelectorAll("[data-step]")
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        window.playGameSound(
                            gameId,
                            "choice"
                        );

                        chosenSteps.push(
                            button.dataset.step
                        );

                        button.disabled = true;

                        $("sequenceTrainResult")
                            .innerHTML =
                            chosenSteps.map(
                                (step) => `
                                    <span class="command">
                                        ${step}
                                    </span>
                                `
                            ).join("");

                        if (
                            chosenSteps.length !==
                            correctOrder.length
                        ) {
                            return;
                        }

                        appState.attempts += 1;

                        const correct =
                            chosenSteps.join("|") ===
                            correctOrder.join("|");

                        if (!correct) {
                            markWrong(
                                gameId,
                                "The order needs another try."
                            );

                            setTimeout(
                                showRound,
                                900
                            );

                            return;
                        }

                        appState.correct += 1;
                        roundIndex += 1;

                        window.playGameSound(
                            gameId,
                            "success"
                        );

                        addScore(
                            5,
                            "Perfect sequence!"
                        );

                        updateProgress(
                            (
                                roundIndex /
                                rounds.length
                            ) * 100
                        );

                        if (
                            roundIndex >=
                            rounds.length
                        ) {
                            completeGame(
                                "Sequence Train complete!"
                            );

                            return;
                        }

                        setTimeout(
                            showRound,
                            700
                        );
                    }
                );
            });
    }

    showRound();
};

/**
 * Coding game 3: Bug Fixer
 */

window.bugGame = function bugGame() {
    const gameId = "bug";

    const rounds = [
        {
            steps: [
                "Put on shoes",
                "Put on socks",
                "Tie shoes"
            ],
            answer: 0
        },
        {
            steps: [
                "Walk in rain",
                "Open umbrella",
                "Close umbrella indoors"
            ],
            answer: 0
        },
        {
            steps: [
                "Pour cereal",
                "Eat breakfast",
                "Add milk"
            ],
            answer: 1
        }
    ];

    let roundIndex = 0;

    function showRound() {
        const round = rounds[roundIndex];

        elements.gameStage.innerHTML = `
            <div class="center">
                <div>
                    <div class="big">🐞</div>

                    <h2>
                        Which step came too early?
                    </h2>

                    <div class="choice-grid">
                        ${round.steps.map(
                            (step, index) => `
                                <button
                                    class="choice"
                                    data-answer-index="${index}"
                                >
                                    ${index + 1}. ${step}
                                </button>
                            `
                        ).join("")}
                    </div>
                </div>
            </div>
        `;

        document
            .querySelectorAll(
                "[data-answer-index]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        window.playGameSound(
                            gameId,
                            "choice"
                        );

                        appState.attempts += 1;

                        const answer =
                            Number(
                                button.dataset
                                    .answerIndex
                            );

                        if (
                            answer !== round.answer
                        ) {
                            markWrong(
                                gameId,
                                "Look for the step that came too early."
                            );

                            return;
                        }

                        appState.correct += 1;
                        roundIndex += 1;

                        window.playGameSound(
                            gameId,
                            "success"
                        );

                        addScore(
                            4,
                            "Bug found!"
                        );

                        updateProgress(
                            (
                                roundIndex /
                                rounds.length
                            ) * 100
                        );

                        if (
                            roundIndex >=
                            rounds.length
                        ) {
                            completeGame(
                                "You fixed all the bugs!"
                            );

                            return;
                        }

                        setTimeout(
                            showRound,
                            700
                        );
                    }
                );
            });
    }

    showRound();
};

/**
 * Coding game 4: Pattern Builder
 */

window.patternGame = function patternGame() {
    const gameId = "pattern";

    const rounds = [
        {
            pattern: [
                "🔴",
                "🔵",
                "🔴",
                "🔵"
            ],
            answer: "🔴",
            choices: [
                "🔴",
                "🟢",
                "🟡",
                "🔵"
            ]
        },
        {
            pattern: [
                "⭐",
                "⭐",
                "🌙",
                "⭐",
                "⭐",
                "🌙"
            ],
            answer: "⭐",
            choices: [
                "🌙",
                "⭐",
                "☀️",
                "☁️"
            ]
        },
        {
            pattern: [
                "1",
                "2",
                "1",
                "2",
                "1"
            ],
            answer: "2",
            choices: [
                "1",
                "2",
                "3",
                "4"
            ]
        }
    ];

    let roundIndex = 0;

    function showRound() {
        const round = rounds[roundIndex];

        elements.gameStage.innerHTML = `
            <div class="center">
                <div>
                    <div class="big">🧩</div>

                    <h2>
                        What comes next?
                    </h2>

                    <div class="pattern-row">
                        ${round.pattern.map(
                            (item) => `
                                <span>${item}</span>
                            `
                        ).join("")}

                        <span>❓</span>
                    </div>

                    <div class="choice-grid">
                        ${round.choices.map(
                            (choice) => `
                                <button
                                    class="choice"
                                    data-pattern-choice="${choice}"
                                >
                                    ${choice}
                                </button>
                            `
                        ).join("")}
                    </div>
                </div>
            </div>
        `;

        document
            .querySelectorAll(
                "[data-pattern-choice]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        window.playGameSound(
                            gameId,
                            "choice"
                        );

                        appState.attempts += 1;

                        if (
                            button.dataset
                                .patternChoice !==
                            round.answer
                        ) {
                            markWrong(
                                gameId,
                                "Look at what repeats."
                            );

                            return;
                        }

                        appState.correct += 1;
                        roundIndex += 1;

                        window.playGameSound(
                            gameId,
                            "success"
                        );

                        addScore(
                            3,
                            "Pattern solved!"
                        );

                        updateProgress(
                            (
                                roundIndex /
                                rounds.length
                            ) * 100
                        );

                        if (
                            roundIndex >=
                            rounds.length
                        ) {
                            completeGame(
                                "Pattern Builder complete!"
                            );

                            return;
                        }

                        setTimeout(
                            showRound,
                            600
                        );
                    }
                );
            });
    }

    showRound();
};

/**
 * Coding game 5: Condition Forest
 */

window.conditionGame = function conditionGame() {
    const gameId = "condition";

    const rounds = [
        {
            question:
                "If it is raining, what should you take?",
            answer: "Umbrella",
            choices: [
                "Umbrella",
                "Sunglasses",
                "Ball",
                "Book"
            ]
        },
        {
            question:
                "If the traffic light is red, what should you do?",
            answer: "Stop",
            choices: [
                "Run",
                "Stop",
                "Dance",
                "Jump"
            ]
        },
        {
            question:
                "If an answer is correct, what should a game give?",
            answer: "A star",
            choices: [
                "A star",
                "A shoe",
                "A spoon",
                "A cloud"
            ]
        }
    ];

    let roundIndex = 0;

    function showRound() {
        const round = rounds[roundIndex];

        elements.gameStage.innerHTML = `
            <div class="center">
                <div style="width:min(760px,95%)">
                    <div class="big">🌳</div>

                    <h2>
                        ${round.question}
                    </h2>

                    <div class="choice-grid">
                        ${shuffle(round.choices).map(
                            (choice) => `
                                <button
                                    class="choice"
                                    data-condition-choice="${choice}"
                                >
                                    ${choice}
                                </button>
                            `
                        ).join("")}
                    </div>
                </div>
            </div>
        `;

        document
            .querySelectorAll(
                "[data-condition-choice]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        window.playGameSound(
                            gameId,
                            "choice"
                        );

                        appState.attempts += 1;

                        if (
                            button.dataset
                                .conditionChoice !==
                            round.answer
                        ) {
                            markWrong(
                                gameId,
                                "Think about what should happen."
                            );

                            return;
                        }

                        appState.correct += 1;
                        roundIndex += 1;

                        window.playGameSound(
                            gameId,
                            "success"
                        );

                        addScore(
                            4,
                            "Correct condition!"
                        );

                        updateProgress(
                            (
                                roundIndex /
                                rounds.length
                            ) * 100
                        );

                        if (
                            roundIndex >=
                            rounds.length
                        ) {
                            completeGame(
                                "Condition Forest complete!"
                            );

                            return;
                        }

                        setTimeout(
                            showRound,
                            600
                        );
                    }
                );
            });
    }

    showRound();
};

/**
 * Coding game 6: Loop Dance
 */

window.loopGame = function loopGame() {
    const gameId = "loop";

    const rounds = [
        {
            move: "👏",
            count: 3
        },
        {
            move: "🦶",
            count: 2
        },
        {
            move: "🙌",
            count: 4
        }
    ];

    let roundIndex = 0;

    function showRound() {
        const round = rounds[roundIndex];

        let clicks = 0;

        elements.gameStage.innerHTML = `
            <div class="center">
                <div>
                    <div class="big">💃</div>

                    <h2>
                        Repeat ${round.move}
                        ${round.count} times
                    </h2>

                    <p class="helper">
                        A loop repeats an action.
                    </p>

                    <button
                        id="danceMoveButton"
                        class="choice"
                        style="font-size:3rem"
                    >
                        ${round.move}
                    </button>

                    <div
                        id="danceResults"
                        class="pattern-row"
                    ></div>
                </div>
            </div>
        `;

        $("danceMoveButton")
            .addEventListener("click", () => {
                window.playGameSound(
                    gameId,
                    "command"
                );

                clicks += 1;

                $("danceResults").innerHTML =
                    Array.from(
                        { length: clicks },
                        () => `
                            <span>${round.move}</span>
                        `
                    ).join("");

                if (clicks < round.count) {
                    return;
                }

                if (clicks > round.count) {
                    markWrong(
                        gameId,
                        "That loop repeated too many times."
                    );

                    setTimeout(
                        showRound,
                        700
                    );

                    return;
                }

                appState.attempts += 1;
                appState.correct += 1;
                roundIndex += 1;

                window.playGameSound(
                    gameId,
                    "success"
                );

                addScore(
                    round.count,
                    "Loop complete!"
                );

                updateProgress(
                    (
                        roundIndex /
                        rounds.length
                    ) * 100
                );

                if (
                    roundIndex >=
                    rounds.length
                ) {
                    completeGame(
                        "Loop Dance complete!"
                    );

                    return;
                }

                setTimeout(
                    showRound,
                    700
                );
            });
    }

    showRound();
};

/**
 * Coding game 7: Algorithm Sandwich
 */

window.sandwichGame = function sandwichGame() {
    const gameId = "sandwich";

    const correctSteps = [
        "Take two slices of bread",
        "Add filling",
        "Put bread together",
        "Cut the sandwich",
        "Serve it"
    ];

    const selectedSteps = [];

    elements.gameStage.innerHTML = `
        <div class="center">
            <div style="width:min(800px,95%)">
                <div class="big">🥪</div>

                <h2>
                    Build the sandwich algorithm
                </h2>

                <div
                    id="sandwichSequence"
                    class="sequence"
                ></div>

                <div class="choice-grid">
                    ${shuffle(correctSteps).map(
                        (step) => `
                            <button
                                class="choice"
                                data-sandwich-step="${step}"
                            >
                                ${step}
                            </button>
                        `
                    ).join("")}
                </div>
            </div>
        </div>
    `;

    document
        .querySelectorAll(
            "[data-sandwich-step]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    window.playGameSound(
                        gameId,
                        "choice"
                    );

                    selectedSteps.push(
                        button.dataset
                            .sandwichStep
                    );

                    button.disabled = true;

                    $("sandwichSequence")
                        .innerHTML =
                        selectedSteps.map(
                            (step, index) => `
                                <span class="command">
                                    ${index + 1}. ${step}
                                </span>
                            `
                        ).join("");

                    if (
                        selectedSteps.length !==
                        correctSteps.length
                    ) {
                        return;
                    }

                    appState.attempts += 1;

                    const correct =
                        selectedSteps.join("|") ===
                        correctSteps.join("|");

                    if (!correct) {
                        markWrong(
                            gameId,
                            "The sandwich steps need another order."
                        );

                        setTimeout(
                            sandwichGame,
                            900
                        );

                        return;
                    }

                    appState.correct += 1;

                    window.playGameSound(
                        gameId,
                        "success"
                    );

                    addScore(
                        8,
                        "That is a clear algorithm!"
                    );

                    updateProgress(100);

                    completeGame(
                        "Sandwich Algorithm complete!"
                    );
                }
            );
        });
};

/**
 * Coding game 8: Event Match
 */

window.eventGame = function eventGame() {
    const gameId = "event";

    const rounds = [
        {
            question:
                "When a button is clicked...",
            answer: "Open a page",
            choices: [
                "Open a page",
                "Cook rice",
                "Make rain",
                "Grow a tree"
            ]
        },
        {
            question:
                "When a key is pressed...",
            answer: "Move the character",
            choices: [
                "Move the character",
                "Wash clothes",
                "Close a road",
                "Make lunch"
            ]
        },
        {
            question:
                "When a timer ends...",
            answer: "Show time up",
            choices: [
                "Show time up",
                "Plant corn",
                "Open a window",
                "Paint a wall"
            ]
        }
    ];

    let roundIndex = 0;

    function showRound() {
        const round = rounds[roundIndex];

        elements.gameStage.innerHTML = `
            <div class="center">
                <div>
                    <div class="big">🖱️</div>

                    <h2>
                        ${round.question}
                    </h2>

                    <div class="choice-grid">
                        ${shuffle(round.choices).map(
                            (choice) => `
                                <button
                                    class="choice"
                                    data-event-choice="${choice}"
                                >
                                    ${choice}
                                </button>
                            `
                        ).join("")}
                    </div>
                </div>
            </div>
        `;

        document
            .querySelectorAll(
                "[data-event-choice]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        window.playGameSound(
                            gameId,
                            "choice"
                        );

                        appState.attempts += 1;

                        if (
                            button.dataset
                                .eventChoice !==
                            round.answer
                        ) {
                            markWrong(
                                gameId,
                                "Choose what the program should do."
                            );

                            return;
                        }

                        appState.correct += 1;
                        roundIndex += 1;

                        window.playGameSound(
                            gameId,
                            "success"
                        );

                        addScore(
                            4,
                            "Event matched!"
                        );

                        updateProgress(
                            (
                                roundIndex /
                                rounds.length
                            ) * 100
                        );

                        if (
                            roundIndex >=
                            rounds.length
                        ) {
                            completeGame(
                                "Event Match complete!"
                            );

                            return;
                        }

                        setTimeout(
                            showRound,
                            600
                        );
                    }
                );
            });
    }

    showRound();
};

/**
 * Coding game 9: Variable Boxes
 */

window.variableGame = function variableGame() {
    const gameId = "variable";

    const rounds = [
        {
            boxes: {
                score: 5,
                lives: 3
            },
            question:
                "What is inside score?",
            answer: "5",
            choices: [
                "3",
                "5",
                "8",
                "0"
            ]
        },
        {
            boxes: {
                name: "Ada",
                age: 6
            },
            question:
                "What is inside name?",
            answer: "Ada",
            choices: [
                "Ada",
                "6",
                "Sam",
                "Name"
            ]
        },
        {
            boxes: {
                colour: "Blue",
                stars: 7
            },
            question:
                "What is inside stars?",
            answer: "7",
            choices: [
                "Blue",
                "7",
                "Stars",
                "2"
            ]
        }
    ];

    let roundIndex = 0;

    function showRound() {
        const round = rounds[roundIndex];

        elements.gameStage.innerHTML = `
            <div class="center">
                <div>
                    <div class="big">📦</div>

                    <p class="helper">
                        Variables are named boxes.
                    </p>

                    <div class="box-row">
                        ${Object.entries(
                            round.boxes
                        ).map(
                            ([name, value]) => `
                                <div class="variable-box">
                                    <span>${name}</span>
                                    <strong>${value}</strong>
                                </div>
                            `
                        ).join("")}
                    </div>

                    <h2>
                        ${round.question}
                    </h2>

                    <div class="choice-grid">
                        ${shuffle(round.choices).map(
                            (choice) => `
                                <button
                                    class="choice"
                                    data-variable-choice="${choice}"
                                >
                                    ${choice}
                                </button>
                            `
                        ).join("")}
                    </div>
                </div>
            </div>
        `;

        document
            .querySelectorAll(
                "[data-variable-choice]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        window.playGameSound(
                            gameId,
                            "choice"
                        );

                        appState.attempts += 1;

                        if (
                            button.dataset
                                .variableChoice !==
                            round.answer
                        ) {
                            markWrong(
                                gameId,
                                "Look at the named box carefully."
                            );

                            return;
                        }

                        appState.correct += 1;
                        roundIndex += 1;

                        window.playGameSound(
                            gameId,
                            "success"
                        );

                        addScore(
                            4,
                            "You read the variable!"
                        );

                        updateProgress(
                            (
                                roundIndex /
                                rounds.length
                            ) * 100
                        );

                        if (
                            roundIndex >=
                            rounds.length
                        ) {
                            completeGame(
                                "Variable Boxes complete!"
                            );

                            return;
                        }

                        setTimeout(
                            showRound,
                            600
                        );
                    }
                );
            });
    }

    showRound();
};

/**
 * Coding game 10: Binary Lights
 */

window.binaryGame = function binaryGame() {
    const gameId = "binary";

    const rounds = [
        [1, 0, 1, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [1, 0, 0, 1]
    ];

    let roundIndex = 0;

    function showRound() {
        const target =
            rounds[roundIndex];

        const current = [
            0,
            0,
            0,
            0
        ];

        elements.gameStage.innerHTML = `
            <div class="center">
                <div>
                    <div class="big">💡</div>

                    <h2>
                        Match the light pattern
                    </h2>

                    <p class="helper">
                        1 means ON. 0 means OFF.
                    </p>

                    <div class="pattern-row">
                        ${target.map(
                            (value) => `
                                <span>
                                    ${
                                        value
                                            ? "🟡"
                                            : "⚫"
                                    }
                                </span>
                            `
                        ).join("")}
                    </div>

                    <div class="light-grid">
                        ${current.map(
                            (_, index) => `
                                <button
                                    class="light"
                                    data-light-index="${index}"
                                >
                                    0
                                </button>
                            `
                        ).join("")}
                    </div>

                    <button
                        id="checkBinaryButton"
                        class="primary-button"
                    >
                        Check Pattern
                    </button>
                </div>
            </div>
        `;

        document
            .querySelectorAll(
                "[data-light-index]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        window.playGameSound(
                            gameId,
                            "command"
                        );

                        const index =
                            Number(
                                button.dataset
                                    .lightIndex
                            );

                        current[index] =
                            current[index]
                                ? 0
                                : 1;

                        button.classList.toggle(
                            "on",
                            Boolean(
                                current[index]
                            )
                        );

                        button.textContent =
                            current[index];
                    }
                );
            });

        $("checkBinaryButton")
            .addEventListener(
                "click",
                () => {
                    appState.attempts += 1;

                    const correct =
                        current.join("") ===
                        target.join("");

                    if (!correct) {
                        markWrong(
                            gameId,
                            "Some lights do not match yet."
                        );

                        return;
                    }

                    appState.correct += 1;
                    roundIndex += 1;

                    window.playGameSound(
                        gameId,
                        "success"
                    );

                    addScore(
                        4,
                        "Binary pattern matched!"
                    );

                    updateProgress(
                        (
                            roundIndex /
                            rounds.length
                        ) * 100
                    );

                    if (
                        roundIndex >=
                        rounds.length
                    ) {
                        completeGame(
                            "Binary Lights complete!"
                        );

                        return;
                    }

                    setTimeout(
                        showRound,
                        600
                    );
                }
            );
    }

    showRound();
};

/**
 * Coding game 11: Maze Commands
 */

window.mazeGame = function mazeGame() {
    const gameId = "maze";

    const correctCommands = [
        "U",
        "U",
        "U",
        "U",
        "R",
        "R",
        "R",
        "R"
    ];

    let selectedCommands = [];

    function drawMaze() {
        elements.gameStage.innerHTML = `
            <div class="center">
                <div>
                    <div
                        class="robot-board"
                        style="
                            grid-template-columns:
                            repeat(5,1fr)
                        "
                    >
                        ${Array.from(
                            { length: 25 },
                            (_, index) => `
                                <div
                                    class="cell ${
                                        index === 4
                                            ? "goal"
                                            : ""
                                    }"
                                >
                                    ${
                                        index === 20
                                            ? "🚗"
                                            : index === 4
                                            ? "🏁"
                                            : ""
                                    }
                                </div>
                            `
                        ).join("")}
                    </div>

                    <div class="sequence">
                        ${
                            selectedCommands.length
                                ? selectedCommands.map(
                                    (command) => `
                                        <span class="command">
                                            ${commandIcon(command)}
                                        </span>
                                    `
                                ).join("")
                                : "Build the route"
                        }
                    </div>

                    <div class="command-bank">
                        ${[
                            "U",
                            "R",
                            "CLEAR",
                            "RUN"
                        ].map(
                            (command) => `
                                <button
                                    class="command"
                                    data-maze-command="${command}"
                                >
                                    ${commandIcon(command)}
                                </button>
                            `
                        ).join("")}
                    </div>
                </div>
            </div>
        `;

        document
            .querySelectorAll(
                "[data-maze-command]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        window.playGameSound(
                            gameId,
                            "command"
                        );

                        const command =
                            button.dataset
                                .mazeCommand;

                        if (command === "CLEAR") {
                            selectedCommands = [];
                            drawMaze();
                            return;
                        }

                        if (command === "RUN") {
                            appState.attempts += 1;

                            const correct =
                                selectedCommands.join() ===
                                correctCommands.join();

                            if (!correct) {
                                markWrong(
                                    gameId,
                                    "Try 4 up moves, then 4 right moves."
                                );

                                return;
                            }

                            appState.correct += 1;

                            window.playGameSound(
                                gameId,
                                "success"
                            );

                            addScore(
                                10,
                                "The car reached the flag!"
                            );

                            updateProgress(100);

                            completeGame(
                                "Maze Commands complete!"
                            );

                            return;
                        }

                        selectedCommands.push(
                            command
                        );

                        drawMaze();
                    }
                );
            });
    }

    drawMaze();
};

/**
 * Coding game 12: Sort the Steps
 */

window.sortGame = function sortGame() {
    const gameId = "sort";

    const correctOrder = [
        "Turn on the computer",
        "Open the browser",
        "Type the website address",
        "Press Enter",
        "Choose a game"
    ];

    let items = shuffle(correctOrder);

    function drawList() {
        elements.gameStage.innerHTML = `
            <div class="center">
                <div style="width:min(760px,95%)">
                    <div class="big">🔢</div>

                    <h2>
                        Put the steps in logical order
                    </h2>

                    <div
                        style="
                            display:grid;
                            gap:10px;
                        "
                    >
                        ${items.map(
                            (item, index) => `
                                <div
                                    style="
                                        padding:14px;
                                        border-radius:15px;
                                        background:#eef4f7;
                                        font-weight:900;
                                        display:flex;
                                        justify-content:
                                        space-between;
                                        align-items:center;
                                        gap:10px;
                                    "
                                >
                                    <span>
                                        ${index + 1}. ${item}
                                    </span>

                                    <span>
                                        <button
                                            data-move-up="${index}"
                                        >
                                            ↑
                                        </button>

                                        <button
                                            data-move-down="${index}"
                                        >
                                            ↓
                                        </button>
                                    </span>
                                </div>
                            `
                        ).join("")}
                    </div>

                    <button
                        id="checkSortButton"
                        class="primary-button"
                    >
                        Check Order
                    </button>
                </div>
            </div>
        `;

        document
            .querySelectorAll(
                "[data-move-up]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        window.playGameSound(
                            gameId,
                            "command"
                        );

                        const index =
                            Number(
                                button.dataset
                                    .moveUp
                            );

                        if (index <= 0) {
                            return;
                        }

                        [
                            items[index - 1],
                            items[index]
                        ] = [
                            items[index],
                            items[index - 1]
                        ];

                        drawList();
                    }
                );
            });

        document
            .querySelectorAll(
                "[data-move-down]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        window.playGameSound(
                            gameId,
                            "command"
                        );

                        const index =
                            Number(
                                button.dataset
                                    .moveDown
                            );

                        if (
                            index >=
                            items.length - 1
                        ) {
                            return;
                        }

                        [
                            items[index + 1],
                            items[index]
                        ] = [
                            items[index],
                            items[index + 1]
                        ];

                        drawList();
                    }
                );
            });

        $("checkSortButton")
            .addEventListener(
                "click",
                () => {
                    appState.attempts += 1;

                    const correct =
                        items.join("|") ===
                        correctOrder.join("|");

                    if (!correct) {
                        markWrong(
                            gameId,
                            "Some steps are still out of order."
                        );

                        return;
                    }

                    appState.correct += 1;

                    window.playGameSound(
                        gameId,
                        "success"
                    );

                    addScore(
                        10,
                        "The steps now make sense!"
                    );

                    updateProgress(100);

                    completeGame(
                        "Sort the Steps complete!"
                    );
                }
            );
    }

       drawList();
};

renderGameGrid();
updateHeader();
