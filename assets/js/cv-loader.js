// ============================================
// cv-loader.js - Main data loading module
// Multi-language support (DE/EN)
// ============================================

// Global data container
let siteData = {
    resume: null,
    pageContent: null,
    documents: null,
    projects: null,
    config: null,
    legal: null
};

// Language settings
let currentLang = 'de'; // default: German
const langNames = { de: 'Deutsch', en: 'English' };

// ==================== PASSWORD PROTECTION ====================

// Password for protected documents
const DOCS_PASSWORD = '2026';

// List of protected documents (by title or path)
const PROTECTED_DOCS = [
    'Lebenslauf', 'cv', 'CV', 'Zertifikat', 'certificate',
    'HTML', 'CSS', 'JavaScript', 'SQL', 'Python'
];

let pendingDocPath = null;

// Password modal HTML template
const passwordModalHTML = `
<div id="password-modal" class="modal" style="display:none;">
    <div class="modal-content" style="max-width:400px;">
        <span class="close" onclick="closePasswordModal()">&times;</span>
        <h3>Password required</h3>
        <p>This document is password protected. Please enter the password.</p>
        <input type="password" id="password-input" placeholder="Enter password" style="width:100%; padding:10px; margin:15px 0; border:1px solid var(--border-color); border-radius:4px;">
        <div style="display:flex; gap:10px;">
            <button id="password-submit" class="btn">Confirm</button>
            <button onclick="closePasswordModal()" class="btn" style="background:var(--border-light);">Cancel</button>
        </div>
    </div>
</div>
`;

// Checks if document requires password
function needsPassword(docPath, docTitle) {
    const lowerTitle = (docTitle || '').toLowerCase();
    const lowerPath = (docPath || '').toLowerCase();
    return PROTECTED_DOCS.some(protected => {
        const lowerProtected = protected.toLowerCase();
        return lowerTitle.includes(lowerProtected) || lowerPath.includes(lowerProtected);
    });
}

// Shows password modal dialog
function showPasswordModal(docPath) {
    pendingDocPath = docPath;
    const modal = document.getElementById('password-modal');
    if (modal) {
        modal.style.display = 'block';
        const input = document.getElementById('password-input');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
}

// Closes password modal dialog
function closePasswordModal() {
    const modal = document.getElementById('password-modal');
    if (modal) modal.style.display = 'none';
    pendingDocPath = null;
}

// Validates password and opens document if correct
function checkPasswordAndOpen() {
    const userPassword = document.getElementById('password-input').value;
    if (userPassword === DOCS_PASSWORD) {
        if (pendingDocPath) {
            window.open(pendingDocPath, '_blank');
        }
        closePasswordModal();
    } else {
        alert('Wrong password! Access denied.');
        document.getElementById('password-input').value = '';
        document.getElementById('password-input').focus();
    }
}

// Handles document access with password check
function handleDocumentAccess(docPath, docTitle) {
    if (needsPassword(docPath, docTitle)) {
        showPasswordModal(docPath);
    } else {
        window.open(docPath, '_blank');
    }
}

// ==================== LANGUAGE SWITCHER ====================

// Changes the current language and reloads content
function setLanguage(lang) {
    if (lang === 'de' || lang === 'en') {
        currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        console.log(`Language changed to: ${lang}`);
        init(); // Reload all content
    }
}

// Retrieves saved language preference from browser storage
function getLanguageFromStorage() {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved === 'de' || saved === 'en') {
        currentLang = saved;
    }
    return currentLang;
}

// Adds language switcher buttons to navigation bar
function renderLanguageSwitcher() {
    const navContainer = document.getElementById('nav-links');
    if (!navContainer) return;
    
    if (document.getElementById('lang-switcher')) return;
    
    const langSwitcherHTML = `
        <li id="lang-switcher" class="lang-switcher-item">
            <button class="lang-btn ${currentLang === 'de' ? 'active' : ''}" data-lang="de">DE</button>
            <span class="lang-separator">|</span>
            <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
        </li>
    `;
    
    navContainer.insertAdjacentHTML('beforeend', langSwitcherHTML);
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = btn.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
}

// ==================== JSON LOADER ====================

// Builds file path based on current language
function getDataPath(filename) {
    return `data/${currentLang}/${filename}.json`;
}

// Loads all JSON files for current language
async function loadAllJSON() {
    console.log(`Loading all JSON files (${currentLang})...`);
    
    const files = {
        resume: getDataPath('resume'),
        pageContent: getDataPath('pageContent'),
        documents: getDataPath('documents'),
        projects: getDataPath('projects'),
        config: getDataPath('config'),
        legal: getDataPath('legal')
    };
    
    try {
        const promises = Object.entries(files).map(async ([key, path]) => {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    siteData[key] = await response.json();
                    console.log(`Loaded: ${key}.json (${currentLang})`);
                } else {
                    console.warn(`${key}.json not found for ${currentLang}`);
                    siteData[key] = null;
                }
            } catch (error) {
                console.warn(`${key}.json could not be loaded:`, error);
                siteData[key] = null;
            }
        });
        
        await Promise.all(promises);
        console.log("All JSON files processed");
        return true;
    } catch (error) {
        console.error("Error loading JSONs:", error);
        return false;
    }
}

// ==================== PAGE DETECTION ====================

// Detects current page from URL filename
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    const pageName = filename.replace('.html', '');
    console.log(`Detected page: ${pageName}`);
    return pageName;
}

// ==================== RENDER FUNCTIONS ====================

// Renders navigation menu from config
function renderNavigation() {
    const config = siteData.config;
    if (!config?.navigation) return;
    
    const navContainer = document.getElementById('nav-links');
    if (!navContainer) return;
    
    const existingSwitcher = document.getElementById('lang-switcher');
    navContainer.innerHTML = '';
    
    const navItems = [
        { name: "Home", key: "home", icon: "🏠︎" },
        { name: "About", key: "about", icon: "𓂃🖊" },
        { name: "CV", key: "cv", icon: "" },
        { name: "Certificates", key: "certificates", icon: "🗐" },
        { name: "Projects", key: "projects", icon: "🗒" },
        { name: "Contact", key: "contact", icon: "✉" }
    ];
    
    let html = '';
    navItems.forEach(item => {
        const path = config.navigation[item.key];
        if (path) {
            html += `<li><a href="${path}"> ${item.icon} ${item.name}</a></li>`;
        }
    });
    
    navContainer.innerHTML = html;
    
    if (existingSwitcher) {
        navContainer.appendChild(existingSwitcher);
    } else {
        renderLanguageSwitcher();
    }
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const lang = btn.getAttribute('data-lang');
        if (lang === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    console.log("Navigation rendered");
}

// Renders social media links in sidebar
function renderSocialLinks() {
    const config = siteData.config;
    if (!config?.sidebar?.socialLinks) return;
    
    const container = document.getElementById('social-links');
    if (!container) return;
    
    let html = '';
    config.sidebar.socialLinks.forEach(link => {
        const icon = link.icon || (link.name === 'GitHub' ? '🐙' : '💼');
        html += `
            <a href="${link.url}" target="_blank" data-platform="${link.name.toLowerCase()}">
                <span class="social-icon">${icon}</span>
                <span class="social-name">${link.name}</span>
            </a>
        `;
    });
    
    container.innerHTML = html;
    console.log("Social links rendered");
}

// Renders footer with legal links and copyright
function renderFooter() {
    const config = siteData.config;
    const container = document.getElementById('footer-links');
    if (!container) return;
    
    const currentYear = new Date().getFullYear();
    
    if (config?.footer) {
        let html = '';
        if (config.footer.impressum) html += `<a href="${config.footer.impressum}">Impressum</a> | `;
        if (config.footer.datenschutz) html += `<a href="${config.footer.datenschutz}">Privacy Policy</a> | `;
        if (config.footer.contact) html += `<a href="${config.footer.contact}">Contact</a> | `;
        html += `© ${currentYear} Maximilian Fuksik. All rights reserved.`;
        container.innerHTML = html;
    } else {
        container.innerHTML = `© ${currentYear} Maximilian Fuksik. All rights reserved.`;
    }
    console.log("Footer rendered");
}

// Sets search input placeholder text
function renderSearchPlaceholder() {
    const pageContent = siteData.pageContent?.cvPage;
    const searchInput = document.getElementById('json-search');
    if (!searchInput) return;
    searchInput.placeholder = pageContent?.searchPlaceholder || "Search...";
}

// Renders all text content from pageContent.json
function renderPageTexts() {
    const texts = siteData.pageContent?.cvPage;
    if (!texts) return;
    
    setText('#search-title', texts.searchTitle);
    setText('#links-title', texts.linksTitle);
    setText('#contact-title', texts.contactTitle);
    setText('#interests-title', texts.interestsTitle);
    setText('#documents-title', texts.documentsTitle);
    setText('#documents-subtitle', texts.documentsSubtitle);
    setText('#work-title', texts.workTitle);
    setText('#education-title', texts.educationTitle);
    setText('#skills-json-title', texts.skillsJsonTitle);
    setText('#skills-title', texts.skillsTitle);
    setText('#prog-lang-title', texts.progLangTitle);
    setText('#softskills-title', texts.softskillsTitle);
    setText('#languages-title', texts.languagesTitle);
    setText('#other-title', texts.otherTitle);
    setText('#gallery-title', texts.galleryTitle);
    setText('#projects-title', texts.projectsTitle);
    setText('#upload-title', texts.uploadTitle);
    setText('#upload-text', texts.uploadText);
    setText('#upload-btn', texts.uploadBtn);
    setText('#form-title', texts.formTitle);
    setText('#label-name', texts.labelName);
    setText('#label-email', texts.labelEmail);
    setText('#label-subject', texts.labelSubject);
    setText('#label-message', texts.labelMessage);
    setText('#submit-btn', texts.submitBtn);
    
    document.querySelectorAll('.json-loading').forEach(el => {
        if (el.textContent === '' || el.textContent === 'Loading...' || el.textContent === 'Laden...') {
            el.textContent = texts.loadingText || 'Loading...';
        }
    });
}

// Renders contact information (without street address)
function renderContactInfo() {
    const info = siteData.resume?.personalInfo;
    const container = document.getElementById('json-contact');
    if (!container) return;
    
    if (!info) {
        container.innerHTML = '<p>No contact information available</p>';
        return;
    }
    
    // City only - street removed
    const cityOnly = info.address?.city || '';
    const country = info.address?.country || '';
    const locationText = cityOnly + (country ? `, ${country}` : '');
    
    container.innerHTML = `
        <p>Email: <span class="json-email">${escapeHtml(info.email)}</span></p>
        <p>Phone: <span class="json-phone">${escapeHtml(info.phone)}</span></p>
        <p>Location: <span class="json-location">${escapeHtml(locationText)}</span></p>
    `;
    console.log("Contact info loaded");
}

// Renders interests/hobbies section
function renderInterests() {
    const interests = siteData.resume?.interests;
    const container = document.getElementById('json-interests');
    const texts = siteData.pageContent?.cvPage;
    if (!container) return;
    
    if (!interests || interests.length === 0) {
        container.innerHTML = `<p>${texts?.noDataText || 'No interests listed'}</p>`;
        return;
    }
    
    container.innerHTML = `
        <div class="interests-list">
            ${interests.map(i => `<span class="interest-tag">${escapeHtml(i)}</span>`).join('')}
        </div>
    `;
    console.log(`${interests.length} interests loaded`);
}

// Renders documents grid (CV or Certificates)
function renderDocuments(type = 'all') {
    const container = document.getElementById('documents-grid');
    const documents = siteData.documents?.documents;
    const texts = siteData.pageContent?.cvPage;
    
    if (!container) return;
    
    if (!documents || documents.length === 0) {
        container.innerHTML = `<p class="json-error">${texts?.noDataText || 'No documents available'}</p>`;
        return;
    }
    
    let filteredDocs = documents;
    if (type === 'cv') {
        filteredDocs = documents.filter(doc => doc.showOnCV === true);
    } else if (type === 'certificates') {
        filteredDocs = documents.filter(doc => doc.showOnCertificates === true);
    }
    
    if (filteredDocs.length === 0) {
        container.innerHTML = `<p class="json-error">${texts?.noDataText || 'No documents available'}</p>`;
        return;
    }
    
    let html = '';
    filteredDocs.forEach(doc => {
        html += `
            <div class="document-card">
                <div class="document-icon">${doc.icon || '📄'}</div>
                <div class="document-info">
                    <h4>${escapeHtml(doc.title)}</h4>
                    ${doc.description ? `<p>${escapeHtml(doc.description)}</p>` : ''}
                    <p class="upload-date">Uploaded: ${doc.uploadDate || 'Unknown'}</p>
                    <div class="document-actions">
                        ${doc.viewable !== false ? `<button class="btn view-document" data-path="${escapeHtml(doc.path)}" data-title="${escapeHtml(doc.title)}">View</button>` : ''}
                        ${doc.downloadable !== false ? `<a href="${escapeHtml(doc.path)}" download class="download-link" data-path="${escapeHtml(doc.path)}" data-title="${escapeHtml(doc.title)}"><button class="btn download-document">Download</button></a>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log(`${filteredDocs.length} documents loaded (type: ${type})`);
    
    document.querySelectorAll('.view-document').forEach(btn => {
        btn.addEventListener('click', function() {
            const path = this.getAttribute('data-path');
            const title = this.getAttribute('data-title');
            handleDocumentAccess(path, title);
        });
    });
    
    document.querySelectorAll('.download-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const path = this.getAttribute('data-path');
            const title = this.getAttribute('data-title');
            handleDocumentAccess(path, title);
        });
    });
}

// Renders work experience section
function renderWorkExperience() {
    const container = document.getElementById('json-work-experience');
    const experiences = siteData.resume?.workExperience;
    const texts = siteData.pageContent?.cvPage;
    if (!container) return;
    
    if (!experiences || experiences.length === 0) {
        container.innerHTML = `<p>${texts?.noDataText || 'No work experience available'}</p>`;
        return;
    }
    
    let html = '';
    experiences.forEach((job, idx) => {
        const isLast = idx === experiences.length - 1;
        html += `
        <div class="work-item ${isLast ? 'last' : ''}">
            <div class="job-header">
                <h3>${escapeHtml(job.position)}</h3>
                <div class="job-meta">
                    <span class="company">${escapeHtml(job.company)}</span>
                    <span class="location">${escapeHtml(job.location)}</span>
                    <span class="period">${escapeHtml(job.period)}</span>
                </div>
            </div>
            <ul class="job-responsibilities">
                ${job.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
            </ul>
        </div>`;
    });
    container.innerHTML = html;
    console.log(`${experiences.length} work experiences loaded`);
}

// Renders education section
function renderEducation() {
    const container = document.getElementById('json-education');
    const education = siteData.resume?.education;
    const texts = siteData.pageContent?.cvPage;
    if (!container) return;
    
    if (!education || education.length === 0) {
        container.innerHTML = `<p>${texts?.noDataText || 'No education data available'}</p>`;
        return;
    }
    
    let html = '';
    education.forEach((edu, idx) => {
        const isLast = idx === education.length - 1;
        html += `
        <div class="education-item ${isLast ? 'last' : ''}">
            <div class="education-header">
                <h3>${escapeHtml(edu.program)}</h3>
                <div class="education-meta">
                    <span class="institution">${escapeHtml(edu.institution)}</span>
                    <span class="period">${escapeHtml(edu.period)}</span>
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
    console.log(`${education.length} education items loaded`);
}

// Renders skills from resume.json
function renderSkillsFromJSON() {
    const container = document.getElementById('json-skills');
    const skills = siteData.resume?.skills;
    const texts = siteData.pageContent?.cvPage;
    if (!container) return;
    
    if (!skills) {
        container.innerHTML = `<p>${texts?.noDataText || 'No skills available'}</p>`;
        return;
    }
    
    let html = '<div class="skills-container">';
    
    if (skills.languages?.length) {
        html += `<div class="skills-category">
            <h4>Languages</h4>
            <div class="skills-list languages">
                ${skills.languages.map(l => `<span class="skill-tag">${escapeHtml(l.language)} (${l.level})</span>`).join('')}
            </div>
        </div>`;
    }
    
    if (skills.software?.length) {
        html += `<div class="skills-category">
            <h4>Software & Technologies</h4>
            <div class="skills-list software">
                ${skills.software.map(s => `<span class="skill-tag">${escapeHtml(s.name)} (${s.level})</span>`).join('')}
            </div>
        </div>`;
    }
    
    if (skills.drivingLicense) {
        html += `<div class="skills-category">
            <h4>Driving License</h4>
            <p class="license">${escapeHtml(skills.drivingLicense)}</p>
        </div>`;
    }
    
    if (skills.abilities?.length) {
        html += `<div class="skills-category">
            <h4>Personal Abilities</h4>
            <div class="skills-list abilities">
                ${skills.abilities.map(a => `<span class="skill-tag">${escapeHtml(a)}</span>`).join('')}
            </div>
        </div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
    console.log("Skills loaded from resume.json");
}

// Renders manual skills from pageContent.json
function renderManualSkills() {
    const skillsData = siteData.pageContent?.skillsData;
    if (!skillsData) return;
    
    const progLangGrid = document.getElementById('prog-lang-grid');
    if (progLangGrid && skillsData.programmingLanguages) {
        progLangGrid.innerHTML = skillsData.programmingLanguages.map(skill => `
            <div class="skill">
                <span>${escapeHtml(skill.name)}</span>
                <div class="skill-bar"><div class="skill-progress" data-level="${skill.level}"></div></div>
            </div>
        `).join('');
    }
    
    const softskillsGrid = document.getElementById('softskills-grid');
    if (softskillsGrid && skillsData.softskills) {
        softskillsGrid.innerHTML = skillsData.softskills.map(skill => `
            <div class="skill">
                <span>${escapeHtml(skill.name)}</span>
                <div class="skill-bar"><div class="skill-progress" data-level="${skill.level}"></div></div>
            </div>
        `).join('');
    }
    
    const languagesGrid = document.getElementById('languages-grid');
    if (languagesGrid && skillsData.languages) {
        languagesGrid.innerHTML = skillsData.languages.map(skill => `
            <div class="skill">
                <span>${escapeHtml(skill.name)}</span>
                <div class="skill-bar"><div class="skill-progress" data-level="${skill.level}"></div></div>
            </div>
        `).join('');
    }
    
    const otherGrid = document.getElementById('other-grid');
    if (otherGrid && skillsData.other) {
        otherGrid.innerHTML = skillsData.other.map(skill => `
            <div class="skill">
                <span>${escapeHtml(skill.name)}</span>
                <div class="skill-bar"><div class="skill-progress" data-level="${skill.level}"></div></div>
            </div>
        `).join('');
    }
    
    if (typeof initSkillBars === 'function') {
        initSkillBars();
    } else {
        document.querySelectorAll('.skill-progress').forEach(bar => {
            const level = bar.getAttribute('data-level');
            if (level) bar.style.width = level + '%';
        });
    }
    
    console.log("Manual skills rendered from pageContent.json");
}

// Renders index/home page content
function renderIndexPage() {
    const content = siteData.pageContent?.index;
    if (!content) return;
    
    if (content.welcome) {
        setText('#welcome-title', content.welcome.title);
        setText('#welcome-text', content.welcome.text);
    }
    
    if (content.aboutSections?.length) {
        const container = document.getElementById('about-section-container');
        if (container) {
            let html = '';
            content.aboutSections.forEach(section => {
                const reverseClass = section.reverse ? 'reverse' : '';
                const imagePath = section.image ? `assets/images/${section.image}` : '';
                html += `
                <div class="about-item ${reverseClass}">
                    <div class="about-image">
                        ${imagePath ? `<img src="${imagePath}" alt="${escapeHtml(section.imageAlt || 'Image')}">` : ''}
                    </div>
                    <div class="about-text">
                        <h2>${escapeHtml(section.title)}</h2>
                        <p>${escapeHtml(section.text)}</p>
                    </div>
                </div>`;
            });
            container.innerHTML = html;
        }
    }
    
    if (content.gallery) {
        setText('#gallery-title', content.gallery.title);
        const images = document.querySelectorAll('.gallery-grid .gallery-item img');
        if (images.length && content.gallery.images) {
            images.forEach((img, i) => {
                if (content.gallery.images[i]) {
                    img.src = `assets/images/${content.gallery.images[i]}`;
                }
            });
        }
    }
    console.log("Index page rendered");
}

// Renders about page content
function renderAboutPage() {
    const content = siteData.pageContent?.about;
    if (!content) return;
    
    setText('#about-title-1', content.title);
    
    const textEl = document.getElementById('about-text-1');
    if (textEl && content.text) {
        const formattedText = content.text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
        textEl.innerHTML = `<p>${formattedText}</p>`;
    }
    
    const img1 = document.getElementById('about-image-1');
    if (img1 && content.image1) {
        img1.src = `assets/images/${content.image1}`;
    }
    
    const img2 = document.getElementById('about-image-2');
    if (img2) {
        if (content.image2) {
            img2.src = `assets/images/${content.image2}`;
            img2.style.display = 'block';
        } else {
            img2.style.display = 'none';
        }
    }
    console.log("About page rendered");
}

// Renders projects grid
function renderProjects() {
    const container = document.getElementById('projects-container');
    const projects = siteData.projects?.items || siteData.projects?.projects;
    const texts = siteData.pageContent?.cvPage;
    
    if (!container) return;
    
    if (!projects || projects.length === 0) {
        container.innerHTML = `<p class="json-error">${texts?.noDataText || 'No projects available'}</p>`;
        return;
    }
    
    let html = '<div class="projects-grid">';
    projects.forEach(project => {
        html += `
            <div class="project-card">
                <h3>${escapeHtml(project.name)}</h3>
                <p>${escapeHtml(project.description)}</p>
                ${project.link ? `<a href="${project.link}" target="_blank" class="btn">Explore</a>` : ''}
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
    console.log(`${projects.length} projects loaded`);
}

// Renders impressum/legal notice page
function renderImpressum() {
    const container = document.getElementById('impressum-content');
    const legal = siteData.legal?.impressum;
    const personalInfo = siteData.resume?.personalInfo;
    
    if (!container || !legal) {
        if (container) container.innerHTML = '<p class="json-error">Impressum data not available</p>';
        return;
    }
    
    const replacePlaceholders = (text) => {
        if (!text) return '';
        return text
            .replace(/{name}/g, personalInfo?.name || '')
            .replace(/{street}/g, personalInfo?.address?.street || '')
            .replace(/{city}/g, personalInfo?.address?.city || '')
            .replace(/{country}/g, personalInfo?.address?.country || '')
            .replace(/{phone}/g, personalInfo?.phone || '')
            .replace(/{email}/g, personalInfo?.email || '');
    };
    
    let html = `<h1>${legal.title}</h1>`;
    
    if (legal.sections?.accordingTo) {
        html += `<section class="impressum-section">
            <h2>${legal.sections.accordingTo.title}</h2>
            <div class="impressum-details">
                ${legal.sections.accordingTo.content.map(line => `<p>${replacePlaceholders(line)}</p>`).join('')}
            </div>
        </section>`;
    }
    
    if (legal.sections?.contact) {
        html += `<section class="impressum-section">
            <h2>${legal.sections.contact.title}</h2>
            <div class="impressum-details">
                ${legal.sections.contact.content.map(line => `<p>${replacePlaceholders(line)}</p>`).join('')}
            </div>
        </section>`;
    }
    
    if (legal.sections?.responsible) {
        html += `<section class="impressum-section">
            <h2>${legal.sections.responsible.title}</h2>
            <div class="impressum-details">
                ${legal.sections.responsible.content.map(line => `<p>${replacePlaceholders(line)}</p>`).join('')}
            </div>
        </section>`;
    }
    
    if (legal.sections?.disclaimer) {
        html += `<section class="impressum-section">
            <h2>${legal.sections.disclaimer.title}</h2>
            <div class="impressum-details">
                <h3>${legal.sections.disclaimer.subsections.liabilityContent.title}</h3>
                <p>${legal.sections.disclaimer.subsections.liabilityContent.text}</p>
                <h3>${legal.sections.disclaimer.subsections.liabilityLinks.title}</h3>
                <p>${legal.sections.disclaimer.subsections.liabilityLinks.text}</p>
                <h3>${legal.sections.disclaimer.subsections.copyright.title}</h3>
                <p>${legal.sections.disclaimer.subsections.copyright.text}</p>
            </div>
        </section>`;
    }
    
    if (legal.sections?.euSettlement) {
        html += `<section class="impressum-section">
            <h2>${legal.sections.euSettlement.title}</h2>
            <div class="impressum-details">
                <p>${legal.sections.euSettlement.text}</p>
            </div>
        </section>`;
    }
    
    container.innerHTML = html;
    console.log("Impressum rendered");
}

// Renders privacy policy page
function renderDatenschutz() {
    const container = document.getElementById('datenschutz-content');
    const legal = siteData.legal?.datenschutz;
    const personalInfo = siteData.resume?.personalInfo;
    
    if (!container || !legal) {
        if (container) container.innerHTML = '<p class="json-error">Privacy policy data not available</p>';
        return;
    }
    
    const replacePlaceholders = (text) => {
        if (!text) return '';
        return text
            .replace(/{name}/g, personalInfo?.name || '')
            .replace(/{street}/g, personalInfo?.address?.street || '')
            .replace(/{city}/g, personalInfo?.address?.city || '')
            .replace(/{country}/g, personalInfo?.address?.country || '')
            .replace(/{phone}/g, personalInfo?.phone || '')
            .replace(/{email}/g, personalInfo?.email || '');
    };
    
    let html = `<h1>${legal.title}</h1>`;
    
    if (legal.sections?.responsible) {
        html += `<section class="datenschutz-section">
            <h2>${legal.sections.responsible.title}</h2>
            <div class="datenschutz-details">
                <p>${legal.sections.responsible.text || ''}</p>
                ${legal.sections.responsible.content.map(line => `<p>${replacePlaceholders(line)}</p>`).join('')}
            </div>
        </section>`;
    }
    
    if (legal.sections?.dataCollection) {
        html += `<section class="datenschutz-section">
            <h2>${legal.sections.dataCollection.title}</h2>
            <div class="datenschutz-details">
                <h3>${legal.sections.dataCollection.subsections.websiteVisit.title}</h3>
                <p>${legal.sections.dataCollection.subsections.websiteVisit.text}</p>
                <ul>${legal.sections.dataCollection.subsections.websiteVisit.list.map(item => `<li>${item}</li>`).join('')}</ul>
                <p>${legal.sections.dataCollection.subsections.websiteVisit.legalText}</p>
                <h3>${legal.sections.dataCollection.subsections.contact.title}</h3>
                <p>${legal.sections.dataCollection.subsections.contact.text}</p>
            </div>
        </section>`;
    }
    
    if (legal.sections?.cookies) {
        html += `<section class="datenschutz-section">
            <h2>${legal.sections.cookies.title}</h2>
            <div class="datenschutz-details">
                <p>${legal.sections.cookies.text}</p>
                <ul>${legal.sections.cookies.list.map(item => `<li>${item}</li>`).join('')}</ul>
                <p>${legal.sections.cookies.legalText}</p>
            </div>
        </section>`;
    }
    
    if (legal.sections?.externalServices) {
        html += `<section class="datenschutz-section">
            <h2>${legal.sections.externalServices.title}</h2>
            <div class="datenschutz-details">
                <h3>${legal.sections.externalServices.subsections.github.title}</h3>
                <p>${legal.sections.externalServices.subsections.github.text}</p>
                <h3>${legal.sections.externalServices.subsections.linkedin.title}</h3>
                <p>${legal.sections.externalServices.subsections.linkedin.text}</p>
            </div>
        </section>`;
    }
    
    if (legal.sections?.userRights) {
        html += `<section class="datenschutz-section">
            <h2>${legal.sections.userRights.title}</h2>
            <div class="datenschutz-details">
                <p>${legal.sections.userRights.text}</p>
                <ul>${legal.sections.userRights.list.map(item => `<li>${item}</li>`).join('')}</ul>
                <p>${legal.sections.userRights.legalText}</p>
            </div>
        </section>`;
    }
    
    if (legal.sections?.dataSecurity) {
        html += `<section class="datenschutz-section">
            <h2>${legal.sections.dataSecurity.title}</h2>
            <div class="datenschutz-details">
                <p>${legal.sections.dataSecurity.text}</p>
            </div>
        </section>`;
    }
    
    if (legal.sections?.changes) {
        html += `<section class="datenschutz-section">
            <h2>${legal.sections.changes.title}</h2>
            <div class="datenschutz-details">
                <p>${legal.sections.changes.text}</p>
                <p><strong>Last updated:</strong> ${legal.sections.changes.lastUpdated}</p>
            </div>
        </section>`;
    }
    
    container.innerHTML = html;
    console.log("Privacy policy rendered");
}

// ==================== HELPER FUNCTIONS ====================

// Sets text content of an element by selectorfunction setText(selector, text) {
    if (!text) return;
    const element = document.querySelector(selector);
    if (element) element.textContent = text;


// Escapes HTML special characters to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Shows error message in content containers
function showError(message) {
    const containers = ['json-work-experience', 'json-education', 'json-skills', 'json-interests', 'documents-grid', 'projects-container', 'impressum-content', 'datenschutz-content'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el && (el.innerHTML === '' || el.querySelector('.json-loading'))) {
            el.innerHTML = `<div class="json-error">${message}</div>`;
        }
    });
}

// ==================== ADD PASSWORD MODAL TO PAGE ====================

// Injects password modal HTML into the page
function addPasswordModal() {
    if (!document.getElementById('password-modal')) {
        document.body.insertAdjacentHTML('beforeend', passwordModalHTML);
        const submitBtn = document.getElementById('password-submit');
        const passwordInput = document.getElementById('password-input');
        if (submitBtn) {
            submitBtn.addEventListener('click', checkPasswordAndOpen);
        }
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    checkPasswordAndOpen();
                }
            });
        }
        const closeBtn = document.querySelector('#password-modal .close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closePasswordModal);
        }
    }
}

// ==================== MAIN INIT ====================

// Main initialization function - loads data and renders page
async function init() {
    console.log("CV Loader initializing...");
    
    getLanguageFromStorage();
    addPasswordModal();
    
    const success = await loadAllJSON();
    if (!success) {
        showError("Data could not be loaded");
        return;
    }
    
    const page = getCurrentPage();
    
    renderNavigation();
    renderSocialLinks();
    renderFooter();
    renderSearchPlaceholder();
    renderPageTexts();
    renderContactInfo();
    renderInterests();
    
    switch(page) {
        case 'index':
            renderIndexPage();
            break;
        case 'about':
            renderAboutPage();
            break;
        case 'cv':
            renderDocuments('cv');
            renderWorkExperience();
            renderEducation();
            renderSkillsFromJSON();
            renderManualSkills();
            break;
        case 'certificate':
            renderDocuments('certificates');
            break;
        case 'project':
            renderProjects();
            break;
        case 'contact':
            break;
        case 'legalnotice':
            renderImpressum();
            break;
        case 'privacypolicy':
            renderDatenschutz();
            break;
        default:
            console.log(`No specific logic for page: ${page}`);
    }
    
    console.log("All data loaded and rendered");
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Expose functions for debugging/emergency reloads
window.reloadCVData = () => init();
window.testJSON = () => {
    alert(`JSON Status:\nResume: ${siteData.resume ? 'OK' : 'Missing'}\nPageContent: ${siteData.pageContent ? 'OK' : 'Missing'}\nDocuments: ${siteData.documents ? 'OK' : 'Missing'}\nProjects: ${siteData.projects ? 'OK' : 'Missing'}\nConfig: ${siteData.config ? 'OK' : 'Missing'}\nLegal: ${siteData.legal ? 'OK' : 'Missing'}`);
};