import './MembershipPage.css';
import saccoLogo from './sacco-logo.png';

const preparationItems = [
  {
    number: '01',
    title: 'Personal details',
    details: 'Full name and date of birth. Gender may be requested if required by the approved application.',
  },
  {
    number: '02',
    title: 'Contact and address',
    details: 'Phone number, email address and residential address.',
  },
  {
    number: '03',
    title: 'Work or business',
    details: 'Occupation and employer or business details. KRA PIN only where required.',
  },
  {
    number: '04',
    title: 'Supporting information',
    details: 'National ID and passport photograph, next-of-kin and beneficiary details, and membership category, as required.',
  },
];

const applicationSteps = [
  {
    number: '01',
    title: 'Confirm the requirements',
    text: 'Ask Smartlife SACCO about current eligibility, membership categories, fees and required documents.',
  },
  {
    number: '02',
    title: 'Prepare your details',
    text: 'Use the checklist as a guide. Share personal documents only through an application channel confirmed by the SACCO.',
  },
  {
    number: '03',
    title: 'Submit through an approved channel',
    text: 'The online application form is not available yet. Contact the SACCO for the current application process.',
  },
  {
    number: '04',
    title: 'Wait for application review',
    text: 'The SACCO will advise how applications are reviewed, approved and assigned a membership number.',
  },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4.25 10h11.5m-4.75-4.75L15.75 10 11 14.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Brand() {
  return (
    <a className="membership-brand" href="/" aria-label="Smartlife SACCO home">
      <img src={saccoLogo} alt="" />
      <span><strong>SMARTLIFE</strong><small>SAVINGS &amp; CREDIT CO-OPERATIVE</small></span>
    </a>
  );
}

export default function MembershipPage() {
  return (
    <div className="membership-page">
      <div className="membership-topline">
        <div className="membership-container">
          <span>Save Today. Grow Tomorrow.</span>
          <a href="tel:+254700123456">Call +254 700 123 456</a>
        </div>
      </div>

      <header className="membership-header">
        <div className="membership-container">
          <Brand />
          <nav aria-label="Membership navigation">
            <a href="/#about">About</a>
            <a href="/#services">Services</a>
            <a href="/#loans">Loans</a>
            <a href="/#contact">Contact</a>
            <a className="membership-nav-login" href="/login">Member login <ArrowIcon /></a>
          </nav>
        </div>
      </header>

      <main>
        <section className="membership-hero">
          <div className="membership-container membership-hero-content">
            <a className="membership-back-link" href="/"><span aria-hidden="true">←</span> Back to home</a>
            <span className="membership-kicker"><span /> MEMBERSHIP AT SMARTLIFE</span>
            <h1>Make your next step<br /><em>a shared one.</em></h1>
            <p>Thinking about joining Smartlife SACCO? Here’s what to expect and what you may need to prepare before applying.</p>
            <div className="membership-status">
              <span className="membership-status-icon" aria-hidden="true">i</span>
              <p><strong>Online applications are not open yet.</strong> Contact the SACCO to confirm the current eligibility criteria, fees and application channel.</p>
            </div>
          </div>
          <div className="membership-hero-accent" />
        </section>

        <section className="membership-process-section">
          <div className="membership-container">
            <div className="membership-section-heading">
              <span className="membership-kicker"><span /> HOW TO GET STARTED</span>
              <h2>A clear path to <em>membership.</em></h2>
              <p>The SACCO will confirm the official process and requirements. These steps are a general guide, not an application or approval.</p>
            </div>
            <div className="membership-step-grid">
              {applicationSteps.map((step) => (
                <article className="membership-step-card" key={step.number}>
                  <span className="membership-step-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="membership-checklist-section">
          <div className="membership-container membership-checklist-layout">
            <div className="membership-checklist-intro">
              <span className="membership-kicker"><span /> BEFORE YOU APPLY</span>
              <h2>Get your details<br /><em>ready.</em></h2>
              <p>The application requirements below are based on the information provided for the project. Confirm every requirement with Smartlife SACCO before sharing personal information.</p>
              <div className="privacy-reminder">
                <span aria-hidden="true">!</span>
                <p><strong>Protect your information.</strong> This website does not collect membership applications or documents. Do not send ID numbers, copies of documents or beneficiary details through this page.</p>
              </div>
            </div>
            <div className="membership-checklist">
              {preparationItems.map((item) => (
                <article className="checklist-item" key={item.number}>
                  <span className="checklist-number">{item.number}</span>
                  <div><h3>{item.title}</h3><p>{item.details}</p></div>
                  <span className="checklist-check" aria-hidden="true">✓</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="membership-contact-section">
          <div className="membership-container membership-contact-panel">
            <div>
              <span className="membership-kicker membership-kicker-light"><span /> READY TO ASK A QUESTION?</span>
              <h2>Talk to the SACCO<br /><em>before you apply.</em></h2>
              <p>Confirm current membership criteria, fees and the secure way to submit an application.</p>
            </div>
            <a className="membership-call-button" href="tel:+254700123456">Call +254 700 123 456 <ArrowIcon /></a>
          </div>
        </section>
      </main>

      <footer className="membership-footer">
        <div className="membership-container">
          <Brand />
          <p>© {new Date().getFullYear()} Smartlife SACCO. Application details and policies must be confirmed by the SACCO.</p>
        </div>
      </footer>
    </div>
  );
}
