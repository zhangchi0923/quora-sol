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
        question_account.initializer = ctx.accounts.initializer.key();
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

    pub fn initialize_answer(ctx: Context<InitializeAnswer>, content: String) -> Result<()> {
        msg!("初始化Answer账户...");
        let answer_account = &mut ctx.accounts.answer_account;
        require!(
            !answer_account.is_initialized,
            QuoraError::AnswerAlreadyInitialized
        );
        // write data
        answer_account.is_initialized = true;
        answer_account.answerer = ctx.accounts.answerer.key();
        msg!("Answer内容：{}", content);
        answer_account.answer_content = content;
        answer_account.upvote_amount = 0;
        answer_account.is_adopted = false;

        Ok(())
    }

    pub fn update_answer(ctx: Context<UpdateAnswer>, content: String) -> Result<()> {
        msg!("更新Answer内容...");
        let answer_account = &mut ctx.accounts.answer_account;
        require!(
            answer_account.is_initialized,
            QuoraError::AnswerNotInitialized
        );
        msg!("Answer内容：{}", answer_account.answer_content);
        msg!("Answer内容更新为：{}", content);
        answer_account.answer_content = content;

        Ok(())
    }

    pub fn upvote_answer(ctx: Context<UpvoteAnswer>) -> Result<()> {
        let answer_account = &mut ctx.accounts.answer_account;
        require!(
            answer_account.is_initialized,
            QuoraError::AnswerNotInitialized
        );
        msg!("当前点赞数：{}", answer_account.upvote_amount);
        msg!("更新点赞数...");
        answer_account.upvote_amount = answer_account.upvote_amount.checked_add(1).unwrap();
        msg!("更新后点赞数：{}", answer_account.upvote_amount);

        Ok(())
    }
}

/*提问题 */
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
    pub question_account: Account<'info, QuestionAccount>,
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
        realloc::zero = true,
        has_one = initializer @QuoraError::NotInitializer
    )]
    pub question_account: Account<'info, QuestionAccount>,
}

#[derive(Accounts)]
pub struct CloseQuestion<'info> {
    #[account(mut, close = initializer, has_one = initializer @QuoraError::NotInitializer)]
    question_account: Account<'info, QuestionAccount>,
    #[account(mut)]
    pub initializer: Signer<'info>,
}

/*回答问题 */
#[derive(Accounts)]
#[instruction(content: String)]
pub struct InitializeAnswer<'info> {
    #[account(mut)]
    pub answerer: Signer<'info>,
    pub question_account: Account<'info, QuestionAccount>,
    pub system_program: Program<'info, System>,
    #[account(
        init,
        seeds = [question_account.key().as_ref(), answerer.key().as_ref()],
        bump,
        payer = answerer,
        space = 8 + 1 + 32 + 4 + content.len() + 8 + 1
    )]
    pub answer_account: Account<'info, AnswerAccount>,
}

#[derive(Accounts)]
#[instruction(content: String)]
pub struct UpdateAnswer<'info> {
    #[account(mut)]
    pub answerer: Signer<'info>,
    pub question_account: Account<'info, QuestionAccount>,
    pub system_program: Program<'info, System>,
    #[account(
        mut,
        seeds = [question_account.key().as_ref(), answerer.key().as_ref()],
        bump,
        realloc = 8 + 1 + 32 + 4 + content.len() + 8 + 1,
        realloc::payer = answerer,
        realloc::zero = true,
        has_one = answerer @QuoraError::NotInitializer
    )]
    pub answer_account: Account<'info, AnswerAccount>,
}

#[derive(Accounts)]
pub struct UpvoteAnswer<'info> {
    #[account(mut)]
    pub answer_account: Account<'info, AnswerAccount>,
}

#[account]
pub struct QuestionAccount {
    pub is_initialized: bool,
    pub initializer: Pubkey,
    pub title: String,
    pub content: String,
}

#[account]
pub struct AnswerAccount {
    pub is_initialized: bool,
    pub answerer: Pubkey,
    pub answer_content: String,
    pub upvote_amount: u64,
    pub is_adopted: bool,
}

#[error_code]
pub enum QuoraError {
    #[msg("You have initialized a question with the same title.")]
    QuestionAlreadyInitialized,
    #[msg("Question has not been initialized.")]
    QuestionNotInitialized,

    #[msg("Answer account has been initialized.")]
    AnswerAlreadyInitialized,
    #[msg("Answer has not been initialized.")]
    AnswerNotInitialized,

    #[msg("You are not the initializer.")]
    NotInitializer,
}
