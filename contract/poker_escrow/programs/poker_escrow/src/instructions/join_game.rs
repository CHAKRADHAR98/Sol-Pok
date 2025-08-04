use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::{PokerEscrow, GameStatus};
use crate::errors::PokerError;

#[derive(Accounts)]
pub struct JoinGame<'info> {
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

pub fn handler(ctx: Context<JoinGame>) -> Result<()> {
    let player_key = ctx.accounts.player.key();
    
    // Extract values we need before borrowing mutably
    let current_status = ctx.accounts.poker_escrow.status.clone();
    let is_full = ctx.accounts.poker_escrow.is_full();
    let has_player = ctx.accounts.poker_escrow.has_player(&player_key);
    let buy_in_amount = ctx.accounts.poker_escrow.buy_in;
    let game_id = ctx.accounts.poker_escrow.game_id;
    let max_players = ctx.accounts.poker_escrow.max_players;
    
    // Validate game state
    require!(current_status == GameStatus::Pending, PokerError::GameNotPending);
    require!(!is_full, PokerError::GameFull);
    require!(!has_player, PokerError::PlayerAlreadyJoined);

    // Check player has sufficient SOL balance
    require!(
        ctx.accounts.player.lamports() >= buy_in_amount,
        PokerError::InsufficientBalance
    );

    // Transfer SOL from player to escrow PDA
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.poker_escrow.to_account_info(),
            }
        ),
        buy_in_amount,
    )?;

    // Add player to game and get current players count
    let poker_escrow = &mut ctx.accounts.poker_escrow;
    poker_escrow.add_player(player_key, buy_in_amount)?;
    let current_players = poker_escrow.current_players;

    msg!("Player {} joined SOL game {}, players: {}/{}", 
         player_key,
         game_id,
         current_players,
         max_players);

    Ok(())
}