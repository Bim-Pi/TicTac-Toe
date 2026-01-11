    from flask import Flask, render_template, jsonify, request
import json

app = Flask(__name__)

# Game state
class TicTacToeGame:
    def __init__(self):
        self.reset_game()
    
    def reset_game(self):
        self.board = [['' for _ in range(3)] for _ in range(3)]
        self.current_player = 'X'
        self.game_over = False
        self.winner = None
        self.moves = 0
    
    def make_move(self, row, col):
        if self.game_over or self.board[row][col] != '':
            return False
        
        self.board[row][col] = self.current_player
        self.moves += 1
        
        # Check for winner
        if self.check_winner(row, col):
            self.winner = self.current_player
            self.game_over = True
        elif self.moves == 9:
            self.game_over = True  # Draw
        else:
            # Switch player
            self.current_player = 'O' if self.current_player == 'X' else 'X'
        
        return True
    
    def check_winner(self, row, col):
        # Check row
        if self.board[row][0] == self.board[row][1] == self.board[row][2] == self.current_player:
            return True
        
        # Check column
        if self.board[0][col] == self.board[1][col] == self.board[2][col] == self.current_player:
            return True
        
        # Check diagonals
        if row == col and self.board[0][0] == self.board[1][1] == self.board[2][2] == self.current_player:
            return True
        
        if row + col == 2 and self.board[0][2] == self.board[1][1] == self.board[2][0] == self.current_player:
            return True
        
        return False
    
    def get_state(self):
        return {
            'board': self.board,
            'current_player': self.current_player,
            'game_over': self.game_over,
            'winner': self.winner,
            'moves': self.moves
        }

# Create a new game instance
game = TicTacToeGame()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/move', methods=['POST'])
def make_move():
    data = request.get_json()
    row = data.get('row')
    col = data.get('col')
    
    if row is None or col is None:
        return jsonify({'success': False, 'message': 'Invalid move'})
    
    success = game.make_move(row, col)
    
    if success:
        return jsonify({'success': True, 'state': game.get_state()})
    else:
        return jsonify({'success': False, 'message': 'Invalid move'})

@app.route('/api/reset', methods=['POST'])
def reset_game():
    game.reset_game()
    return jsonify({'success': True, 'state': game.get_state()})

@app.route('/api/state', methods=['GET'])
def get_state():
    return jsonify({'success': True, 'state': game.get_state()})

if __name__ == '__main__':
    app.run(debug=True, port=5000)