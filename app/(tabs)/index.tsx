import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import {
  BarChart3,
  Briefcase,
  Star,
  TrendingUp,
} from "lucide-react-native";
// Victory Piecemeal Compatibility Import/Fallback
let VictoryChart, VictoryLine, VictoryAxis, VictoryBar;
try {
  // Most Expo installs use default import
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const vn = require("victory-native");
  VictoryChart = vn.VictoryChart;
  VictoryLine = vn.VictoryLine;
  VictoryAxis = vn.VictoryAxis;
  VictoryBar = vn.VictoryBar;
} catch {
  // fallback for build
  VictoryChart = View;
  VictoryLine = View;
  VictoryAxis = View;
  VictoryBar = View;
}

const STRATEGY_ORDER = ["QAW", "QFH", "QGF", "QTF"] as const;
type StrategyKey = typeof STRATEGY_ORDER[number];

const STRATEGY_META = {
  QAW: { label: "All Weather", color: "#008455", icon: Star },
  QFH: { label: "Future Horizon", color: "#dabd38", icon: TrendingUp },
  QGF: { label: "Growth Fund", color: "#0b3452", icon: BarChart3 },
  QTF: { label: "Tactical Fund", color: "#550e0e", icon: Briefcase },
};

const BASE_URL = process.env.EXPO_PUBLIC_DATA_API_URL || "";
const START_YEAR = 2024;
const CURRENT_YEAR = new Date().getFullYear();

export default function DashboardOverview() {
  const [selected, setSelected] = useState<StrategyKey>("QAW");
  const [loading, setLoading] = useState(false);

  const [equityData, setEquityData] = useState<Array<{ x: string; y: number }>>(
    []
  );
  const [monthlyData, setMonthlyData] = useState<
    Array<{ x: string; y: number; fill: string }>
  >([]);
  const [sinceInception, setSinceInception] = useState<any>(null);

  // ----------- Since Inception -----------
  useEffect(() => {
    setLoading(true);
    fetch(
      "https://qode360-backend.qodeinvest.com/api/v1/dashboard/since_inception/"
    )
      .then((res) => res.json())
      .then((json) => {
        setSinceInception(json.data?.[selected] || null);
      })
      .catch(() => setSinceInception(null))
      .finally(() => setLoading(false));
    // Ensure loading stops if error
  }, [selected]);

  // ----------- Equity Curve -----------
  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/returns/indices/?downloadNav=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indices: [selected] }),
    })
      .then((res) => res.json())
      .then((json) => {
        const arr = json.data?.[selected];
        if (Array.isArray(arr)) {
          setEquityData(
            arr.map((p: any) => ({
              x: p.date,
              y: p.nav,
            }))
          );
        } else {
          setEquityData([]);
        }
      })
      .catch(() => setEquityData([]))
      .finally(() => setLoading(false));
  }, [selected]);

  // ----------- Monthly Returns -----------
  useEffect(() => {
    const calls: Promise<any>[] = [];
    for (let y = START_YEAR; y <= CURRENT_YEAR; y++) {
      calls.push(
        fetch(
          `https://qode360-backend.qodeinvest.com/api/v1/dashboard/get_monthly_returns/${y}/`
        ).then((res) => res.json())
      );
    }

    Promise.all(calls)
      .then((responses) => {
        const bars: Array<{ x: string; y: number; fill: string }> = [];

        responses.forEach((r) => {
          const s = r.data?.[selected];
          if (!s) return;

          Object.entries(s).forEach(([month, obj]: [string, any]) => {
            if (month !== "quarterly" && obj?.return !== null) {
              bars.push({
                x: month,
                y: obj.return,
                fill: obj.return >= 0 ? "#008455" : "#c62828",
              });
            }
          });
        });

        setMonthlyData(bars);
      })
      .catch(() => setMonthlyData([]));
  }, [selected]);

  const Icon = STRATEGY_META[selected].icon;

  // Helper for trimming x-axis labels (date or month names)
  const trimXAxisLabel = (label: string) => {
    if (!label) return "";
    if (label.length > 10) return label.slice(5);
    return label;
  };

  // Custom chart style for Victory (since VictoryTheme is undefined)
  const chartBackground = { parent: { background: "#FFFFFF" } };

  // Guard for missing Victory components
  const isVictoryReady =
    typeof VictoryChart === "function" &&
    typeof VictoryLine === "function" &&
    typeof VictoryAxis === "function" &&
    typeof VictoryBar === "function";

  return (
    <ScrollView className="flex-1 bg-background px-4 py-6 pt-20">
      {/* ---------------- Header ---------------- */}
      <Text className="text-3xl font-serif font-bold text-primary mb-4">
        Dashboard
      </Text>

      {/* ---------------- Strategy Tabs ---------------- */}
      <View className="flex-row bg-card border rounded-full p-1 mb-6">
        {STRATEGY_ORDER.map((key) => {
          const active = key === selected;
          return (
            <Text
              key={key}
              onPress={() => setSelected(key)}
              className={`flex-1 text-center py-2 rounded-full text-sm font-semibold ${
                active ? "bg-primary text-white" : "text-muted-foreground"
              }`}
            >
              {key}
            </Text>
          );
        })}
      </View>

      {/* ---------------- Since Inception ---------------- */}
      <View className="bg-card border rounded-2xl p-5 mb-8">
        <View className="flex-row items-center mb-2">
          <Icon size={22} color={STRATEGY_META[selected].color} />
          <Text className="ml-2 font-semibold text-base">
            {STRATEGY_META[selected].label}
          </Text>
        </View>

        <Text className="text-4xl font-bold text-green-600">
          {sinceInception?.since_inception ?? "--"}%
        </Text>

        <Text className="text-sm text-muted-foreground mt-1">
          {sinceInception?.since_inception_type} •{" "}
          {sinceInception?.start_date} → {sinceInception?.end_date}
        </Text>
      </View>

      {/* ---------------- Equity Curve ---------------- */}
      <View className="bg-card border rounded-2xl p-4 mb-8">
        <Text className="text-xl font-serif font-bold mb-3">
          Equity Curve
        </Text>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : isVictoryReady ? (
          <VictoryChart
            style={chartBackground}
            height={260}
            domainPadding={{ x: 30, y: 20 }}
          >
            <VictoryAxis
              style={{
                tickLabels: { fill: "#666", fontSize: 10, angle: 0 },
                axis: { stroke: "#EEE" },
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tickFormat={(tick: string) => trimXAxisLabel(tick)}
              fixLabelOverlap={true}
            />
            <VictoryAxis
              dependentAxis
              style={{
                tickLabels: { fill: "#666", fontSize: 10 },
                axis: { stroke: "#EEE" },
                grid: { stroke: "#eee", strokeDasharray: "2,2" },
              }}
            />
            <VictoryLine
              data={equityData}
              style={{
                data: {
                  stroke: STRATEGY_META[selected].color,
                  strokeWidth: 2,
                },
              }}
              interpolation="monotoneX"
            />
          </VictoryChart>
        ) : (
          <Text className="text-muted-foreground text-center py-8">
            Charting engine not available.
          </Text>
        )}
      </View>

      {/* ---------------- Monthly Returns ---------------- */}
      <View className="bg-card border rounded-2xl p-4 mb-8">
        <Text className="text-xl font-serif font-bold mb-4">
          Monthly Returns
        </Text>

        {monthlyData.length === 0 ? (
          <Text className="text-muted-foreground text-center py-6">
            No data available
          </Text>
        ) : isVictoryReady ? (
          <VictoryChart
            style={chartBackground}
            height={260}
            domainPadding={{ x: 25, y: 15 }}
          >
            <VictoryAxis
              style={{
                tickLabels: {
                  fill: "#666",
                  fontSize: 10,
                  angle: -25,
                  padding: 10,
                },
                axis: { stroke: "#EEE" },
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tickFormat={(tick: string) => tick}
            />
            <VictoryAxis
              dependentAxis
              style={{
                tickLabels: { fill: "#666", fontSize: 10 },
                axis: { stroke: "#EEE" },
                grid: { stroke: "#eee", strokeDasharray: "2,2" },
              }}
            />
            <VictoryBar
              data={monthlyData}
              barWidth={16}
              style={{
                data: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  fill: ({ datum }: { datum: any }) =>
                    datum.fill || "#008455",
                },
              }}
            />
          </VictoryChart>
        ) : (
          <Text className="text-muted-foreground text-center py-8">
            Charting engine not available.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
