use anchor_lang::prelude::*;
use crate::state::{PokerEscrow, GameStatus};
use crate::errors::PokerError;

#[derive(Accounts)]
pub struct EmergencyRefund<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    
    /// CHECK: Game server account (verified in escrow)
    pub game_server: UncheckedAccount<'info>,
    
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
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<EmergencyRefund>) -> Result<()> {
    let clock = Clock::get()?;
    let player_key = ctx.accounts.player.key();
    
    // Extract values we need before borrowing mutably
    let current_status = ctx.accounts.poker_escrow.status.clone();
    let created_at = ctx.accounts.poker_escrow.created_at;
    let has_player = ctx.accounts.poker_escrow.has_player(&player_key);
    
    // Validate player is in the game
    require!(has_player, PokerError::PlayerNotInGame);
    
    // Emergency refund conditions:
    // 1. Game is pending and 24 hours have passed, OR
    // 2. Game is marked as abandoned
    let refund_timeout = 24 * 60 * 60; // 24 hours in seconds
    let can_emergency_refund = match current_status {
        GameStatus::Pending => {
            clock.unix_timestamp - created_at > refund_timeout
        },
        GameStatus::Abandoned => true,
        _ => false,
    };
    
    require!(can_emergency_refund, PokerError::RefundTimeoutNotReached);

    // Find player's deposit amount
    let refund_amount = ctx.accounts.poker_escrow.players
        .iter()
        .find(|p| p.player == player_key)
        .ok_or(PokerError::PlayerNotInGame)?
        .amount;

    // Transfer SOL from escrow back to player
    **ctx.accounts.poker_escrow.to_account_info().try_borrow_mut_lamports()? -= refund_amount;
    **ctx.accounts.player.to_account_info().try_borrow_mut_lamports()? += refund_amount;

    // Remove player from game
    let poker_escrow = &mut ctx.accounts.poker_escrow;
    poker_escrow.players.retain(|p| p.player != player_key);
    poker_escrow.current_players -= 1;
    poker_escrow.total_pot -= refund_amount;

    msg!("Emergency refund: {} lamports returned to player {}", 
         refund_amount, player_key);

    Ok(())
}
