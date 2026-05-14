import { useRouter, useRoute } from "vue-router";

const MANAGED = ["cohortTab", "cohortId", "defTab", "modeId", "database"];
const GEN_KEYS = ["genCohort", "genDb"];

export function useCohortUrl() {
  const router = useRouter();
  const route = useRoute();

  function readUrl() {
    const q = route.query;
    return {
      cohortTab:
        q.cohortTab != null ? parseInt(q.cohortTab as string, 10) : null,
      cohortId: q.cohortId != null ? parseInt(q.cohortId as string, 10) : null,
      defTab: q.defTab != null ? parseInt(q.defTab as string, 10) : null,
      modeId: q.modeId != null ? parseInt(q.modeId as string, 10) : null,
      database: (q.database as string) ?? null,
      genCohort: (q.genCohort as string) ?? null,
      genDb: (q.genDb as string) ?? null,
    };
  }

  function writeUrl(params: Partial<ReturnType<typeof readUrl>>) {
    const query: Record<string, string> = {};

    for (const [k, v] of Object.entries(route.query)) {
      if (!MANAGED.includes(k) && !GEN_KEYS.includes(k)) query[k] = v as string;
    }

    if (params.cohortTab != null) query.cohortTab = String(params.cohortTab);
    if (params.cohortId != null) query.cohortId = String(params.cohortId);
    if (params.defTab != null) query.defTab = String(params.defTab);
    if (params.modeId != null) query.modeId = String(params.modeId);
    if (params.database != null) query.database = params.database;
    if (params.genCohort) query.genCohort = params.genCohort;
    if (params.genDb) query.genDb = params.genDb;

    router.replace({ query });
  }

  function updateUrl(partial: Partial<ReturnType<typeof readUrl>>) {
    const current = readUrl();
    writeUrl({ ...current, ...partial });
  }

  function clearDefinitionParams() {
    updateUrl({
      cohortId: undefined as any,
      defTab: undefined as any,
      modeId: undefined as any,
      database: undefined as any,
    });
  }

  function clearGenerationParams() {
    updateUrl({
      genCohort: undefined as any,
      genDb: undefined as any,
    });
  }

  return { readUrl, updateUrl, clearDefinitionParams, clearGenerationParams };
}
