import { useRouter, useRoute } from "vue-router";

let _selfWriteCount = 0;

export const TABLE_URL_PREFIXES: Record<string, string> = {
  "char:databaseComparison:binary": "dbb",
  "char:databaseComparison:continuous": "dbc",
  "char:cohortComparison:binary": "ccb",
  "char:cohortComparison:continuous": "ccc",
  "char:riskFactors:binary": "rfb",
  "char:riskFactors:continuous": "rfc",
  "char:cohortIncidence": "ci",
  "char:dechalRechal": "dr",
  "char:timeToEvent": "tte",
  "char:caseSeries:binary": "csb",
  "char:caseSeries:continuous": "csc",
};

const TABLE_CHILD_KEYS = Object.values(TABLE_URL_PREFIXES).flatMap((p) => [
  `${p}Cols`,
  `${p}Search`,
  `${p}ShowF`,
  `${p}F`,
]);

const CHART_CHILD_KEYS = [
  "dbpX",
  "dbpY",
  "cipDbs",
  "cipOuts",
  "cipX",
  "cipSex",
  "cipFixY",
  "tteDbs",
  "tteTs",
  "tteOt",
  "tteTot",
];

const CHILD_STATE_KEYS = [...TABLE_CHILD_KEYS, ...CHART_CHILD_KEYS, "dbThresh"];

const MANAGED = [
  "targetId",
  "tab",
  "outcomeId",
  "outcomeIds",
  "databaseId",
  "databaseIds",
  "comparatorId",
  "tar",
  "washout",
  "dbView",
  "ccView",
  "rfView",
  "ciView",
  "tteView",
  "csView",
];

export function useCharacterizationUrl() {
  const router = useRouter();
  const route = useRoute();

  function readUrl() {
    const q = route.query;
    return {
      targetId: q.targetId ? parseInt(q.targetId as string, 10) : null,
      tab: (q.tab as string) || null,
      report: q.report || 0,
      outcomeId: q.outcomeId ? parseInt(q.outcomeId as string, 10) : null,
      outcomeIds: q.outcomeIds
        ? (q.outcomeIds as string).split(",").map(Number)
        : null,
      databaseId: (q.databaseId as string) || null,
      databaseIds: q.databaseIds ? (q.databaseIds as string).split(",") : null,
      comparatorId: q.comparatorId
        ? parseInt(q.comparatorId as string, 10)
        : null,
      tar: (q.tar as string) || null,
      washout: (q.washout as string) || null,
      dbView: q.dbView != null ? parseInt(q.dbView as string, 10) : null,
      ccView: q.ccView != null ? parseInt(q.ccView as string, 10) : null,
      rfView: q.rfView != null ? parseInt(q.rfView as string, 10) : null,
      ciView: q.ciView != null ? parseInt(q.ciView as string, 10) : null,
      tteView: q.tteView != null ? parseInt(q.tteView as string, 10) : null,
      csView: q.csView != null ? parseInt(q.csView as string, 10) : null,
      dbThresh: q.dbThresh ? parseFloat(q.dbThresh as string) : null,
      dbpX: (q.dbpX as string) ?? null,
      dbpY: (q.dbpY as string) ?? null,
      cipDbs: q.cipDbs ? (q.cipDbs as string).split(",") : null,
      cipOuts: q.cipOuts ? (q.cipOuts as string).split(",") : null,
      cipX: (q.cipX as string) ?? null,
      cipSex: q.cipSex === "1",
      cipFixY: q.cipFixY !== "0",
      tteDbs: q.tteDbs ? (q.tteDbs as string).split(",") : null,
      tteTs: q.tteTs ? (q.tteTs as string).split(",") : null,
      tteOt: q.tteOt ? (q.tteOt as string).split(",") : null,
      tteTot: q.tteTot ? (q.tteTot as string).split(",") : null,
    };
  }

  function writeUrl(params) {
    const query: Record<string, any> = { ...route.query };

    MANAGED.forEach((k) => delete query[k]);

    if (params.targetId != null) query.targetId = String(params.targetId);
    if (params.tab != null) query.tab = params.tab;
    if (params.report != null) query.report = params.report;
    if (params.outcomeId != null) query.outcomeId = String(params.outcomeId);
    if (params.outcomeIds?.length)
      query.outcomeIds = params.outcomeIds.join(",");
    if (params.databaseId != null) query.databaseId = params.databaseId;
    if (params.databaseIds?.length)
      query.databaseIds = params.databaseIds.join(",");
    if (params.comparatorId != null)
      query.comparatorId = String(params.comparatorId);
    if (params.tar != null) query.tar = params.tar;
    if (params.washout != null) query.washout = String(params.washout);
    if (params.dbView != null) query.dbView = String(params.dbView);
    if (params.ccView != null) query.ccView = String(params.ccView);
    if (params.rfView != null) query.rfView = String(params.rfView);
    if (params.ciView != null) query.ciView = String(params.ciView);
    if (params.tteView != null) query.tteView = String(params.tteView);
    if (params.csView != null) query.csView = String(params.csView);

    _selfWriteCount++;
    router.push({ query }).finally(() => {
      _selfWriteCount--;
    });
  }

  function patchUrl(partial: Record<string, string | null | undefined>) {
    const query = { ...route.query } as Record<string, string | undefined>;
    for (const [k, v] of Object.entries(partial)) {
      if (v == null) delete query[k];
      else query[k] = v;
    }
    _selfWriteCount++;
    router.replace({ query }).finally(() => {
      _selfWriteCount--;
    });
  }

  function updateUrl(partial) {
    const current = readUrl();
    writeUrl({ ...current, ...partial });
  }

  function clearChildParams(
    opts: {
      report?: any;
      targetId?: number | null;
      tab?: string | null;
    } = {}
  ) {
    const query: Record<string, any> = { ...route.query };
    [...MANAGED, ...CHILD_STATE_KEYS].forEach((k) => delete query[k]);

    if (opts.report != null) query.report = opts.report;
    if (opts.targetId != null) query.targetId = String(opts.targetId);
    if (opts.tab != null) query.tab = opts.tab;

    _selfWriteCount++;
    router.push({ query }).finally(() => {
      _selfWriteCount--;
    });
  }

  function isSelfWrite() {
    return _selfWriteCount > 0;
  }

  return {
    readUrl,
    writeUrl,
    updateUrl,
    clearChildParams,
    patchUrl,
    isSelfWrite,
  };
}
