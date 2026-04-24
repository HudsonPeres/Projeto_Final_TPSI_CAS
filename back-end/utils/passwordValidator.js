export const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isValid = hasUpperCase && hasSpecialChar && hasNumber;
  return {
    isValid,
    message:
      "A senha deve conter pelo menos uma letra maiúscula, um caractere especial e um número.",
  };
};
