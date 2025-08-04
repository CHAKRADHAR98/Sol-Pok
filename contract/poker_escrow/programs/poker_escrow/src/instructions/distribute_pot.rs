// programs/poker_escrow/src/instructions/distribute_pot.rs
use anchor_lang::prelude::*;
use crate::state::{PokerEscrow, GameStatus, GameType};
use crate::errors::PokerError;

#[derive(Accounts)]
pub struct DistributePot<'info> {
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

    /// Winner who will receive the payout
    /// CHECK: This account is verified to be a player in the game
    #[account(mut)]
    pub winner: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<DistributePot>,
    amount: u64,
    hand_rank: u8,
    hand_description: String,
) -> Result<()> {
    let winner = ctx.accounts.winner.key();

    // Extract values we need before borrowing mutably
    let game_id = ctx.accounts.poker_escrow.game_id;
    let current_status = ctx.accounts.poker_escrow.status.clone();
    let current_pot = ctx.accounts.poker_escrow.total_pot;
    let has_winner = ctx.accounts.poker_escrow.has_player(&winner);
    let game_type = ctx.accounts.poker_escrow.game_type.clone();

    // Validate game state
    require!(current_status == GameStatus::Active, PokerError::GameNotActive);
    require!(has_winner, PokerError::PlayerNotInGame);
    require!(amount <= current_pot, PokerError::PayoutMismatch);
    require!(hand_rank <= 9, PokerError::InvalidHandResult); // 0-9 for poker hands
    require!(!hand_description.is_empty(), PokerError::InvalidHandResult);

    // Transfer SOL from escrow to winner
    **ctx.accounts.poker_escrow.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += amount;

    // Update pot and add hand result
    let poker_escrow = &mut ctx.accounts.poker_escrow;
    poker_escrow.total_pot -= amount;
    
    // Record the hand result for transparency
    poker_escrow.add_hand_result(winner, hand_rank, hand_description.clone(), amount)?;

    // Always complete the hand and rotate dealer for multi-hand games
    match game_type {
        GameType::SingleHand => {
            // Single hand games complete and close account after one payout
            poker_escrow.complete_hand()?;
            
            // Close account and return rent to game server
            let dest_starting_lamports = ctx.accounts.game_server.lamports();
            **ctx.accounts.game_server.lamports.borrow_mut() = dest_starting_lamports
                .checked_add(ctx.accounts.poker_escrow.to_account_info().lamports())
                .unwrap();
            **ctx.accounts.poker_escrow.to_account_info().lamports.borrow_mut() = 0;
            
            msg!("Single-hand poker game {} completed and closed", game_id);
        },
        GameType::Tournament | GameType::CashGame => {
            // For multi-hand games, always complete hand and rotate dealer after each payout
            poker_escrow.complete_hand()?;
            poker_escrow.rotate_dealer()?;
            
            // If pot is empty, mark game as completed
            if poker_escrow.total_pot == 0 {
                poker_escrow.status = GameStatus::Completed;
                msg!("Multi-hand poker game {} completed - all funds distributed", game_id);
            } else {
                msg!("Hand completed in poker game {}, ready for next hand", game_id);
            }
        }
    }

    msg!(
        "Paid {} lamports to winner {} with {} (rank: {})", 
        amount, 
        winner, 
        hand_description,
        hand_rank
    );

    Ok(())
}