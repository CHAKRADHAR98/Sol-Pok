// programs/poker_escrow/src/instructions/start_game.rs
use anchor_lang::prelude::*;
use crate::state::{PokerEscrow, GameStatus, GameType};
use crate::errors::PokerError;

#[derive(Accounts)]
pub struct StartGame<'info> {
    #[account(mut)]
    pub game_server: Signer<'info>,
    
    #[account(
        mut,
        seeds = [
            PokerEscrow::SEED_PREFIX,
            game_server.key().as_ref(),
            poker_escrow.game_id.to_le_bytes().as_ref()
        ],
        bump = poker_escrow.bump,
        has_one = game_server,
    )]
    pub poker_escrow: Account<'info, PokerEscrow>,
}

pub fn handler(
    ctx: Context<StartGame>,
    hand_identifier: Option<String>,
) -> Result<()> {
    let poker_escrow = &mut ctx.accounts.poker_escrow;
    
    // Validate game can start
    require!(poker_escrow.status == GameStatus::Pending, PokerError::GameNotPending);
    require!(poker_escrow.can_start(), PokerError::NotEnoughPlayers);

    // Set hand identifier if provided (for multi-hand games)
    if let Some(hand_id) = hand_identifier {
        require!(!hand_id.is_empty(), PokerError::InvalidHandIdentifier);
        require!(hand_id.len() <= 64, PokerError::InvalidHandIdentifier);
        poker_escrow.hand_identifier = hand_id;
    }

    // Store values before borrowing mutably to avoid borrow checker issues
    let game_type = poker_escrow.game_type.clone();
    let game_id = poker_escrow.game_id;
    let current_players = poker_escrow.current_players;
    let total_pot = poker_escrow.total_pot;
    let hand_identifier_clone = poker_escrow.hand_identifier.clone();

    // Update game status and timing
    poker_escrow.status = GameStatus::Active;
    poker_escrow.started_at = Some(Clock::get()?.unix_timestamp);
    
    // Start new hand (increments hand number) 
    poker_escrow.start_new_hand(hand_identifier_clone.clone())?;

    let game_type_str = match game_type {
        GameType::SingleHand => "Single Hand",
        GameType::Tournament => "Tournament",
        GameType::CashGame => "Cash Game",
    };

    msg!(
        "{} poker game {} started with {} players, pot: {} lamports, hand: {}", 
        game_type_str,
        game_id,
        current_players,
        total_pot,
        hand_identifier_clone
    );

    Ok(())
}