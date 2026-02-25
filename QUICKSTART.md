# Quick Start Guide

## Prerequisites
- Python 3.8+
- Node.js 14+
- MySQL 5.7+ or MariaDB
- Git

## 5-Minute Setup

### Step 1: Clone/Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# For Windows users: If mysqlclient fails to install, it's OK.
# PyMySQL is installed as fallback and works just as well.
```

### Step 2: Create MySQL Database

1. Open MySQL/MariaDB command line or MySQL Workbench
2. Run these commands:
```sql
CREATE DATABASE portfolio_db;
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
```

3. Verify `backend/config/settings.py` has correct database credentials:
   - NAME: portfolio_db
   - USER: portfolio_user
   - PASSWORD: password
   - HOST: localhost
   - PORT: 3306

### Step 3: Initialize Database

Make sure MySQL is running, then:

```bash
# In backend directory (with virtual environment activated)
python manage.py makemigrations
python manage.py migrate
```

✅ If you see "No migrations to apply" - that's success! All tables are created.

### Step 4: Create Admin User

```bash
python manage.py createsuperuser
# Enter username, email, and password when prompted
```

### Step 5: Populate Default Themes

```bash
python manage.py shell
```

Paste this code:
```python
from api.models import Theme

themes = [
    ('default', 'Default', '#000000', '#ffffff', '#0066cc', '#f5f5f5', '#333333'),
    ('spring', 'Spring', '#2d5016', '#ffffff', '#4caf50', '#f1f8e9', '#333333'),
    ('summer', 'Summer', '#005a9c', '#ffffff', '#ff9800', '#fff3e0', '#333333'),
    ('autumn', 'Autumn', '#5d4037', '#ffffff', '#ff6f00', '#ffe0b2', '#333333'),
    ('winter', 'Winter', '#01579b', '#ffffff', '#00bcd4', '#e0f7fa', '#333333'),
    ('new_year', 'New Year', '#b71c1c', '#ffffff', '#ffeb3b', '#fff9c4', '#333333'),
    ('valentine', "Valentine's Day", '#c2185b', '#ffffff', '#e91e63', '#fce4ec', '#333333'),
    ('easter', 'Easter', '#6a1b9a', '#ffffff', '#ce93d8', '#f3e5f5', '#333333'),
    ('halloween', 'Halloween', '#1a237e', '#ffffff', '#ff6f00', '#1a237e', '#ffeb3b'),
    ('thanksgiving', 'Thanksgiving', '#33691e', '#ffffff', '#d84315', '#fff3e0', '#333333'),
    ('christmas', 'Christmas', '#b71c1c', '#ffffff', '#00c853', '#c8e6c9', '#333333'),
    ('cny', 'Chinese New Year', '#b71c1c', '#ffd700', '#ff6f00', '#fff3e0', '#333333'),
]

for season, name, primary, secondary, accent, bg, text in themes:
    Theme.objects.create(
        season=season,
        name=name,
        primary_color=primary,
        secondary_color=secondary,
        accent_color=accent,
        background_color=bg,
        text_color=text
    )

print("Themes created successfully!")
exit()
```

### Step 6: Start Backend Server

```bash
python manage.py runserver
# Server will start on http://localhost:8000
```

### Step 7: Setup Frontend (New Terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend will be available at http://localhost:5173
```

## Access Your Portfolio

- **Public Portfolio**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin/login
- **Django Admin**: http://localhost:8000/admin

## First Steps

1. Login to admin panel with your superuser credentials
2. Add your profile information (About section)
3. Create some projects
4. Add your skills
5. Add your experiences
6. Configure social links
7. Customize themes with your colors

## Common Issues

### Database Connection Error
- Verify MySQL is running
- Check credentials in `config/settings.py`
- Ensure database exists

### Port Already in Use
- Backend: `python manage.py runserver 8001` (change port)
- Frontend: `npm run dev -- --port 5174` (change port)

### CORS Error
- Check `CORS_ALLOWED_ORIGINS` in `config/settings.py`
- Restart backend server

### Theme Not Loading
- Ensure themes are created in database
- Check browser console for errors
- Try refreshing the page

## Build for Production

### Backend
```bash
# Collect static files
python manage.py collectstatic --noinput

# Use a production WSGI server like gunicorn
pip install gunicorn
gunicorn config.wsgi
```

### Frontend
```bash
npm run build
# Output will be in dist/ folder
```

Deploy the `dist/` folder to your hosting service.

## Need Help?

Refer to the main README.md for detailed API documentation and feature descriptions.
