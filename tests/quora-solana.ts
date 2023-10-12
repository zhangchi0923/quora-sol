import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QuoraSolana } from "../target/types/quora_solana";
import { assert } from "chai";

describe("quora-solana", () => {
  // Configure the client to use the local cluster.
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.QuoraSolana as Program<QuoraSolana>;

  // question account test
  let title = "如何量产航空母舰?";
  // let question_account_seed = [Buffer.from(title), provider.wallet.publicKey.toBuffer()] as Buffer[];
  let question_account;

  before(async () => {
    [question_account] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(title), provider.wallet.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Is initialized!", async () => {
    // Add your test here.
    let content = "请教宫保鸡丁的标准做法？";
    const tx = await program.methods.initializeQuestion(
      title,
      content
    )
      .accounts({
        questionAccount: question_account,
        initializer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc({ commitment: "confirmed" });
    console.log("Question init signature", tx);

    let fetched_question_account = await program.account.questionAccount.fetch(question_account, "confirmed");
    assert.ok(fetched_question_account.raiser.equals(provider.wallet.publicKey));
    assert.ok(fetched_question_account.isInitialized);
    assert.ok(fetched_question_account.title === title);
    assert.ok(fetched_question_account.content === content);
  });

  it("Is updated?", async () => {
    let content = "请教宫保鸡丁的标准做法？家里有孩子，口味不要太重。"
    const tx = await program.methods.updateQuestion(
      title,
      content
    )
      .accounts({
        questionAccount: question_account,
        initializer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc({ commitment: "confirmed" });
    console.log("Question update transaction signature: ", tx);

    let fetched_question_account = await program.account.questionAccount.fetch(question_account, "confirmed");
    assert.equal(fetched_question_account.content, content);
  });

  it("Is closed?", async () => {
    const tx = await program.methods.closeQuestion()
      .accounts({
        questionAccount: question_account,
        raiser: provider.wallet.publicKey
      })
      .rpc({ commitment: "confirmed" });
    console.log("Question close transaction signature: ", tx);
    let pda = await provider.connection.getAccountInfo(question_account, "confirmed");
    assert.isNull(pda);
  })
});
