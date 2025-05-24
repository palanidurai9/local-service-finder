Local Service Finder
A static website for finding local service providers (e.g., plumbers, tutors, electricians) with search, filtering, geolocation, and ratings features.
Features

Search & Filter: Search by keyword or category, filter by location.
Geolocation: Sort services by proximity using browser geolocation.
Favorites & Ratings: Save favorite services and rate them using localStorage.
Dark Mode: Toggle between light and dark themes.
PWA Support: Offline access via Service Worker.
Responsive Design: Mobile-friendly with a grid layout.
Form Submissions: Submit new services via Google Forms (or submit.html with Google Apps Script).

Project Structure
/local-service-finder/
│
├── index.html              # Main page
├── submit.html             # Service submission form
├── 404.html                # Custom error page
├── manifest.json           # PWA configuration
├── robots.txt              # SEO configuration
├── favicon.ico             # Browser icon
│
├── assets/
│   ├── css/
│   │   ├── main.css        # Main styles
│   │   └── dark-mode.css   # Dark theme
│   ├── js/
│   │   ├── app.js          # Main application logic
│   │   └── sw.js           # Service Worker
│   └── images/
│       ├── logo.svg
│       ├── placeholder.jpg
│       └── icons/
│           ├── icon-192.png
│           └── icon-512.png
│
├── data/
│   └── services.json       # Sample service data
│
└── README.md               # Deployment instructions

Setup Instructions

Clone the Repository:
git clone https://github.com/yourusername/local-service-finder.git
cd local-service-finder


Set Up Google Forms:

Create a Google Form with fields: Name, Category, Location, Phone, Description, Hours, Services.
Get the form's shareable link and update index.html (replace https://forms.gle/your-google-form-id).
Alternatively, use submit.html with a Google Apps Script:
Deploy a Google Apps Script to handle form submissions to Google Sheets.
Update the action URL in submit.html with your script's URL.




Update services.json:

Export Google Form responses as CSV from Google Sheets.
Convert to JSON and update data/services.json in the repository.
Add lat and lng for geolocation support (use a geocoding API or manual lookup).


Deploy to GitHub Pages:

Push the repository to GitHub.
Go to Settings > Pages, select the main branch, and set the root folder to /.
Access the site at https://yourusername.github.io/local-service-finder.


Alternative Deployment (Netlify):

Drag and drop the project folder into Netlify's dashboard or link the GitHub repo.
Set build command to echo "No build required" and publish directory to ..



Dependencies

Font Awesome: For icons (loaded via CDN).
No build tools required: Pure HTML, CSS, and Vanilla JavaScript.

Optional Monetization

Google AdSense: Add ad code to index.html.
Featured Listings: Add "featured": true to services.json and style in main.css.
Affiliate Links: Add a section in index.html for recommended tools.

Notes

Replace placeholder image paths (logo.svg, placeholder.jpg, icon-192.png, icon-512.png, favicon.ico) with actual assets.
Update social and legal links in index.html and 404.html.
Create a sitemap.xml and update the robots.txt sitemap URL.
Test PWA functionality by installing the app on a mobile device.

License
MIT License
