export class AuthService {
  #loginAttempts = new Map();
  #MAX_ATTEMPTS = 5;
  #LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor(firebase) {
    this.auth = firebase.auth();
    this.firestore = firebase.firestore();
  }

  async signIn(email, password) {
    const attemptKey = email.toLowerCase();
    
    // Use transaction for login attempts
    return this.firestore.runTransaction(async (transaction) => {
      const attemptsRef = this.firestore.collection('loginAttempts').doc(attemptKey);
      const attemptsDoc = await transaction.get(attemptsRef);
      
      const attempts = attemptsDoc.exists ? attemptsDoc.data() : { count: 0, timestamp: Date.now() };

      // Check for lockout
      if (attempts.count >= this.#MAX_ATTEMPTS) {
        const timeLeft = this.#LOCKOUT_DURATION - (Date.now() - attempts.timestamp);
        if (timeLeft > 0) {
          throw new Error('Too many login attempts. Please try again later.');
        }
        // Reset attempts after lockout period
        transaction.set(attemptsRef, { count: 0, timestamp: Date.now() });
      }

      try {
        const { user } = await this.auth.signInWithEmailAndPassword(email, password);
        // Reset attempts on successful login
        transaction.delete(attemptsRef);
        return this.formatUserData(user);
      } catch (error) {
        // Update attempts count
        transaction.set(attemptsRef, {
          count: attempts.count + 1,
          timestamp: Date.now()
        });
        throw this.#handleAuthError(error);
      }
    });
  }

  #handleAuthError(error) {
    const safeErrors = {
      'auth/user-not-found': 'Invalid credentials',
      'auth/wrong-password': 'Invalid credentials',
      'auth/invalid-email': 'Invalid email format',
      'auth/user-disabled': 'Account disabled',
      'auth/too-many-requests': 'Too many attempts'
    };

    return new Error(safeErrors[error.code] || 'Authentication failed');
  }

  formatUserData(user) {
    // Sanitize user data
    return {
      _id: user.uid,
      name: this.#sanitizeString(user.displayName) || 'Anonymous',
      email: user.email,
      avatar: this.#sanitizeUrl(user.photoURL),
    };
  }

  #sanitizeString(str) {
    return str ? String(str).slice(0, 100).trim() : '';
  }

  #sanitizeUrl(url) {
    try {
      return url ? new URL(url).toString() : null;
    } catch {
      return null;
    }
  }
}


