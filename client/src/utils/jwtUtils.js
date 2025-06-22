const jwtUtils = {
  decode(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (err) {
      console.error('JWT decode error:', err);
      return null;
    }
  },

  isTokenExpired(token) {
    const decoded = this.decode(token);
    if (!decoded) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  },

  getTokenPayload(token) {
    return this.decode(token);
  },

  validateToken(token) {
    if (!token) return false;
    
    // Basic structure validation
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Check expiration
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return false;

    return !this.isTokenExpired(token);
  }
};

export default jwtUtils;
