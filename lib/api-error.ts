/**
 * Route Handler が返す `{ error: string | ZodFlatten | ... }` を画面向けの1行〜短文に整形する。
 */
type ZodFlattenLike = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

function isZodFlatten(e: unknown): e is ZodFlattenLike {
  if (e === null || typeof e !== "object") return false;
  return "formErrors" in e || "fieldErrors" in e;
}

export function apiErrorMessage(json: { error?: unknown }): string {
  const e = json.error;
  if (e === undefined || e === null) {
    return "エラーが発生しました。しばらくしてから再度お試しください。";
  }
  if (typeof e === "string") {
    return e.trim() || "エラーが発生しました。";
  }
  if (typeof e === "object") {
    const o = e as Record<string, unknown>;

    if (isZodFlatten(e)) {
      const parts: string[] = [];
      if (Array.isArray(e.formErrors)) {
        for (const msg of e.formErrors) {
          if (typeof msg === "string" && msg.trim()) parts.push(msg.trim());
        }
      }
      const fieldErrors = e.fieldErrors ?? {};
      for (const [field, msgs] of Object.entries(fieldErrors)) {
        if (Array.isArray(msgs) && msgs.length > 0) {
          const joined = msgs.filter((m): m is string => typeof m === "string").join("、");
          if (joined) parts.push(`${field}: ${joined}`);
        }
      }
      if (parts.length > 0) {
        return parts.join(" / ");
      }
    }

    if (typeof o.message === "string" && o.message.trim()) {
      return o.message.trim();
    }

    if (typeof o.code === "string" && typeof o.message === "string") {
      return `${o.message.trim()} (${o.code})`;
    }
  }

  return "入力内容を確認してください。";
}
