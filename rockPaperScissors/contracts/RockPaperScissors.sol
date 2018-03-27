//TODO make withdrawGame neater
// TODO run solidity checker (somewhere a link was give)

pragma solidity ^0.4.19;

contract RockPaperScissors {
    
    // duration is given in blocks and is initialized at contract deployment.
    uint duration;
    
    // these variables are needed to keep track of during the game. 
    // Rock == 1, Scissors == 2, Stone == 3.
    struct Game {
        uint stage;
        uint bet;
        bytes32 hiddenMove;
        uint initialTime;
        uint8 secondMove;
        address secondPlayer;
        uint secondTime;
    }
    
    // we map an address (the person who makes the first move) to the game variables.
    mapping(address => Game) public games;
    
    // this map is to keep track of the payouts (which can be claimed by the players at will)
    mapping(address => uint) public balances;
    
    // TODO! Events
    // constructor -> we set duration
    function RockPaperScissors(uint _duration) {
        duration = _duration;
    }
    
    event logNewPlay(bytes32 _hiddenMove, address indexed _firstPlayer, address indexed _secondPlayer, uint _value);
    event logAcceptPlay(address indexed _firstPlayer, uint8 _move);
    event logFinishPlay(string _secret, uint8 _firstMove, address indexed _firstPlayer);
    event logWithdrawGame(address _sender);
    event logClaimPrize(uint _amount, address indexed _winner);
    // Everybody can call the function newPlay, given that he is not currently playing another game (stage = 0). The bet amount is set to msg.value.
    // At this point, the player cannot submit his move unhidden, since otherwise it would be very easy for player two to win. HiddenMove is essentially a hash of 
    // a password and a move. firstPlayer can reveal at a later stage the authenticity of his move by providing the password, together with his move.
    function newPlay(bytes32 _hiddenMove, address _secondPlayer) public payable {
        require(games[msg.sender].stage == 0);
        games[msg.sender].stage = 1;
        games[msg.sender].bet = msg.value;
        games[msg.sender].hiddenMove = _hiddenMove;
        games[msg.sender].initialTime = block.number;
        // secondPlayer. If left blank, anybody can accept the play.
        games[msg.sender].secondPlayer = _secondPlayer;

        logNewPlay(games[msg.sender].hiddenMove, msg.sender, games[msg.sender].secondPlayer, msg.value);
    }
    
    // This function can be called by the secondPlayer or anybody (depending on how firstPlayer started the game). 
    function acceptPlay(address firstPlayer, uint8 _move) public payable {
        require(games[firstPlayer].stage == 1);
        
        // if secondPlayer is left blank, anybody can accept the play and msg.sender will become the secondPlayer,
        if(keccak256(games[firstPlayer].secondPlayer) == keccak256(0x0000000000000000000000000000000000000000)) {
            games[firstPlayer].secondPlayer = msg.sender;
        } else {
            // otherwise, msg.sender has to be the secondPlayer
            require(games[firstPlayer].secondPlayer == msg.sender);
        }
        // the bet has to be matched with an equal amount
        require(games[firstPlayer].bet == msg.value);
        // the initialTime cannot be too far in the past
        require((games[firstPlayer].initialTime + duration) > block.number);
        // we have to check wether playerTwo submits a valid move.
        require(_move == 1 || _move == 2 || _move == 3);
        games[firstPlayer].stage = 2;
        games[firstPlayer].secondMove = _move;
        games[firstPlayer].secondTime = block.number;

        logAcceptPlay(firstPlayer, _move);
    }
    
    // This function requires the firstPlayer to submit his secret and move. If he does not provide these, the contract assumes he lost
    // and after a duration, secondPlayer will be able to claim the prize. If firstPlayer submitted an invalid move, the contract automatically
    // assigns the prize to secondPlayer. 
    function finishPlay(string _secret, uint8 _firstMove) public {
         require(games[msg.sender].stage == 2);
        
        // if incorrect values were passed, the function reverts. 
        require(keccak256(_firstMove, _secret) == games[msg.sender].hiddenMove);
        games[msg.sender].stage = 0;
        
        // tie
        if(_firstMove == games[msg.sender].secondMove) {
            balances[msg.sender] += games[msg.sender].bet;
            balances[games[msg.sender].secondPlayer] += games[msg.sender].bet;
        } 
        // firstPlayer wins
        else if
        (
            (_firstMove == 1 && games[msg.sender].secondMove == 3) ||
            (_firstMove == 2 && games[msg.sender].secondMove == 1) ||
            (_firstMove == 3 && games[msg.sender].secondMove == 2)
        ) {
            balances[msg.sender] += (games[msg.sender].bet * 2);
        }
        // secondPlayer wins
        else {
            balances[games[msg.sender].secondPlayer] += (games[msg.sender].bet * 2);
        }

        logFinishPlay(_secret, _firstMove, msg.sender);
        
    }
    
    // this function can be called if the game is in stage one or two if the duration has passed. If the function is called in stage one, the contract pays out
    // the bet to firstPlayer. If the function is called in stage two, the contract pays out the bet to secondPlayer.
    function withdrawGame(address _firstPlayer) public {
        require(games[_firstPlayer].stage != 0);

        if(games[_firstPlayer].stage ==1) {
            require((games[_firstPlayer].initialTime + duration) < block.number);
            games[_firstPlayer].stage == 0;
            balances[_firstPlayer] += games[_firstPlayer].bet;
        } else {
            require((games[_firstPlayer].secondTime + duration) < block.number);
            games[_firstPlayer].stage = 0;
            balances[games[_firstPlayer].secondPlayer] += (games[_firstPlayer].bet * 2);
        }
        logWithdrawGame(msg.sender);
    }

     // anybody who has a prize to claim can call this function and his prize will be paid out
    function claimPrize() public {
        require(balances[msg.sender] != 0);
        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;
        logClaimPrize(amount, msg.sender);
        msg.sender.transfer(amount);
    }
    
}

