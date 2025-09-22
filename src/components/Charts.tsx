import React from 'react';

// Generate sample data for charts
function generateSalesData() {
  const last7Days: Array<{ date: string; value: number }> = [];
  const last6Months: Array<{ month: string; value: number }> = [];

  // Last 7 days data
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const value = Math.random() * 10000000 + 2000000; // 2M to 12M range
    last7Days.push({
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value,
    });
  }

  // Last 6 months data
  const months = [
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
  ];
  months.forEach((month) => {
    const value = Math.random() * 8000000 + 6000000; // 6M to 14M range
    last6Months.push({ month, value });
  });

  return { last7Days, last6Months };
}

function generateExpensesData() {
  return [
    { category: 'FUEL', value: 25, color: '#ef4444' },
    { category: 'FRAIS DE MISSION', value: 15, color: '#3b82f6' },
    { category: 'MONTHLY FIXED PAYMENT', value: 35, color: '#f59e0b' },
    { category: 'MAINTENANCE', value: 10, color: '#10b981' },
    { category: 'VIDANGE', value: 8, color: '#8b5cf6' },
    { category: 'AVANCE SUR FACTURE', value: 7, color: '#06b6d4' },
  ];
}

export function LineChart({ data, title }: { data: any[]; title: string }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const width = 400;
  const height = 200;
  const padding = 40;

  const xStep = (width - 2 * padding) / (data.length - 1);
  const yScale = (height - 2 * padding) / maxValue;

  const points = data.map((d, i) => ({
    x: padding + i * xStep,
    y: height - padding - d.value * yScale,
  }));

  const pathD = points.reduce((path, point, i) => {
    return (
      path + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`)
    );
  }, '');

  // Create area fill path
  const areaPath =
    pathD +
    ` L ${points[points.length - 1].x} ${height - padding} L ${padding} ${
      height - padding
    } Z`;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="mb-4">
        <span className="inline-flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          Sales
        </span>
      </div>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Area fill */}
        <path d={areaPath} fill="rgba(59, 130, 246, 0.1)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" />

        {/* Points */}
        {points.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r="3" fill="#3b82f6" />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={padding + i * xStep}
            y={height - 10}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {d.date || d.month}
          </text>
        ))}

        {/* Y-axis labels */}
        {[
          0, 2000000, 4000000, 6000000, 8000000, 10000000, 12000000, 14000000,
        ].map((value, i) => (
          <text
            key={i}
            x={10}
            y={height - padding - value * yScale}
            textAnchor="start"
            className="text-xs fill-gray-600"
          >
            {value / 1000000}M
          </text>
        ))}
      </svg>
    </div>
  );
}

export function BarChart({ data, title }: { data: any[]; title: string }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const width = 400;
  const height = 200;
  const padding = 40;

  const barWidth = ((width - 2 * padding) / data.length) * 0.8;
  const barSpacing = (width - 2 * padding) / data.length;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="mb-4">
        <span className="inline-flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-teal-500 rounded"></div>
          Sales
        </span>
      </div>
      <svg width={width} height={height}>
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * (height - 2 * padding);
          const x = padding + i * barSpacing + (barSpacing - barWidth) / 2;
          const y = height - padding - barHeight;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#14b8a6"
                opacity={0.8}
              />
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {d.month}
              </text>
            </g>
          );
        })}

        {/* Y-axis labels */}
        {[
          0, 2000000, 4000000, 6000000, 8000000, 10000000, 12000000, 14000000,
        ].map((value, i) => (
          <text
            key={i}
            x={10}
            y={height - padding - (value / maxValue) * (height - 2 * padding)}
            textAnchor="start"
            className="text-xs fill-gray-600"
          >
            {value / 1000000}M
          </text>
        ))}
      </svg>
    </div>
  );
}

export function PieChart({ data, title }: { data: any[]; title: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const centerX = 120;
  const centerY = 120;
  const radius = 80;
  const innerRadius = 40;

  let cumulativeAngle = 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className="flex items-start gap-6">
        <svg width={240} height={240}>
          {data.map((d, i) => {
            const percentage = d.value / total;
            const angle = percentage * 2 * Math.PI;
            const startAngle = cumulativeAngle;
            const endAngle = cumulativeAngle + angle;

            const x1 = centerX + Math.cos(startAngle) * radius;
            const y1 = centerY + Math.sin(startAngle) * radius;
            const x2 = centerX + Math.cos(endAngle) * radius;
            const y2 = centerY + Math.sin(endAngle) * radius;

            const x3 = centerX + Math.cos(endAngle) * innerRadius;
            const y3 = centerY + Math.sin(endAngle) * innerRadius;
            const x4 = centerX + Math.cos(startAngle) * innerRadius;
            const y4 = centerY + Math.sin(startAngle) * innerRadius;

            const largeArcFlag = angle > Math.PI ? 1 : 0;

            const pathData = [
              `M ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `L ${x3} ${y3}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
              'Z',
            ].join(' ');

            cumulativeAngle += angle;

            return <path key={i} d={pathData} fill={d.color} opacity={0.9} />;
          })}
        </svg>

        <div className="flex-1">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {data.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: d.color }}
                ></div>
                <span className="text-gray-600">{d.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Charts() {
  const { last7Days, last6Months } = generateSalesData();
  const expensesData = generateExpensesData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <LineChart data={last7Days} title="Sales - Last 7 Days" />
      <BarChart data={last6Months} title="Sales - Last 6 Months" />
      <div className="lg:col-span-1">
        <PieChart data={expensesData} title="Expenses by Category" />
      </div>
    </div>
  );
}
