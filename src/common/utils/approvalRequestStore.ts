export const APPROVAL_REQUEST_TTL_MS = 15 * 60 * 1000;

export type ApprovalContext = {
  origin: string;
  tabId: number;
};

export type ApprovalRecord = {
  kind: 'popup' | 'legacy';
  createdAt: number;
  /** Modern openPopup payload */
  context?: ApprovalContext;
  data?: unknown;
  /** Legacy hash-query params (signPsbt, etc.) */
  legacyParams?: Record<string, string>;
};

const store = new Map<string, ApprovalRecord>();

const pruneExpired = (now = Date.now()) => {
  for (const [id, record] of store) {
    if (now - record.createdAt > APPROVAL_REQUEST_TTL_MS) {
      store.delete(id);
    }
  }
};

export const createApprovalRequest = (
  record: Omit<ApprovalRecord, 'createdAt'>,
): string => {
  pruneExpired();
  const requestId = crypto.randomUUID();
  store.set(requestId, { ...record, createdAt: Date.now() });
  return requestId;
};

export const getApprovalRequest = (requestId: string): ApprovalRecord | undefined => {
  pruneExpired();
  const record = store.get(requestId);
  if (!record) {
    return undefined;
  }
  if (Date.now() - record.createdAt > APPROVAL_REQUEST_TTL_MS) {
    store.delete(requestId);
    return undefined;
  }
  return record;
};

export const deleteApprovalRequest = (requestId: string): boolean => store.delete(requestId);

/** Test / diagnostics helper — not for production UI. */
export const __approvalStoreSizeForTests = () => store.size;

export const __clearApprovalStoreForTests = () => {
  store.clear();
};
