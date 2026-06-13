import Link from 'next/link'

export const metadata = { title: 'Terms & Conditions — Amana' }

const SECTIONS = [
  {
    title: 'Introduction',
    body: `Welcome to Amana.

These Terms & Conditions govern your access to and use of the Amana platform. Please read them carefully before creating an account or using any part of the service.

By creating an account, accessing, or using Amana, you agree to be bound by these Terms & Conditions. If you do not agree with these terms, you should not use the platform.

If you have questions at any time, you can contact us at teshoade2020@gmail.com.`,
  },
  {
    title: '1. About Amana',
    body: `Amana is a business management platform designed to help business owners manage invoices, customers, appointments, payments, records, and other business-related activities from a single dashboard.

Our goal is to provide simple, reliable, and effective tools that help businesses of all sizes operate more efficiently, get paid faster, and stay organised.

Amana is currently offered free of charge to all early users. Paid plans may be introduced in the future with appropriate notice.`,
  },
  {
    title: '2. Eligibility',
    body: `To use Amana, you must:

— Be at least 18 years old or of legal age in your jurisdiction to enter into a binding agreement.
— Be legally capable of entering into a binding agreement.
— Provide accurate and complete registration information.
— Use the platform in compliance with all applicable laws and regulations in your country.

By creating an account, you confirm that the information you provide is accurate and that you meet the eligibility requirements above.

If you are registering on behalf of a business entity, you confirm that you have the authority to bind that entity to these Terms & Conditions.`,
  },
  {
    title: '3. Account Registration',
    body: `Certain features of Amana require you to create an account.

When creating your account, you agree to:

— Provide accurate, current, and complete registration information.
— Maintain and promptly update your account details to keep them accurate.
— Use an email address that you own and control.
— Keep your login credentials secure and confidential.
— Not share your account with other people.
— Notify us immediately if you become aware of any unauthorised access to your account.

You are responsible for all activities that occur under your account. Amana cannot be held responsible for losses resulting from a user's failure to protect their account credentials.`,
  },
  {
    title: '4. Account Security',
    body: `You are responsible for maintaining the security of your account.

To protect your account, you should:

— Use a strong password that includes uppercase letters, lowercase letters, numbers, and special characters.
— Never share your password with anyone.
— Avoid accessing your account on public or shared devices.
— Log out of your account when using a shared computer or browser.
— Enable email notifications to stay informed of account activity.
— Contact us immediately at teshoade2020@gmail.com if you suspect unauthorised access.

Amana is not responsible for losses arising from your failure to protect your login credentials.`,
  },
  {
    title: '5. Your Responsibilities',
    body: `Amana provides tools that help you manage your business. You remain responsible for how you use those tools.

You are responsible for:

— All information you enter into the platform.
— The invoices you create and send to customers.
— The customer records you maintain.
— The appointments you schedule and manage.
— The business decisions you make using information from the platform.
— Communications you send to customers through or outside the platform.
— Meeting your legal and tax obligations as a business owner.

Before sending invoices, confirming appointments, or making important business decisions based on information in Amana, you should review that information carefully and verify its accuracy.`,
  },
  {
    title: '6. Business Information Accuracy',
    body: `You are responsible for ensuring that all information stored in Amana is accurate, current, and complete.

This includes:

— Your business name, address, and contact details.
— Your customer records and contact information.
— Invoice amounts, dates, and descriptions.
— Appointment details and schedules.

Amana displays the information you enter. We are not responsible for issues, disputes, or losses arising from inaccurate information that you have entered into the platform.

You should review invoices carefully before sending them to customers. Once sent, you are responsible for any corrections or disputes.`,
  },
  {
    title: '7. Customer Information',
    body: `Amana allows you to manage customer records as part of your normal business operations.

You are responsible for ensuring that:

— You have a legitimate business reason for collecting and storing customer information.
— Customer information is accurate and kept up to date.
— You handle customer information in compliance with applicable privacy laws in your country.
— You only store information about customers that is necessary for your business activities.

Amana does not claim ownership of customer records you store on the platform. We process customer information only as necessary to display it back to you within your account.`,
  },
  {
    title: '8. Acceptable Use',
    body: `You agree to use Amana only for lawful, legitimate business purposes.

You must not use Amana for:

— Fraudulent activities of any kind.
— Creating false or misleading invoices.
— Illegal activities or activities that violate applicable laws.
— Sending spam, unsolicited messages, or bulk communications.
— Impersonating any person, business, or organisation.
— Harassing, threatening, or harming other users or third parties.
— Attempting to gain unauthorised access to other accounts or systems.
— Uploading malicious software, viruses, or harmful code.
— Activities that interfere with the normal operation of the platform.
— Activities that harm or disrupt other users of the platform.

Any misuse of the platform may result in immediate restrictions, suspension, or permanent termination of your account.`,
  },
  {
    title: '9. Invoices and Business Records',
    body: `Amana provides tools for creating, managing, and sending invoices and business records.

You remain responsible for:

— Reviewing the accuracy of every invoice before sending it.
— Ensuring invoice amounts, descriptions, and customer details are correct.
— Managing your business records in compliance with applicable laws.
— Maintaining your own copies of important business records.
— Meeting any legal requirements for invoicing and record-keeping in your country.

Amana does not guarantee the accuracy of information entered by users. Invoice content is determined entirely by the information you provide.`,
  },
  {
    title: '10. Payments and Financial Records',
    body: `Amana may help you manage payment-related records, invoice statuses, and payment activity tracking.

However, you should be aware that:

— Amana does not guarantee payment collection from your customers.
— Amana is not responsible for customer payment behaviour or defaults.
— Amana is not responsible for payment disputes between you and your customers.
— Payment processing is handled by trusted third-party payment providers such as Paystack, who operate under their own terms.

You remain responsible for:

— Verifying payment receipt through your bank or payment provider.
— Maintaining your own financial records for tax and accounting purposes.
— Managing payment disputes with customers directly.
— Meeting your tax and financial reporting obligations.

Business decisions should not rely solely on payment status displayed within Amana without independent verification.`,
  },
  {
    title: '11. Appointments and Scheduling',
    body: `Amana provides tools for managing appointments, bookings, and scheduling.

You remain responsible for:

— Confirming appointments with customers directly where required.
— Managing your schedule and availability.
— Communicating changes or cancellations to customers.
— Reviewing booking information for accuracy.

Amana's automated reminders are provided as a convenience feature. Amana is not responsible for missed appointments, scheduling conflicts, customer no-shows, or any losses resulting from appointment-related issues.`,
  },
  {
    title: '12. Service Availability',
    body: `We strive to keep Amana available, reliable, and performing well at all times. However, we cannot guarantee that the platform will be available without interruption at all times.

There may be occasions where:

— Scheduled maintenance requires temporary downtime.
— Software updates are deployed.
— Technical issues require investigation and resolution.
— Third-party service providers experience disruptions outside our control.

We will make reasonable efforts to minimise disruptions and provide advance notice of planned maintenance where possible. Amana is not liable for losses caused by service unavailability or downtime.`,
  },
  {
    title: '13. Feedback and Suggestions',
    body: `We welcome your ideas, feedback, feature requests, bug reports, and suggestions. Your input helps us make Amana better.

By submitting feedback or suggestions, you acknowledge that:

— Amana may review and use your suggestions to improve the platform.
— You are not entitled to compensation for suggestions we choose to implement.
— Submission of feedback does not create any obligation for us to implement any specific feature or change.
— Feedback may be submitted to teshoade2020@gmail.com.`,
  },
  {
    title: '14. Future Features and Changes',
    body: `Amana will continue to grow and evolve over time.

We may:

— Add new features and capabilities.
— Improve existing features.
— Remove features that are no longer relevant or sustainable.
— Update user interface designs and workflows.
— Introduce new services or integrations.

We may make these changes without prior notice where necessary. Where significant changes affect how you use the platform, we will make reasonable efforts to communicate those changes through email or in-app notifications.`,
  },
  {
    title: '15. Future Pricing',
    body: `Amana is currently offered free of charge to all users during our early access period.

As the platform grows, we may introduce paid plans, premium features, or subscription options.

Where pricing changes affect existing users, we will provide reasonable advance notice before any paid requirement takes effect. We are committed to maintaining a functional free tier for existing users.

We will never charge you without giving you clear notice and the opportunity to review the new pricing before it applies to your account.`,
  },
  {
    title: '16. Intellectual Property',
    body: `The Amana platform, software, branding, design, logos, content, and related materials are the intellectual property of Amana unless otherwise stated.

You may not:

— Copy, reproduce, or redistribute platform content without our written permission.
— Use Amana branding, logos, or design elements outside of the platform.
— Attempt to reverse engineer, decompile, or access the source code of the platform.
— Misrepresent ownership or affiliation with Amana.

Your content — invoices, customer records, business information, and uploaded assets — remains your intellectual property. Use of Amana does not transfer ownership of your content to us.`,
  },
  {
    title: '17. Account Suspension and Termination',
    body: `We reserve the right to suspend, restrict, or permanently terminate accounts that:

— Violate these Terms & Conditions.
— Engage in fraudulent or deceptive activities.
— Misuse or abuse the platform or its features.
— Create security risks for other users or the platform.
— Attempt unauthorised access to other accounts or systems.
— Harm or attempt to harm other users.

Where appropriate, we will notify the affected user before taking action and allow an opportunity to respond. However, where immediate action is required to protect the platform or other users, we may act without prior notice.

You may also close your own account at any time from Settings within your dashboard.`,
  },
  {
    title: '18. Limitation of Liability',
    body: `Amana is provided as a business management tool to help you run your operations more efficiently. While we strive to provide a reliable and accurate service, we cannot guarantee that the platform will always operate without interruption, error, or limitation.

To the maximum extent permitted by applicable law, Amana shall not be liable for:

— Business losses, lost revenue, or lost profits.
— Missed opportunities or contracts.
— Customer disputes arising from invoice or appointment-related issues.
— Incorrect or inaccurate information entered by users.
— Missed appointments or scheduling failures.
— Payment disputes between users and their customers.
— Service interruptions caused by circumstances outside our reasonable control.
— Decisions made based solely on information displayed within the platform.

You remain responsible for reviewing information carefully and making business decisions accordingly. Amana is a tool — the judgment and decisions remain yours.`,
  },
  {
    title: '19. Indemnification',
    body: `You agree to be responsible for, and to hold Amana harmless from, any claims, damages, losses, or liabilities arising from:

— Your misuse of the platform.
— Your violation of these Terms & Conditions.
— Your violation of applicable laws or regulations.
— Infringement of third-party rights through your use of the platform.
— Inaccurate information you have entered into the platform that has caused harm to others.`,
  },
  {
    title: '20. Changes to These Terms',
    body: `We may update these Terms & Conditions from time to time to reflect changes in our services, legal requirements, or business practices.

When significant changes are made, we will make reasonable efforts to notify you by email or through a prominent notice on the platform.

Your continued use of Amana after the effective date of any changes constitutes your acceptance of the updated Terms. If you do not agree with updated terms, you should stop using the platform and may close your account.`,
  },
  {
    title: '21. Governing Law',
    body: `These Terms & Conditions shall be governed by and interpreted in accordance with applicable laws and regulations.

Where disputes arise between you and Amana, both parties agree to first attempt to resolve them through good-faith discussion before pursuing formal legal action.

Nothing in these terms limits your rights under mandatory consumer protection laws that apply in your country.`,
  },
  {
    title: '22. Contact Us',
    body: `For support, complaints, feedback, questions, or enquiries regarding these Terms & Conditions, please contact us:

Email: teshoade2020@gmail.com

We aim to respond to all enquiries within 5 business days.

Thank you for choosing Amana. We appreciate the opportunity to support your business.`,
  },
]

export default function TermsPage() {
  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",background:'#F9FAFB',minHeight:'100vh'}}>
      {/* Header */}
      <header style={{background:'white',borderBottom:'1px solid #E5E7EB',padding:'0 24px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:32,height:32,background:'#7C3AED',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7H3zM14 3h7v7h-7z" fill="white"/></svg>
          </div>
          <span style={{fontWeight:800,fontSize:16,color:'#111827'}}>Amana</span>
        </Link>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <Link href="/privacy" style={{fontSize:13,color:'#6B7280',textDecoration:'none'}}>Privacy</Link>
          <Link href="/sign-in" style={{fontSize:13,color:'#6B7280',textDecoration:'none'}}>Sign in</Link>
          <Link href="/sign-up" style={{fontSize:13,fontWeight:600,color:'white',background:'#7C3AED',padding:'7px 14px',borderRadius:8,textDecoration:'none'}}>Get Started</Link>
        </div>
      </header>

      <div style={{maxWidth:760,margin:'0 auto',padding:'48px 24px 80px'}}>
        {/* Hero */}
        <div style={{marginBottom:48}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'#EDE9FE',borderRadius:20,padding:'5px 14px',marginBottom:16}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span style={{fontSize:12,fontWeight:600,color:'#7C3AED'}}>Please read carefully</span>
          </div>
          <h1 style={{fontSize:36,fontWeight:900,color:'#111827',marginBottom:10,letterSpacing:-0.5}}>Terms & Conditions</h1>
          <p style={{fontSize:14,color:'#9CA3AF',marginBottom:12}}>Last updated: {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
          <p style={{fontSize:16,color:'#6B7280',lineHeight:1.8,maxWidth:620}}>
            These Terms & Conditions govern your use of the Amana platform. By creating an account or using our service, you agree to these terms. Please read them fully before proceeding.
          </p>
        </div>

        {/* Key points summary */}
        <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:14,padding:'20px 24px',marginBottom:40}}>
          <p style={{fontSize:13,fontWeight:700,color:'#92400E',marginBottom:10,textTransform:'uppercase',letterSpacing:0.5}}>Key Points</p>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {[
              'You are responsible for the accuracy of information you enter and invoices you send.',
              'Amana is currently free. Paid plans may be introduced with advance notice.',
              'Do not use Amana for fraudulent, illegal, or harmful activities.',
              'We may update these terms — continued use means you accept the updated version.',
              'Contact us at teshoade2020@gmail.com for any questions or support.',
            ].map(point => (
              <div key={point} style={{display:'flex',gap:8,fontSize:14,color:'#78350F',lineHeight:1.6}}>
                <span style={{flexShrink:0,marginTop:2}}>→</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table of contents */}
        <div style={{background:'white',borderRadius:14,border:'1px solid #E5E7EB',padding:'20px 24px',marginBottom:40}}>
          <p style={{fontSize:13,fontWeight:700,color:'#374151',marginBottom:12,textTransform:'uppercase',letterSpacing:0.5}}>Contents</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:4}}>
            {SECTIONS.map(s => (
              <p key={s.title} style={{fontSize:13,color:'#6B7280',padding:'2px 0'}}>{s.title}</p>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{display:'flex',flexDirection:'column',gap:0}}>
          {SECTIONS.map((s) => (
            <div key={s.title} style={{borderBottom:'1px solid #E5E7EB',paddingBottom:28,marginBottom:28}}>
              <h2 style={{fontSize:18,fontWeight:700,color:'#111827',marginBottom:12}}>{s.title}</h2>
              <div style={{fontSize:15,color:'#4B5563',lineHeight:1.85,whiteSpace:'pre-line'}}>{s.body}</div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div style={{background:'#111827',borderRadius:16,padding:'28px 32px',textAlign:'center',marginTop:16}}>
          <p style={{fontSize:16,fontWeight:600,color:'white',marginBottom:6}}>Questions about these terms?</p>
          <p style={{fontSize:14,color:'#9CA3AF',marginBottom:16}}>We respond to all enquiries within 5 business days.</p>
          <a href="mailto:teshoade2020@gmail.com" style={{display:'inline-block',background:'#7C3AED',color:'white',padding:'10px 24px',borderRadius:8,fontSize:14,fontWeight:600,textDecoration:'none'}}>
            teshoade2020@gmail.com
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer style={{background:'#111827',padding:'24px',textAlign:'center'}}>
        <div style={{display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap',marginBottom:12}}>
          <Link href="/" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Home</Link>
          <Link href="/privacy" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Privacy Policy</Link>
          <Link href="/sign-up" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Sign Up</Link>
          <a href="mailto:teshoade2020@gmail.com" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Contact</a>
        </div>
        <p style={{fontSize:12,color:'#6B7280'}}>© {new Date().getFullYear()} Amana. All rights reserved.</p>
      </footer>
    </div>
  )
}
