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
  let title = "如何烹饪航空母舰?";
  // let question_account_seed = [Buffer.from(title), provider.wallet.publicKey.toBuffer()] as Buffer[];
  let question_account;
  let answer_account;

  before(async () => {
    [question_account] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(title), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    [answer_account] = anchor.web3.PublicKey.findProgramAddressSync(
      [question_account.toBuffer(), provider.wallet.publicKey.toBuffer()],
      program.programId
    )
  });

  // it("Is initialized!", async () => {
  //   // Add your test here.
  //   let content = "请教宫保鸡丁的标准做法？";
  //   const tx = await program.methods.initializeQuestion(
  //     title,
  //     content
  //   )
  //     .accounts({
  //       questionAccount: question_account,
  //       initializer: provider.wallet.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId
  //     })
  //     .rpc({ commitment: "confirmed" });
  //   console.log("Question init signature", tx);

  //   let fetched_question_account = await program.account.questionAccount.fetch(question_account, "confirmed");
  //   assert.ok(fetched_question_account.raiser.equals(provider.wallet.publicKey));
  //   assert.ok(fetched_question_account.isInitialized);
  //   assert.ok(fetched_question_account.title === title);
  //   assert.ok(fetched_question_account.content === content);
  // });

  // it("Is updated?", async () => {
  //   let content = "请教宫保鸡丁的标准做法？家里有孩子，口味不要太重。"
  //   const tx = await program.methods.updateQuestion(
  //     title,
  //     content
  //   )
  //     .accounts({
  //       questionAccount: question_account,
  //       initializer: provider.wallet.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId
  //     })
  //     .rpc({ commitment: "confirmed" });
  //   console.log("Question update transaction signature: ", tx);

  //   let fetched_question_account = await program.account.questionAccount.fetch(question_account, "confirmed");
  //   assert.equal(fetched_question_account.content, content);
  // });

  // it("Is closed?", async () => {
  //   const tx = await program.methods.closeQuestion()
  //     .accounts({
  //       questionAccount: question_account,
  //       raiser: provider.wallet.publicKey
  //     })
  //     .rpc({ commitment: "confirmed" });
  //   console.log("Question close transaction signature: ", tx);
  //   let pda = await provider.connection.getAccountInfo(question_account, "confirmed");
  //   assert.isNull(pda);
  // })

  // it("Is answer initialized?", async () => {
  //   // let questions = await provider.connection.getProgramAccounts(program.programId);
  //   // console.log(questions);
  //   let content = "你到底是想问航母还是宫保鸡丁？";
  //   const tx = await program.methods.initializeAnswer(
  //     question_account,
  //     content
  //   )
  //     .accounts({
  //       answerAccount: answer_account,
  //       answerer: provider.wallet.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId
  //     })
  //     .rpc({ commitment: 'confirmed' });

  //   console.log("Answer init signature", tx);
  //   let fetched_answer_account = await program.account.answerAccount.fetch(answer_account, "confirmed")
  //   assert.equal(fetched_answer_account.answerContent, content)
  // });

  it("Is answer updated?", async () => {
    let content = "造航母的话参考www.baidu.com。宫保鸡丁的话参考www.douyin.com。";
    const tx = await program.methods.updateAnswer(
      question_account,
      content
    )
      .accounts({
        answerAccount: answer_account,
        answerer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc({ commitment: "confirmed" })

    console.log("Answer update transaction: ", tx);

    let fetched_answer_account = await program.account.answerAccount.fetch(answer_account, "confirmed")
    assert.equal(fetched_answer_account.answerContent, content)

  })
});
