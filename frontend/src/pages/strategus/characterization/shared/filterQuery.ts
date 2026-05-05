export type FilterOperator = "=" | "!=" | "<" | ">" | "<=" | ">=" | "contains";

export interface FilterClause {
  key: string;
  op: FilterOperator;
  value: string;
  connector: "and" | "or";
}

export interface FilterParseResult {
  clauses: FilterClause[];
  error: string | null;
}

const CLAUSE_RE =
  /^([a-zA-Z_][a-zA-Z0-9_.]*)\s*(<=|>=|!=|contains|<|>|=)\s*([\s\S]+)$/i;

function parseClause(
  text: string
): { key: string; op: FilterOperator; value: string } | null {
  const m = text.trim().match(CLAUSE_RE);
  if (!m) return null;
  return {
    key: m[1],
    op: m[2].toLowerCase() as FilterOperator,
    value: m[3].trim(),
  };
}

export function parseFilterQuery(input: string): FilterParseResult {
  const raw = input.startsWith(":") ? input.slice(1).trim() : input.trim();
  if (!raw) return { clauses: [], error: null };

  const segments: string[] = [];
  const connectors: ("and" | "or")[] = [];
  const TOKEN_RE = /\s+(and|or)\s+/gi;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = TOKEN_RE.exec(raw)) !== null) {
    segments.push(raw.slice(last, m.index));
    connectors.push(m[1].toLowerCase() as "and" | "or");
    last = m.index + m[0].length;
  }
  segments.push(raw.slice(last));

  const clauses: FilterClause[] = [];

  for (let i = 0; i < segments.length; i++) {
    const parsed = parseClause(segments[i]);
    if (!parsed) {
      return { clauses: [], error: `Cannot parse: "${segments[i].trim()}"` };
    }
    clauses.push({ ...parsed, connector: i === 0 ? "and" : connectors[i - 1] });
  }

  return { clauses, error: null };
}

function evaluateClause(
  row: Record<string, unknown>,
  clause: FilterClause
): boolean {
  const rawVal = row[clause.key];
  if (rawVal === undefined || rawVal === null) return false;

  if (clause.op === "contains") {
    return String(rawVal).toLowerCase().includes(clause.value.toLowerCase());
  }

  const numTarget = Number(clause.value);
  if (!isNaN(numTarget) && typeof rawVal === "number") {
    switch (clause.op) {
      case "=":
        return rawVal === numTarget;
      case "!=":
        return rawVal !== numTarget;
      case "<":
        return rawVal < numTarget;
      case ">":
        return rawVal > numTarget;
      case "<=":
        return rawVal <= numTarget;
      case ">=":
        return rawVal >= numTarget;
    }
  }

  const rowStr = String(rawVal).toLowerCase();
  const valStr = clause.value.toLowerCase();
  switch (clause.op) {
    case "=":
      return rowStr === valStr;
    case "!=":
      return rowStr !== valStr;
    case "<":
      return rowStr < valStr;
    case ">":
      return rowStr > valStr;
    case "<=":
      return rowStr <= valStr;
    case ">=":
      return rowStr >= valStr;
  }
  return false;
}

export function normalizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function translateClauses(
  result: FilterParseResult,
  keyMap: Record<string, string>
): FilterParseResult {
  if (result.error !== null || !Object.keys(keyMap).length) return result;
  return {
    ...result,
    clauses: result.clauses.map((c) => ({ ...c, key: keyMap[c.key] ?? c.key })),
  };
}

export function applyFilterQuery(
  rows: Record<string, unknown>[],
  result: FilterParseResult
): Record<string, unknown>[] {
  if (result.error !== null || result.clauses.length === 0) return rows;

  return rows.filter((row) => {
    let pass = evaluateClause(row, result.clauses[0]);
    for (let i = 1; i < result.clauses.length; i++) {
      const clause = result.clauses[i];
      const next = evaluateClause(row, clause);
      pass = clause.connector === "or" ? pass || next : pass && next;
    }
    return pass;
  });
}

export function applyFilterMatchMode(
  rowVal: unknown,
  filterVal: string,
  matchMode: string
): boolean {
  if (rowVal === undefined || rowVal === null) return false;
  const rowStr = String(rowVal).toLowerCase();
  const filterStr = filterVal.toLowerCase();
  const rowNum = Number(rowVal);
  const filterNum = Number(filterVal);
  const numericOk =
    !isNaN(rowNum) && !isNaN(filterNum) && filterVal.trim() !== "";

  switch (matchMode) {
    case "contains":
      return rowStr.includes(filterStr);
    case "notContains":
      return !rowStr.includes(filterStr);
    case "startsWith":
      return rowStr.startsWith(filterStr);
    case "endsWith":
      return rowStr.endsWith(filterStr);
    case "equals":
      return numericOk ? rowNum === filterNum : rowStr === filterStr;
    case "notEquals":
      return numericOk ? rowNum !== filterNum : rowStr !== filterStr;
    case "lt":
      return numericOk && rowNum < filterNum;
    case "lte":
      return numericOk && rowNum <= filterNum;
    case "gt":
      return numericOk && rowNum > filterNum;
    case "gte":
      return numericOk && rowNum >= filterNum;
    default:
      return rowStr.includes(filterStr);
  }
}
