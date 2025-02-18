export function sanitizeInput(input: string): string {
  // Only remove or replace potentially dangerous characters, keep everything else including spaces
  return input.replace(/[<>]/g, "");
}
