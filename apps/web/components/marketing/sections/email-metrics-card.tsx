"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardFooter } from "@church-space/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@church-space/ui/chart";

// Generate initial data
const generateData = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    name: i,
    openRate: Math.floor(Math.random() * 15) + 20, // 20-35% open rate
    clickRate: Math.floor(Math.random() * 8) + 5, // 5-13% click rate
  }));
};

export default function EmailMetricsCard() {
  const [data, setData] = useState(generateData());
  const [openRate, setOpenRate] = useState(28.4);
  const [clickRate, setClickRate] = useState(9.2);
  const [rateChange, setRateChange] = useState(1.8);

  // Animate the chart by updating data at regular intervals
  useEffect(() => {
    const interval = setInterval(() => {
      // Add new data point and remove oldest
      const newData = [...data.slice(1)];
      newData.push({
        name: newData[newData.length - 1].name + 1,
        openRate: Math.floor(Math.random() * 15) + 20,
        clickRate: Math.floor(Math.random() * 8) + 5,
      });

      setData(newData);

      // Update metrics with small random changes
      const openChange = Math.random() * 2 - 0.5;
      const newOpenRate = Math.max(15, Math.min(45, openRate + openChange));
      setOpenRate(newOpenRate);

      const clickChange = Math.random() * 1 - 0.3;
      const newClickRate = Math.max(3, Math.min(18, clickRate + clickChange));
      setClickRate(newClickRate);

      // Update rate change
      const newRateChange = rateChange + (Math.random() * 0.6 - 0.3);
      setRateChange(newRateChange);
    }, 1500);

    return () => clearInterval(interval);
  }, [data, openRate, clickRate, rateChange]);

  return (
    <Card className="mx-auto h-52 w-full items-center gap-2 border bg-gradient-to-br from-muted/40 to-muted/60 p-2 text-primary shadow-sm">
      <CardContent className="py-2">
        <div className="h-[120px] w-full">
          <ChartContainer
            config={{
              openRate: {
                label: "Open Rate",
                color: "hsl(var(--primary))",
              },
              clickRate: {
                label: "Click Rate",
                color: "hsl(var(--secondary))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="openRate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={500}
                />
                <Line
                  type="monotone"
                  dataKey="clickRate"
                  stroke="hsl(var(--secondary, 280 40% 50%))"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-2">
        <div className="flex gap-6">
          <div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              <p className="text-base font-bold">{openRate.toFixed(1)}%</p>
            </div>
            <p className="text-sm text-muted-foreground">Open rate</p>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: "hsl(var(--secondary, 280 40% 50%))",
                }}
              ></div>
              <p className="text-base font-bold">{clickRate.toFixed(1)}%</p>
            </div>
            <p className="text-sm text-muted-foreground">Click rate</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
