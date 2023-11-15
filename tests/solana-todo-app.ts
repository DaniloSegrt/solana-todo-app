import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ToDo } from "../target/types/todo";
import { PublicKey } from '@solana/web3.js';
import { assert } from "chai";
import crypto from "crypto";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import * as chai from "chai";


describe("to-do", () => {
  const provider = anchor.AnchorProvider.local("http://127.0.0.1:8899");
  anchor.setProvider(provider);

  const program = anchor.workspace.ToDo as Program<ToDo>;

  const danilo = anchor.web3.Keypair.generate();

  const todo_content = "I have to do the dishes!";

  describe("Init User", async()=>{
    it("Init User", async () => {
      await airdrop(provider.connection, danilo.publicKey);
      const user_pk = getUserAddress("", danilo.publicKey, program.programId);
  
      await program.methods.initialize_user({
          accounts: {
              authority: danilo.publicKey,
              user_profile: user_pk,
              systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [
              danilo.publicKey
          ],
      });
    });
  });
  describe("Add TO-DO",async () => {
    it("Add TO-DO",async () => {
      const user_pk = getUserAddress(" ", danilo.publicKey, program.programId);
      const todo_pk = getProgramAddress(" ", danilo.publicKey, 0, program.programId);

      await program.methods.add_todo({
        accounts: {
              user_profile : user_pk,
              todo_account : todo_pk,
              authority : danilo.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
      },
        signers: [
          danilo.publicKey
      ],
      })
    });
  });
  describe("Mark TO-DO",async () => {

    it("Mark TO-DO",async () => {
      const user_pk = getUserAddress(" ", danilo.publicKey, program.programId);
      const todo_pk = getProgramAddress(" ", danilo.publicKey, 0, program.programId);

      await program.methods.mark_todo({
        accounts: {
          user_profile : user_pk,
          todo_account : todo_pk,
          authority : danilo.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
  },
    signers: [
      danilo.publicKey
  ],
      })
    });
  });
  describe("Remove TO-DO",async () => {
    it("Remove TO-DO",async () => {
      const user_pk = getUserAddress(" ", danilo.publicKey, program.programId);
      const todo_pk = getProgramAddress(" ", danilo.publicKey, 0, program.programId);

      await program.methods.remove_todo({
        accounts: {
          user_profile : user_pk,
          todo_account : todo_pk,
          authority : danilo.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
  },
    signers: [
      danilo.publicKey
  ],
      });
    });
  })
  describe("Bad Scenarios", () => {
    describe("User Initialization Fails", () => {
      it("should fail when user initialization fails", async () => {
        const user_pk = getUserAddress("", danilo.publicKey, program.programId);

        try {
          await program.methods.initialize_user({
            accounts: {
              authority: danilo.publicKey,
              user_profile: user_pk,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
          });
          assert.fail("Expected an error, but none was thrown.");
        } catch (error) {
          assert.include(error.toString(), "Missing required signatures");
        }
      });
    });

    describe("Removing Non-Existent TODO", () => {
      it("should fail when trying to remove a non-existent TODO", async () => {
        const user_pk = getUserAddress("", danilo.publicKey, program.programId);

        await program.methods.initialize_user({
          accounts: {
            authority: danilo.publicKey,
            user_profile: user_pk,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [danilo],
        });

        try {
          await program.methods.remove_todo({
            accounts: {
              user_profile: user_pk,
              todo_account: getProgramAddress("", danilo.publicKey, 0, program.programId),
              authority: danilo.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [danilo],
          });
          assert.fail("Expected an error, but none was thrown.");
        } catch (error) {
          assert.include(error.toString(), "TODO not found");
        }
      });
    });

    describe("Exceeding TODO Count Limit", () => {
      it("should fail when exceeding TODO count limit", async () => {
        const user_pk = getUserAddress("", danilo.publicKey, program.programId);

        await program.methods.initialize_user({
          accounts: {
            authority: danilo.publicKey,
            user_profile: user_pk,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [danilo],
        });

        const todo_pk = getProgramAddress("", danilo.publicKey, 0, program.programId);
        await program.methods.add_todo({
          accounts: {
            user_profile: user_pk,
            todo_account: todo_pk,
            authority: danilo.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [danilo],
        });

      });
      });
    });

    describe("Marking an Already Marked TODO", () => {
      it("should fail when marking an already marked TODO", async () => {
        const user_pk = getUserAddress("", danilo.publicKey, program.programId);
        const todo_pk = getProgramAddress("", danilo.publicKey, 0, program.programId);

        await program.methods.add_todo({
          accounts: {
            user_profile: user_pk,
            todo_account: todo_pk,
            authority: danilo.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [danilo],
        });

        await program.methods.mark_todo({
          accounts: {
            user_profile: user_pk,
            todo_account: todo_pk,
            authority: danilo.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [danilo],
        });

        
      });
    });
});

 



async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}
function getUserAddress(USER_STATE: string, author: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(USER_STATE),
      author.toBuffer()
    ], programID);
}
function getProgramAddress(TODO_STATE: string, author: PublicKey, last_todo = 0, programID: PublicKey ){
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(TODO_STATE),
      author.toBuffer(),
    ], programID
  );
}
