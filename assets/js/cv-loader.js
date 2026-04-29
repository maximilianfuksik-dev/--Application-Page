// ============================================
// cv-loader.js - Data loading module
// All texts from JSON for multi-language support
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

// ==================== JSON LOADER ====================

async function loadAllJSON() {
    console.log("Loading all JSON files...");
    
    const files = {
        resume: 'data/resume.json',
        pageContent: 'data/pageContent.json',
        documents: 'data/documents.json',
        projects: 'data/projects.json',
        config: 'data/config.json',
        legal: 'data/legal.json'
    };
    
    try {
        const promises = Object.entries(files).map(async ([key, path]) => {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    siteData[key] = await response.json();
                    console.log(`Loaded: ${key}.json`);
                } else {
                    console.warn(`${key}.json not found`);
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

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    const pageName = filename.replace('.html', '');
    console.log(`Detected page: ${pageName}`);
    return pageName;
}

// ==================== RENDER FUNCTIONS ====================

function renderNavigation() {
    const config = siteData.config;
    if (!config?.navigation) return;
    
    const navContainer = document.getElementById('nav-links');
    if (!navContainer) return;
    
    const navItems = [
        { name: "Home", key: "home", icon: "🏠︎" },
        { name: "About", key: "about", icon: "𓂃🖊" },
        { name: "CV", key: "cv", icon: "🇨🇻" },
        { name: "Zertifikate", key: "certificates", icon: "🗐" },
        { name: "Projekte", key: "projects", icon: "🗒" },
        { name: "Kontakt", key: "contact", icon: "✉" },
        
    ];
    
    let html = '';
    navItems.forEach(item => {
        const path = config.navigation[item.key];
        if (path) {
            html += `<li><a href="${path}"> ${item.icon} ${item.name}</a></li>`;
        }
    });
    
    navContainer.innerHTML = html;
    console.log("Navigation rendered");
}

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

function renderFooter() {
    const config = siteData.config;
    const container = document.getElementById('footer-content') || document.getElementById('footer-links');
    if (!container) return;
    
    const currentYear = new Date().getFullYear();
    
    if (config?.footer) {
        let html = '';
        if (config.footer.impressum) html += `<a href="${config.footer.impressum}">Impressum</a> | `;
        if (config.footer.datenschutz) html += `<a href="${config.footer.datenschutz}">Datenschutz</a> | `;
        if (config.footer.contact) html += `<a href="${config.footer.contact}">Kontakt</a> | `;
        html += `© ${currentYear} Maximilian Fuksik. Alle Rechte vorbehalten.`;
        container.innerHTML = html;
    } else {
        container.innerHTML = `© ${currentYear} Maximilian Fuksik. Alle Rechte vorbehalten.`;
    }
    console.log("Footer rendered");
}

function renderSearchPlaceholder() {
    const config = siteData.config;
    const pageContent = siteData.pageContent?.cvPage;
    const searchInput = document.getElementById('json-search');
    if (!searchInput) return;
    searchInput.placeholder = pageContent?.searchPlaceholder || config?.sidebar?.searchPlaceholder || "Search...";
}

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
        if (el.textContent === '' || el.textContent === 'Loading...') {
            el.textContent = texts.loadingText || 'Loading...';
        }
    });
}

function renderContactInfo() {
    const info = siteData.resume?.personalInfo;
    const container = document.getElementById('json-contact');
    if (!container) return;
    
    if (!info) {
        container.innerHTML = '<p>No contact information available</p>';
        return;
    }
    
    container.innerHTML = `
        <p>Email: <span class="json-email">${escapeHtml(info.email)}</span></p>
        <p>Phone: <span class="json-phone">${escapeHtml(info.phone)}</span></p>
        <p>Address: <span class="json-address">${escapeHtml(info.address?.street || '')}, ${escapeHtml(info.address?.city || '')}</span></p>
        <p>Country: <span class="json-country">${escapeHtml(info.address?.country || '')}</span></p>
    `;
    console.log("Contact info loaded");
}

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

// Render documents with optional filtering
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
                        ${doc.viewable !== false ? `<button class="btn view-document" data-path="${escapeHtml(doc.path)}">View</button>` : ''}
                        ${doc.downloadable !== false ? `<a href="${escapeHtml(doc.path)}" download><button class="btn">Download</button></a>` : ''}
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
            if (typeof openModal === 'function') {
                openModal(path);
            } else {
                window.open(path, '_blank');
            }
        });
    });
}

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
                ${project.link ? `<a href="${project.link}" target="_blank" class="btn"> Explore </a>` : ''}
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
    console.log(`${projects.length} projects loaded`);
}

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
                <p><strong>Stand:</strong> ${legal.sections.changes.lastUpdated}</p>
            </div>
        </section>`;
    }
    
    container.innerHTML = html;
    console.log("Privacy policy rendered");
}

// ==================== HELPER FUNCTIONS ====================

function setText(selector, text) {
    if (!text) return;
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showError(message) {
    const containers = ['json-work-experience', 'json-education', 'json-skills', 'json-interests', 'documents-grid', 'projects-container', 'impressum-content', 'datenschutz-content'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el && (el.innerHTML === '' || el.querySelector('.json-loading'))) {
            el.innerHTML = `<div class="json-error">${message}</div>`;
        }
    });
}

// ==================== MAIN INIT ====================

async function init() {
    console.log("CV Loader initializing...");
    
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

document.addEventListener('DOMContentLoaded', init);

window.reloadCVData = () => init();
window.testJSON = () => {
    alert(`JSON Status:\nResume: ${siteData.resume ? 'OK' : 'Missing'}\nPageContent: ${siteData.pageContent ? 'OK' : 'Missing'}\nDocuments: ${siteData.documents ? 'OK' : 'Missing'}\nProjects: ${siteData.projects ? 'OK' : 'Missing'}\nConfig: ${siteData.config ? 'OK' : 'Missing'}\nLegal: ${siteData.legal ? 'OK' : 'Missing'}`);
};