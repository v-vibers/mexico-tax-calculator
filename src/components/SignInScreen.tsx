interface SignInScreenProps {
  signIn: () => void;
}

export function SignInScreen({ signIn }: SignInScreenProps) {
  return (
    <div className="sign-in-container">
      <div className="sign-in-card">
        <h1>🇲🇽 Mexico Tax Calculator</h1>
        <p className="subtitle">
          Calculate your taxes according to Mexican tax laws using AI
        </p>
        <div className="features">
          <div className="feature">
            <span className="feature-icon">💰</span>
            <span>Income tax (ISR) calculations</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📊</span>
            <span>Tax bracket analysis</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🤖</span>
            <span>AI-powered insights</span>
          </div>
        </div>
        <button className="sign-in-button" onClick={signIn}>
          Sign In to Get Started
        </button>
        <p className="disclaimer">
          Sign in to access the tax calculator and save your calculations
        </p>
      </div>
    </div>
  );
}