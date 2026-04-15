import { useRouter, useRoute } from "vue-router";

let _isSelfWrite = false;

export function useCharacterizationUrl() {
  const router = useRouter();
  const route = useRoute();

  function readUrl() {
    const q = route.query;
    return {
      targetId: q.targetId ? parseInt(q.targetId, 10) : null,
      tab: q.tab || null,
      report: q.report || 0,
      outcomeId: q.outcomeId ? parseInt(q.outcomeId, 10) : null,
      outcomeIds: q.outcomeIds ? q.outcomeIds.split(",").map(Number) : null,
      databaseId: q.databaseId || null,
      databaseIds: q.databaseIds ? q.databaseIds.split(",") : null,
      comparatorId: q.comparatorId ? parseInt(q.comparatorId, 10) : null,
      tar: q.tar || null,
      washout: q.washout || null,
    };
  }

  function writeUrl(params) {
    const query: Record<string, any> = { ...route.query };

    const managed = [
      "targetId",
      "tab",
      "outcomeId",
      "outcomeIds",
      "databaseId",
      "databaseIds",
      "comparatorId",
      "tar",
      "washout",
    ];
    managed.forEach((k) => delete query[k]);

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

    _isSelfWrite = true;
    router.push({ query }).finally(() => {
      _isSelfWrite = false;
    });
  }

  function updateUrl(partial) {
    const current = readUrl();
    writeUrl({ ...current, ...partial });
  }

  function clearChildParams() {
    const current = readUrl();
    writeUrl({
      report: current.report,
      targetId: current.targetId,
      tab: current.tab,
    });
  }

  function isSelfWrite() {
    return _isSelfWrite;
  }

  return {
    readUrl,
    writeUrl,
    updateUrl,
    clearChildParams,
    isSelfWrite,
  };
}
