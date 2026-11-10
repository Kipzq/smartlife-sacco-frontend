import './MemberPortal.css';
import saccoLogo from './sacco-logo.png';

const memberAreas = [
  ['Overview', true],
  ['My savings', false],
  ['My shares', false],
  ['My loans', false],
  ['Statements', false],
  ['My profile', false],
];

const accountCards = [
  { label: 'SAVINGS BALANCE', title: 'Savings', icon: 'S' },
  { label: 'SHARE CAPITAL', title: 'Shares', icon: '↗' },
  { label: 'OUTSTANDING LOANS', title: 'Loans', icon: 'L' },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4.25 10h11.5m-4.75-4.75L15.75 10 11 14.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MemberPortal() {
  return (
    <div className="member-portal">
      <header className="portal-header">
        <div className="portal-brand">
          <a className="portal-logo-link" href="/" aria-label="Smartlife SACCO home">
            <img src={saccoLogo} alt="" />
          </a>
          <span className="portal-brand-copy"><strong>SMARTLIFE</strong><small>MEMBER SERVICES</small></span>
          <span className="portal-preview-label">PREVIEW</span>
        </div>
        <div className="portal-header-actions">
          <a href="/" className="portal-public-link">Public website</a>
          <a href="tel:+254700123456" className="portal-help-link">Need help? <strong>+254 700 123 456</strong></a>
        </div>
      </header>

      <div className="portal-layout">
        <aside className="portal-sidebar" aria-label="Member portal sections">
          <div className="portal-member-placeholder">
            <span className="portal-avatar" aria-hidden="true">M</span>
            <span><strong>Member space</strong><small>Account not connected</small></span>
          </div>
          <nav className="portal-navigation">
            <span className="portal-nav-heading">YOUR ACCOUNT</span>
            {memberAreas.map(([label, active]) => (
              active
                ? <a className="portal-nav-item active" key={label} href="/member" aria-current="page"><span className="portal-nav-icon" aria-hidden="true">{label === 'Overview' ? '⌂' : '·'}</span>{label}</a>
                : <span className="portal-nav-item disabled" key={label} aria-disabled="true"><span className="portal-nav-icon" aria-hidden="true">·</span>{label}<small>Coming soon</small></span>
            ))}
          </nav>
          <div className="portal-sidebar-bottom">
            <p>Member accounts and financial records are not connected in this preview.</p>
            <a href="/#contact">Contact Smartlife <ArrowIcon /></a>
          </div>
        </aside>

        <main className="portal-main">
          <div className="portal-main-inner">
            <div className="portal-breadcrumb"><a href="/">HOME</a><span>/</span><strong>MEMBER PORTAL</strong></div>
            <div className="portal-heading-row">
              <div>
                <span className="portal-kicker"><span /> MEMBER SERVICES</span>
                <h1>Your member space.</h1>
                <p>A preview of the tools being prepared for Smartlife SACCO members.</p>
              </div>
              <a className="portal-login-button" href="/login">Demo phone check <ArrowIcon /></a>
            </div>

            <section className="portal-notice" aria-label="Preview limitations">
              <span className="portal-notice-icon" aria-hidden="true">i</span>
              <div>
                <strong>Preview only — not connected to member accounts</strong>
                <p>No personal records, savings balances, shares, loans or statements are displayed here. The current phone-check demo does not sign you in.</p>
              </div>
            </section>

            <section className="portal-account-section" aria-labelledby="account-summary-title">
              <div className="portal-section-title">
                <div><span className="portal-section-kicker">ACCOUNT OVERVIEW</span><h2 id="account-summary-title">Your accounts</h2></div>
                <span className="portal-data-state"><i /> DATA NOT CONNECTED</span>
              </div>
              <div className="portal-account-grid">
                {accountCards.map((account) => (
                  <article className="portal-account-card" key={account.label}>
                    <div className="portal-account-card-top">
                      <span className="portal-account-icon" aria-hidden="true">{account.icon}</span>
                      <span className="portal-card-status">NOT CONNECTED</span>
                    </div>
                    <span className="portal-account-label">{account.label}</span>
                    <h3>{account.title}</h3>
                    <div className="portal-placeholder-value" aria-label="Member account data not available"><span /><span /><span /><span /><span /><span /><span /></div>
                    <p>Member account connection required</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="portal-lower-grid">
              <article className="portal-activity-card">
                <div className="portal-section-title">
                  <div><span className="portal-section-kicker">YOUR LATEST ACTIVITY</span><h2>Recent transactions</h2></div>
                  <span className="portal-activity-lock" aria-label="Unavailable until connected">◇</span>
                </div>
                <div className="portal-empty-state">
                  <span aria-hidden="true">↗</span>
                  <strong>No member activity to show</strong>
                  <p>Transactions will appear after a secure member account and records are connected.</p>
                </div>
              </article>

              <article className="portal-actions-card">
                <span className="portal-section-kicker">MEMBER TOOLS</span>
                <h2>More ways to manage your account</h2>
                <div className="portal-action-list">
                  <span><i aria-hidden="true">S</i>Savings &amp; contributions<small>Not available yet</small></span>
                  <span><i aria-hidden="true">L</i>Loan applications<small>Not available yet</small></span>
                  <span><i aria-hidden="true">D</i>Statements &amp; receipts<small>Not available yet</small></span>
                </div>
              </article>
            </section>

            <footer className="portal-main-footer">
              <span>Member data will only appear after secure sign-in and verified account access are implemented.</span>
              <a href="/#contact">Contact us <ArrowIcon /></a>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
