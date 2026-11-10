CREATE TABLE dbo.BookingPromotions
(
    BookingPromotionId INT IDENTITY(1,1) PRIMARY KEY,

    BookingId INT NOT NULL UNIQUE,

    PromotionId INT NOT NULL,

    DiscountAmount DECIMAL(10,2) NOT NULL,

    AppliedAt DATETIME2 NOT NULL
        DEFAULT SYSDATETIME(),

    CONSTRAINT FK_BookingPromotions_Bookings
        FOREIGN KEY (BookingId)
        REFERENCES dbo.Bookings(BookingId),

    CONSTRAINT FK_BookingPromotions_Promotion
        FOREIGN KEY (PromotionId)
        REFERENCES dbo.Promotions(PromotionId)
);
GO