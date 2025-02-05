BEGIN TRY

    BEGIN TRAN;

-- CreateTable
    CREATE TABLE [dbo].[account_types]
    (
        [id]         INT NOT NULL IDENTITY (1,1),
        [type_name]  NVARCHAR(200),
        [owner_type] INT,
        CONSTRAINT [PK__account___3213E83F2CF43568] PRIMARY KEY CLUSTERED ([id])
    );

-- CreateTable
    CREATE TABLE [dbo].[accounts]
    (
        [id]           INT NOT NULL IDENTITY (1,1),
        [owner_id]     INT,
        [account_type] INT,
        [balance]      MONEY,
        [currency]     INT,
        [is_locked]    BIT,
        CONSTRAINT [PK__accounts__3213E83F9A5EF9A3] PRIMARY KEY CLUSTERED ([id])
    );

-- CreateTable
    CREATE TABLE [dbo].[action_types]
    (
        [id]          INT NOT NULL IDENTITY (1,1),
        [action_name] NVARCHAR(200),
        CONSTRAINT [PK__action_t__3213E83F663DA6FB] PRIMARY KEY CLUSTERED ([id])
    );

-- CreateTable
    CREATE TABLE [dbo].[credit_conditions]
    (
        [id]                  INT NOT NULL IDENTITY (1,1),
        [credit_name]         NVARCHAR(200),
        [credit_type]         INT,
        [percentage_per_year] FLOAT(53),
        [max_sum]             MONEY,
        [currency]            INT,
        [paydate]             NVARCHAR(7),
        CONSTRAINT [PK__credit_c__3213E83F6D246337] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [UQ__credit_c__E2D7E624B7F9B46A] UNIQUE NONCLUSTERED ([credit_name])
    );

-- CreateTable
    CREATE TABLE [dbo].[credit_types]
    (
        [id]               INT NOT NULL IDENTITY (1,1),
        [credit_type_name] NVARCHAR(200),
        CONSTRAINT [PK__credit_t__3213E83F9770D8BB] PRIMARY KEY CLUSTERED ([id])
    );

-- CreateTable
    CREATE TABLE [dbo].[currency]
    (
        [id]                  INT NOT NULL IDENTITY (1,1),
        [currecy_name]        NVARCHAR(200),
        [currency_short_name] NVARCHAR(3),
        CONSTRAINT [PK__currency__3213E83FF8B515D0] PRIMARY KEY CLUSTERED ([id])
    );

-- CreateTable
    CREATE TABLE [dbo].[currency_convertion]
    (
        [pair_id]   INT NOT NULL IDENTITY (1,1),
        [currncy1]  INT,
        [currency2] INT,
        [ratio]     FLOAT(53),
        CONSTRAINT [PK__currency__97BA35D9017E1F48] PRIMARY KEY CLUSTERED ([pair_id])
    );

-- CreateTable
    CREATE TABLE [dbo].[deposit_conditioins]
    (
        [id]                     INT NOT NULL IDENTITY (1,1),
        [deposit_condition_name] NVARCHAR(200),
        [deposit_type]           INT,
        [percentage_per_year]    FLOAT(53),
        [currency]               INT,
        CONSTRAINT [PK__deposit___3213E83F13DA45E9] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [UQ__deposit___E5474B9E340FE6D4] UNIQUE NONCLUSTERED ([deposit_condition_name])
    );

-- CreateTable
    CREATE TABLE [dbo].[deposit_types]
    (
        [id]                INT NOT NULL IDENTITY (1,1),
        [deposit_type_name] NVARCHAR(200),
        CONSTRAINT [PK__deposit___3213E83F9B637F0F] PRIMARY KEY CLUSTERED ([id])
    );

-- CreateTable
    CREATE TABLE [dbo].[operation_log]
    (
        [id]              INT NOT NULL IDENTITY (1,1),
        [user_id]         INT,
        [account_id]      INT,
        [table_name]      NVARCHAR(200),
        [action_time]     DATETIME
            CONSTRAINT [DF__operation__actio__59063A47] DEFAULT CURRENT_TIMESTAMP,
        [additional_info] NVARCHAR(max),
        CONSTRAINT [PK__operatio__3213E83F6BDFC5E6] PRIMARY KEY CLUSTERED ([id])
    );

-- CreateTable
    CREATE TABLE [dbo].[role]
    (
        [id]               INT NOT NULL IDENTITY (1,1),
        [role_name]        NVARCHAR(200),
        [role_privs_level] INT,
        CONSTRAINT [PK__role__3213E83FC3DB53E1] PRIMARY KEY CLUSTERED ([id])
    );

-- CreateTable
    CREATE TABLE [dbo].[users]
    (
        [id]         INT NOT NULL IDENTITY (1,1),
        [first_name] NVARCHAR(200),
        [midle_name] NVARCHAR(200),
        [last_name]  NVARCHAR(200),
        [phone]      NCHAR(15),
        [user_role]  INT,
        [username]   VARCHAR(200),
        [passwd]     VARCHAR(255),
        [is_locked]  BIT
            CONSTRAINT [DF__users__is_locked__3A4CA8FD] DEFAULT 0,
        CONSTRAINT [PK__users__3213E83FD0197FA7] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [UQ__users__F3DBC57208A65445] UNIQUE NONCLUSTERED ([username])
    );

-- CreateTable
    CREATE TABLE [dbo].[Chat]
    (
        [id]         INT NOT NULL IDENTITY (1,1),
        [message]    NVARCHAR(max),
        [senderId]   INT,
        [recieverId] INT,
        [createdAt]  DATETIME
            CONSTRAINT [DF__Chat__createdAt__2B0A656D] DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT [PK__Chat__3213E83FB0602276] PRIMARY KEY CLUSTERED ([id])
    );

-- CreateTable
    CREATE TABLE [dbo].[credit_history]
    (
        [id]        INT NOT NULL IDENTITY (1,1),
        [user_id]   INT NOT NULL,
        [credit_id] INT NOT NULL,
        [amount]    MONEY,
        [opened_at] DATETIME
            CONSTRAINT [DF__credit_hi__opene__4F47C5E3] DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT [PK__credit_h__3213E83F24A71E94] PRIMARY KEY CLUSTERED ([id])
    );

-- AddForeignKey
    ALTER TABLE [dbo].[account_types]
        ADD CONSTRAINT [FK__account_t__owner__3C69FB99] FOREIGN KEY ([owner_type]) REFERENCES [dbo].[role] ([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
    ALTER TABLE [dbo].[accounts]
        ADD CONSTRAINT [FK__accounts__accoun__45F365D3] FOREIGN KEY ([account_type]) REFERENCES [dbo].[account_types] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
    ALTER TABLE [dbo].[accounts]
        ADD CONSTRAINT [FK__accounts__curren__46E78A0C] FOREIGN KEY ([currency]) REFERENCES [dbo].[currency] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
    ALTER TABLE [dbo].[accounts]
        ADD CONSTRAINT [FK__accounts__owner___44FF419A] FOREIGN KEY ([owner_id]) REFERENCES [dbo].[users] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
    ALTER TABLE [dbo].[credit_conditions]
        ADD CONSTRAINT [FK__credit_co__credi__4BAC3F29] FOREIGN KEY ([credit_type]) REFERENCES [dbo].[credit_types] ([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
    ALTER TABLE [dbo].[credit_conditions]
        ADD CONSTRAINT [FK__credit_co__curre__4CA06362] FOREIGN KEY ([currency]) REFERENCES [dbo].[currency] ([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
    ALTER TABLE [dbo].[currency_convertion]
        ADD CONSTRAINT [FK__currency___curre__4222D4EF] FOREIGN KEY ([currency2]) REFERENCES [dbo].[currency] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
    ALTER TABLE [dbo].[currency_convertion]
        ADD CONSTRAINT [FK__currency___currn__412EB0B6] FOREIGN KEY ([currncy1]) REFERENCES [dbo].[currency] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
    ALTER TABLE [dbo].[deposit_conditioins]
        ADD CONSTRAINT [FK__deposit_c__curre__52593CB8] FOREIGN KEY ([currency]) REFERENCES [dbo].[currency] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
    ALTER TABLE [dbo].[deposit_conditioins]
        ADD CONSTRAINT [FK__deposit_c__depos__5165187F] FOREIGN KEY ([deposit_type]) REFERENCES [dbo].[deposit_types] ([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
    ALTER TABLE [dbo].[operation_log]
        ADD CONSTRAINT [FK__operation__accou__5812160E] FOREIGN KEY ([account_id]) REFERENCES [dbo].[accounts] ([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
    ALTER TABLE [dbo].[operation_log]
        ADD CONSTRAINT [FK__operation__user___571DF1D5] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
    ALTER TABLE [dbo].[users]
        ADD CONSTRAINT [FK__users__user_role__398D8EEE] FOREIGN KEY ([user_role]) REFERENCES [dbo].[role] ([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
    ALTER TABLE [dbo].[Chat]
        ADD CONSTRAINT [FK__Chat__recieverId__2A164134] FOREIGN KEY ([recieverId]) REFERENCES [dbo].[users] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
    ALTER TABLE [dbo].[Chat]
        ADD CONSTRAINT [FK__Chat__senderId__29221CFB] FOREIGN KEY ([senderId]) REFERENCES [dbo].[users] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
    ALTER TABLE [dbo].[credit_history]
        ADD CONSTRAINT [FK_credit_history_credit_id] FOREIGN KEY ([credit_id]) REFERENCES [dbo].[credit_conditions] ([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
    ALTER TABLE [dbo].[credit_history]
        ADD CONSTRAINT [FK_credit_history_user_id] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

    COMMIT TRAN;

END TRY
BEGIN CATCH

    IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRAN;
        END;
    THROW

END CATCH
