# United Society Affiliates Website

A modern, responsive website for United Society Affiliates - a nonprofit organization dedicated to improving access to vital information, services, and resources for communities with limited support systems in Syracuse, New York.

## Features

- **Fully Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, professional design with smooth animations and transitions
- **Mobile-First Approach**: Optimized for mobile viewing with a collapsible navigation menu
- **Accessibility**: Semantic HTML and ARIA labels for better accessibility
- **Fast Loading**: Optimized CSS and minimal dependencies
- **Easy to Customize**: Well-organized code with CSS variables for quick theme changes

## File Structure

```
united-society-affiliates/
├── index.html          # Main HTML file
├── styles.css          # All styling and responsive design
├── script.js           # Interactive functionality
└── README.md           # This file
```

## Quick Start

### Option 1: Simple Web Hosting

1. Upload all files to your web hosting provider via FTP or hosting control panel
2. Ensure `index.html` is in the root directory
3. Your site will be accessible at your domain

### Option 2: Local Testing

1. Open `index.html` in any modern web browser
2. All functionality will work locally

## Customization Guide

### Changing Colors

Edit the CSS variables in `styles.css` (lines 2-14):

```css
:root {
    --primary-color: #2563eb;      /* Main brand color */
    --primary-dark: #1e40af;       /* Darker shade for hover states */
    --secondary-color: #059669;    /* Accent color */
    --text-dark: #1f2937;          /* Main text color */
    --text-light: #6b7280;         /* Secondary text color */
}
```

### Updating Content

All content can be edited directly in `index.html`. Main sections include:

- **Hero Section**: Main headline and call-to-action buttons
- **Mission Statement**: Organization's core mission
- **Services**: List of programs offered
- **Contact Information**: Update with real contact details

### Adding Images

To add images:

1. Create an `images` folder in the same directory as index.html
2. Add your images to this folder
3. Update the HTML to reference images:
   ```html
   <img src="images/your-image.jpg" alt="Description">
   ```

## Contact Form Setup

The contact form currently shows an alert message. To make it functional:

1. **Using a Form Service** (Recommended for beginners):
   - Sign up for services like Formspree, Netlify Forms, or Basin
   - Follow their integration instructions
   - Replace the form handling code in `script.js`

2. **Using Your Own Backend**:
   - Set up a server-side script (PHP, Node.js, Python, etc.)
   - Update the form submission code in `script.js` (lines 84-104)
   - Configure email sending on your server

## WordPress Migration Guide

When you're ready to move to WordPress:

### Recommended Approach

1. **Choose a Page Builder**: Use Elementor, Beaver Builder, or Gutenberg blocks
2. **Select a Theme**: Pick a lightweight, customizable theme (e.g., Astra, GeneratePress, OceanWP)
3. **Content Migration**:
   - Copy content section by section from HTML to WordPress pages
   - Use custom CSS to match the current design
   - Recreate sections using page builder blocks

### Plugin Recommendations

- **Contact Form**: WPForms or Contact Form 7
- **SEO**: Yoast SEO or Rank Math
- **Performance**: WP Rocket or W3 Total Cache
- **Security**: Wordfence Security

### Preserve Design Elements

1. Copy the CSS from `styles.css` to **Appearance > Customize > Additional CSS**
2. Use the same color scheme (reference CSS variables)
3. Match typography using Google Fonts (already using Inter font)
4. Recreate layouts using page builder grid systems

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

1. **Optimize Images**: Use WebP format and compress images before uploading
2. **Enable Caching**: Configure your hosting to enable browser caching
3. **Use a CDN**: Consider Cloudflare or similar for faster global delivery
4. **Minify Files**: Use tools to minify CSS and JS for production

## Updating Contact Information

Update these sections in `index.html`:

1. **Contact Section** (line ~440):
   - Replace placeholder phone number
   - Update email address if different
   - Add specific office address if available

2. **Footer** (line ~490):
   - Update contact information
   - Add social media links if desired

## Adding Social Media Links

To add social media icons to the footer:

1. Choose an icon library (e.g., Font Awesome)
2. Add the icon library to the `<head>` of index.html
3. Add icon links in the footer section
4. Style them in styles.css

## Security Best Practices

- Keep all software and hosting environment updated
- Use HTTPS (SSL certificate) - most hosts provide this free
- Implement CAPTCHA on contact form to prevent spam
- Regular backups of your website files

## Support and Customization

For additional customization or technical support:
- Review HTML/CSS/JS documentation online
- Consider hiring a web developer for complex changes
- Many hosting providers offer website support services

## License

This website is created for United Society Affiliates. All content and branding belong to the organization.

## Technical Notes

- Built with vanilla HTML5, CSS3, and JavaScript
- No framework dependencies for maximum compatibility
- Uses modern CSS Grid and Flexbox for layouts
- Follows web accessibility guidelines (WCAG)
- Mobile-first responsive design approach

---

**Version**: 1.0  
**Last Updated**: February 2024  
**Built for**: United Society Affiliates, Syracuse, NY
