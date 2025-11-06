export function composeSearchQueryAnnouncement(
  query: string,
  options: {
    describeQuery: (value: string) => string;
    clearedMessage: string;
    resultCountText: string;
  }
): string {
  const { describeQuery, clearedMessage, resultCountText } = options;
  const trimmed = query.trim();
  if (trimmed) {
    return `${describeQuery(trimmed)}, ${resultCountText}`;
  }
  return `${clearedMessage}, ${resultCountText}`;
}

export function composeSearchFilterAnnouncement(
  labels: string[],
  options: {
    joiner: string;
    singularWord: string;
    pluralWord: string;
    resultCountText: string;
    resultSeparator?: string;
  }
): string {
  const { joiner, singularWord, pluralWord, resultCountText, resultSeparator = ', ' } = options;
  const filterWord = labels.length > 1 ? pluralWord : singularWord;
  const prefix = labels.join(joiner);
  return `${prefix} ${filterWord}${resultSeparator}${resultCountText}`;
}

export function composeTimelineChipAnnouncement(
  label: string,
  stateLabel: string,
  resultSummary: string
): string {
  return `${label} — ${stateLabel}, ${resultSummary}`;
}

export function composeTimelineLogicAnnouncement(
  logicLabel: string,
  resultSummary: string
): string {
  return `${logicLabel}, ${resultSummary}`;
}

export function composeBookmarkAnnouncement(
  message: string,
  resultSummary?: string
): string {
  if (resultSummary) {
    return `${message}, ${resultSummary}`;
  }
  return message;
}
