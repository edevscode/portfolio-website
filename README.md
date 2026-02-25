# Portfolio Website with Dynamic Seasonal Theming

A full-featured portfolio website built with Django REST Framework and React, featuring separate admin and public portals with automatic seasonal theme switching.

## Features

✨ **Dual Portal System**
- Admin panel for portfolio management
- Public viewer for portfolio display
- Secure authentication

🎨 **Dynamic Seasonal Theming**
- Automatic seasonal theme detection (Spring, Summer, Autumn, Winter)
- Holiday themes (New Year, Valentine's Day, Easter, Halloween, Thanksgiving, Christmas, Chinese New Year)
- Customizable colors for each theme
- Manual theme activation

📱 **Responsive Design**
- Mobile-first design
- Minimalist and aesthetic UI
- Smooth animations and transitions

📊 **Content Management**
- Manage Projects with images, technologies, and links
- Manage Skills with proficiency levels
- Manage Experience timeline
- Manage About information
- Social links management
- Contact form submission

🗄️ **MySQL Database**
- Complete database schema for portfolio management
- Django ORM for easy data manipulation

## Project Structure

```
portfolio-website/
├── backend/
│   ├── config/           # Django configuration
│   ├── api/              # API app
│   │   ├── models.py     # Database models
│   │   ├── views.py      # API views
│   │   ├── serializers.py# DRF serializers
│   │   ├── urls.py       # API routes
│   │   └── admin.py      # Django admin config
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── admin/        # Admin portal
    │   │   └── portfolio/    # Portfolio viewer
    │   ├── services/         # API service
    │   ├── context/          # Theme context
    │   ├── App.jsx
    │   └── index.css
    ├── vite.config.js
    └── package.json
```

## Setup Instructions

### Backend Setup

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Create MySQL database:**
```bash
# Create database in MySQL
CREATE DATABASE portfolio_db;
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Update Django settings** (backend/config/settings.py):
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'portfolio_db',
        'USER': 'portfolio_user',  # Update with your MySQL user
        'PASSWORD': 'password',     # Update with your password
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

4. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create superuser for admin:**
```bash
python manage.py createsuperuser
# Follow the prompts to create admin user
```

6. **Create default themes:**
```bash
python manage.py shell
```

Then in the Django shell:
```python
from api.models import Theme

themes_data = [
    {'season': 'default', 'name': 'Default', 'primary_color': '#000000', 'secondary_color': '#ffffff', 'accent_color': '#0066cc', 'background_color': '#f5f5f5', 'text_color': '#333333'},
    {'season': 'spring', 'name': 'Spring', 'primary_color': '#2d5016', 'secondary_color': '#ffffff', 'accent_color': '#4caf50', 'background_color': '#f1f8e9', 'text_color': '#333333'},
    {'season': 'summer', 'name': 'Summer', 'primary_color': '#005a9c', 'secondary_color': '#ffffff', 'accent_color': '#ff9800', 'background_color': '#fff3e0', 'text_color': '#333333'},
    {'season': 'autumn', 'name': 'Autumn', 'primary_color': '#5d4037', 'secondary_color': '#ffffff', 'accent_color': '#ff6f00', 'background_color': '#ffe0b2', 'text_color': '#333333'},
    {'season': 'winter', 'name': 'Winter', 'primary_color': '#01579b', 'secondary_color': '#ffffff', 'accent_color': '#00bcd4', 'background_color': '#e0f7fa', 'text_color': '#333333'},
    {'season': 'new_year', 'name': 'New Year', 'primary_color': '#b71c1c', 'secondary_color': '#ffffff', 'accent_color': '#ffeb3b', 'background_color': '#fff9c4', 'text_color': '#333333'},
    {'season': 'valentine', 'name': "Valentine's Day", 'primary_color': '#c2185b', 'secondary_color': '#ffffff', 'accent_color': '#e91e63', 'background_color': '#fce4ec', 'text_color': '#333333'},
    {'season': 'easter', 'name': 'Easter', 'primary_color': '#6a1b9a', 'secondary_color': '#ffffff', 'accent_color': '#ce93d8', 'background_color': '#f3e5f5', 'text_color': '#333333'},
    {'season': 'halloween', 'name': 'Halloween', 'primary_color': '#1a237e', 'secondary_color': '#ffffff', 'accent_color': '#ff6f00', 'background_color': '#1a237e', 'text_color': '#ffeb3b'},
    {'season': 'thanksgiving', 'name': 'Thanksgiving', 'primary_color': '#33691e', 'secondary_color': '#ffffff', 'accent_color': '#d84315', 'background_color': '#fff3e0', 'text_color': '#333333'},
    {'season': 'christmas', 'name': 'Christmas', 'primary_color': '#b71c1c', 'secondary_color': '#ffffff', 'accent_color': '#00c853', 'background_color': '#c8e6c9', 'text_color': '#333333'},
    {'season': 'cny', 'name': 'Chinese New Year', 'primary_color': '#b71c1c', 'secondary_color': '#ffd700', 'accent_color': '#ff6f00', 'background_color': '#fff3e0', 'text_color': '#333333'},
]

for data in themes_data:
    Theme.objects.create(**data)

exit()
```

7. **Run development server:**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api-auth/login/` - Admin login
- `POST /api-auth/logout/` - Admin logout

### Public Endpoints
- `GET /api/portfolio/all/` - Get all portfolio data
- `GET /api/themes/current/` - Get current theme

### Admin Endpoints (Requires Authentication)
- `GET/POST /api/projects/` - Projects management
- `GET/POST /api/skills/` - Skills management
- `GET/POST /api/experiences/` - Experience management
- `GET/POST /api/about/` - About information
- `GET/POST /api/social-links/` - Social links
- `GET/POST /api/themes/` - Theme management
- `GET/POST /api/contacts/` - View contact messages

## Seasonal Theme System

The portfolio automatically detects the current season and applies the appropriate theme:

- **Winter**: Dec 21 - Mar 19
- **Spring**: Mar 20 - Jun 20
- **Summer**: Jun 21 - Sep 22
- **Autumn**: Sep 23 - Dec 20
- **Special Dates**:
  - New Year: Jan 1-7
  - Valentine's Day: Feb 10-18
  - Easter: ~Apr 9 (varies)
  - Halloween: Oct 25 - Nov 1
  - Thanksgiving: ~Nov 25 (4th Thursday)
  - Christmas: Dec 20-31
  - Chinese New Year: Variable (detected in Feb-Mar range)

Admins can manually activate any theme from the Themes manager.

## Default Theme Colors

Each theme includes customizable colors:
- **Primary Color**: Main text color
- **Secondary Color**: Background color for sections
- **Accent Color**: Links, buttons, highlights
- **Background Color**: Page background
- **Text Color**: Default text color

## Admin Panel Features

### Projects Manager
- Add, edit, delete projects
- Set featured and published status
- Add project images, technologies, URLs

### Skills Manager
- Organize by category (Frontend, Backend, Database, Tools, Other)
- Set proficiency levels (0-100%)
- Custom ordering

### Experience Manager
- Timeline-based display
- Mark current positions
- Add location and description

### Themes Manager
- Visual theme preview cards
- Color picker for customization
- One-click theme activation

### Messages
- View contact form submissions
- Mark as read/unread
- Filter and search

## Security Considerations

1. Change the Django `SECRET_KEY` in production
2. Set `DEBUG = False` in production
3. Use environment variables for sensitive data
4. Implement HTTPS
5. Set proper CORS configuration for production domains
6. Use strong admin credentials

## Performance Tips

1. Compress images before uploading
2. Use CDN for media files
3. Enable database query optimization
4. Implement caching for themes (already cached on frontend)
5. Minimize CSS and JavaScript in production

## Future Enhancements

- Blog section
- Project categories/filtering
- Analytics dashboard
- Email notifications for contact submissions
- Image upload with optimization
- Dark mode toggle
- Multi-language support
- SEO optimization

## License

This project is open source and available for personal use.
