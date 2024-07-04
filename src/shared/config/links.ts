const getSqlQueryLink = function (val: string): string {
  return val
    ? `https://github.com/OHDSI/Achilles/tree/main/inst/sql/sql_server/${val}`
    : undefined;
};
const getAchillesLink = function (): string {
  return "https://github.com/ohdsi/achilles";
};
const getDatavizDatasheetLink = function (): string {
  return "https://policyviz.com/2018/08/07/dataviz-cheatsheet/";
};
export const VEGA_SCHEMA = "https://vega.github.io/schema/vega-lite/v5.json";
const getDataQualityDashboardLink = function (): string {
  return "https://ohdsi.github.io/DataQualityDashboard/";
};
const getCastorLink = function (): string {
  return "http://www.github.com/ohdsi/castor";
};
const getDocsLink = function (val: string): string {
  return `https://ohdsi.github.io/CommonDataModel/cdm531.html#${val}`;
};

const getNewIssueLink = function (title = "", body = "") {
  return `https://github.com/OHDSI/Ares/issues/new?assignees=&labels=&projects=&template=bug_report.md&title=${title}&body=${body}`;
};

export const links = {
  getSqlQueryLink,
  getDocsLink,
  getCastorLink,
  getAchillesLink,
  getDatavizDatasheetLink,
  getDataQualityDashboardLink,
  getNewIssueLink,
};
