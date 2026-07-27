import fs from "fs"

let c = fs.readFileSync("D:/meter/Frontend/src/features/charts/components/ChartComponents.tsx", "utf-8")

// Remove Tooltip + isDark + dots from LineChartCard
c = c.replace(
  'const isDark = useDarkMode()\n  return (\n    <ChartCard title={title} subtitle={subtitle}>\n      <div style={{ width: "100%", backgroundColor: "transparent" }}>\n      <ResponsiveContainer width="100%" height={height}>\n        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} style={{ backgroundColor: "transparent" }}>\n          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />\n          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={{ stroke: "var(--border-default)" }} tickLine={false} />\n          <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />\n          <Tooltip contentStyle={tooltipStyle(isDark)} />\n          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />',
  'return (\n    <ChartCard title={title} subtitle={subtitle}>\n      <div style={{ width: "100%", backgroundColor: "transparent" }}>\n      <ResponsiveContainer width="100%" height={height}>\n        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} style={{ backgroundColor: "transparent" }}>\n          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />\n          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={{ stroke: "var(--border-default)" }} tickLine={false} />\n          <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />\n          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />'
)

// Remove Tooltip + isDark from BarChartCard 
c = c.replace(
  'const isDark = useDarkMode()\n  return (\n    <ChartCard title={title} subtitle={subtitle}>\n      <div style={{ width: "100%", backgroundColor: "transparent" }}>\n      <ResponsiveContainer width="100%" height={height}>\n        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} style={{ backgroundColor: "transparent" }}>\n          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />\n          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={{ stroke: "var(--border-default)" }} tickLine={false} />\n          <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />\n          <Tooltip contentStyle={tooltipStyle(isDark)} />\n          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />',
  'return (\n    <ChartCard title={title} subtitle={subtitle}>\n      <div style={{ width: "100%", backgroundColor: "transparent" }}>\n      <ResponsiveContainer width="100%" height={height}>\n        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} style={{ backgroundColor: "transparent" }}>\n          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />\n          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={{ stroke: "var(--border-default)" }} tickLine={false} />\n          <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />\n          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />'
)

// Remove Tooltip from PieChartCard
c = c.replace(
  '          <Tooltip contentStyle={tooltipStyle(isDark)} />\n          <Legend wrapperStyle={{ fontSize: 11, color: isDark ? "#F2F2F5" : "#1C1C1E" }} />',
  '          <Legend wrapperStyle={{ fontSize: 11 }} />'
)

fs.writeFileSync("D:/meter/Frontend/src/features/charts/components/ChartComponents.tsx", c)
console.log("✅ Removed all Tooltips and fill areas from charts")
