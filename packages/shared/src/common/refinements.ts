export const hasAnyField = (obj: object) => Object.values(obj).some((v) => v !== undefined);
export const ANY_FIELD_MESSAGE = "at least one field is required";
