# Maximilian Fuksik - Personal Portfolio Website

This is my personal portfolio and CV website that I created during my retraining as an IT specialist (Application Development). This project was developed independently for my own learning and professional presentation purposes.

## Table of Contents

- [About the Project](#about-the-project)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Future Improvements](#future-improvements)
- [Contact](#contact)
- [License](#license)

##  About the Project

Before my retraining, I worked in sales, but I was always fascinated by IT security. During my retraining, my passion for hardware and technology grew. This website is the result of that journey – combining my sales background with my new technical skills.

The website serves as:
- My personal online CV
- A showcase of my certifications and projects
- A demonstration of my frontend development skills
- A central point of contact for potential employers

> **Note:** This project was created for my own learning and self-presentation, not as a requirement for my retraining.

## Technologies Used

| Category | Technologies |
|----------|-------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Data Management | JSON (no backend required) |
| Architecture | Dynamic content rendering via JavaScript |
| Features | Dark/Light Mode, Responsive Design |
| Icons | Emoji-based (customizable) |

## Features

- **Fully dynamic content** – All texts are loaded from JSON files (easy multilingual support)
- **Dark / Light Mode** – Toggle between themes, preference is saved
- **Responsive Design** – Works on desktop, tablet, and mobile devices
- **Document Management** – CV and certificates can be viewed or downloaded
- **Modular JavaScript** – Clean separation of concerns
- **No external dependencies** – Pure HTML/CSS/JS, no frameworks

##  Project Structure
website/
│
├── index.html # Homepage
├── about.html # About me page
├── cv.html # CV / Resume page
├── certificate.html # Certificates page
├── project.html # Projects showcase
├── contact.html # Contact page (WIP)
├── weiteres.html # Additional content page
│
├── legal/
│ ├── legalnotice.html # Impressum (German legal notice)
│ └── privacypolicy.html # Privacy policy
│
├── assets/
│ ├── css/
│ │ └── stylesheet.css # Main styles (light mode)
│ ├── js/
│ │ ├── cv-loader.js # JSON data loader & renderer
│ │ └── script.js # UI utilities (clock, modal, dark mode)
│ └── images/ # All images and favicon
│
├── data/
│ ├── config.json # Navigation, social links, footer
│ ├── resume.json # Work experience, education, skills
│ ├── pageContent.json # All texts for all pages
│ ├── documents.json # CV and certificate documents
│ ├── projects.json # Project data
│ └── legal.json # Legal texts (Impressum, Privacy)
│
├── docs/ # Downloadable documents (CV, etc.)
├── certificates/ # Certificate PDF files
│
└── README.md # This file
