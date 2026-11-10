
USE ViewBookCinemasDB;
GO

SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    -- Lấy 2 ghế chưa được sử dụng
    DECLARE @AvailableSeats TABLE
    (
        RowNumber INT IDENTITY(1,1),
        ShowtimeSeatId INT
    );

    INSERT INTO @AvailableSeats (ShowtimeSeatId)
    SELECT TOP 2 SS.ShowtimeSeatId
    FROM dbo.ShowtimeSeat SS
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.BookingSeats BS
        WHERE BS.ShowtimeSeatId = SS.ShowtimeSeatId
    )
    ORDER BY SS.ShowtimeSeatId;

    IF (SELECT COUNT(*) FROM @AvailableSeats) < 2
        THROW 50001, N'Không đủ 2 ghế chưa được sử dụng trong ShowtimeSeat.', 1;

    -- BookingId = 1: MoMo thành công
    INSERT INTO dbo.BookingSeats
    (
        BookingId,
        ShowtimeSeatId,
        TicketPrice
    )
    SELECT
        1,
        ShowtimeSeatId,
        85000.00
    FROM @AvailableSeats
    WHERE RowNumber = 1;

    -- BookingId = 4: Card thành công
    INSERT INTO dbo.BookingSeats
    (
        BookingId,
        ShowtimeSeatId,
        TicketPrice
    )
    SELECT
        4,
        ShowtimeSeatId,
        85000.00
    FROM @AvailableSeats
    WHERE RowNumber = 2;

    COMMIT TRANSACTION;

    PRINT N'Thêm dữ liệu BookingSeats thành công!';

END TRY
BEGIN CATCH

    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;

END CATCH;
GO
