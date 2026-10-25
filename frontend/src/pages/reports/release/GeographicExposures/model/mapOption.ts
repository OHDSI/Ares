import type {
  GeoBoundaries,
  GeoExposureConcept,
  GeoRegion,
  GeoStat,
  GeoSummaryRow,
} from "./types";

export interface Layer {
  concept: GeoExposureConcept;
  /** summary rows for the selected period, keyed by region id */
  rows: Map<string, GeoSummaryRow>;
  color?: string;
}

export interface MapInputs {
  boundaries: GeoBoundaries | null;
  regions: Map<string, GeoRegion>;
  base: Layer | null;
  overlays: Layer[];
  stat: GeoStat;
  minCellCount: number;
  dark: boolean;
}

export const STAT_LABELS: Record<GeoStat, string> = {
  MEAN_VALUE: "Mean",
  MEDIAN_VALUE: "Median",
  P90_VALUE: "90th percentile",
};

// viridis; reads on both light and dark backgrounds
const SEQUENTIAL = ["#440154", "#3b528b", "#21908d", "#5dc863", "#fde725"];

function hexToRgb(h: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

/** Position t in [0,1] on the sequential ramp. */
function colorAt(t: number): string {
  const x = Math.min(1, Math.max(0, t)) * (SEQUENTIAL.length - 1);
  const i = Math.min(SEQUENTIAL.length - 2, Math.floor(x));
  const a = hexToRgb(SEQUENTIAL[i]);
  const b = hexToRgb(SEQUENTIAL[i + 1]);
  const mix = a.map((v, k) => Math.round(v + (b[k] - v) * (x - i)));
  return `rgb(${mix.join(",")})`;
}

export function formatValue(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "–";
  const a = Math.abs(v);
  if (a !== 0 && a < 1) return v.toPrecision(3);
  if (a < 10) return v.toFixed(2);
  if (a < 1000) return v.toFixed(1);
  return Math.round(v).toLocaleString();
}

function extent(layer: Layer, stat: GeoStat): [number, number] {
  const { GLOBAL_MIN: lo, GLOBAL_MAX: hi } = layer.concept;
  if (lo !== null && hi !== null && lo !== hi) return [lo, hi];
  const vals = [...layer.rows.values()]
    .map((r) => r[stat])
    .filter((v): v is number => v !== null);
  return vals.length ? [Math.min(...vals), Math.max(...vals)] : [0, 1];
}

function tooltip(inputs: MapInputs) {
  const { regions, base, overlays, stat, minCellCount } = inputs;
  const layers = [base, ...overlays].filter(Boolean) as Layer[];
  return {
    trigger: "item",
    formatter: (p: any) => {
      const id = p.data?.regionId ?? p.name;
      const region = regions.get(id);
      const lines = [`<b>${region?.REGION_NAME ?? id}</b>`];
      for (const layer of layers) {
        const row = layer.rows.get(id);
        const label = layer.concept.EXPOSURE_NAME;
        if (!row) lines.push(`${label}: no data`);
        else if (row.SUPPRESSED)
          lines.push(`${label}: suppressed (&lt; ${minCellCount} persons)`);
        else
          lines.push(
            `${label}: ${formatValue(row[stat])} <span style="opacity:.6">(n=${row.N_PERSONS?.toLocaleString()})</span>`,
          );
      }
      return lines.join("<br/>");
    },
  };
}

function bubbleSize(layer: Layer, stat: GeoStat) {
  const [lo, hi] = extent(layer, stat);
  // thousands of counties need small bubbles or they cover the map; a handful of states can be big
  const max = Math.max(8, Math.min(30, 420 / Math.sqrt(layer.rows.size || 1)));
  const min = max * 0.25;
  return (value: number) => {
    const t = Math.min(1, Math.max(0, (value - lo) / (hi - lo || 1)));
    return min + Math.sqrt(t) * (max - min);
  };
}

function overlaySeries(
  layer: Layer,
  inputs: MapInputs,
  position: (id: string) => [number, number] | null,
  coordinateSystem: "geo" | "cartesian2d",
) {
  const size = bubbleSize(layer, inputs.stat);
  const data = [...layer.rows.entries()]
    .map(([id, row]) => {
      const value = row[inputs.stat];
      const pos = position(id);
      if (row.SUPPRESSED || value === null || !pos) return null;
      return {
        regionId: id,
        value: [pos[0], pos[1], value],
        symbolSize: size(value),
      };
    })
    .filter(Boolean);
  return {
    type: "scatter",
    name: layer.concept.EXPOSURE_NAME,
    coordinateSystem,
    ...(coordinateSystem === "geo" ? { geoIndex: 0 } : {}),
    data,
    itemStyle: {
      color: layer.color,
      opacity: layer.rows.size > 500 ? 0.55 : 0.7,
      borderColor: inputs.dark ? "#ffffff" : "#000000",
      borderWidth: 0.5,
    },
    emphasis: { scale: 1.2 },
    z: 4,
  };
}

function visualMap(inputs: MapInputs, seriesIndex: number) {
  const { base, stat, dark } = inputs;
  if (!base) return undefined;
  const [min, max] = extent(base, stat);
  return {
    type: "continuous",
    min,
    max,
    seriesIndex,
    calculable: true,
    realtime: false,
    left: 12,
    bottom: 12,
    itemHeight: 140,
    formatter: (v: number) => formatValue(v),
    inRange: { color: SEQUENTIAL },
    outOfRange: { color: inputs.dark ? "#2b2f36" : "#e6e8eb" },
    textStyle: { color: dark ? "#cccccc" : "#444444" },
  };
}

/** Initial zoom/center that frames the regions that actually carry data. */
function initialView(boundaries: GeoBoundaries, ids: Set<string>) {
  const boxes = [...ids]
    .map((id) => boundaries.boxes.get(id))
    .filter(Boolean) as [number, number, number, number][];
  if (!boxes.length) return {};
  const x0 = Math.min(...boxes.map((b) => b[0]));
  const y0 = Math.min(...boxes.map((b) => b[1]));
  const x1 = Math.max(...boxes.map((b) => b[2]));
  const y1 = Math.max(...boxes.map((b) => b[3]));
  const [bx0, by0, bx1, by1] = boundaries.bounds;
  const zoom = Math.min(
    10,
    Math.max(
      1,
      0.85 *
        Math.min((bx1 - bx0) / (x1 - x0 || 1), (by1 - by0) / (y1 - y0 || 1)),
    ),
  );
  return { zoom, center: [(x0 + x1) / 2, (y0 + y1) / 2] };
}

export function buildMapOption(inputs: MapInputs) {
  const { boundaries, base, overlays, stat, dark } = inputs;
  const noData = dark ? "#2b2f36" : "#e6e8eb";
  const border = dark ? "#555b66" : "#ffffff";

  if (boundaries) {
    const withData = new Set<string>();
    [base, ...overlays].forEach((l) =>
      l?.rows.forEach((row, id) => {
        if (!row.SUPPRESSED) withData.add(id);
      }),
    );
    // Regions are colored directly (rather than through a map series) so that no-data and
    // suppressed areas keep their own styling; the visualMap below only draws the legend.
    const [lo, hi] = base ? extent(base, stat) : [0, 1];
    const regions: any[] = [];
    base?.rows.forEach((row, id) => {
      const value = row[stat];
      if (row.SUPPRESSED) {
        regions.push({
          name: id,
          itemStyle: {
            areaColor: noData,
            decal: {
              symbol: "rect",
              dashArrayX: [1, 0],
              dashArrayY: [2, 3],
              rotation: Math.PI / 4,
              color: dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
            },
          },
        });
      } else if (value !== null) {
        regions.push({
          name: id,
          itemStyle: { areaColor: colorAt((value - lo) / (hi - lo || 1)) },
        });
      }
    });
    const series: any[] = [
      // anchor for the visualMap legend
      {
        type: "scatter",
        coordinateSystem: "geo",
        geoIndex: 0,
        data: [],
        silent: true,
      },
    ];
    overlays.forEach((layer) =>
      series.push(
        overlaySeries(
          layer,
          inputs,
          (id) => boundaries.centers.get(id) ?? null,
          "geo",
        ),
      ),
    );
    return {
      tooltip: tooltip(inputs),
      visualMap: visualMap(inputs, 0),
      geo: {
        map: boundaries.mapName,
        nameProperty: "__key",
        roam: true,
        aspectScale: boundaries.aspectScale,
        ...initialView(boundaries, withData),
        top: 8,
        bottom: 8,
        itemStyle: { areaColor: noData, borderColor: border, borderWidth: 0.3 },
        emphasis: {
          label: { show: false },
          itemStyle: {
            borderColor: dark ? "#ffffff" : "#000000",
            borderWidth: 1,
          },
        },
        select: { disabled: true },
        regions,
      },
      series,
    };
  }

  // no boundaries available: plot region centroids on a plain lon/lat plane
  const position = (id: string): [number, number] | null => {
    const r = inputs.regions.get(id);
    return r && r.CENTROID_LON !== null && r.CENTROID_LAT !== null
      ? [r.CENTROID_LON, r.CENTROID_LAT]
      : null;
  };
  const series: any[] = [];
  if (base) {
    const size = bubbleSize(base, stat);
    series.push({
      type: "scatter",
      name: base.concept.EXPOSURE_NAME,
      data: [...base.rows.entries()]
        .map(([id, r]) => {
          const pos = position(id);
          const v = r[stat];
          return r.SUPPRESSED || v === null || !pos
            ? null
            : { regionId: id, value: [pos[0], pos[1], v], symbolSize: size(v) };
        })
        .filter(Boolean),
      z: 3,
    });
  }
  overlays.forEach((layer) =>
    series.push(overlaySeries(layer, inputs, position, "cartesian2d")),
  );
  return {
    tooltip: tooltip(inputs),
    visualMap: visualMap(inputs, 0),
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: "value",
      name: "Longitude",
      scale: true,
      nameLocation: "middle",
      nameGap: 26,
    },
    yAxis: {
      type: "value",
      name: "Latitude",
      scale: true,
      nameLocation: "middle",
      nameGap: 36,
    },
    series,
  };
}

export function buildTrendOption(args: {
  concept: GeoExposureConcept;
  rows: GeoSummaryRow[];
  stat: GeoStat;
  period: number;
  dark: boolean;
}) {
  const { concept, rows, stat, period, dark } = args;
  const sorted = [...rows]
    .filter((r) => !r.SUPPRESSED)
    .sort((a, b) => a.PERIOD - b.PERIOD);
  const periods = sorted.map((r) => r.PERIOD);
  const band = dark ? "rgba(160,203,232,0.18)" : "rgba(44,94,149,0.15)";
  return {
    tooltip: { trigger: "axis" },
    grid: { left: 56, right: 16, top: 24, bottom: 28 },
    xAxis: { type: "category", data: periods },
    yAxis: {
      type: "value",
      scale: true,
      name: concept.UNIT_NAME || undefined,
      axisLabel: { formatter: (v: number) => formatValue(v) },
    },
    series: [
      {
        name: "10th percentile",
        type: "line",
        stack: "band",
        symbol: "none",
        lineStyle: { opacity: 0 },
        data: sorted.map((r) => r.P10_VALUE),
        tooltip: { show: false },
      },
      {
        name: "10th–90th percentile",
        type: "line",
        stack: "band",
        symbol: "none",
        lineStyle: { opacity: 0 },
        areaStyle: { color: band },
        data: sorted.map((r) => (r.P90_VALUE ?? 0) - (r.P10_VALUE ?? 0)),
        tooltip: { show: false },
      },
      {
        name: STAT_LABELS[stat],
        type: "line",
        symbol: "circle",
        symbolSize: 6,
        data: sorted.map((r) => r[stat]),
        markLine: {
          silent: true,
          symbol: "none",
          label: { show: false },
          data: periods.includes(period) ? [{ xAxis: String(period) }] : [],
        },
      },
    ],
  };
}
