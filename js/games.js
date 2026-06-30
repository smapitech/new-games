/**
 * Kids Learning Adventure
 * Game definitions and sound mappings
 */

window.GAME_LIBRARY = [
    {
        id: "balloon",
        type: "typing",
        title: "Balloon Pop",
        icon: "🎈",
        concept: "Letter Recognition",
        description: "Type letters before the balloons float away.",
        sounds: {
            click: "click",
            success: "pop",
            wrong: "wrong",
            reward: "star",
            complete: "complete"
        }
    },
    {
        id: "falling",
        type: "typing",
        title: "Falling Letters",
        icon: "🌧️",
        concept: "Keyboard Confidence",
        description: "Catch letters before they reach the ground.",
        sounds: {
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    },
    {
        id: "word",
        type: "typing",
        title: "Word Builder",
        icon: "🐶",
        concept: "Word Typing",
        description: "Type simple child-friendly words.",
        sounds: {
            success: "correct",
            wrong: "wrong",
            reward: "star",
            complete: "complete"
        }
    },
    {
        id: "sentence",
        type: "typing",
        title: "Sentence Practice",
        icon: "💬",
        concept: "Sentence Typing",
        description: "Copy short sentences and correct mistakes.",
        sounds: {
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    },
    {
        id: "rocket",
        type: "typing",
        title: "Rocket Typing",
        icon: "🚀",
        concept: "Speed and Accuracy",
        description: "Fill the rocket fuel tank by typing words.",
        sounds: {
            success: "correct",
            wrong: "wrong",
            launch: "launch",
            complete: "celebration"
        }
    },
    {
        id: "colour",
        type: "typing",
        title: "Type and Colour",
        icon: "🎨",
        concept: "Spelling",
        description: "Type colour words to paint a picture.",
        sounds: {
            success: "correct",
            wrong: "wrong",
            reward: "star",
            complete: "complete"
        }
    },
    {
        id: "garden",
        type: "typing",
        title: "Magic Garden",
        icon: "🌻",
        concept: "Vocabulary",
        description: "Grow flowers by typing nature words.",
        sounds: {
            success: "star",
            wrong: "wrong",
            complete: "celebration"
        }
    },
    {
        id: "code",
        type: "typing",
        title: "Mini Coding",
        icon: "💻",
        concept: "Code Typing",
        description: "Type tiny HTML and JavaScript examples.",
        sounds: {
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    },
    {
        id: "robot",
        type: "coding",
        title: "Robot Path",
        icon: "🤖",
        concept: "Sequencing",
        description: "Choose commands that move the robot to the star.",
        sounds: {
            command: "click",
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    },
    {
        id: "train",
        type: "coding",
        title: "Sequence Train",
        icon: "🚂",
        concept: "Instruction Order",
        description: "Arrange actions in the correct order.",
        sounds: {
            choice: "click",
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    },
    {
        id: "bug",
        type: "coding",
        title: "Bug Fixer",
        icon: "🐞",
        concept: "Debugging",
        description: "Spot the instruction that is in the wrong place.",
        sounds: {
            choice: "click",
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    },
    {
        id: "pattern",
        type: "coding",
        title: "Pattern Builder",
        icon: "🧩",
        concept: "Patterns",
        description: "Find what comes next in a repeating pattern.",
        sounds: {
            choice: "click",
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    },
    {
        id: "condition",
        type: "coding",
        title: "Condition Forest",
        icon: "🌳",
        concept: "If and Else",
        description: "Choose what happens when a condition is true.",
        sounds: {
            choice: "click",
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    },
    {
        id: "loop",
        type: "coding",
        title: "Loop Dance",
        icon: "💃",
        concept: "Loops",
        description: "Repeat dance moves using loop thinking.",
        sounds: {
            command: "click",
            success: "correct",
            wrong: "wrong",
            complete: "celebration"
        }
    },
    {
        id: "sandwich",
        type: "coding",
        title: "Algorithm Sandwich",
        icon: "🥪",
        concept: "Algorithms",
        description: "Put sandwich-making steps in the correct order.",
        sounds: {
            choice: "click",
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    },
    {
        id: "event",
        type: "coding",
        title: "Event Match",
        icon: "🖱️",
        concept: "Events",
        description: "Match clicks, key presses and touches to results.",
        sounds: {
            choice: "click",
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    },
    {
        id: "variable",
        type: "coding",
        title: "Variable Boxes",
        icon: "📦",
        concept: "Variables",
        description: "Read values stored inside named boxes.",
        sounds: {
            choice: "click",
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    },
    {
        id: "binary",
        type: "coding",
        title: "Binary Lights",
        icon: "💡",
        concept: "Binary",
        description: "Turn lights on and off to match a pattern.",
        sounds: {
            command: "click",
            success: "correct",
            wrong: "wrong",
            complete: "celebration"
        }
    },
    {
        id: "maze",
        type: "coding",
        title: "Maze Commands",
        icon: "🗺️",
        concept: "Directions",
        description: "Build a command route through a simple maze.",
        sounds: {
            command: "click",
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    },
    {
        id: "sort",
        type: "coding",
        title: "Sort the Steps",
        icon: "🔢",
        concept: "Logical Order",
        description: "Move instructions until they make sense.",
        sounds: {
            command: "click",
            success: "correct",
            wrong: "wrong",
            complete: "complete"
        }
    }
];

window.getGameById = function getGameById(gameId) {
    return window.GAME_LIBRARY.find((game) => game.id === gameId) || null;
};

window.getGamesByType = function getGamesByType(type) {
    if (type === "all") {
        return [...window.GAME_LIBRARY];
    }

    return window.GAME_LIBRARY.filter((game) => game.type === type);
};

window.playGameSound = function playGameSound(gameId, action) {
    const game = window.getGameById(gameId);

    if (!game || !game.sounds || !game.sounds[action]) {
        return;
    }

    if (
        window.GameSounds &&
        typeof window.GameSounds.play === "function"
    ) {
        window.GameSounds.play(game.sounds[action]);
    }
};

window.speakGameIntroduction = function speakGameIntroduction(gameId) {
    const game = window.getGameById(gameId);

    if (
        !game ||
        !window.GameSounds ||
        typeof window.GameSounds.speak !== "function"
    ) {
        return;
    }

    window.GameSounds.speak(
        `${game.title}. ${game.description}`
    );
};

console.info(
    `Kids Learning Adventure: ${window.GAME_LIBRARY.length} games loaded.`
);
