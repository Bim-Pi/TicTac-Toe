document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const gameBoard = document.getElementById('game-board');
    const currentPlayerIcon = document.getElementById('current-player-icon');
    const currentPlayerText = document.getElementById('current-player-text');
    const gameStatus = document.getElementById('game-status');
    const resetBtn = document.getElementById('reset-btn');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Score elements
    const scoreX = document.getElementById('score-x').querySelector('.score-value');
    const scoreO = document.getElementById('score-o').querySelector('.score-value');
    const scoreDraw = document.getElementById('score-draw').querySelector('.score-value');
    
    // Game state
    let scores = { x: 0, o: 0, draw: 0 };
    let gameActive = true;
    
    // Initialize the game board
    function initializeBoard() {
        gameBoard.innerHTML = '';
        
        // Create 3x3 grid
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => handleCellClick(row, col));
                gameBoard.appendChild(cell);
            }
        }
        
        // Get initial game state from server
        fetchGameState();
    }
    
    // Handle cell click
    function handleCellClick(row, col) {
        if (!gameActive) return;
        
        // Send move to server
        fetch('/api/move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ row, col })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateBoard(data.state);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    // Update the board with game state
    function updateBoard(state) {
        const { board, current_player, game_over, winner, moves } = state;
        
        // Update board UI
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cellIndex = row * 3 + col;
                const cell = gameBoard.children[cellIndex];
                const cellValue = board[row][col];
                
                cell.textContent = cellValue;
                cell.classList.remove('x', 'o', 'winning');
                
                if (cellValue === 'X') {
                    cell.classList.add('x');
                } else if (cellValue === 'O') {
                    cell.classList.add('o');
                }
            }
        }
        
        // Update current player display
        currentPlayerIcon.textContent = current_player;
        currentPlayerIcon.className = 'player-icon ' + current_player.toLowerCase();
        currentPlayerText.textContent = `Player ${current_player}'s Turn`;
        
        // Check game status
        if (game_over) {
            gameActive = false;
            
            if (winner) {
                // Highlight winning cells (for simplicity, we'll highlight all cells with winner's mark)
                for (let cell of gameBoard.children) {
                    if (cell.textContent === winner) {
                        cell.classList.add('winning');
                    }
                }
                
                gameStatus.textContent = `Player ${winner} Wins! 🎉`;
                gameStatus.style.color = winner === 'X' ? '#ff416c' : '#2193b0';
                
                // Update scores
                scores[winner.toLowerCase()]++;
                updateScores();
            } else {
                gameStatus.textContent = "It's a Draw! 🤝";
                gameStatus.style.color = '#666';
                
                // Update scores
                scores.draw++;
                updateScores();
            }
        } else {
            gameStatus.textContent = `Game in progress... Move: ${moves}`;
            gameStatus.style.color = '#2575fc';
        }
    }
    
    // Fetch game state from server
    function fetchGameState() {
        fetch('/api/state')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateBoard(data.state);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    // Reset the game
    function resetGame() {
        fetch('/api/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                gameActive = true;
                updateBoard(data.state);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    // Update score display
    function updateScores() {
        scoreX.textContent = scores.x;
        scoreO.textContent = scores.o;
        scoreDraw.textContent = scores.draw;
    }
    
    // Toggle theme
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.className = 'fas fa-sun';
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
    }
    
    // Event listeners
    resetBtn.addEventListener('click', resetGame);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Initialize the game
    initializeBoard();
});