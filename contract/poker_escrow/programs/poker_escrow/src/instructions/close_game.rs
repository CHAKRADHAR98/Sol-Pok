// programs/poker_escrow/src/instructions/close_game.rs
use anchor_lang::prelude::*;
use crate::state::{PokerEscrow, GameStatus, GameType};
use crate::errors::PokerError;

#[derive(Accounts)]
pub struct CloseGame<'info> {
    #[account(mut)]
    pub game_server: Signer<'info>,

    #[account(
        mut,
        close = game_server,
        seeds = [
            PokerEscrow::SEED_PREFIX,
            game_server.key().as_ref(),
            poker_escrow.game_id.to_le_bytes().as_ref()
        ],
        bump = poker_escrow.bump,
        has_one = game_server,
    )]
    pub poker_escrow: Account<'info, PokerEscrow>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CloseGame>) -> Result<()> {
    let poker_escrow = &ctx.accounts.poker_escrow;
    let game_id = poker_escrow.game_id;
    let game_type = poker_escrow.game_type.clone();

    // Validate that the game can be closed
    require!(poker_escrow.status == GameStatus::Completed, PokerError::GameNotCompleted);
    require!(poker_escrow.total_pot == 0, PokerError::PotNotEmpty);

    // Only allow closing Tournament and CashGame accounts manually
    // SingleHand games auto-close in distribute_pot
    match game_type {
        GameType::Tournament | GameType::CashGame => {
            msg!("Closing {} poker game {} with {} hands played", 
                 match game_type {
                     GameType::Tournament => "Tournament",
                     GameType::CashGame => "Cash Game",
                     _ => "Unknown"
                 },
                 game_id,
                 poker_escrow.total_hands_played
            );
        },
        GameType::SingleHand => {
            return Err(PokerError::InvalidGameType.into());
        }
    }

    Ok(())
}