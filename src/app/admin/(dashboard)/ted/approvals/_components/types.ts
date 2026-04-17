export type ApprovalItem =
  | {
      kind: "prompt";
      id: number;
      pillar: string;
      scheduledFor: string;
      originalBody: string;
      editedBody: string | null;
      voiceCheck: Record<string, unknown> | null;
      status: string;
      attempts: number;
      createdAt: string;
    }
  | {
      kind: "welcome";
      memberEmail: string;
      firstName: string;
      persona: string | null;
      draftBody: string;
      voiceCheck: Record<string, unknown> | null;
      status: string;
      createdAt: string;
    }
  | {
      kind: "surface";
      id: number;
      surfaceType: string;
      threadUrl: string;
      threadAuthor: string | null;
      threadTitle: string | null;
      threadBody: string | null;
      originalBody: string;
      editedBody: string | null;
      voiceCheck: Record<string, unknown> | null;
      status: string;
      createdAt: string;
    };

export function itemKey(item: ApprovalItem): string {
  if (item.kind === "welcome") return `welcome:${item.memberEmail}`;
  return `${item.kind}:${item.id}`;
}

export function itemOriginalBody(item: ApprovalItem): string {
  if (item.kind === "prompt") return item.originalBody;
  if (item.kind === "welcome") return item.draftBody;
  return item.originalBody;
}

export function itemCurrentBody(item: ApprovalItem): string {
  if (item.kind === "prompt") return item.editedBody ?? item.originalBody;
  if (item.kind === "welcome") return item.draftBody;
  return item.editedBody ?? item.originalBody;
}
