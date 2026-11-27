
import { useMemo } from "react";

const CHART_OPTIONS = [
    { value: "text", label: "Văn bản (mặc định)" },
    { value: "bar", label: "Biểu đồ cột" },
    { value: "line", label: "Biểu đồ đường" },
    { value: "pie", label: "Biểu đồ quạt" }
];

const formatPrice = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)}đ`;

const getPiePath = (startAngle, endAngle, radius = 90) => {
    const x1 = 110 + radius * Math.cos(startAngle);
    const y1 = 110 + radius * Math.sin(startAngle);
    const x2 = 110 + radius * Math.cos(endAngle);
    const y2 = 110 + radius * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M 110 110 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
};

function ReportChartPanel({
    title,
    description,
    icon,
    items = [],
    type,
    onTypeChange,
    valueLabel = "Doanh thu",
    emptyMessage = "Chưa có dữ liệu thống kê"
}) {
    const normalizedItems = useMemo(
        () =>
            items.map((item) => ({
                label: item.label || item.name || "Chưa xác định",
                value: Number(item.revenue ?? item.value) || 0
            })),
        [items]
    );

    const total = normalizedItems.reduce(
        (sum, item) => sum + item.value,
        0
    );

    const maxValue = Math.max(
        ...normalizedItems.map((item) => item.value),
        1
    );

    const colors = [
        "#6558D3",
        "#2695D6",
        "#20A77A",
        "#E5A13B",
        "#D66C8B",
        "#7D8BA5"
    ];

    let currentAngle = -Math.PI / 2;

    return (
        <article className="admin-report-panel">
            <div className="admin-report-panel-heading">
                <div>
                    <h5>{title}</h5>
                    <p>{description}</p>
                </div>

                <div className="admin-report-chart-controls">
                    <select
                        aria-label={`Kiểu biểu đồ ${title}`}
                        value={type}
                        onChange={(event) =>
                            onTypeChange(event.target.value)
                        }
                    >
                        {CHART_OPTIONS.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <span className="admin-report-heading-icon">
                        <i className={`bi ${icon}`}></i>
                    </span>
                </div>
            </div>

            {!normalizedItems.length ? (
                <div className="admin-report-empty">
                    <i className="bi bi-bar-chart-line"></i>
                    <strong>{emptyMessage}</strong>
                </div>
            ) : (
                <>
                    {type === "text" && (
                        <div className="admin-report-text-list">
                            {normalizedItems.map((item, index) => (
                                <div
                                    className="admin-report-text-item"
                                    key={`${item.label}-${index}`}
                                >
                                    <span>
                                        {index + 1}. {item.label}
                                    </span>
                                    <strong>{formatPrice(item.value)}</strong>
                                </div>
                            ))}

                            <div className="admin-report-text-total">
                                <span>Tổng cộng</span>
                                <strong>{formatPrice(total)}</strong>
                            </div>
                        </div>
                    )}

                    {type === "bar" && (
                        <div className="admin-report-chart">
                            {normalizedItems.map((item, index) => (
                                <div
                                    className="admin-report-chart-row"
                                    key={`${item.label}-${index}`}
                                >
                                    <span className="admin-report-chart-label">
                                        {item.label}
                                    </span>

                                    <div className="admin-report-chart-track">
                                        <div
                                            className="admin-report-chart-bar"
                                            style={{
                                                width: `${Math.max(
                                                    (item.value / maxValue) * 100,
                                                    1
                                                )}%`
                                            }}
                                        />
                                    </div>

                                    <strong>{formatPrice(item.value)}</strong>
                                </div>
                            ))}
                        </div>
                    )}

                    {type === "line" && (
                        <div className="admin-report-svg-chart">
                            <svg
                                viewBox="0 0 700 260"
                                role="img"
                                aria-label={`Biểu đồ đường ${title}`}
                            >
                                {[50, 100, 150, 200].map((y) => (
                                    <line
                                        key={y}
                                        x1="45"
                                        y1={y}
                                        x2="680"
                                        y2={y}
                                        stroke="currentColor"
                                        opacity=".12"
                                        strokeDasharray="4 5"
                                    />
                                ))}

                                {(() => {
                                    const points = normalizedItems.map(
                                        (item, index) => {
                                            const x =
                                                normalizedItems.length === 1
                                                    ? 350
                                                    : 55 +
                                                      (index *
                                                          610) /
                                                          (normalizedItems.length -
                                                              1);

                                            const y =
                                                210 -
                                                (item.value / maxValue) *
                                                    160;

                                            return { x, y, item };
                                        }
                                    );

                                    return (
                                        <>
                                            <polyline
                                                points={points
                                                    .map(
                                                        (point) =>
                                                            `${point.x},${point.y}`
                                                    )
                                                    .join(" ")}
                                                fill="none"
                                                stroke="#6558D3"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />

                                            {points.map((point, index) => (
                                                <circle
                                                    key={index}
                                                    cx={point.x}
                                                    cy={point.y}
                                                    r="5"
                                                    fill="#6558D3"
                                                />
                                            ))}

                                            {points.map((point, index) => (
                                                <text
                                                    key={index}
                                                    x={point.x}
                                                    y="238"
                                                    fontSize="11"
                                                    textAnchor="middle"
                                                    fill="currentColor"
                                                >
                                                    {point.item.label.length > 12
                                                        ? `${point.item.label.slice(0, 10)}…`
                                                        : point.item.label}
                                                </text>
                                            ))}
                                        </>
                                    );
                                })()}
                            </svg>
                        </div>
                    )}

                    {type === "pie" && (
                        <div className="admin-report-pie-layout">
                            <svg
                                viewBox="0 0 220 220"
                                role="img"
                                aria-label={`Biểu đồ quạt ${title}`}
                            >
                                {normalizedItems.map((item, index) => {
                                    const angle =
                                        total > 0
                                            ? (item.value / total) *
                                              Math.PI *
                                              2
                                            : 0;

                                    const path = getPiePath(
                                        currentAngle,
                                        currentAngle + angle
                                    );

                                    currentAngle += angle;

                                    return (
                                        <path
                                            key={`${item.label}-${index}`}
                                            d={path}
                                            fill={colors[index % colors.length]}
                                            stroke="white"
                                            strokeWidth="2"
                                        />
                                    );
                                })}
                                <circle
                                    cx="110"
                                    cy="110"
                                    r="43"
                                    fill="var(--admin-report-pie-center, white)"
                                />
                                <text
                                    x="110"
                                    y="106"
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="currentColor"
                                >
                                    Tổng cộng
                                </text>
                                <text
                                    x="110"
                                    y="123"
                                    textAnchor="middle"
                                    fontSize="11"
                                    fontWeight="700"
                                    fill="currentColor"
                                >
                                    {normalizedItems.length} nhóm
                                </text>
                            </svg>

                            <div className="admin-report-pie-legend">
                                {normalizedItems.map((item, index) => (
                                    <div
                                        key={`${item.label}-${index}`}
                                        className="admin-report-pie-legend-item"
                                    >
                                        <span
                                            style={{
                                                background:
                                                    colors[index % colors.length]
                                            }}
                                        />
                                        <div>
                                            <strong>{item.label}</strong>
                                            <small>
                                                {total
                                                    ? (
                                                          (item.value / total) *
                                                          100
                                                      ).toFixed(1)
                                                    : "0.0"}
                                                %
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </article>
    );
}

export default ReportChartPanel;
