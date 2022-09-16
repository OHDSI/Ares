const getSqlQueryLink = function (val) {
  return `https://github.com/OHDSI/Achilles/tree/main/inst/sql/sql_server/${val}`;
};
const getAchillesLink = function () {
  return "https://github.com/ohdsi/achilles";
};
const getDatavizDatasheetLink = function () {
  return "https://policyviz.com/2018/08/07/dataviz-cheatsheet/";
};
export const VEGA_SCHEMA = "https://vega.github.io/schema/vega-lite/v5.json";
const getDataQualityDashboardLink = function () {
  return "https://ohdsi.github.io/DataQualityDashboard/";
};
const getCastorLink = function () {
  return "http://www.github.com/ohdsi/castor";
};
const getDocsLink = function (val) {
  return `https://ohdsi.github.io/CommonDataModel/cdm531.html#${val}`;
};

export const getLinks = {
  methods: {
    getSqlQueryLink,
    getDocsLink,
    getCastorLink,
    getAchillesLink,
    getDatavizDatasheetLink,
    getDataQualityDashboardLink,
  },
};
