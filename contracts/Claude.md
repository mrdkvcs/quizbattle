# QuizBattle - Blockchain-Based Competitive Quiz Game

## Project Overview

QuizBattle is a real-time competitive quiz game where players battle head-to-head with cryptocurrency bets. Winners receive 2x their bet, losers get nothing, draws trigger refunds.

**Status:** Planning Phase (0% Complete)

---

## Architecture

### Frontend (SvelteKit)
- Wallet connection and signature requests
- Friend requests UI (send, accept, reject)
- Username search
- Game invite creation and acceptance
- Real-time gameplay UI
- Transaction signing for bet deposits

### Backend (Go)
- WebSocket server for real-time gameplay
- JWT session management
- User management (creation, username checks, signature verification)
- Friend request lifecycle
- Match creation and game management
- Question retrieval and delivery
- Answer checking and scoring
- Timer control during quiz
- Winner determination
- Submit game results to smart contract
- Coordinate bet deposits to contract

### Smart Contract (Solidity)
**Minimal responsibilities - money handling only:**
- Hold escrow bets for games
- Enforce both players have deposited before game can proceed
- Pay out full pot (2x bet) to winner
- Refund both players on draw

---

## Game Flow

1. **Sign In** - User connects wallet, signs message, backend verifies and issues JWT
2. **Social** - Send/accept friend requests, search usernames (all via backend)
3. **Create Match** - Player creates invite with bet amount via backend
4. **Accept Match** - Opponent accepts, both players deposit bets to contract
5. **Game Start** - Backend verifies deposits, starts WebSocket game session
6. **Quiz Battle** - Backend sends questions, tracks answers, controls timers
7. **Result** - Backend determines winner, submits result to contract
8. **Payout** - Contract automatically pays winner or refunds on draw

---

## Smart Contract Design

### Data Structures

```solidity
enum GameState { AwaitingPlayers, Ready, Completed, Cancelled }
enum GameResult { Player1Win, Player2Win, Draw }

struct Game {
    uint256 gameId;
    address player1;
    address player2;
    uint256 betAmount;
    GameState state;
    bool player1Deposited;
    bool player2Deposited;
}
```

### State Variables

```solidity
mapping(uint256 => Game) public games;
mapping(uint256 => uint256) public gameEscrow;
address public oracle;  // Backend wallet
address public owner;
```

### Core Functions

```solidity
// Game setup (called by backend or players)
function createGame(uint256 _gameId, address _player1, address _player2, uint256 _betAmount) external

// Players deposit their bets
function deposit(uint256 _gameId) external payable

// Backend submits result after game ends
function submitResult(uint256 _gameId, GameResult _result) external onlyOracle

// Cancel game and refund (if not started)
function cancelGame(uint256 _gameId) external
```

### Events

```solidity
event GameCreated(uint256 indexed gameId, address indexed player1, address indexed player2, uint256 betAmount);
event PlayerDeposited(uint256 indexed gameId, address indexed player);
event GameReady(uint256 indexed gameId);  // Both players deposited
event GameCompleted(uint256 indexed gameId, address indexed winner, uint256 payout);
event GameDraw(uint256 indexed gameId);
event GameCancelled(uint256 indexed gameId);
```

### Modifiers

```solidity
modifier onlyOracle()
modifier onlyOwner()
modifier gameExists(uint256 _gameId)
modifier onlyGamePlayer(uint256 _gameId)
```

---

## Payout Logic

- **Winner**: Receives entire pot (player1 bet + player2 bet)
- **Draw**: Both players get full refund
- **Cancelled**: Refund any deposited amounts

---

## Security Considerations

1. **Reentrancy** - Use ReentrancyGuard, Checks-Effects-Interactions pattern
2. **Oracle Trust** - Only backend can submit results
3. **Deposit Validation** - Exact bet amount required, verify sender is game participant
4. **Failed Transfers** - Use `.call()` with success check
5. **Game State** - Enforce state transitions (can't submit result before both deposited)

---

## Commands Reference

```bash
npx hardhat compile
npx hardhat test
npx hardhat coverage
REPORT_GAS=true npx hardhat test

npx hardhat node
npx hardhat run scripts/deploy.ts
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat verify --network sepolia <ADDRESS> <ORACLE_ADDRESS>

npx hardhat vars set SEPOLIA_PRIVATE_KEY
npx hardhat vars set SEPOLIA_RPC_URL
```

---

## Key Design Decisions

- **Thin Contract**: All game logic (users, friends, questions, scoring) lives in backend
- **Contract = Escrow Only**: Just handles money (deposits, payouts, refunds)
- **Backend as Oracle**: Trusted authority for game results
- **Game IDs from Backend**: Backend generates game IDs, contract just tracks them
- **ETH Only (MVP)**: Native ETH betting, ERC-20 support later
