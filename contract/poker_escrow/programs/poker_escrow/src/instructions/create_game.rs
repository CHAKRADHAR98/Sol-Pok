// programs/poker_escrow/src/instructions/create_game.rs
use anchor_lang::prelude::*;
use crate::state::{PokerEscrow, GameStatus, GameType};
use crate::errors::PokerError;

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct CreateGame<'info> {
    #[account(mut)]
    pub game_server: Signer<'info>,
    
    #[account(
        init,
        payer = game_server,
        space = PokerEscrow::MAX_SIZE,
        seeds = [
            PokerEscrow::SEED_PREFIX,
            game_server.key().as_ref(),
            game_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub poker_escrow: Account<'info, PokerEscrow>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateGame>,
    game_id: u64,
    buy_in: u64,
    min_players: u8,
    max_players: u8,
    game_type: GameType,
    hand_identifier: String,
) -> Result<()> {
    // Validate inputs
    require!(min_players >= 2, PokerError::InvalidPlayerCount);
    require!(max_players <= 10, PokerError::InvalidPlayerCount);
    require!(min_players <= max_players, PokerError::InvalidPlayerCount);
    require!(buy_in > 0, PokerError::IncorrectBuyIn);
    require!(!hand_identifier.is_empty(), PokerError::InvalidHandIdentifier);
    require!(hand_identifier.len() <= 64, PokerError::InvalidHandIdentifier);

    let poker_escrow = &mut ctx.accounts.poker_escrow;
    let clock = Clock::get()?;

    // Initialize poker escrow with enhanced fields
    poker_escrow.game_id = game_id;
    poker_escrow.game_server = ctx.accounts.game_server.key();
    poker_escrow.buy_in = buy_in;
    poker_escrow.total_pot = 0;
    poker_escrow.min_players = min_players;
    poker_escrow.max_players = max_players;
    poker_escrow.current_players = 0;
    poker_escrow.status = GameStatus::Pending;
    poker_escrow.game_type = game_type.clone();
    poker_escrow.hand_identifier = hand_identifier.clone();
    poker_escrow.players = Vec::new();
    poker_escrow.hand_results = Vec::new();
    poker_escrow.created_at = clock.unix_timestamp;
    poker_escrow.started_at = None;
    poker_escrow.completed_at = None;
    poker_escrow.dealer_position = 0;
    poker_escrow.hand_number = 0;
    poker_escrow.total_hands_played = 0;
    poker_escrow.bump = ctx.bumps.poker_escrow;

    msg!(
        "Poker game created: ID={}, type={:?}, buy_in={} lamports, players={}-{}, hand_id={}", 
        game_id, 
        game_type,
        buy_in, 
        min_players, 
        max_players,
        hand_identifier
    );

    Ok(())
}