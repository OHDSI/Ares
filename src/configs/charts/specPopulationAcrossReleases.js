export const specPopulationAcrossReleases = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 200,
  mark: { type: "line", interpolate: "linear", point: true },
  encoding: {
    tooltip: [
      {
        field: "release_name",
        title: "Release date",
        type: "temporal",
        format: "%Y-%m-%d",
      },
      { field: "count_person", title: "Population" },
    ],
    x: {
      field: "release_name",
      type: "temporal",
      timeUnit: "yearmonthdate",
      axis: {
        title: "Release",
      },
    },
    y: {
      field: "count_person",
      type: "quantitative",
      axis: {
        title: "People",
      },
      scale: {
        zero: false,
      },
    },
  },
};
