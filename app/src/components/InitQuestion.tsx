import { AnchorWallet, useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionMessage, TransactionSignature, VersionedTransaction, clusterApiUrl } from '@solana/web3.js';
import { FC, useCallback, useState } from 'react';
import { notify } from "../utils/notifications";
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import idl from "../../../target/idl/quora_solana.json";

export const InitQuestion: FC = () => {
    // const { connection } = useConnection();
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    // const { publicKey } = useWallet();
    const [questionTitle, setQuestionTitle] = useState('');
    const [questionContent, setQuestionContent] = useState('');
    const wallet = useAnchorWallet();
    const publicKey = wallet.publicKey

    let provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    const program = new Program(
        JSON.parse(JSON.stringify(idl)),
        new PublicKey(idl.metadata.address),
        provider
    )
    let question_account;

    const onClick = useCallback(async () => {
        if (!publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        [question_account] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(questionTitle), publicKey.toBuffer()],
            program.programId
        )

        let tx: TransactionSignature = '';
        try {
            tx = await program.methods.initializeQuestion(
                questionTitle,
                questionContent
            )
                .accounts({
                    initializer: publicKey,
                    questionAccount: question_account,
                    systemProgram: SystemProgram.programId
                })
                .rpc({ commitment: "confirmed" })

            notify({ type: 'success', message: 'Init Question Transaction sig: ', txid: tx });
            console.log('Init Question transaction: ', tx);
        } catch (error: any) {
            notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: tx });
            console.log('error', `Transaction failed! ${error?.message}`, tx);
            return;
        }
    }, [publicKey, notify, connection]);

    return (
        <div className="flex flex-row justify-center">
            <div className="relative group items-center">
                <div>
                    <label htmlFor="">
                        输入问题title
                        <hr />
                        <textarea
                            name='input-title'
                            value={questionTitle}
                            rows={1}
                            cols={80}
                            color='black'
                            onChange={e => setQuestionTitle(e.currentTarget.value)}
                            required
                            placeholder='Enter question title here' />
                    </label>
                    <hr />
                    <label htmlFor="">
                        输入问题详情
                        <hr />
                        <textarea
                            name='input-content'
                            value={questionContent}
                            rows={5}
                            cols={80}
                            onChange={e => setQuestionContent(e.currentTarget.value)}
                            required
                            placeholder='Enter question details here' />
                    </label>
                </div>
                {/* <div>
                    <input
                        id='question-content'
                        type="text"
                        color='black'
                        onChange={e => setQuestionContent(e.currentTarget.value)}
                        placeholder='Enter question details here' />
                </div> */}
                {/* <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div> */}
                <button
                    className="group w-30 m-3 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                    onClick={onClick} disabled={!publicKey}
                >
                    <div className="hidden group-disabled:block ">
                        Wallet not connected
                    </div>
                    <span className="block group-disabled:hidden" >
                        Publish
                    </span>
                </button>
            </div>
        </div>
    );
};