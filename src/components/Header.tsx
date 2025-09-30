import { useSubscribeDev } from '@subscribe.dev/react';

export function Header() {
  const { user, usage, subscriptionStatus, subscribe, signOut } = useSubscribeDev();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h2 className="app-title">🇲🇽 Mexico Tax Calculator</h2>
        </div>
        <div className="header-right">
          <div className="user-info">
            {user?.avatarUrl && (
              <img src={user.avatarUrl} alt="User avatar" className="user-avatar" />
            )}
            <span className="user-email">{user?.email}</span>
          </div>
          <div className="billing-info">
            <span className="credits-badge">
              💳 {usage?.remainingCredits ?? 0} credits
            </span>
            <span className="plan-badge">
              {subscriptionStatus?.plan?.name ?? 'Free'}
            </span>
          </div>
          <button className="manage-subscription-btn" onClick={subscribe!}>
            Manage Subscription
          </button>
          <button className="sign-out-btn" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}