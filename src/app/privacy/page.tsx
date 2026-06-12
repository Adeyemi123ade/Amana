import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Amana' }

export default function PrivacyPage() {
  const sections = [
    { title: '1. Information We Collect', body: 'We collect: Personal information you provide during registration (name, email, phone number, country). Business information you enter (business name, address, type, website). Customer information you add to your account. Invoice data including amounts, items, and due dates. Appointment and booking details. Payment records and transaction history. Profile images you upload. Device and browser information for security purposes. Usage data to improve our platform.' },
    { title: '2. How We Use Your Information', body: 'We use your information to: Provide and operate the Amana platform. Generate invoices and business documents on your behalf. Send automated reminders and notifications you have configured. Process and track payments through integrated payment processors. Maintain your customer and appointment records. Generate business reports and analytics for your account. Improve platform features and user experience. Send service-related communications including security alerts. Comply with legal obligations.' },
    { title: '3. Business Information', body: 'Your business name, address, logo, and contact details are used to personalise invoices, booking pages, and documents generated through Amana. This information is visible to your customers when you send documents. You are responsible for ensuring your business information is accurate and lawful to use.' },
    { title: '4. Customer Information', body: 'Customer records you create in Amana — including names, phone numbers, and email addresses — are stored in your private account and protected by row-level database security. Amana staff do not access your customer data for commercial purposes. Customer data is used only to provide the features you have requested, such as sending reminders or generating invoices.' },
    { title: '5. Invoice and Payment Records', body: 'Invoice data and payment records are stored securely in your account. This data is used to generate reports, track outstanding balances, and provide your business with accurate financial records. Amana does not share your invoice or payment data with third parties except payment processors required to process transactions.' },
    { title: '6. Appointment and Booking Information', body: 'Appointment records, booking details, and scheduling information are stored privately in your account. This data is used to display your calendar, send reminders, and manage your booking page. Customer-facing booking pages display only the information you choose to make public.' },
    { title: '7. Profile Images', body: 'Profile images you upload are stored in a secure cloud storage bucket provided by Supabase. Images are accessible only through your account and are used to personalise your dashboard experience. You can remove your profile image at any time from the account menu.' },
    { title: '8. Uploaded Documents', body: 'Identity verification documents uploaded during the KYC process (national ID, passport, driver licence, and selfie images) are stored in a private, restricted storage bucket. These documents are accessible only to authorised Amana staff for verification purposes and are not shared with third parties.' },
    { title: '9. Cookies and Session Data', body: 'Amana uses cookies and browser session storage to maintain your login session, remember your preferences, and ensure the security of your account. Session cookies expire when you close your browser unless you select "Remember me." We do not use cookies for advertising tracking or share cookie data with advertisers.' },
    { title: '10. How Data Is Stored', body: 'All data is stored using Supabase, a secure PostgreSQL database platform. Data is stored on servers protected by: encryption at rest using AES-256, encrypted connections over HTTPS using TLS, row-level security ensuring each account can only access its own data, regular automated backups, and access controls limiting data access to authorised services and personnel.' },
    { title: '11. Data Security', body: 'We implement industry-standard security measures to protect your data including HTTPS encryption for all data in transit, database encryption at rest, row-level security policies, regular security reviews, two-factor authentication support, and secure session management. Despite our best efforts, no method of internet transmission is 100% secure. We encourage you to use a strong password and keep your account credentials confidential.' },
    { title: '12. Third-Party Services', body: 'Amana integrates with the following third-party services: Supabase for database and authentication services. Paystack for payment processing. Resend for transactional email delivery. Meta WhatsApp Cloud API for WhatsApp notifications (where configured). These services operate under their own privacy policies. We share only the minimum data necessary for each service to function. We do not sell your data to any third party.' },
    { title: '13. Your Rights', body: 'You have the following rights regarding your personal data: Access: You can view your personal information in your account settings. Correction: You can update your personal information at any time. Deletion: You can request deletion of your account and associated data. Export: You can export your invoice and customer data from your account. Objection: You can object to specific uses of your data by contacting us. Depending on your location, additional rights may apply under GDPR, NDPR, CCPA, or other applicable privacy regulations.' },
    { title: '14. Data Retention', body: 'We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days except where retention is required for legal compliance, dispute resolution, or fraud prevention purposes. Invoice and payment records may be retained for up to 7 years to comply with financial record-keeping requirements. Anonymised and aggregated data may be retained indefinitely for analytics purposes.' },
    { title: '15. Account Deletion', body: 'You may delete your account at any time from Settings → Account. Upon deletion, we will permanently remove your personal information, business profile, customer records, invoices, and appointments within 30 days. Some data may be retained in encrypted backup archives for up to 90 days before permanent deletion. We cannot recover deleted account data after permanent deletion.' },
    { title: '16. Children\'s Privacy', body: 'Amana is not intended for use by persons under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a person under 18, we will take steps to delete that information promptly. If you believe a minor has created an account, please contact us at privacy@amana.app.' },
    { title: '17. International Data Transfers', body: 'Your data may be processed and stored in data centres located outside your country of residence. We ensure appropriate safeguards are in place for international transfers in accordance with applicable privacy laws. By using Amana, you consent to the transfer of your information to countries that may have different data protection laws than your own.' },
    { title: '18. Changes to This Privacy Policy', body: 'We may update this Privacy Policy to reflect changes in our data practices, technology, or legal requirements. We will notify you of significant changes by email or through a notice on the platform. Your continued use of Amana after the effective date of any changes constitutes your acceptance of the updated policy.' },
    { title: '19. Contact Information', body: 'If you have questions about this Privacy Policy, wish to exercise your data rights, or have concerns about how we handle your data, please contact us: Email: privacy@amana.app. General Support: support@amana.app. We aim to respond to all privacy enquiries within 5 business days.' },
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
          <h1 style={{fontSize:32,fontWeight:800,color:'#111827',marginBottom:8}}>Privacy Policy</h1>
          <p style={{fontSize:14,color:'#9CA3AF'}}>Last updated: {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
          <p style={{fontSize:15,color:'#6B7280',marginTop:12,lineHeight:1.7}}>
            Your privacy is important to us. This policy explains exactly what data Amana collects, how we use it, and your rights regarding that data.
          </p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {sections.map(s => (
            <div key={s.title} style={{background:'white',borderRadius:12,padding:'24px',border:'1px solid #E5E7EB'}}>
              <h2 style={{fontSize:16,fontWeight:700,color:'#111827',marginBottom:10}}>{s.title}</h2>
              <p style={{fontSize:14,color:'#6B7280',lineHeight:1.75}}>{s.body}</p>
            </div>
          ))}
        </div>

        <div style={{marginTop:40,padding:'24px',background:'#EDE9FE',borderRadius:12,textAlign:'center'}}>
          <p style={{fontSize:14,color:'#374151',marginBottom:12}}>Questions about your privacy?</p>
          <a href="mailto:privacy@amana.app" style={{color:'#7C3AED',fontWeight:600,textDecoration:'none'}}>privacy@amana.app</a>
        </div>
      </div>

      <footer style={{background:'#111827',padding:'24px',textAlign:'center',marginTop:40}}>
        <div style={{display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Home</Link>
          <Link href="/terms" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Terms of Service</Link>
          <Link href="/sign-up" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Sign Up</Link>
          <a href="mailto:support@amana.app" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>Contact</a>
        </div>
        <p style={{fontSize:12,color:'#6B7280',marginTop:12}}>© {new Date().getFullYear()} Amana. All rights reserved.</p>
      </footer>
    </div>
  )
}
