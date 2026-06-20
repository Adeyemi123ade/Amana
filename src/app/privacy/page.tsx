import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Amana' }

const SECTIONS = [
  {
    title: 'Introduction',
    body: `Welcome to Amana.

Your privacy matters to us. This Privacy Policy explains how we collect, use, store, and protect your information when you use the Amana platform.

Amana is designed to help business owners manage invoices, customers, appointments, payments, and related business activities from a single dashboard.

By creating an account or using Amana, you agree to the practices described in this Privacy Policy. If you do not agree with this policy, you should discontinue use of the platform.

If you have questions at any time, you can reach us at admin@amana.app.`,
  },
  {
    title: '1. Information We Collect',
    body: `We only collect information that is necessary to provide our services. This falls into several categories.

Account Information
When you create an account, we collect your full name, email address, phone number, country, and a securely stored password. This information is used to identify you and give you access to your account.

Business Information
When you complete your business setup, we collect your business name, business address, business phone number, business email, and any other business details you choose to provide including logos and branding assets.

Customer Information
As part of normal business operations, you may store customer records inside Amana. This may include customer names, contact information, notes, appointment history, and invoice records. You remain responsible for collecting and managing this information appropriately within your business.

Invoice Information
When you create invoices through Amana, we store invoice numbers, amounts, dates, due dates, line item descriptions, payment status, and customer references.

Appointment Information
When you create or manage appointments, we store appointment dates, times, locations, notes, and booking information.

Payment Records
Amana may store payment-related records such as payment status, transaction references, payment dates, and invoice payment activity. Amana does not store card numbers or sensitive financial credentials — these are handled by trusted third-party payment processors.

Usage and Technical Information
We may collect basic technical information such as browser type, device type, and general usage patterns. This helps us improve the platform and fix issues. We do not use this information to track you across other websites.

Support and Feedback Information
When you contact us for support, report a bug, or submit feedback, we may collect your name, email address, and the content of your message.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information only for purposes that are directly related to providing and improving Amana.

Specifically, we use information to:

— Create and manage your account
— Verify your email address during registration
— Allow you to create, manage, and send invoices
— Help you manage your customers, appointments, and payments
— Display your business information on invoices and your public booking page
— Personalise your dashboard experience including your selected theme
— Improve platform performance and fix bugs
— Respond to your support requests and inquiries
— Detect and prevent misuse or abuse of the platform
— Maintain platform security
— Comply with legal obligations where required

We do not use your information for advertising purposes. We do not sell your information. We do not share your information with advertisers.`,
  },
  {
    title: '3. Profile Images and Business Assets',
    body: `Users may upload profile images, business logos, and branding assets. These materials are stored securely and used to personalise your experience within Amana — for example, your business logo may appear on invoices you send to customers.

Ownership of all uploaded content remains entirely with you. Amana does not claim any ownership rights over content you upload.

You can update or remove your profile image at any time from the account menu in the top-right corner of your dashboard. You can update your business logo from Settings → Business Profile.`,
  },
  {
    title: '4. Customer Information You Store',
    body: `Amana allows you to store information about your customers as part of managing your business operations.

You are responsible for ensuring that you have a valid and legitimate business reason for collecting, storing, and using information about your customers.

Amana does not claim ownership of customer records you store on the platform. We do not use your customer information for any purpose other than displaying it back to you within your account.

You should not store sensitive information about customers that is not necessary for your business operations.`,
  },
  {
    title: '5. Payment Information',
    body: `Amana helps you track payment activity related to your invoices. Where payment integrations are active, payment processing is handled by trusted third-party payment providers such as Paystack.

Amana stores references to payment transactions, payment statuses, and related dates for your records. We do not store card numbers, bank account details, or other sensitive financial credentials.

Amana does not guarantee payment collection. You remain responsible for verifying payments through your payment provider and maintaining your own financial records.`,
  },
  {
    title: '6. Data Storage and Security',
    body: `Your data is stored using Supabase, a secure PostgreSQL-based database platform. Data is protected using the following measures:

— Encryption of data in transit using HTTPS and TLS
— Encryption of data at rest
— Row-level security ensuring each account can only access its own data
— Access controls limiting data access to authorised services
— Regular security monitoring and updates

While we take reasonable steps to protect your information, no online service can guarantee absolute security. You are responsible for protecting your login credentials, using a strong password, and logging out from shared devices.

If you believe your account has been compromised, please contact us immediately at admin@amana.app.`,
  },
  {
    title: '7. Sharing of Information',
    body: `We do not sell your information. We do not rent your information. We do not trade your information to third parties for commercial purposes.

Information may only be shared in the following circumstances:

— With trusted third-party service providers who help us operate the platform, such as hosting providers, email delivery services, and payment processors. These providers may only use your information to perform their specific service.
— Where required by law, court order, or regulatory authority.
— To protect the security, integrity, or rights of the platform or its users.

Any third-party service providers we work with are held to appropriate data protection standards.`,
  },
  {
    title: '8. Third-Party Services',
    body: `Amana relies on a number of third-party services to operate. These services may process some of your information in order to provide their functionality.

Current third-party services include:

— Supabase — database hosting, authentication, and file storage
— Paystack — payment processing for invoice payments
— Resend — transactional email delivery for verification emails and notifications
— Meta WhatsApp Cloud API — WhatsApp message delivery where configured

Each of these providers operates under their own privacy policies and data protection standards. We share only the minimum information necessary for each service to function.`,
  },
  {
    title: '9. Cookies and Session Data',
    body: `Amana uses cookies and browser session storage to maintain your login session and remember your preferences such as your selected dashboard theme.

Session cookies expire when you close your browser unless you select "Remember me" during sign-in. We do not use cookies for advertising or cross-site tracking.

You can manage cookies through your browser settings, but disabling certain cookies may affect your ability to use the platform.`,
  },
  {
    title: '10. Data Retention',
    body: `We retain your information for as long as your account remains active and for a reasonable period afterwards to allow for account recovery and to meet legal or operational requirements.

If you delete your account, we will take reasonable steps to remove or anonymise your personal information within 30 days, subject to requirements for fraud prevention, security investigations, or legal obligations.

Invoice and payment records may be retained for up to 7 years to comply with standard financial record-keeping requirements.`,
  },
  {
    title: '11. Account Deletion',
    body: `You may request deletion of your account at any time from Settings → Account.

Upon account deletion, we will permanently remove your personal information, business profile, customer records, invoices, and appointments within 30 days.

Please note that some data may be retained in encrypted backup archives for up to 90 days before permanent deletion. We cannot recover deleted account data after permanent deletion is complete.

To request account deletion or raise a deletion query, contact us at admin@amana.app.`,
  },
  {
    title: '12. Your Rights',
    body: `You have the following rights regarding your information:

Access — You can view your personal information within your account settings at any time.

Correction — You can update your personal information from Settings → Profile or Settings → Business Profile.

Deletion — You can request deletion of your account and associated data.

Objection — You can contact us to object to specific uses of your data.

Portability — You can export your invoice and customer data from within your account.

Depending on your location, additional rights may apply under applicable privacy regulations including GDPR, Nigeria's NDPA, or other regional laws. We will make reasonable efforts to respond to legitimate requests within a reasonable timeframe.`,
  },
  {
    title: '13. Children\'s Privacy',
    body: `Amana is not intended for use by persons under the age of 18. We do not knowingly collect personal information from children.

If you believe a minor has created an account on Amana, please contact us at admin@amana.app and we will take prompt steps to remove that information.`,
  },
  {
    title: '14. International Data Transfers',
    body: `Your data may be processed and stored in data centres located outside your country of residence. We ensure that appropriate safeguards are in place for international data transfers in accordance with applicable privacy laws.

By using Amana, you acknowledge that your information may be transferred to countries that may have different data protection laws than your own. We take steps to ensure your information remains protected regardless of where it is processed.`,
  },
  {
    title: '15. Changes to This Privacy Policy',
    body: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements.

When significant changes are made, we will notify you by email or through a notice on the platform. Your continued use of Amana after the effective date of any changes constitutes your acceptance of the updated policy.

We encourage you to review this policy periodically. The date at the top of this page indicates when it was last updated.`,
  },
  {
    title: '16. Contact Us',
    body: `If you have questions about this Privacy Policy, concerns about how we handle your data, or requests to exercise your privacy rights, please contact us:

Email: admin@amana.app

We aim to respond to all privacy-related enquiries within 5 business days.

Thank you for trusting Amana with your business operations.`,
  },
]

export default function PrivacyPage() {
  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",background:'#F9FAFB',minHeight:'100vh'}}>
      {/* Header */}
      <header style={{background:'white',borderBottom:'1px solid #E5E7EB',padding:'0 24px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:32,height:32,background:'#7C3AED',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span style={{fontWeight:800,fontSize:16,color:'#111827'}}>Amana</span>
        </Link>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <Link href="/terms" style={{fontSize:13,color:'#6B7280',textDecoration:'none'}}>Terms</Link>
          <Link href="/sign-in" style={{fontSize:13,color:'#6B7280',textDecoration:'none'}}>Sign in</Link>
          <Link href="/sign-up" style={{fontSize:13,fontWeight:600,color:'white',background:'#7C3AED',padding:'7px 14px',borderRadius:8,textDecoration:'none'}}>Get Started</Link>
        </div>
      </header>

      <div style={{maxWidth:760,margin:'0 auto',padding:'48px 24px 80px'}}>
        {/* Hero */}
        <div style={{marginBottom:48}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'#EDE9FE',borderRadius:20,padding:'5px 14px',marginBottom:16}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{fontSize:12,fontWeight:600,color:'#7C3AED'}}>Your privacy is protected</span>
          </div>
          <h1 style={{fontSize:36,fontWeight:900,color:'#111827',marginBottom:10,letterSpacing:-0.5}}>Privacy Policy</h1>
          <p style={{fontSize:14,color:'#9CA3AF',marginBottom:12}}>Last updated: {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
          <p style={{fontSize:16,color:'#6B7280',lineHeight:1.8,maxWidth:620}}>
            This policy explains what information Amana collects, how it is used, and the rights you have over your data. We are committed to being transparent about our data practices.
          </p>
        </div>

        {/* Quick summary box */}
        <div style={{background:'#F5F3FF',border:'1px solid #DDD6FE',borderRadius:14,padding:'20px 24px',marginBottom:40}}>
          <p style={{fontSize:13,fontWeight:700,color:'#7C3AED',marginBottom:10,textTransform:'uppercase',letterSpacing:0.5}}>Quick Summary</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10}}>
            {[
              {icon:'🚫',text:'We never sell your data'},
              {icon:'🔒',text:'Data encrypted at rest and in transit'},
              {icon:'👤',text:'You own your content and customer records'},
              {icon:'📧',text:'Contact us anytime: admin@amana.app'},
            ].map(item => (
              <div key={item.text} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#374151'}}>
                <span>{item.icon}</span>{item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{display:'flex',flexDirection:'column',gap:0}}>
          {SECTIONS.map((s, i) => (
            <div key={s.title} style={{borderBottom:'1px solid #E5E7EB',paddingBottom:28,marginBottom:28}}>
              <h2 style={{fontSize:18,fontWeight:700,color:'#111827',marginBottom:12}}>{s.title}</h2>
              <div style={{fontSize:15,color:'#4B5563',lineHeight:1.85,whiteSpace:'pre-line'}}>{s.body}</div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div style={{background:'#111827',borderRadius:16,padding:'28px 32px',textAlign:'center',marginTop:16}}>
          <p style={{fontSize:16,fontWeight:600,color:'white',marginBottom:6}}>Questions about your privacy?</p>
          <p style={{fontSize:14,color:'#9CA3AF',marginBottom:16}}>We respond to all privacy enquiries within 5 business days.</p>
          <a href="mailto:admin@amana.app" style={{display:'inline-block',background:'#7C3AED',color:'white',padding:'10px 24px',borderRadius:8,fontSize:14,fontWeight:600,textDecoration:'none'}}>
            admin@amana.app
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer style={{background:'#111827',padding:'24px',textAlign:'center'}}>
        <div style={{display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap',marginBottom:12}}>
          <Link href="/" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Home</Link>
          <Link href="/terms" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Terms of Service</Link>
          <Link href="/sign-up" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Sign Up</Link>
          <a href="mailto:admin@amana.app" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Contact</a>
        </div>
        <p style={{fontSize:12,color:'#6B7280'}}>© {new Date().getFullYear()} Amana. All rights reserved.</p>
      </footer>
    </div>
  )
}
