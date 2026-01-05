"use client";
import {
  createChart,
  ColorType,
  CandlestickSeries,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

type CandleData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type MiniCandleChartProps = {
  data: CandleData[];
  height?: number;
  colors?: {
    backgroundColor?: string;
    textColor?: string;
    upColor?: string;
    downColor?: string;
    borderUpColor?: string;
    borderDownColor?: string;
    wickUpColor?: string;
    wickDownColor?: string;
  };
};

export function MiniCandleChart({
  data,
  height = 120,
  colors = {},
}: MiniCandleChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: colors.backgroundColor ?? "transparent",
        },
        textColor: colors.textColor ?? "#8A94A6",
      },
      width: chartContainerRef.current.clientWidth,
      height,
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      timeScale: {
        visible: false,
      },
      rightPriceScale: {
        visible: false,
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: colors.upColor ?? "#16C784",
      downColor: colors.downColor ?? "#EA3943",
      borderUpColor: colors.borderUpColor ?? "#16C784",
      borderDownColor: colors.borderDownColor ?? "#EA3943",
      wickUpColor: colors.wickUpColor ?? "#16C784",
      wickDownColor: colors.wickDownColor ?? "#EA3943",
    });

    candleSeries.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, height, colors]);

  return <div ref={chartContainerRef} className="w-full" />;
}
export default MiniCandleChart;