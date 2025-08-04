// programs/poker_escrow/src/errors.rs
use anchor_lang::prelude::*;

#[error_code]
pub enum PokerError {
    #[msg("Game is full")]
    GameFull,
    
    #[msg("Player already joined this game")]
    PlayerAlreadyJoined,
    
    #[msg("Incorrect buy-in amount")]
    IncorrectBuyIn,
    
    #[msg("Game not in pending status")]
    GameNotPending,
    
    #[msg("Game not active")]
    GameNotActive,
    
    #[msg("Not enough players to start")]
    NotEnoughPlayers,
    
    #[msg("Game already started")]
    GameAlreadyStarted,
    
    #[msg("Game already completed")]
    GameAlreadyCompleted,
    
    #[msg("Unauthorized game server")]
    UnauthorizedGameServer,
    
    #[msg("Invalid winner list")]
    InvalidWinnerList,
    
    #[msg("Payout amounts don't match pot")]
    PayoutMismatch,
    
    #[msg("Player not in game")]
    PlayerNotInGame,
    
    #[msg("Game not abandoned")]
    GameNotAbandoned,
    
    #[msg("Refund timeout not reached")]
    RefundTimeoutNotReached,
    
    #[msg("Invalid player count")]
    InvalidPlayerCount,
    
    #[msg("Math overflow")]
    MathOverflow,
    
    #[msg("Insufficient SOL balance")]
    InsufficientBalance,

    // New poker-specific errors
    #[msg("Invalid game type")]
    InvalidGameType,
    
    #[msg("Invalid hand identifier")]
    InvalidHandIdentifier,
    
    #[msg("Hand already completed")]
    HandAlreadyCompleted,
    
    #[msg("Invalid hand result")]
    InvalidHandResult,
    
    #[msg("Maximum hands reached")]
    MaximumHandsReached,
    
    #[msg("Hand not started")]
    HandNotStarted,
    
    #[msg("Invalid dealer position")]
    InvalidDealerPosition,
    
    #[msg("Winner verification failed")]
    WinnerVerificationFailed,
    
    #[msg("Hand results limit exceeded")]
    HandResultsLimitExceeded,

    #[msg("Game not completed")]
    GameNotCompleted,
    
    #[msg("Pot not empty")]
    PotNotEmpty,
}