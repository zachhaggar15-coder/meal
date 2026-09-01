import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { SITE_CONTACT_EMAIL } from '../constants/site.js';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy',
  url: 'https://www.mealprep.org.uk/privacy',
};

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy | MealPrep.org.uk"
        description="What MealPrep.org.uk collects, which analytics providers we use, how consent works, what is stored in your browser, and how to contact us."
        canonical="/privacy"
        jsonLd={jsonLd}
      />

      <div className="content-page privacy-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">Privacy</span>
        </nav>
        <SiteLogo variant="page" className="page-header-logo" />
        <h1>Privacy Policy</h1>
        <p className="content-intro">
          MealPrep.org.uk is a free UK meal-planning website. There are no user accounts and we
          do not sell data. This page names every third party that can receive data from your
          visit, and explains what is stored on your own device.
        </p>

        <section>
          <h2>What runs before you choose</h2>
          <p>
            Nothing optional. Until you accept analytics, no analytics or measurement provider is
            loaded at all — the scripts are not on the page, so they cannot set cookies or receive
            your visit. If your browser sends a Do Not Track signal, analytics stay off regardless
            of what the banner says.
          </p>
          <p>
            The site is hosted on Vercel, so your request reaches Vercel&rsquo;s servers in order
            for the page to be delivered at all. That is unavoidable for any hosted website.
          </p>
        </section>

        <section>
          <h2>Analytics providers we use</h2>
          <p>
            If you accept analytics, these providers are loaded. They are named here so you can
            read their own policies before deciding:
          </p>
          <ul className="content-bullets">
            <li>
              <strong>Google Analytics 4</strong> — page views and interaction events. Google may
              set cookies and processes data under its own terms.{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google privacy policy
              </a>
            </li>
            <li>
              <strong>Ahrefs Web Analytics</strong> — cookieless traffic measurement.{' '}
              <a
                href="https://ahrefs.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ahrefs privacy policy
              </a>
            </li>
            <li>
              <strong>Vercel Analytics</strong> — cookieless page-performance and traffic
              measurement from our host.{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel privacy policy
              </a>
            </li>
            <li>
              <strong>Our own event log</strong> — the anonymous events described below are sent
              to our own server rather than to an analytics company, and stored in a{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                Supabase
              </a>{' '}
              database we control. Your browser never contacts Supabase directly.
            </li>
          </ul>
          <p>
            If analytics are accepted, we may record anonymous session events such as page views,
            button and link clicks, internal searches, scroll depth, sections that enter the
            viewport, approximate time spent on a page, referrer type, device category, viewport
            size and page-speed measurements. Quiz completion is recorded only as broad modes,
            such as preset versus custom targets; answer-bearing URLs and exact calorie or macro
            targets are removed before storage. We do not put email addresses, payment details,
            health information or typed meal-plan form answers into this behaviour log.
          </p>
          <p>
            You can change your mind at any time by clearing this site&rsquo;s stored data in your
            browser settings, which resets the choice and stops the providers loading again.
          </p>
        </section>

        <section>
          <h2>Advertising</h2>
          <p>
            The site is built to carry advertising from{' '}
            <strong>Google AdSense</strong>, and this section describes how that works whether or
            not you are seeing ads today. Ads are switched off site-wide unless we have enabled
            them, and while they are off no advertising script is loaded on any page.
          </p>
          <p>
            When advertising is on, the banner offers equally available <strong>Accept all</strong>
            and <strong>Reject all</strong> choices before anything loads. A smaller More options
            control lets you allow analytics only or advertising only, so agreeing to one does not
            agree to the other. Until you accept advertising, the Google AdSense script is not on
            the page, so it cannot set cookies or receive your visit. If your browser sends a Do Not
            Track signal, advertising stays off regardless of what the banner says.
          </p>
          <p>
            If you accept, Google and its partners may set cookies or read device identifiers to
            serve and measure ads, including personalised ads where you have agreed to that. Google
            processes this under its own terms:{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
            >
              how Google uses data from sites that use its services
            </a>
            . You can change or withdraw the choice at any time by clearing this site&rsquo;s
            stored data in your browser settings, and you can turn off personalised advertising
            across Google at{' '}
            <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">
              My Ad Center
            </a>
            .
          </p>
          <p>
            Ads are never placed on error screens, forms, the quiz, the plan browser, the chooser
            screens or other navigation pages. Advertising is bought by Google, not by us: an ad
            appearing beside a page is not a recommendation, and we have no relationship with the
            advertiser.
          </p>
        </section>

        <section>
          <h2>Things stored on your device</h2>
          <p>
            Saved plans, shopping-list ticks, household portion settings, quiz progress and your
            analytics choice are stored in your browser&rsquo;s local storage. They stay on that
            device, are not uploaded to an account, and expire after a year. You can remove saved
            plans from the <Link to="/saved-plans">saved plans</Link> page, or clear this
            website&rsquo;s stored data in your browser settings to remove all of it.
          </p>
        </section>

        <section>
          <h2>Things you send us</h2>
          <p>
            If you submit feedback, request a plan by email or join the MealPrep+ waitlist, we
            receive what you typed and the email address you gave, and use it to answer you,
            deliver what you asked for, or fix the page in question. Email is delivered through{' '}
            <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
              Resend
            </a>
            . Please do not send medical details through these forms.
          </p>
        </section>

        <section>
          <h2>Affiliate links</h2>
          <p>
            Some container and accessory links are Amazon UK affiliate links. If you click one,
            Amazon receives standard referral information and applies its own cookies and privacy
            policy from that point on. We record that a click happened, but not who you are. See
            our <Link to="/terms">terms</Link> for how affiliate commission works.
          </p>
        </section>

        <section>
          <h2>Your rights and contact</h2>
          <p>
            You can ask what we hold about you, ask for it to be corrected or deleted, or object to
            processing, by emailing{' '}
            <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>. Because there are no
            accounts and the behaviour log is anonymous, in most cases the practical answer is that
            everything tied to you is already on your own device and clearing site data removes it.
            If you are unhappy with how we have handled a privacy question you can complain to the{' '}
            <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">
              Information Commissioner&rsquo;s Office
            </a>
            .
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
