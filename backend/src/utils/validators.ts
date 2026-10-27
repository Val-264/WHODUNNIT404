export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
 
/**
 * Validate wether a text string confroms to the email format 
*/
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validate wether the password meets security requirements
 * (at least 8 characters, at least one uppercase, an lowercase, a number and a special character)
 */
export const isValidPassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};