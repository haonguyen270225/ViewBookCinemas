
USE ViewBookCinemasDB;
GO

INSERT INTO dbo.Payments
(
    BookingId,
    PaymentCode,
    PaymentMethod,
    PaymentProvider,
    TransactionCode,
    Amount,
    PaymentStatus,
    PaidAt,
    FailureReason,
    CreatedAt,
    UpdatedAt
)
VALUES
-- 1. MoMo - Thành công
(
    1,
    'VBC-PAY-20261110-001',
    'MoMo',
    'MoMo',
    'MOMO-TRANS-001',
    170000.00,
    'Success',
    '2026-11-10 09:15:00',
    NULL,
    '2026-11-10 09:14:00',
    '2026-11-10 09:15:00'
),

-- 2. MoMo - Thất bại
(
    2,
    'VBC-PAY-20261110-002',
    'MoMo',
    'MoMo',
    'MOMO-TRANS-002',
    250000.00,
    'Failed',
    NULL,
    N'Giao dịch bị từ chối.',
    '2026-11-10 09:30:00',
    '2026-11-10 09:31:00'
),

-- 3. MoMo - Đang chờ
(
    3,
    'VBC-PAY-20261110-003',
    'MoMo',
    'MoMo',
    NULL,
    120000.00,
    'Pending',
    NULL,
    NULL,
    '2026-11-10 10:00:00',
    NULL
),

-- 4. Card - Thành công
(
    4,
    'VBC-PAY-20261110-004',
    'Card',
    NULL,
    'CARD-TRANS-001',
    200000.00,
    'Success',
    '2026-11-10 10:20:00',
    NULL,
    '2026-11-10 10:19:00',
    '2026-11-10 10:20:00'
),

-- 5. Card - Thất bại
(
    5,
    'VBC-PAY-20261110-005',
    'Card',
    NULL,
    'CARD-TRANS-002',
    150000.00,
    'Failed',
    NULL,
    N'Thanh toán bằng thẻ không thành công.',
    '2026-11-10 11:00:00',
    '2026-11-10 11:01:00'
),

-- 6. Card - Đang chờ
(
    6,
    'VBC-PAY-20261110-006',
    'Card',
    NULL,
    NULL,
    300000.00,
    'Pending',
    NULL,
    NULL,
    '2026-11-10 11:30:00',
    NULL
);
GO
