// programs/poker_escrow/src/lib.rs
use anchor_lang::prelude::*;

mod state;
mod errors;
mod instructions;

use instructions::*;
use state::GameType;

declare_id!("2trpGNhySFn7mZysNXJMHsiQQb5Mp8LFU5sJCS35W6Qq");

#[program]
pub mod poker_escrow {
    use super::*;

    /// Create a new poker game escrow with enhanced poker features
    pub fn create_game(
        ctx: Context<CreateGame>,
        game_id: u64,
        buy_in: u64,
        min_players: u8,
        max_players: u8,
        game_type: GameType,
        hand_identifier: String,
    ) -> Result<()> {
        instructions::create_game::handler(
            ctx, 
            game_id, 
            buy_in, 
            min_players, 
            max_players, 
            game_type, 
            hand_identifier
        )
    }

    /// Join an existing poker game (unchanged from original)
    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        instructions::join_game::handler(ctx)
    }

    /// Start a poker hand when minimum players reached
    pub fn start_game(
        ctx: Context<StartGame>,
        hand_identifier: Option<String>,
    ) -> Result<()> {
        instructions::start_game::handler(ctx, hand_identifier)
    }

    /// Distribute pot to winner with hand result details
    pub fn distribute_pot(
        ctx: Context<DistributePot>,
        amount: u64,
        hand_rank: u8,
        hand_description: String,
    ) -> Result<()> {
        instructions::distribute_pot::handler(ctx, amount, hand_rank, hand_description)
    }

    /// Emergency refund for abandoned games (unchanged from original)
    pub fn emergency_refund(ctx: Context<EmergencyRefund>) -> Result<()> {
        instructions::emergency_refund::handler(ctx)
    }

    /// Close completed Tournament/CashGame accounts
    pub fn close_game(ctx: Context<CloseGame>) -> Result<()> {
        instructions::close_game::handler(ctx)
    }

    /// Get game information (view function)
    pub fn get_game_info(ctx: Context<GetGameInfo>) -> Result<GameInfo> {
        let poker_escrow = &ctx.accounts.poker_escrow;
        
        Ok(GameInfo {
            game_id: poker_escrow.game_id,
            game_type: poker_escrow.game_type.clone(),
            status: poker_escrow.status.clone(),
            current_players: poker_escrow.current_players,
            max_players: poker_escrow.max_players,
            total_pot: poker_escrow.total_pot,
            buy_in: poker_escrow.buy_in,
            hand_identifier: poker_escrow.hand_identifier.clone(),
            hand_number: poker_escrow.hand_number,
            dealer_position: poker_escrow.dealer_position,
            total_hands_played: poker_escrow.total_hands_played,
        })
    }
}

#[derive(Accounts)]
pub struct GetGameInfo<'info> {
    pub poker_escrow: Account<'info, state::PokerEscrow>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GameInfo {
    pub game_id: u64,
    pub game_type: GameType,
    pub status: state::GameStatus,
    pub current_players: u8,
    pub max_players: u8,
    pub total_pot: u64,
    pub buy_in: u64,
    pub hand_identifier: String,
    pub hand_number: u32,
    pub dealer_position: u8,
    pub total_hands_played: u32,
}