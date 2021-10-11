import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/* 
The Square component renders the buttons that will be used as the "mini squares"
When clicked upon, the id will either contain "X" or "O" depending on who's go it is. 
*/

function Square(props) {
  return (
    <button className="square" id={props.value} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

const totalRows = 3; //Setting the amount of rows (This will be used in the render row function to loop through and create the grid (Board-rows and buttons))
const squaresPerRow = 3; //Setting the amount of squares per a row (This will be used in the render row function to loop through and create the grid (Board-rows and buttons))

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(row) {
    const squares = []; //Array to hold the squares (Buttons).
    const offset = row * squaresPerRow; // this makes sure first row is 0,1,2, second row is 3,4,5, etc. Replacing the hard code found in the tutorial. Example of hardcode: "{this.renderSquare(0)}"
    for (let s = 0; s < squaresPerRow; s++) { //Loop through adding each square til the 3 is met from the squaresPerRow const set earlier. 
      squares.push(
        this.renderSquare(offset + s) //Used to create "{this.renderSquare(0)}" With the number updating to give each square a uniqie id.
      );
    }
    return (
      <div className="board-row">
        {squares}
      </div>
    )
  }

  render() {
    const rows = [];
    for (let r = 0; r < totalRows; r++) { //This loops through add the content of each row. It does this by pushing renderRow(row) to an empty array.
      rows.push(
        this.renderRow(r)
      );
    }
    return <div>{rows}</div>; //Returns the div containing both the row and squares. 
  }
}

class Game extends React.Component {

  /*
  The constructor holds the live states that will be used within this application.
  History is used to take into account each move (It keeps a record of how the board looks after every move)
  StepNumber is used to navigate though the users moves. (Allowing us to recall previous history and provides the next/back button with functionality)
  xScore, oScore and draw Score are used to keep track of each games out come.
  gameNo is used to keep track of the amount of games that have been played and points available. 
  */

  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true,
      xScore: 0,
      oScore: 0,
      drawScore: 0,
      gameNo: 1,
    };
  }

  /*
  The handleClick function below handles the clicking of the individual box. 
  */

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();


    /*
    If a winner occurs, this will prevent you on click on any of the other squares. 
    You can by pass this by resetting the game, or going back to a previous move and continuing from that state. 
    */

    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O'; //Used to determine which move is next.
    this.setState({ 
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    }); //Updates the states with the latest information after the click. 
  }

  /*
  The function below allows the user to navigate through their game history.
  It is in an if else statement to prevent the user from naviagtion above the possible amount of clicks.
  It also prevents the user from going back too far into negative moves.
  If they move off the winning move, this will remove the winning class. No longer displaying the winning line. 
  It also updates the state to display whos move it is based on which move you navigate to. 
  */

  jumpTo(step) {
      if (step >= 10 || step < 0) {
        return;
      } else {
      // document.getElementsByClassName('square').classList.remove('winningRow');
      let squareClasses = document.getElementsByClassName('square'); //A variable that will be used to loop through all the squares removing the winningRow class (That shows which line won the game).
      for (var i = 0; i < squareClasses.length; i++) {
        squareClasses[i].classList.remove('winningRow');
      }

      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
      });
    }
  }

  /*
  This historyToggle below has been implemented to provide functionality to the "H" button.
  This will allow the user to toggle between seeing their move history and not. 
  */

  historyToggle = () => {
    var x = document.getElementById("historyDiv");
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  }

  /*
  The resetButton function provides the code for the arrowed button.
  This has 3 purposes. 
  1st is to add to the gameNo state updating the amount of games played.
  Second is to hide the historyDiv (ID that has all the games moves in) if a new game is stated.
  The final is to jump to an empty board. 
  */

  resetButton = (totalGamesPlayed, totalScore) => {

    if((totalGamesPlayed - totalScore) === 1) {
      this.state.gameNo++;
    }

    var x = document.getElementById("historyDiv");
      if (x.style.display === "block") {
      x.style.display = "none";
    }
    this.jumpTo(0);
  }

  /*
  Thie isDisabled button has been set up to disactivate the users buttons if the are not required.
  The well prevent the buttons from being clickable whilst the game is at the start.
  This is because you will not need any buttons til the first move is played. 
  */

  isDisabled = () => {
    if (this.state.stepNumber === 0){
    return true;
    } else {
      return false;
    }
  }

  /*
  This contains the same functionality as the isDisabed button. 
  Although it has an added feature. This prevents the next button going past the amount of goes that have occured.
  For example, if 2 moves have been played. You are not abled to skip to the 3rd move (As it has not occured yet)
  */

  isDisabledNextButton = () => {
    if (this.state.stepNumber === 0  || (this.state.history.length - 1) <= this.state.stepNumber){
    return true;
    } else {
      return false;
    }
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    //Next and previous button variables. This are to be used to help with the navigation buttons. Informing the program of which was the previous move and the next move to the current state the user is viewing.
    let previousStep = this.state.stepNumber - 1;
    let nextStep = this.state.stepNumber + 1;

    //Score variables. 
    let xScore = this.state.xScore;
    let oScore = this.state.oScore;
    let drawScore = this.state.drawScore;

    // totalScore adds up the score variables, this is so we can compare them to the games played. To prevent adding extra points when naviagting through the winning move and the rest. 
    let totalScore = this.state.xScore + this.state.oScore + this.state.drawScore;
    let totalGamesPlayed = this.state.gameNo;
  
    // Const moves updates the list containing the buttons found within the history section. It adds a new button with details each time a move occurs.
    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    /*
    The winner else if statement below provides 3 different functionalities.
    The first is to see if someon has won, if so to add a point to the winner.
    The section is to check if a draw has occured. it does this by checking the total moves and making sure no one has one. If a draw has occured a point will be added to the drawScore.
    If neither of these events have occured. It will update the game status informing the user who's move is next. 
    */

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
      if (winner === "X" && totalScore < totalGamesPlayed){
        this.state.xScore++;
      } else if (totalScore < totalGamesPlayed) {
        this.state.oScore++;
      }
    } else if (!winner && this.state.stepNumber === 9) { //Adding an else if statement to check the status of the game. (To see if it is a draw)
      status = 'Play again! It was a draw...'
      if (totalScore < totalGamesPlayed) {
        this.state.drawScore++;
      }

    } else {
      status = "It's " + (this.state.xIsNext ? 'X' : 'O') + "'s move"; 
    }

    //The main return below, displays all of the features on web page. 

    return (
      <div className="game">
        <div className="scoreBoard xScoreBoard">
          <div id="X" className="individualScores">
            <h2>X</h2>
            <h4>{xScore} wins</h4>
          </div>    
          <div id="O" className="individualScores">
          <h2>O</h2>
            <h4>{oScore} wins</h4>
          </div>   
          <div id="draw" className="individualScores drawScoreBoard">
          <h2>&#9878;</h2>
            <h4>{drawScore} draws</h4>
          </div>      
        </div>

        <div className="game-info">
          <div>{status}</div>
        </div>

        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="userButtons">
          <button title="Back Button" disabled={this.isDisabled()} onClick={() => this.jumpTo(previousStep)}>&#9754;</button>
          <button title="Restart Game" disabled={this.isDisabled()} onClick={() => this.resetButton(totalGamesPlayed, totalScore)}>&#8635;</button>
          <button title="Game History" disabled={this.isDisabled()} onClick={this.historyToggle}>H</button> 
          <button title="Next Button" disabled={this.isDisabledNextButton()} onClick={() => this.jumpTo(nextStep)}>&#9755;</button>
        </div>
        <ol id="historyDiv">{moves}</ol>
      </div>
    );
  }
}

// The render function below places the Game component (Containing all of the return above) into the html file.

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

  /*
  CalculateWinner will be used to check when a winning line occurs.
  It then calls the winningRow function mentioned earlier (Which adds the winning colour to the winning line).
  */

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      winningRow(lines[i]); //Running the winning line function in order to display which line won the game. 
      return squares[a]; //This will return X or O based on the winner and also return lines[i]
    }
  }
  return null;
}

/* 
The function below is called within the calculateWinner function. 
It's purpose is to get the winning row and loop though adding the winningRow class to the boxes that had won the game.
This class will display the winning line as a different colour. 
*/

function winningRow(line) {
  for (let i = 0; i < line.length; i++) {
    document.getElementsByClassName('square')[line[i]].className += " winningRow";
  }
}


