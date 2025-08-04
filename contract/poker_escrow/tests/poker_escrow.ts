import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PokerEscrow } from "../target/types/poker_escrow";
import { expect } from "chai";

describe("Enhanced Poker Escrow Tests", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.PokerEscrow as Program<PokerEscrow>;
  const provider = anchor.getProvider();

  // Test accounts
  let gameServer: Keypair;
  let player1: Keypair;
  let player2: Keypair;

  // Game parameters
  const buyInAmount = new anchor.BN(LAMPORTS_PER_SOL); // 1 SOL
  const minPlayers = 2;
  const maxPlayers = 6;
  const handIdentifier = "hand_001_preflop";

  const GameType = {
    SingleHand: { singleHand: {} },
  };

  // Helper function to airdrop
  async function airdrop(keypair: Keypair, amount: number) {
    const conn = provider.connection;
    const sig = await conn.requestAirdrop(keypair.publicKey, amount);
    const blockhash = await conn.getLatestBlockhash();
    await conn.confirmTransaction({
        signature: sig,
        ...blockhash,
    }, "confirmed");
  }

  before(async () => {
    // Create test keypairs
    gameServer = Keypair.generate();
    player1 = Keypair.generate();
    player2 = Keypair.generate();

    // Airdrop to all accounts
    await Promise.all([
        airdrop(gameServer, 10 * LAMPORTS_PER_SOL),
        airdrop(player1, 10 * LAMPORTS_PER_SOL),
        airdrop(player2, 10 * LAMPORTS_PER_SOL),
    ]);
  });

  describe("Game Creation, Flow, and Distribution", () => {
    const gameId = new anchor.BN(Date.now());
    let pokerEscrowPda: PublicKey;

    it("Creates a new SingleHand poker game successfully", async () => {
      [pokerEscrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("poker_game"), gameServer.publicKey.toBuffer(), gameId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      await program.methods
        .createGame(gameId, buyInAmount, minPlayers, maxPlayers, GameType.SingleHand, handIdentifier)
        .accounts({
          gameServer: gameServer.publicKey,
          // `pokerEscrow` is correctly omitted here because it's being created (`init`)
          // and Anchor can derive its address from the instruction arguments.
        })
        .signers([gameServer])
        .rpc();

      const gameState = await program.account.pokerEscrow.fetch(pokerEscrowPda);
      expect(gameState.gameId.toString()).to.equal(gameId.toString());
    });

    it("Allows players to join the game", async () => {
      await program.methods
        .joinGame()
        .accounts({
          player: player1.publicKey,
          pokerEscrow: pokerEscrowPda,
          gameServer: gameServer.publicKey, // Required for the `has_one` client-side check
        })
        .signers([player1])
        .rpc();

      await program.methods
        .joinGame()
        .accounts({
          player: player2.publicKey,
          pokerEscrow: pokerEscrowPda,
          gameServer: gameServer.publicKey, // Required for the `has_one` client-side check
        })
        .signers([player2])
        .rpc();
        
      const gameState = await program.account.pokerEscrow.fetch(pokerEscrowPda);
      expect(gameState.currentPlayers).to.equal(2);
    });
    
    it("Starts the game", async () => {
        await program.methods
            .startGame(null)
            .accounts({
                gameServer: gameServer.publicKey,
                pokerEscrow: pokerEscrowPda,
            })
            .signers([gameServer])
            .rpc();

        const gameState = await program.account.pokerEscrow.fetch(pokerEscrowPda);
        expect(gameState.status).to.deep.equal({ active: {} });
    });

    it("Distributes pot and closes the SingleHand game", async () => {
        const gameStateBefore = await program.account.pokerEscrow.fetch(pokerEscrowPda);
        const totalPot = gameStateBefore.totalPot;

        await program.methods
            .distributePot(totalPot, 6, "Full House")
            .accounts({
                winner: player1.publicKey,
                pokerEscrow: pokerEscrowPda,
                gameServer: gameServer.publicKey, // Required for the `has_one` client-side check
            })
            .signers([gameServer])
            .rpc();

        // Verify account was closed
        try {
            await program.account.pokerEscrow.fetch(pokerEscrowPda);
            expect.fail("Escrow account should have been closed");
        } catch (error) {
            expect(error.message).to.include("Account does not exist");
        }
    });
  });
});