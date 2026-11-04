"use strict";
/** Shared contract for authored and published MCQs. Metadata is optional. */
function questionErrors(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return ["question must be an object"];
  const errors = [];
  const hasText = (value) => typeof value === "string" && value.trim().length > 0;
  if (!hasText(item.question)) errors.push("question must be non-empty text");
  if (!Array.isArray(item.options) || item.options.length !== 4 || !item.options.every(hasText)) {
    errors.push("options must contain four non-empty strings");
  } else if (new Set(item.options.map((option) => option.trim().toLowerCase())).size !== 4) {
    errors.push("options must be distinct");
  }
  if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer > 3) {
    errors.push("answer must be a 0-based integer from 0 to 3");
  }
  if (!hasText(item.explanation)) errors.push("explanation must be non-empty text");
  if (item.level !== undefined && ![1, 2, 3].includes(item.level)) {
    errors.push("level must be 1, 2 or 3 when provided");
  }
  return errors;
}

function assertQuestion(item, context) {
  const errors = questionErrors(item);
  if (errors.length) throw new Error((context || "Invalid question") + ": " + errors.join("; "));
  return item;
}

module.exports = { questionErrors, assertQuestion };
