POISE CLASSES — FINAL INTEGRATED WEBSITE SYSTEM

PUBLIC SITE
- One integrated POISE CLASSES website
- Classic navy/gold/white branding
- Professional full-width hero banner without the artificial-looking student collage
- About, Courses, Why Us, Faculty, Results/Progress and Contact sections
- IIT/JEE, NEET and Foundation cards are clickable and open detailed program information
- Faculty cards are clickable and open detailed teaching approach
- Admission Enquiry opens all three contact numbers
- Online Registration opens only when the registration button is pressed
- Full address: Semariyawa, Sant Kabir Nagar (Basti Region), Uttar Pradesh – 272126, India
- Contact: 9129187762, 6394814630, 7678146410

REGISTRATION + PAYMENT
- Online registration is stored on the server with exact date/time and unique application ID
- Course, class, mobile, email, fee amount and UTR are recorded
- PhonePe/UPI QR included
- UPI ID: 7678146410@kotakbank
- Optional payment screenshot upload
- Manual payment verification: Pending Verification / Verified / Rejected
- Admission status: New / Confirmed / Rejected

ADMIN
- /admin.html
- Login + dashboard
- Search and status filters
- New registration count
- Exact registration date/time
- Payment verification and admission confirmation
- Internal admin notes
- Payment screenshot view
- CSV export/backup
- Browser notification + sound when a new registration arrives while the dashboard is open and notifications are enabled

SECURITY
- Set ADMIN_USER and ADMIN_PASS environment variables before going live.
- Never share UPI PIN, OTP, bank password, card PIN or secret banking credentials.
- Keep data/ persistent on the hosting server so registrations survive restarts.

RUN LOCALLY
1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run: npm start
4. Open: http://localhost:3000
5. Admin: http://localhost:3000/admin.html

DEFAULT LOCAL LOGIN
Username: admin
Password: POISE@2026
CHANGE THIS BEFORE PUBLICATION.

LIVE DEPLOYMENT
1. Buy/own a domain such as poiseclasses.in (availability must be checked before purchase).
2. Use Node.js-capable hosting with persistent storage.
3. Upload this folder and run npm start (or use the host's Node start command).
4. Point the domain DNS to the host.
5. Enable HTTPS/SSL.
6. Set ADMIN_USER and ADMIN_PASS environment variables.
7. Confirm the public homepage and registration API work.
8. Add the final domain to Google Search Console.
9. Verify ownership.
10. Submit https://YOUR-DOMAIN/sitemap.xml.
11. Use URL Inspection and request indexing for the homepage.

GOOGLE NOTE
Google Search indexing is free, but Google controls crawling/indexing timing and does not guarantee immediate inclusion. The site contains a sitemap, robots.txt, canonical URL and structured data to make discovery easier. Replace the example domain in index.html, sitemap.xml and robots.txt with the actual purchased domain before deployment.

NOTIFICATIONS
The included dashboard provides live browser notifications while it is open. Automatic WhatsApp/SMS/email alerts when the dashboard is closed require an external notification provider and credentials. This package deliberately does not contain private API keys or banking credentials.

PAYMENT NOTE
This is UPI/QR + UTR manual verification. It does not automatically verify a bank/UPI payment. A payment gateway can be integrated later.
