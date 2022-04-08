export const specDatastrand = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  description: "Data Strand Visualization",
  autosize: { type: "fit-x", contains: "padding" },
  padding: 5,
  data: [
    {
      name: "source_0",
      values: []
    },
    {
      name: "data_0",
      source: "source_0",
      transform: [
        {
          type: "filter",
          expr:
            "indexof(['condition occurrence','drug exposure','measurement','observation','procedure occurrence','visit occurrence','device exposure'], lower(datum.domain)) >= 0"
        },
        {
          type: "joinaggregate",
          as: ["total_records"],
          ops: ["sum"],
          fields: ["count_records"],
          groupby: ["cdm_source_key"]
        },
        {
          type: "formula",
          expr: "datum.count_records/datum.total_records",
          as: "percent"
        },
        {
          type: "aggregate",
          groupby: [
            "domain",
            "percent",
            "count_records",
            "cdm_source_key",
            "cdm_source_abbreviation",
            "cdm_release_key"
          ],
          ops: ["sum", "sum"],
          fields: ["percent", "count_records"],
          as: ["sum_percent", "sum_count_records"]
        },
        {
          type: "stack",
          groupby: ["cdm_source_key"],
          field: "sum_percent",
          sort: { field: ["sum_count_records"], order: ["descending"] },
          as: ["sum_percent_start", "sum_percent_end"],
          offset: "zero"
        },
        {
          type: "filter",
          expr:
            'isValid(datum["sum_percent"]) && isFinite(+datum["sum_percent"])'
        }
      ]
    }
  ],
  signals: [
    {
      name: "selectDomain",
      on: [{ events: "mousedown", update: "datum" }]
    },
    {
      name: "width",
      init: "isFinite(containerSize()[0]) ? containerSize()[0] : 200",
      on: [
        {
          update: "isFinite(containerSize()[0]) ? containerSize()[0] : 200",
          events: "window:resize"
        }
      ]
    },
    { name: "y_step", value: 20 },
    {
      name: "height",
      update: "bandspace(domain('y').length, 3, 3) * y_step"
    }
  ],
  marks: [
    {
      name: "marks",
      type: "rect",
      style: ["bar"],
      from: { data: "data_0" },
      encode: {
        enter: {
          strokeWidth: { value: 7 }
        },
        update: {
          cornerRadius: { value: 10 },
          fill: { scale: "color", field: "domain" },
          tooltip: {
            signal:
              '{"Data Source": datum["cdm_source_abbreviation"], "Domain": isValid(datum["domain"]) ? datum["domain"] : ""+datum["domain"], "Percent": format(datum["sum_percent"], "0.2%"), "Number of Records": format(datum["count_records"], ",")}'
          },
          x: { scale: "x", field: "sum_percent_end" },
          x2: { scale: "x", field: "sum_percent_start" },
          yc: { scale: "y", field: "cdm_source_key" },
          height: { value: 20 }
        }
      }
    }
  ],
  scales: [
    {
      name: "x",
      type: "linear",
      domain: {
        data: "data_0",
        fields: ["sum_percent_start", "sum_percent_end"]
      },
      range: [0, { signal: "width" }],
      nice: true,
      zero: true
    },
    {
      name: "y",
      type: "band",
      domain: { data: "data_0", field: "cdm_source_key", sort: true },
      range: { step: { signal: "y_step" } },
      padding: 3
    },
    {
      name: "color",
      type: "ordinal",
      domain: { data: "data_0", field: "domain", sort: true },
      range: "category"
    }
  ],
  axes: [{ scale: "y", orient: "left", zindex: 0 }],
  legends: [
    {
      columns: 2,
      columnPadding: 15,
      rowPadding: 10,
      orient: "right",
      fill: "color",
      symbolType: "circle"
    }
  ]
};
