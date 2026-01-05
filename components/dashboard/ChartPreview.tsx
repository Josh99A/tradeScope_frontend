import React from 'react'
import Card from '../ui/Card'
import MiniCandleChart from './MiniCandleChart'

const ChartPreview = () => {
 const miniCandleData = [
  { time: "2024-01-01", open: 1.1010, high: 1.1050, low: 1.0980, close: 1.1030 },
  { time: "2024-01-02", open: 1.1030, high: 1.1080, low: 1.1015, close: 1.1060 },
  { time: "2024-01-03", open: 1.1060, high: 1.1100, low: 1.1040, close: 1.1075 },
  { time: "2024-01-04", open: 1.1075, high: 1.1090, low: 1.1020, close: 1.1040 },
  { time: "2024-01-05", open: 1.1040, high: 1.1070, low: 1.1005, close: 1.1025 },
  { time: "2024-01-06", open: 1.1025, high: 1.1055, low: 1.0990, close: 1.1000 },
  { time: "2024-01-07", open: 1.1000, high: 1.1035, low: 1.0975, close: 1.0985 },
  { time: "2024-01-08", open: 1.0985, high: 1.1020, low: 1.0950, close: 1.1005 },
  { time: "2024-01-09", open: 1.1005, high: 1.1045, low: 1.0990, close: 1.1035 },
  { time: "2024-01-10", open: 1.1035, high: 1.1075, low: 1.1010, close: 1.1065 },
  { time: "2024-01-11", open: 1.1065, high: 1.1095, low: 1.1040, close: 1.1080 },
  { time: "2024-01-12", open: 1.1080, high: 1.1120, low: 1.1055, close: 1.1110 },
  { time: "2024-01-15", open: 1.1110, high: 1.1140, low: 1.1090, close: 1.1135 },
  { time: "2024-01-16", open: 1.1135, high: 1.1165, low: 1.1115, close: 1.1150 },
  { time: "2024-01-17", open: 1.1150, high: 1.1180, low: 1.1125, close: 1.1170 },
  { time: "2024-01-18", open: 1.1170, high: 1.1195, low: 1.1140, close: 1.1155 },
];

  return (
   <Card>
      <h3 className="mb-2 font-semibold">EUR/USD</h3>
      <div className="h-64 bg-ts-bg-main rounded-lg flex items-center justify-center text-ts-text-muted">
      <MiniCandleChart
        data={miniCandleData}
        colors={{
          backgroundColor: "transparent",
          textColor: "#8A94A6",
        }}
      />

      </div>
    </Card>
  )
}

export default ChartPreview
