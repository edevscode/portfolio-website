#!/usr/bin/env python
"""
Populate database with seasonal themes.
Run: python manage.py shell < populate_seasonal_themes.py
Or: python manage.py runscript populate_seasonal_themes
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Theme

# Define seasonal themes with appropriate colors
seasonal_themes = [
    {
        'season': 'default',
        'name': 'Default',
        'primary_color': '#000000',
        'secondary_color': '#ffffff',
        'accent_color': '#0066cc',
        'background_color': '#f5f5f5',
        'text_color': '#333333',
        'is_active': True,  # Default theme is active by default
    },
    {
        'season': 'spring',
        'name': 'Spring Bloom',
        'primary_color': '#2d5016',
        'secondary_color': '#fef5e7',
        'accent_color': '#e74c3c',
        'background_color': '#ecf0f1',
        'text_color': '#2c3e50',
    },
    {
        'season': 'summer',
        'name': 'Summer Vibes',
        'primary_color': '#f39c12',
        'secondary_color': '#ffffcc',
        'accent_color': '#e67e22',
        'background_color': '#fff8dc',
        'text_color': '#333333',
    },
    {
        'season': 'autumn',
        'name': 'Autumn Warmth',
        'primary_color': '#8b4513',
        'secondary_color': '#ffa500',
        'accent_color': '#d2691e',
        'background_color': '#ffe4b5',
        'text_color': '#5d4037',
    },
    {
        'season': 'winter',
        'name': 'Winter Frost',
        'primary_color': '#2c3e50',
        'secondary_color': '#ecf0f1',
        'accent_color': '#3498db',
        'background_color': '#f8f9fa',
        'text_color': '#2c3e50',
    },
    {
        'season': 'new_year',
        'name': 'New Year Celebration',
        'primary_color': '#c0392b',
        'secondary_color': '#f1c40f',
        'accent_color': '#2ecc71',
        'background_color': '#2c3e50',
        'text_color': '#ecf0f1',
    },
    {
        'season': 'valentine',
        'name': "Valentine's Love",
        'primary_color': '#e91e63',
        'secondary_color': '#f8bbd0',
        'accent_color': '#c2185b',
        'background_color': '#fce4ec',
        'text_color': '#880e4f',
    },
    {
        'season': 'easter',
        'name': 'Easter Joy',
        'primary_color': '#9c27b0',
        'secondary_color': '#e1bee7',
        'accent_color': '#f48fb1',
        'background_color': '#f3e5f5',
        'text_color': '#4a148c',
    },
    {
        'season': 'halloween',
        'name': 'Halloween Spooky',
        'primary_color': '#1a1a1a',
        'secondary_color': '#ff6600',
        'accent_color': '#ff0000',
        'background_color': '#2d2d2d',
        'text_color': '#ff6600',
    },
    {
        'season': 'thanksgiving',
        'name': 'Thanksgiving Gratitude',
        'primary_color': '#8b4513',
        'secondary_color': '#daa520',
        'accent_color': '#d2691e',
        'background_color': '#f5deb3',
        'text_color': '#654321',
    },
    {
        'season': 'christmas',
        'name': 'Christmas Cheer',
        'primary_color': '#c41e3a',
        'secondary_color': '#165b33',
        'accent_color': '#ffd700',
        'background_color': '#f0f8ff',
        'text_color': '#0f3460',
    },
    {
        'season': 'cny',
        'name': 'Chinese New Year',
        'primary_color': '#c41e3a',
        'secondary_color': '#ffd700',
        'accent_color': '#ff6b6b',
        'background_color': '#ffe4e4',
        'text_color': '#8b0000',
    },
]

def populate_themes():
    """Create seasonal themes in the database."""
    created_count = 0
    updated_count = 0
    
    for theme_data in seasonal_themes:
        theme, created = Theme.objects.update_or_create(
            season=theme_data['season'],
            defaults={
                'name': theme_data['name'],
                'primary_color': theme_data['primary_color'],
                'secondary_color': theme_data['secondary_color'],
                'accent_color': theme_data['accent_color'],
                'background_color': theme_data['background_color'],
                'text_color': theme_data['text_color'],
                'is_active': theme_data.get('is_active', False),
            }
        )
        
        if created:
            print(f"✓ Created: {theme.name} ({theme.season})")
            created_count += 1
        else:
            print(f"✓ Updated: {theme.name} ({theme.season})")
            updated_count += 1
    
    print(f"\n✓ Populated {created_count} new themes and updated {updated_count} existing themes.")
    print("✓ The 'Default' theme is set as active. Switch to 'Auto (Seasonal)' in the admin panel to enable automatic seasonal switching.")

if __name__ == '__main__':
    populate_themes()
