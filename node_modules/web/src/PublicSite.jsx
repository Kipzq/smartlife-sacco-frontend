import { useState } from 'react';
import './PublicSite.css';
import saccoLogo from './sacco-logo.png';

const navigation = [
  ['About', '#about'],
  ['Services', '#services'],
  ['Loans', '#loans'],
  ['Membership', '#membership'],
  ['Updates', '#updates'],
  ['FAQs', '#faqs'],
  ['Contact', '#contact'],
];

const services = [
  {
    number: '01',
    title: 'Savings that build over time',
    text: 'Create a consistent savings habit and keep track of your contributions as you work toward your goals.',
    label: 'SAVINGS',
  },
  {
    number: '02',
    title: 'Member-focused support',
    text: 'Get clear guidance on membership, savings and the services available to you.',
    label: 'MEMBERSHIP',
  },
  {
    number: '03',
    title: 'Credit with a clear purpose',
    text: 'Explore loan options designed around members’ needs. Eligibility and terms follow the approved credit policy.',
    label: 'LOANS',
  },
  {
    number: '04',
    title: 'Opportunities to grow',
    text: 'Ask the SACCO about current investment opportunities. Official options and terms will be published when confirmed.',
    label: 'INVESTMENT',
  },
];

const loanProducts = [
  'Development',
  'Emergency',
  'School fees',
  'Business',
  'Asset financing',
  'Salary advance',
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4.25 10h11.5m-4.75-4.75L15.75 10 11 14.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Brand({ footer = false }) {
  return (
    <a className={`site-brand${footer ? ' site-brand-footer' : ''}`} href="/" aria-label="Smartlife SACCO home">
      <img src={saccoLogo} alt="" />
      <span className="site-brand-copy">
        <strong>SMARTLIFE</strong>
        <small>SAVINGS &amp; CREDIT CO-OPERATIVE</small>
      </span>
    </a>
  );
}

export default function PublicSite() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="public-site">
      <div className="site-topline">
        <div className="site-container topline-inner">
          <span>Member-focused savings and credit services</span>
          <a href="tel:+254700123456">Talk to us <span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <header className="site-header">
        <div className="site-container header-inner">
          <Brand />
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
          <nav id="primary-navigation" className={`primary-navigation${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
            {navigation.map(([label, href]) => (
              <a key={href} href={href} onClick={closeMenu}>{label}</a>
            ))}
            <a className="nav-login" href="/login">Member login <ArrowIcon /></a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="site-container hero-grid">
            <div className="hero-copy">
              <span className="section-kicker"><span /> SAVE TODAY. GROW TOMORROW.</span>
              <h1>Small steps today.<br /><em>More possibilities</em><br />tomorrow.</h1>
              <p>Build a savings habit, find support for your plans and grow alongside a cooperative that puts its members first.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="/membership">Explore membership <ArrowIcon /></a>
                <a className="button button-secondary" href="#services">Discover our services</a>
              </div>
              <div className="hero-note">
                <span className="note-mark">S</span>
                <span><strong>Save with purpose.</strong><small>Grow at your own pace.</small></span>
              </div>
            </div>

            <div className="hero-art" aria-label="Smartlife SACCO brand artwork">
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />
              <div className="art-sun" />
              <div className="art-panel">
                <img src={saccoLogo} alt="Smartlife Savings and Credit Co-operative Society logo" />
                <div className="art-caption">
                  <span>YOUR GOALS. YOUR JOURNEY.</span>
                  <strong>Together, we prosper.</strong>
                </div>
              </div>
              <div className="art-tag tag-top"><span className="tag-dot" /> A cooperative for your next chapter</div>
              <div className="art-tag tag-bottom"><span>01</span> Save <i /> Plan <i /> Grow</div>
            </div>
          </div>
          <div className="hero-bottom-line" />
        </section>

        <section className="values-strip" aria-label="Our approach">
          <div className="site-container values-grid">
            <div><span className="value-index">01</span><strong>Member first</strong><small>People at the heart of every step</small></div>
            <div><span className="value-index">02</span><strong>Save with purpose</strong><small>Steady habits for meaningful goals</small></div>
            <div><span className="value-index">03</span><strong>Grow together</strong><small>Progress built on shared effort</small></div>
          </div>
        </section>

        <section className="content-section about-section" id="about">
          <div className="site-container about-grid">
            <div className="section-heading">
              <span className="section-kicker"><span /> A LITTLE ABOUT US</span>
              <h2>Built around people.<br /><em>Focused on possibility.</em></h2>
            </div>
            <div className="about-copy">
              <p className="lead-copy">Smartlife SACCO is a member-focused savings and credit cooperative. We’re here to help members make informed financial choices, develop a savings culture and work toward their goals.</p>
              <p>Our story, leadership details and official mission and vision will be published here once confirmed by the SACCO.</p>
              <a className="text-link" href="#contact">Get in touch <ArrowIcon /></a>
            </div>
          </div>
          <div className="site-container principles-grid">
            <article className="principle-card principle-highlight">
              <span className="principle-label">OUR PURPOSE</span>
              <h3>Mission</h3>
              <p>Official mission statement to be provided by Smartlife SACCO.</p>
              <span className="principle-watermark">M</span>
            </article>
            <article className="principle-card">
              <span className="principle-label">OUR DIRECTION</span>
              <h3>Vision</h3>
              <p>Official vision statement to be provided by Smartlife SACCO.</p>
              <span className="principle-watermark">V</span>
            </article>
            <article className="principle-card">
              <span className="principle-label">WHAT GUIDES US</span>
              <h3>Our values</h3>
              <p>Official core values to be confirmed and published by the SACCO.</p>
              <span className="principle-watermark">S</span>
            </article>
          </div>
        </section>

        <section className="content-section services-section" id="services">
          <div className="site-container">
            <div className="section-heading section-heading-centered">
              <span className="section-kicker"><span /> SERVICES FOR YOUR JOURNEY</span>
              <h2>Make room for <em>what’s next.</em></h2>
              <p>Explore the ways members can save, get support and plan for their next step.</p>
            </div>
            <div className="service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.number}>
                  <div className="service-card-top"><span>{service.number}</span><span className="service-mark"><ArrowIcon /></span></div>
                  <span className="service-label">{service.label}</span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <a
                    href={service.label === 'LOANS' ? '#loans' : service.label === 'INVESTMENT' ? '#contact' : '#membership'}
                    aria-label={`Learn about ${service.label.toLowerCase()}`}
                  >
                    Learn more <ArrowIcon />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="loans-section" id="loans">
          <div className="site-container loans-grid">
            <div className="loans-copy">
              <span className="section-kicker section-kicker-light"><span /> PLANNING YOUR NEXT STEP?</span>
              <h2>Credit should move<br /><em>you forward.</em></h2>
              <p>Loan products and terms are subject to Smartlife SACCO’s approved credit policy. Contact the SACCO for current eligibility, rates, fees and application requirements.</p>
              <a className="button button-light" href="#contact">Ask about loan options <ArrowIcon /></a>
            </div>
            <div className="loan-list-card">
              <div className="loan-list-heading"><span>LOAN OPTIONS</span><span>SUBJECT TO POLICY</span></div>
              <div className="loan-pills">
                {loanProducts.map((product) => <span key={product}>{product}</span>)}
              </div>
              <div className="loan-list-note"><span>i</span><p>Availability, eligibility and all lending terms must be confirmed with the SACCO.</p></div>
            </div>
          </div>
        </section>

        <section className="membership-section" id="membership">
          <div className="site-container membership-panel">
            <div>
              <span className="section-kicker"><span /> YOUR NEXT CHAPTER STARTS HERE</span>
              <h2>Interested in becoming<br />a <em>member?</em></h2>
              <p>Online membership applications are being prepared. Contact Smartlife SACCO to confirm current requirements and the application process.</p>
            </div>
            <a className="button button-primary" href="/membership">Membership information <ArrowIcon /></a>
          </div>
        </section>

        <section className="updates-section" id="updates">
          <div className="site-container updates-grid">
            <div>
              <span className="section-kicker"><span /> FROM SMARTLIFE</span>
              <h2>News &amp; updates</h2>
            </div>
            <div className="empty-update">
              <span className="update-icon">S</span>
              <div><strong>Stay tuned</strong><p>Official announcements and news will appear here when published by the SACCO.</p></div>
            </div>
          </div>
        </section>

        <section className="content-section faq-section" id="faqs">
          <div className="site-container faq-grid">
            <div className="section-heading">
              <span className="section-kicker"><span /> GOOD TO KNOW</span>
              <h2>Questions, <em>answered.</em></h2>
              <p>For details specific to your situation, please contact the SACCO directly.</p>
            </div>
            <div className="faq-list">
              <details>
                <summary>How do I become a member?<span aria-hidden="true">+</span></summary>
                <p>Online applications are being prepared. Call Smartlife SACCO to confirm current eligibility and application requirements.</p>
              </details>
              <details>
                <summary>What are the current loan rates and terms?<span aria-hidden="true">+</span></summary>
                <p>Rates, fees, eligibility and repayment terms depend on the approved credit policy. Contact the SACCO for current product details.</p>
              </details>
              <details>
                <summary>Can I access my account online?<span aria-hidden="true">+</span></summary>
                <p>The full member portal is being developed. Contact the SACCO to confirm current account access options.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="testimonials-section" aria-labelledby="testimonials-title">
          <div className="site-container testimonial-placeholder">
            <span className="quote-mark" aria-hidden="true">“</span>
            <div>
              <span className="section-kicker"><span /> MEMBER STORIES</span>
              <h2 id="testimonials-title">Real voices. Shared progress.</h2>
              <p>Member testimonials will be added with the contributors’ consent.</p>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="site-container contact-grid">
            <div>
              <span className="section-kicker section-kicker-light"><span /> WE’RE HERE TO HELP</span>
              <h2>Let’s talk about<br /><em>your goals.</em></h2>
              <p>Reach out for information about membership, savings and current services.</p>
            </div>
            <div className="contact-card">
              <span className="contact-card-label">CALL SMARTLIFE SACCO</span>
              <a className="contact-phone" href="tel:+254700123456">+254 700 123 456 <ArrowIcon /></a>
              <p>Official office address, email and support hours to be confirmed by the SACCO.</p>
              <a className="contact-email-placeholder" href="#contact">Office location &amp; email details coming soon</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-container footer-main">
          <div className="footer-brand-block">
            <Brand footer />
            <p>Save Today. Grow Tomorrow.</p>
          </div>
          <div className="footer-links">
            <span>EXPLORE</span>
            <a href="#about">About us</a>
            <a href="#services">Services</a>
            <a href="#loans">Loan options</a>
          </div>
          <div className="footer-links">
            <span>MEMBERS</span>
            <a href="/membership">Membership information</a>
            <a href="/login">Member login</a>
            <a href="#contact">Contact us</a>
          </div>
          <div className="footer-links">
            <span>CONTACT</span>
            <a href="tel:+254700123456">+254 700 123 456</a>
            <span className="footer-placeholder">Official email to be provided</span>
          </div>
        </div>
        <div className="site-container footer-bottom">
          <span>© {new Date().getFullYear()} Smartlife SACCO. All rights reserved.</span>
          <span>Official privacy and legal policies to be published by the SACCO.</span>
        </div>
      </footer>
    </div>
  );
}
