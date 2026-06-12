import Link from 'next/link'

export const metadata = { title: 'Terms of Service — Amana' }

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      body: `By creating an account or using the Amana platform ("the Service"), you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use the Service. These terms apply to all users including business owners, team members, and any person accessing the platform.`,
    },
    {
      title: '2. User Eligibility',
      body: `You must be at least 18 years old to create an account on Amana. By registering, you confirm that you are of legal age in your jurisdiction to enter into a binding agreement. If you are registering on behalf of a business entity, you confirm that you have authority to bind that entity to these terms.`,
    },
    {
      title: '3. Account Registration',
      body: `To use Amana, you must create an account by providing accurate, current, and complete information including your full name, email address, phone number, and business details. You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorised access to your account. Amana is not liable for any loss resulting from unauthorised use of your account.`,
    },
    {
      title: '4. User Responsibilities',
      body: `You are solely responsible for all activities conducted through your account. You agree to use the Service only for lawful business purposes. You must not misrepresent your identity, impersonate any person or entity, or provide false information. You are responsible for ensuring your use of Amana complies with all applicable laws and regulations in your country.`,
    },
    {
      title: '5. Business Information Accuracy',
      body: `You agree to provide accurate and truthful business information including your business name, registration details, address, and contact information. Amana uses this information to generate invoices and documents on your behalf. You accept full responsibility for the accuracy of all business information entered into the platform. Amana does not verify the accuracy of business information provided by users.`,
    },
    {
      title: '6. Invoice and Document Usage',
      body: `Amana enables you to create professional invoices, receipts, and business documents. You are solely responsible for the accuracy, legality, and completeness of all documents you create using the platform. Amana does not guarantee that invoices created on the platform meet any specific legal or regulatory requirements in your jurisdiction. You should consult a qualified professional for legal or tax advice regarding your business documents.`,
    },
    {
      title: '7. AI-Generated Content Disclaimer',
      body: `Amana may use artificial intelligence to assist with content generation, suggestions, and document automation. AI-generated content is provided as a convenience tool only. You must review all AI-generated content before use. Amana makes no warranty that AI-generated content is accurate, complete, legally compliant, or suitable for any specific purpose. You accept full responsibility for any AI-generated content you publish, send, or rely upon.`,
    },
    {
      title: '8. Payment Tracking Disclaimer',
      body: `Amana provides tools to track invoice statuses and payment records. Payment status information is dependent on third-party payment processors and may not always reflect real-time accuracy. Amana is not responsible for errors in payment records caused by third-party processor failures, delays, or data discrepancies. You should always verify payment status with your bank or payment processor for critical financial decisions.`,
    },
    {
      title: '9. Appointment and Booking Disclaimer',
      body: `Amana provides appointment scheduling and booking management tools. Amana is not responsible for missed appointments, no-shows, or scheduling conflicts that occur through use of the platform. You are responsible for confirming appointments with your customers independently where required. Amana's automated reminders are provided as a convenience and do not guarantee customer attendance.`,
    },
    {
      title: '10. Data Storage',
      body: `Your data is stored securely using Supabase, a PostgreSQL-based cloud database provider. Data is protected using row-level security, encrypted connections, and access controls. While we take reasonable measures to protect your data, no internet transmission is completely secure. You acknowledge that data transmission over the internet is done at your own risk. We maintain backups but do not guarantee recovery from all data loss scenarios.`,
    },
    {
      title: '11. Prohibited Use',
      body: `You must not use Amana to: create fraudulent or deceptive invoices; engage in money laundering or financial fraud; send spam or unsolicited communications; distribute malware or malicious code; attempt to gain unauthorised access to other accounts or systems; scrape or harvest data from the platform; violate any applicable law or regulation; harass, threaten, or harm other users.`,
    },
    {
      title: '12. Account Suspension and Termination',
      body: `Amana reserves the right to suspend or terminate your account at any time if we believe you have violated these terms, engaged in fraudulent activity, or used the platform in a way that harms other users or the platform itself. We will provide notice where reasonably possible except where immediate action is required to protect the platform or other users. You may delete your account at any time from the Settings page.`,
    },
    {
      title: '13. Free Access and Future Paid Plans',
      body: `Amana is currently provided free of charge to all users during our early access period. We reserve the right to introduce paid subscription plans in the future. We will provide advance notice of any transition to a paid model. Users who registered during the free period will be given reasonable notice and options before any mandatory payment requirement is introduced. We commit to maintaining a functional free tier for existing users.`,
    },
    {
      title: '14. Subscription and Billing Terms for Future Use',
      body: `If and when paid plans are introduced, billing terms will be clearly disclosed before any payment is required. Subscription fees will be charged on a recurring basis as specified at the time of subscription. You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing period. Amana does not offer refunds for unused portions of paid subscription periods unless required by applicable law.`,
    },
    {
      title: '15. Limitation of Liability',
      body: `To the maximum extent permitted by applicable law, Amana and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages including loss of revenue, loss of profits, loss of data, or business interruption arising from your use of the Service. Our total liability to you for any claims arising from the use of the Service shall not exceed the amount you paid to Amana in the twelve months preceding the claim, or USD 100, whichever is greater.`,
    },
    {
      title: '16. Service Availability',
      body: `We aim to provide continuous access to the Amana platform but do not guarantee uninterrupted availability. The Service may be unavailable due to scheduled maintenance, updates, technical failures, or circumstances beyond our control. We will endeavour to provide advance notice of planned maintenance. Amana is not liable for losses caused by service downtime or unavailability.`,
    },
    {
      title: '17. Changes to Features',
      body: `Amana reserves the right to add, modify, or remove features from the platform at any time. We will notify users of significant changes through in-app notifications or email. Continued use of the platform after changes are made constitutes your acceptance of the updated feature set. We will not remove core invoicing, customer management, or appointment functionality without providing reasonable transition notice.`,
    },
    {
      title: '18. Changes to These Terms',
      body: `We may update these Terms of Service periodically to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes by email or through a prominent notice on the platform. Your continued use of Amana after the effective date of any changes constitutes acceptance of the revised terms. If you do not agree to the updated terms, you must discontinue use of the Service.`,
    },
    {
      title: '19. Governing Law',
      body: `These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which Amana is registered. Any disputes arising from these terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of that jurisdiction. Where consumer protection laws in your country provide stronger rights, those rights shall not be limited by this clause.`,
    },
    {
      title: '20. Contact Information',
      body: `If you have any questions about these Terms of Service, please contact us at: Email: legal@amana.app. We aim to respond to all enquiries within 5 business days. For general support enquiries, please contact support@amana.app.`,
    },
  ]

  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",background:'#F9FAFB',minHeight:'100vh'}}>
      <header style={{background:'white',borderBottom:'1px solid #E5E7EB',padding:'0 24px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:30,height:30,background:'#7C3AED',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span style={{fontWeight:800,fontSize:16,color:'#111827'}}>Amana</span>
        </Link>
        <div style={{display:'flex',gap:16}}>
          <Link href="/sign-in" style={{fontSize:14,color:'#6B7280',textDecoration:'none'}}>Sign in</Link>
          <Link href="/sign-up" style={{fontSize:14,color:'#7C3AED',fontWeight:600,textDecoration:'none'}}>Get Started</Link>
        </div>
      </header>

      <div style={{maxWidth:800,margin:'0 auto',padding:'48px 24px'}}>
        <div style={{marginBottom:40}}>
          <h1 style={{fontSize:32,fontWeight:800,color:'#111827',marginBottom:8}}>Terms of Service</h1>
          <p style={{fontSize:14,color:'#9CA3AF'}}>Last updated: {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
          <p style={{fontSize:15,color:'#6B7280',marginTop:12,lineHeight:1.7}}>
            Please read these Terms of Service carefully before using Amana. These terms govern your use of our platform and services.
          </p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {sections.map(s => (
            <div key={s.title} style={{background:'white',borderRadius:12,padding:'24px',border:'1px solid #E5E7EB',marginBottom:8}}>
              <h2 style={{fontSize:16,fontWeight:700,color:'#111827',marginBottom:10}}>{s.title}</h2>
              <p style={{fontSize:14,color:'#6B7280',lineHeight:1.75}}>{s.body}</p>
            </div>
          ))}
        </div>

        <div style={{marginTop:40,padding:'24px',background:'#EDE9FE',borderRadius:12,textAlign:'center'}}>
          <p style={{fontSize:14,color:'#374151',marginBottom:12}}>Have questions about our terms?</p>
          <a href="mailto:legal@amana.app" style={{color:'#7C3AED',fontWeight:600,textDecoration:'none'}}>legal@amana.app</a>
        </div>
      </div>

      <footer style={{background:'#111827',padding:'24px',textAlign:'center',marginTop:40}}>
        <div style={{display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Home</Link>
          <Link href="/privacy" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Privacy Policy</Link>
          <Link href="/sign-up" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Sign Up</Link>
          <a href="mailto:support@amana.app" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Contact</a>
        </div>
        <p style={{fontSize:12,color:'#6B7280',marginTop:12}}>© {new Date().getFullYear()} Amana. All rights reserved.</p>
      </footer>
    </div>
  )
}
