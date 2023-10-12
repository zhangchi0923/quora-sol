use anchor_lang::prelude::*;

declare_id!("9n8Y27TNBMzh83osNpmXX3accbQiUcHCQbvvunzzb5p9");

#[program]
pub mod quora_solana {
    use super::*;

    pub fn initialize_question(
        ctx: Context<InitializeQuestion>,
        title: String,
        content: String,
    ) -> Result<()> {
        msg!("初始化Question账户...");
        let question_account = &mut ctx.accounts.question_account;
        // 检查同一账户是否重复提出问题
        require!(
            !question_account.is_initialized,
            QuoraError::QuestionAlreadyInitialized
        );
        // 写入数据
        question_account.raiser = ctx.accounts.initializer.key();
        question_account.is_initialized = true;
        msg!("Question题目：{}", title);
        question_account.title = title;
        msg!("Question内容：{}", content);
        question_account.content = content;

        Ok(())
    }

    pub fn update_question(
        ctx: Context<UpdateQuestion>,
        title: String,
        content: String,
    ) -> Result<()> {
        msg!("更新Question...");
        let question_account = &mut ctx.accounts.question_account;
        require!(
            question_account.is_initialized,
            QuoraError::QuestionNotInitialized
        );
        msg!("Question题目：{}", title);
        msg!("Question内容：{}", question_account.content);
        msg!("Question内容更新为：{}", content);
        question_account.content = content;

        Ok(())
    }

    pub fn close_question(ctx: Context<CloseQuestion>) -> Result<()> {
        msg!("关闭Question：{}", ctx.accounts.question_account.title);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String, content: String)]
pub struct InitializeQuestion<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        init,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        payer = initializer,
        space = 8 + 32 + 1 + 4 + title.len() + 4 + content.len()
    )]
    question_account: Account<'info, QuestionAccount>,
}

#[derive(Accounts)]
#[instruction(title: String, content: String)]
pub struct UpdateQuestion<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        mut,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        realloc = 8 + 32 + 1 + 4 + title.len() + 4 + content.len(),
        realloc::payer = initializer,
        realloc::zero = true
    )]
    pub question_account: Account<'info, QuestionAccount>,
}

#[derive(Accounts)]
pub struct CloseQuestion<'info> {
    #[account(mut, close = raiser, has_one = raiser)]
    question_account: Account<'info, QuestionAccount>,
    #[account(mut)]
    pub raiser: Signer<'info>,
}

#[account]
pub struct QuestionAccount {
    pub is_initialized: bool,
    pub raiser: Pubkey,
    pub title: String,
    pub content: String,
}

#[account]
pub struct AnswerAcount {
    pub question_raiser: Pubkey,
}

#[error_code]
pub enum QuoraError {
    #[msg("You have initialized a question with the same title.")]
    QuestionAlreadyInitialized,
    #[msg("Question has not been initialized.")]
    QuestionNotInitialized,
}
