--===============================
--Script INSERT Showtimes
--Lấy các phiên bản phim từ MovieVersions.
--Lấy phòng chiếu từ CinemaRooms.
--Tạo 3 suất mỗi ngày cho từng phòng trong 3 ngày.
--Tính EndTime dựa trên Movies.DurationMinutes.
--Phân bổ các phiên bản phim luân phiên.
--Không thêm trùng suất chiếu nếu chạy lại.
--===============================

USE ViewBookCinemasDB;
GO

;WITH MovieVersionList AS
(
    SELECT
        MV.MovieVersionId,
        ROW_NUMBER() OVER (
            ORDER BY MV.MovieVersionId
        ) AS VersionNumber
    FROM dbo.MovieVersions AS MV
    INNER JOIN dbo.Movies AS M
        ON M.MovieId = MV.MovieId
    WHERE MV.Status = 1
),
RoomList AS
(
    SELECT
        CR.RoomId,
        CR.RoomName,
        CR.RoomType,
        CR.Capacity,
        C.CinemaName
    FROM dbo.CinemaRooms AS CR
    INNER JOIN dbo.Cinemas AS C
        ON C.CinemaId = CR.CinemaId
    WHERE CR.Status = 'Active'
),
DayList AS
(
    SELECT 1 AS DayOffset
    UNION ALL SELECT 2
    UNION ALL SELECT 3
),
TimeSlots AS
(
    SELECT 1 AS SlotNo, 10 AS StartHour
    UNION ALL SELECT 2, 14
    UNION ALL SELECT 3, 18
),
ScheduleList AS
(
    SELECT
        R.RoomId,
        R.RoomType,
        DATEADD(
            DAY,
            D.DayOffset,
            CAST(GETDATE() AS DATE)
        ) AS ShowDate,
        T.SlotNo,
        T.StartHour,

        ROW_NUMBER() OVER (
            ORDER BY
                R.RoomId,
                D.DayOffset,
                T.SlotNo
        ) AS ScheduleNumber

    FROM RoomList AS R
    CROSS JOIN DayList AS D
    CROSS JOIN TimeSlots AS T
),
VersionCount AS
(
    SELECT COUNT(*) AS TotalVersions
    FROM MovieVersionList
),
FinalSchedule AS
(
    SELECT
        S.RoomId,
        MV.MovieVersionId,
        S.RoomType,
        S.ShowDate,
        S.StartHour
    FROM ScheduleList AS S
    CROSS JOIN VersionCount AS VC
    INNER JOIN MovieVersionList AS MV
        ON MV.VersionNumber =
            ((S.ScheduleNumber - 1) % VC.TotalVersions) + 1
    WHERE VC.TotalVersions > 0
),
ShowtimeData AS
(
    SELECT
        FS.MovieVersionId,
        FS.RoomId,

        DATEADD(
            HOUR,
            FS.StartHour,
            CAST(FS.ShowDate AS DATETIME2)
        ) AS StartTime,

        DATEADD(
            MINUTE,
            M.DurationMinutes,
            DATEADD(
                HOUR,
                FS.StartHour,
                CAST(FS.ShowDate AS DATETIME2)
            )
        ) AS EndTime,

        CAST(
            CASE
                WHEN FS.RoomType = 'Standard' THEN 90000
                WHEN FS.RoomType = 'VIP' THEN 120000
                WHEN FS.RoomType = 'IMAX' THEN 150000
                ELSE 90000
            END
            +
            CASE
                WHEN FS.StartHour = 18 THEN 10000
                ELSE 0
            END
            AS DECIMAL(10,2)
        ) AS BasePrice

    FROM FinalSchedule AS FS
    INNER JOIN dbo.MovieVersions AS MV
        ON MV.MovieVersionId = FS.MovieVersionId
    INNER JOIN dbo.Movies AS M
        ON M.MovieId = MV.MovieId
)

INSERT INTO dbo.Showtimes
(
    MovieVersionId,
    RoomId,
    StartTime,
    EndTime,
    BasePrice
)
SELECT
    SD.MovieVersionId,
    SD.RoomId,
    SD.StartTime,
    SD.EndTime,
    SD.BasePrice
FROM ShowtimeData AS SD
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Showtimes AS S
    WHERE S.RoomId = SD.RoomId
      AND S.StartTime = SD.StartTime
);
GO


--==========================================
--Script INSERT ShowtimeSeat
--==========================================

USE ViewBookCinemasDB;
GO

INSERT INTO dbo.ShowtimeSeat
(
    ShowtimeId,
    SeatId,
    SeatStatus,
    HoldExpiredAt
)
SELECT
    S.ShowtimeId,
    ST.SeatId,
    'Available',
    NULL
FROM dbo.Showtimes AS S
INNER JOIN dbo.Seats AS ST
    ON ST.RoomId = S.RoomId
WHERE
    S.StartTime >= DATEADD(
        DAY,
        1,
        CAST(GETDATE() AS DATE)
    )
    AND S.StartTime < DATEADD(
        DAY,
        4,
        CAST(GETDATE() AS DATE)
    )
    AND NOT EXISTS
    (
        SELECT 1
        FROM dbo.ShowtimeSeat AS SS
        WHERE SS.ShowtimeId = S.ShowtimeId
          AND SS.SeatId = ST.SeatId
    );
GO


--==================================
--Kiểm tra dữ liệu Showtimes
--==================================
SELECT
    S.ShowtimeId,
    M.Title AS MovieTitle,
    MV.VersionName,
    MV.AudioLanguage,
    MV.SubtitleLanguage,
    C.CinemaName,
    CR.RoomName,
    CR.RoomType,
    S.StartTime,
    S.EndTime,
    S.BasePrice,
    S.Status
FROM dbo.Showtimes AS S
INNER JOIN dbo.MovieVersions AS MV
    ON MV.MovieVersionId = S.MovieVersionId
INNER JOIN dbo.Movies AS M
    ON M.MovieId = MV.MovieId
INNER JOIN dbo.CinemaRooms AS CR
    ON CR.RoomId = S.RoomId
INNER JOIN dbo.Cinemas AS C
    ON C.CinemaId = CR.CinemaId
ORDER BY
    S.StartTime,
    C.CinemaName,
    CR.RoomName;
GO

--===========================
--Kiểm tra trạng thái ghế theo suất chiếu
--============================
SELECT
    SS.ShowtimeSeatId,
    SS.ShowtimeId,
    S.StartTime,
    C.CinemaName,
    CR.RoomName,
    ST.SeatId,
    ST.SeatRow,
    ST.SeatNumber,
    SETY.SeatTypeName,
    SETY.AdditionalPrice,
    SS.SeatStatus,
    SS.HoldExpiredAt
FROM dbo.ShowtimeSeat AS SS
INNER JOIN dbo.Showtimes AS S
    ON S.ShowtimeId = SS.ShowtimeId
INNER JOIN dbo.Seats AS ST
    ON ST.SeatId = SS.SeatId
INNER JOIN dbo.SeatTypes AS SETY
    ON SETY.SeatTypeId = ST.SeatTypeId
INNER JOIN dbo.CinemaRooms AS CR
    ON CR.RoomId = S.RoomId
INNER JOIN dbo.Cinemas AS C
    ON C.CinemaId = CR.CinemaId
ORDER BY
    S.StartTime,
    ST.SeatRow,
    ST.SeatNumber;
GO