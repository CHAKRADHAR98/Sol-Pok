// programs/poker_escrow/src/state.rs
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum GameStatus {
    Pending,     // Waiting for players
    Active,      // Game in progress
    Completed,   // Game finished, payouts done
    Abandoned,   // Game abandoned, refunds available
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Debug)]
pub enum GameType {
    SingleHand,     // MVP: One poker hand per contract
    Tournament,     // Future: Multiple hands
    CashGame,       // Future: Continuous play
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct PlayerDeposit {
    pub player: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct HandResult {
    pub winner: Pubkey,
    pub hand_rank: u8,          // 0-9 (High Card to Royal Flush)
    #[max_len(32)]
    pub hand_description: String, // "Full House", "Flush", etc.
    pub winning_amount: u64,
}

#[account]
#[derive(InitSpace)]
pub struct PokerEscrow {
    /// Unique game identifier
    pub game_id: u64,
    
    /// Game server authorized to trigger payouts
    pub game_server: Pubkey,
    
    /// Required buy-in amount per player (in lamports)
    pub buy_in: u64,
    
    /// Total pot accumulated (in lamports)
    pub total_pot: u64,
    
    /// Player limits
    pub min_players: u8,
    pub max_players: u8,
    pub current_players: u8,
    
    /// Game status
    pub status: GameStatus,
    
    /// Game type for different poker formats
    pub game_type: GameType,
    
    /// Hand identifier for tracking (hash or round number)
    #[max_len(64)]
    pub hand_identifier: String,
    
    /// Player deposits (max 10 players for space efficiency)
    #[max_len(10)]
    pub players: Vec<PlayerDeposit>,
    
    /// Hand results for transparency and verification
    #[max_len(10)]
    pub hand_results: Vec<HandResult>,
    
    /// Game timing
    pub created_at: i64,
    pub started_at: Option<i64>,
    pub completed_at: Option<i64>,
    
    /// Poker-specific fields
    pub dealer_position: u8,        // Dealer button position
    pub hand_number: u32,           // Current hand number (for multi-hand games)
    pub total_hands_played: u32,    // Total hands completed
    
    /// PDA bump
    pub bump: u8,
}

impl PokerEscrow {
    pub const SEED_PREFIX: &'static [u8] = b"poker_game";
    
    /// Calculate total space needed (updated with new fields)
    pub const MAX_SIZE: usize = 8 + // discriminator
        8 + // game_id
        32 + // game_server
        8 + // buy_in
        8 + // total_pot
        1 + // min_players
        1 + // max_players  
        1 + // current_players
        1 + // status
        1 + // game_type
        4 + 64 + // hand_identifier (String with max 64 chars)
        4 + (10 * (32 + 8 + 8)) + // players vec (max 10)
        4 + (10 * (32 + 1 + 4 + 32 + 8)) + // hand_results vec (max 10 * HandResult size)
        8 + // created_at
        9 + // started_at (Option<i64>)
        9 + // completed_at (Option<i64>)
        1 + // dealer_position
        4 + // hand_number
        4 + // total_hands_played
        1; // bump

    /// Check if player already joined
    pub fn has_player(&self, player: &Pubkey) -> bool {
        self.players.iter().any(|p| p.player == *player)
    }

    /// Check if game can start
    pub fn can_start(&self) -> bool {
        self.status == GameStatus::Pending && 
        self.current_players >= self.min_players
    }

    /// Check if game is full
    pub fn is_full(&self) -> bool {
        self.current_players >= self.max_players
    }

    /// Add player to game
    pub fn add_player(&mut self, player: Pubkey, amount: u64) -> Result<()> {
        require!(!self.is_full(), crate::errors::PokerError::GameFull);
        require!(!self.has_player(&player), crate::errors::PokerError::PlayerAlreadyJoined);
        require!(amount == self.buy_in, crate::errors::PokerError::IncorrectBuyIn);

        self.players.push(PlayerDeposit {
            player,
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        self.current_players += 1;
        self.total_pot += amount;
        
        Ok(())
    }

    /// Set hand result for transparency
    pub fn add_hand_result(&mut self, winner: Pubkey, hand_rank: u8, hand_description: String, amount: u64) -> Result<()> {
        // Validate hand rank is within valid poker range
        require!(hand_rank <= 9, crate::errors::PokerError::InvalidHandResult);
        
        // Only keep last 10 results to manage space
        if self.hand_results.len() >= 10 {
            self.hand_results.remove(0);
        }
        
        self.hand_results.push(HandResult {
            winner,
            hand_rank,
            hand_description,
            winning_amount: amount,
        });
        
        Ok(())
    }

    /// Start new hand (for multi-hand games in future)
    pub fn start_new_hand(&mut self, hand_id: String) -> Result<()> {
        self.hand_number += 1;
        self.hand_identifier = hand_id;
        
        // Reset player bets for new hand (future enhancement)
        // For MVP, each contract instance = one hand
        
        Ok(())
    }

    /// Complete current hand
    pub fn complete_hand(&mut self) -> Result<()> {
        self.total_hands_played += 1;
        self.completed_at = Some(Clock::get()?.unix_timestamp);
        
        // Note: Game status transitions are handled in distribute_pot:
        // - SingleHand games: Always set to Completed
        // - Tournament/CashGame: Set to Completed only when pot reaches 0
        // This method just handles the hand completion tracking
        
        Ok(())
    }

    /// Rotate dealer button (for multi-hand games)
    pub fn rotate_dealer(&mut self) -> Result<()> {
        if self.current_players > 0 {
            self.dealer_position = (self.dealer_position + 1) % self.current_players;
        }
        Ok(())
    }

    /// Get next dealer position
    pub fn get_next_dealer(&self) -> u8 {
        if self.current_players > 0 {
            (self.dealer_position + 1) % self.current_players
        } else {
            0
        }
    }
}