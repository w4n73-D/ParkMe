export const getAuthError = (error) => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Email or password is incorrect';
    case 'Email not confirmed':
      return 'Please confirm your email before logging in';
    case 'User already registered':
      return 'An account with this email already exists';
    default:
      return error.message || 'An error occurred during authentication';
  }
};