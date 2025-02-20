import { z } from "zod";

const emailValidator = z.string().email();

export const isValidEmail = (email: string): boolean => {
  try {
    emailValidator.parse(email);
    return true;
  } catch {
    return false;
  }
};
