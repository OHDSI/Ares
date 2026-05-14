export interface AttritionRow {
  ruleName: string;
  personCount: number;
  dropCount: number;
  dropPercent: string;
  retainPercent: string;
}

interface InclusionRule {
  ruleSequence: number;
  ruleName: string;
}

interface InclusionStat {
  databaseName: string;
  modeId: number;
  inclusionRuleMask: number;
  personCount: number;
}

// modeId 1 = Subject/Person level, modeId 0 = Record/Entry level
export const MODE_OPTIONS = [
  { label: "Subjects", value: 1 },
  { label: "Records", value: 0 },
];

export function computeAttrition(
  rules: InclusionRule[],
  stats: InclusionStat[],
  modeId: number,
  databaseName: string
): AttritionRow[] {
  const filtered = stats.filter(
    (r) => r.modeId === modeId && r.databaseName === databaseName
  );

  const total = filtered.reduce((s, r) => s + r.personCount, 0);

  const rows: AttritionRow[] = [
    {
      ruleName: "Before any inclusion criteria",
      personCount: total,
      dropCount: 0,
      dropPercent: "0.00%",
      retainPercent: "100.00%",
    },
  ];

  const sorted = [...rules].sort((a, b) => a.ruleSequence - b.ruleSequence);
  let prev = total;
  let testMask = 0;

  for (const rule of sorted) {
    // Accumulate testMask by the actual ruleSequence value, matching the R logic:
    // testMask = testMask + 2^(rule$ruleSequence)
    testMask += 1 << rule.ruleSequence;

    const count = filtered
      .filter((r) => (r.inclusionRuleMask & testMask) === testMask)
      .reduce((s, r) => s + r.personCount, 0);

    const drop = prev - count;
    rows.push({
      ruleName: rule.ruleName,
      personCount: count,
      dropCount: drop,
      dropPercent: prev > 0 ? `${((drop / prev) * 100).toFixed(2)}%` : "0.00%",
      retainPercent:
        prev > 0 ? `${((count / prev) * 100).toFixed(2)}%` : "0.00%",
    });
    prev = count;
  }

  return rows;
}
