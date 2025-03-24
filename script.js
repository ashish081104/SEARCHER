document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const advancedToggle = document.querySelector('.advanced-toggle');
    const advancedContent = document.querySelector('.advanced-content');
    const jobdivaOptions = document.querySelector('.jobdiva-options');
    const jobdivaTips = document.querySelector('.jobdiva-tips');
    const portal = document.getElementById('portal');
    const generateBtn = document.getElementById('generate-btn');
    const extractBtn = document.getElementById('extract-btn');
    const output = document.getElementById('output');
    const copyBtn = document.getElementById('copy-btn');
    const saveBtn = document.getElementById('save-btn');
    const historyList = document.getElementById('history-list');
    const profilesList = document.getElementById('profiles-list');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const profileName = document.getElementById('profile-name');
    const resumeFreshness = document.getElementById('resume-freshness');
    const freshnessValue = document.getElementById('freshness-value');
    const addProximityBtn = document.getElementById('add-proximity-btn');

    // Initialize - show manual tab by default
    document.getElementById('manual-tab').style.display = 'block';
    document.getElementById('manual-tab').classList.add('active-tab');
    
    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and hide all tab content
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active-tab'));
            tabContents.forEach(c => c.style.display = 'none');
            
            // Add active class to clicked button and show corresponding content
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active-tab');
            document.getElementById(tabId).style.display = 'block';
        });
    });
    
    // Toggle Advanced Options
    advancedToggle.addEventListener('click', () => {
        advancedContent.classList.toggle('hidden');
        const icon = advancedToggle.querySelector('i');
        if (advancedContent.classList.contains('hidden')) {
            advancedToggle.querySelector('span').textContent = 'Show Advanced Options';
            icon.className = 'fas fa-chevron-down';
        } else {
            advancedToggle.querySelector('span').textContent = 'Hide Advanced Options';
            icon.className = 'fas fa-chevron-up';
        }
    });
    
    // Toggle JobDiva Options based on portal selection
    portal.addEventListener('change', () => {
        if (portal.value === 'jobdiva') {
            jobdivaOptions.classList.remove('hidden');
            jobdivaTips.classList.remove('hidden');
        } else {
            jobdivaOptions.classList.add('hidden');
            jobdivaTips.classList.add('hidden');
        }
    });
    
    // Initialize JobDiva options visibility
    if (portal.value === 'jobdiva') {
        jobdivaOptions.classList.remove('hidden');
        jobdivaTips.classList.remove('hidden');
    }
    
    // Resume Freshness Slider
    if (resumeFreshness && freshnessValue) {
        resumeFreshness.addEventListener('input', () => {
            freshnessValue.textContent = resumeFreshness.value;
        });
    }
    
    // Proximity Search Builder
    if (addProximityBtn) {
        addProximityBtn.addEventListener('click', () => {
            const term1 = document.getElementById('term1').value.trim();
            const term2 = document.getElementById('term2').value.trim();
            const distance = document.getElementById('proximity-distance').value;
            
            if (term1 && term2) {
                const proximitySearch = `("${term1}" ~${distance} "${term2}")`;
                
                // Add to skills input if it exists
                const skillsInput = document.getElementById('skills');
                if (skillsInput) {
                    const currentSkills = skillsInput.value.trim();
                    skillsInput.value = currentSkills ? `${currentSkills}, ${proximitySearch}` : proximitySearch;
                }
                
                showNotification('Proximity search added to skills', 'success');
            } else {
                showNotification('Please enter both terms for proximity search', 'error');
            }
        });
    }
    
    // Save Profile
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const name = profileName.value.trim();
            if (!name) {
                showNotification('Please enter a profile name', 'error');
                return;
            }
            
            // Get all form values
            const profile = {
                name: name,
                portal: portal.value,
                searchMode: document.getElementById('search-mode').value,
                jobTitles: document.getElementById('job-title').value,
                skills: document.getElementById('skills').value,
                experience: document.getElementById('experience').value,
                education: document.getElementById('education').value,
                certifications: document.getElementById('certifications').value,
                location: document.getElementById('location').value,
                excludeTerms: document.getElementById('exclude-terms').value,
                // JobDiva specific options
                jobdivaSearchMode: document.getElementById('jobdiva-search-mode')?.value,
                prioritySkills: document.getElementById('jobdiva-priority-skills')?.value,
                resumeFreshness: resumeFreshness?.value,
                resumeQuality: document.querySelector('input[name="resume-quality"]:checked')?.value,
                resumesOnly: document.getElementById('filter-resumes-only')?.checked,
                availableCandidates: document.getElementById('filter-available-candidates')?.checked,
                jobdivaExcludeTerms: document.getElementById('jobdiva-exclude-terms')?.value
            };
            
            // Save to localStorage
            const profiles = JSON.parse(localStorage.getItem('searchProfiles') || '[]');
            profiles.push(profile);
            localStorage.setItem('searchProfiles', JSON.stringify(profiles));
            
            // Update UI
            loadProfiles();
            showNotification('Profile saved successfully', 'success');
            profileName.value = '';
        });
    }
    
    // Load Profiles
    function loadProfiles() {
        if (!profilesList) return;
        
        const profiles = JSON.parse(localStorage.getItem('searchProfiles') || '[]');
        profilesList.innerHTML = '';
        
        if (profiles.length === 0) {
            profilesList.innerHTML = '<li class="empty-profiles">No saved profiles</li>';
            return;
        }
        
        profiles.forEach((profile, index) => {
            const li = document.createElement('li');
            li.className = 'profile-item';
            li.innerHTML = `
                <div class="profile-info">
                    <span class="profile-name">${profile.name}</span>
                    <span class="profile-portal">${profile.portal.toUpperCase()}</span>
                </div>
                <div class="profile-actions">
                    <button class="load-profile" data-index="${index}">
                        <i class="fas fa-upload"></i> Load
                    </button>
                    <button class="delete-profile" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            profilesList.appendChild(li);
        });
        
        // Add event listeners to load and delete buttons
        document.querySelectorAll('.load-profile').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.getAttribute('data-index');
                loadProfile(profiles[index]);
            });
        });
        
        document.querySelectorAll('.delete-profile').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.getAttribute('data-index');
                profiles.splice(index, 1);
                localStorage.setItem('searchProfiles', JSON.stringify(profiles));
                loadProfiles();
                showNotification('Profile deleted', 'success');
            });
        });
    }
    
    // Load a profile into the form
    function loadProfile(profile) {
        portal.value = profile.portal;
        document.getElementById('search-mode').value = profile.searchMode;
        document.getElementById('job-title').value = profile.jobTitles;
        document.getElementById('skills').value = profile.skills;
        document.getElementById('experience').value = profile.experience;
        document.getElementById('education').value = profile.education;
        document.getElementById('certifications').value = profile.certifications;
        document.getElementById('location').value = profile.location;
        document.getElementById('exclude-terms').value = profile.excludeTerms;
        
        // JobDiva specific options
        if (profile.portal === 'jobdiva') {
            jobdivaOptions.classList.remove('hidden');
            jobdivaTips.classList.remove('hidden');
            
            if (document.getElementById('jobdiva-search-mode')) {
                document.getElementById('jobdiva-search-mode').value = profile.jobdivaSearchMode || 'balanced';
            }
            
            if (document.getElementById('jobdiva-priority-skills')) {
                document.getElementById('jobdiva-priority-skills').value = profile.prioritySkills || '';
            }
            
            if (resumeFreshness) {
                resumeFreshness.value = profile.resumeFreshness || 180;
                if (freshnessValue) freshnessValue.textContent = resumeFreshness.value;
            }
            
            const qualityRadios = document.querySelectorAll('input[name="resume-quality"]');
            qualityRadios.forEach(radio => {
                if (radio.value === (profile.resumeQuality || 'high')) {
                    radio.checked = true;
                }
            });
            
            if (document.getElementById('filter-resumes-only')) {
                document.getElementById('filter-resumes-only').checked = profile.resumesOnly !== false;
            }
            
            if (document.getElementById('filter-available-candidates')) {
                document.getElementById('filter-available-candidates').checked = profile.availableCandidates || false;
            }
            
            if (document.getElementById('jobdiva-exclude-terms')) {
                document.getElementById('jobdiva-exclude-terms').value = profile.jobdivaExcludeTerms || '';
            }
        } else {
            jobdivaOptions.classList.add('hidden');
            jobdivaTips.classList.add('hidden');
        }
        
        showNotification('Profile loaded successfully', 'success');
    }
    
    // Initialize profiles
    loadProfiles();
    
    // Extract Requirements from Job Description
    extractBtn.addEventListener('click', function() {
        console.log('Extract button clicked'); // Debug log
        const jobDescription = document.getElementById('job-description').value.trim();
        
        if (!jobDescription) {
            showNotification('Please enter a job description', 'error');
            return;
        }
        
        // Simulate AI extraction with some basic regex patterns
        // In a real app, this would be connected to an AI service
        const extractedTitles = extractJobTitles(jobDescription);
        const extractedSkills = extractSkills(jobDescription);
        const extractedExperience = extractExperience(jobDescription);
        const extractedEducation = extractEducation(jobDescription);
        const extractedCertifications = extractCertifications(jobDescription);
        
        // Display extracted data
        document.getElementById('extracted-titles').textContent = extractedTitles.join(', ') || 'None found';
        document.getElementById('extracted-skills').textContent = extractedSkills.join(', ') || 'None found';
        document.getElementById('extracted-experience').textContent = extractedExperience || 'Not specified';
        document.getElementById('extracted-education').textContent = extractedEducation.join(', ') || 'None found';
        document.getElementById('extracted-certifications').textContent = extractedCertifications.join(', ') || 'None found';
        
        // Show the extracted data section
        const extractedDataSection = document.querySelector('.extracted-data');
        if (extractedDataSection) {
            extractedDataSection.classList.remove('hidden');
            showNotification('Requirements extracted successfully', 'success');
        } else {
            console.error('Could not find extracted-data element');
            showNotification('Error displaying extracted data', 'error');
        }
    });
    
    // Generate Search String
    generateBtn.addEventListener('click', () => {
        let jobTitles, skills, experience, education, certifications, location, excludeTerms;
        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        const portal = document.getElementById('portal').value;
        const searchMode = document.getElementById('search-mode').value;
        
        // Get values based on active tab
        if (activeTab === 'manual-tab') {
            // Manual entry tab
            jobTitles = document.getElementById('job-titles').value.split(',').map(item => item.trim()).filter(Boolean);
            skills = document.getElementById('skills').value.split(',').map(item => item.trim()).filter(Boolean);
            experience = document.getElementById('experience').value.trim();
            education = document.getElementById('education').value.split(',').map(item => item.trim()).filter(Boolean);
            certifications = document.getElementById('certifications').value.split(',').map(item => item.trim()).filter(Boolean);
        } else {
            // Job description tab - use extracted data
            jobTitles = document.getElementById('extracted-titles').textContent.split(',').map(item => item.trim()).filter(item => item !== 'None found');
            skills = document.getElementById('extracted-skills').textContent.split(',').map(item => item.trim()).filter(item => item !== 'None found');
            experience = document.getElementById('extracted-experience').textContent !== 'Not specified' ? document.getElementById('extracted-experience').textContent : '';
            education = document.getElementById('extracted-education').textContent.split(',').map(item => item.trim()).filter(item => item !== 'None found');
            certifications = document.getElementById('extracted-certifications').textContent.split(',').map(item => item.trim()).filter(item => item !== 'None found');
        }
        
        // Common fields for both tabs
        location = document.getElementById('location').value.trim();
        excludeTerms = document.getElementById('exclude').value.split(',').map(item => item.trim()).filter(Boolean);
        
        // Validate input
        if (jobTitles.length === 0 && skills.length === 0) {
            showNotification('Please enter at least job titles or skills', 'warning');
            return;
        }
        
        // Generate search string based on selected portal
        const searchString = generateSearchString({
            portal,
            searchMode,
            jobTitles,
            skills,
            experience,
            education,
            certifications,
            location,
            excludeTerms
        });
        
        // Display the generated search string
        output.textContent = searchString;
        showNotification('Search string generated successfully', 'success');
    });
    
    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        const searchString = output.textContent;
        if (searchString && searchString !== 'Your search string will appear here...') {
            navigator.clipboard.writeText(searchString)
                .then(() => {
                    showNotification('Copied to clipboard!', 'success');
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                    showNotification('Failed to copy to clipboard', 'error');
                });
        } else {
            showNotification('Nothing to copy', 'warning');
        }
    });
    
    // Save to History
    saveBtn.addEventListener('click', () => {
        const searchString = output.textContent;
        if (searchString && searchString !== 'Your search string will appear here...') {
            const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            const timestamp = new Date().toLocaleString();
            const portal = document.getElementById('portal').value;
            const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
            
            // Create history entry
            const historyEntry = {
                id: Date.now(),
                timestamp,
                portal,
                searchString,
                source: activeTab === 'manual-tab' ? 'Manual Entry' : 'Job Description'
            };
            
            // Add to history and save
            searchHistory.unshift(historyEntry);
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 20))); // Keep only last 20
            
            showNotification('Saved to history', 'success');
        } else {
            showNotification('Nothing to save', 'warning');
        }
    });
    
    // Helper Functions
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = document.createElement('i');
        switch(type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle';
                break;
            default:
                icon.className = 'fas fa-info-circle';
        }
        
        const textSpan = document.createElement('span');
        textSpan.textContent = message;
        
        notification.appendChild(icon);
        notification.appendChild(textSpan);
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Extraction Functions
    function extractJobTitles(text) {
        const commonTitles = [
            'Software Engineer', 'Developer', 'Programmer', 'Web Developer',
            'Frontend', 'Backend', 'Full Stack', 'DevOps', 'SRE', 'Data Scientist',
            'Machine Learning', 'AI', 'Product Manager', 'Project Manager',
            'UX Designer', 'UI Designer', 'QA Engineer', 'Test Engineer',
            'Systems Administrator', 'Network Engineer', 'Database Administrator',
            'Security Engineer', 'Cloud Engineer', 'Architect', 'Java Developer'
        ];
        
        const titles = [];
        commonTitles.forEach(title => {
            // Fix: Properly escape the word boundary in regex
            if (new RegExp(`\\b${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) {
                titles.push(title);
            }
        });
        
        // Look for job title in the beginning of the text
        const titleMatch = text.match(/^\s*([\w\s]+)(?:\n|:)/i);
        if (titleMatch && titleMatch[1].trim()) {
            titles.unshift(titleMatch[1].trim());
        }
        
        return [...new Set(titles)]; // Remove duplicates
    }
    
    function extractSkills(text) {
        const commonSkills = [
            'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Ruby', 'PHP', 'Go', 'Rust',
            'HTML', 'CSS', 'SASS', 'LESS', 'React', 'Angular', 'Vue', 'Svelte', 'jQuery',
            'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET', 'Laravel', 'Ruby on Rails',
            'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'SQLite', 'Redis', 'Elasticsearch',
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CircleCI', 'GitHub Actions',
            'Git', 'SVN', 'Mercurial', 'Jira', 'Confluence', 'Agile', 'Scrum', 'Kanban',
            'REST', 'GraphQL', 'gRPC', 'WebSockets', 'Microservices', 'Serverless',
            'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn', 'Pandas', 'NumPy',
            'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
            'Testing', 'Jest', 'Mocha', 'Cypress', 'Selenium', 'JUnit', 'pytest',
            'Java 8', 'Spring Boot', 'Spring Framework', 'Spring MVC', 'Spring Cloud'
        ];
        
        const skills = [];
        commonSkills.forEach(skill => {
            // Fix: Properly escape the word boundary and special characters in regex
            if (new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) {
                skills.push(skill);
            }
        });
        
        // Look for skills in requirements section
        const requirementsMatch = text.match(/requirements?:|qualifications?:|skills?:|what you('ll| will) need/i);
        if (requirementsMatch) {
            const requirementsIndex = text.indexOf(requirementsMatch[0]);
            const nextSectionMatch = text.substring(requirementsIndex + 1).match(/\n\s*[a-z\s]+:\s*\n/i);
            const requirementsText = nextSectionMatch ? 
                text.substring(requirementsIndex, requirementsIndex + nextSectionMatch.index + 1) : 
                text.substring(requirementsIndex);
                
            // Extract bullet points
            const bulletPoints = requirementsText.match(/[•\-\*]\s*([^\n]+)/g);
            if (bulletPoints) {
                bulletPoints.forEach(point => {
                    commonSkills.forEach(skill => {
                        // Fix: Properly escape the word boundary and special characters in regex
                        if (new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(point)) {
                            skills.push(skill);
                        }
                    });
                });
            }
        }
        
        return [...new Set(skills)]; // Remove duplicates
    }
    
    function extractExperience(text) {
        // Look for years of experience
        const experienceMatches = text.match(/\b(\d+)[\+\-]?\s*(to|-)\s*(\d+)\s*(\+\s*)?years?\b|\b(\d+)\s*(\+\s*)?years?\b/gi);
        
        if (experienceMatches) {
            // Get the first match
            const match = experienceMatches[0];
            
            // Check if it's a range (e.g., "3-5 years" or "3 to 5 years")
            const rangeMatch = match.match(/(\d+)[\+\-]?\s*(to|-)\s*(\d+)\s*(\+\s*)?years?/i);
            if (rangeMatch) {
                return `${rangeMatch[1]}-${rangeMatch[3]} years`;
            }
            
            // Check if it's a single value (e.g., "5 years" or "5+ years")
            const singleMatch = match.match(/(\d+)\s*(\+\s*)?years?/i);
            if (singleMatch) {
                return singleMatch[2] ? `${singleMatch[1]}+ years` : `${singleMatch[1]} years`;
            }
        }
        
        return '';
    }
    
    function extractEducation(text) {
        const educationKeywords = [
            'Bachelor', 'BS', 'B\.S', 'B\.A', 'BA', 'BSc', 'B\.Sc',
            'Master', 'MS', 'M\.S', 'MA', 'M\.A', 'MSc', 'M\.Sc',
            'PhD', 'Ph\.D', 'Doctorate',
            'Computer Science', 'CS', 'Information Technology', 'IT',
            'Software Engineering', 'Computer Engineering',
            'Electrical Engineering', 'EE', 'Data Science'
        ];
        
        const education = [];
        
        // Look for education keywords
        educationKeywords.forEach(keyword => {
            // Fix: Properly escape the word boundary in regex
            if (new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) {
                education.push(keyword);
            }
        });
        
        // Look for degree requirements
        const degreeMatch = text.match(/\b(bachelor'?s?|master'?s?|phd|doctorate|degree)\s+(in|of)\s+([\w\s]+)/gi);
        if (degreeMatch) {
            degreeMatch.forEach(match => {
                education.push(match.trim());
            });
        }
        
        return [...new Set(education)]; // Remove duplicates
    }
    
    function extractCertifications(text) {
        const commonCertifications = [
            'AWS Certified', 'Azure Certified', 'GCP Certified',
            'MCSD', 'MCSE', 'MCP', 'CCNA', 'CCNP', 'CCIE',
            'CompTIA', 'A\+', 'Network\+', 'Security\+',
            'PMP', 'CAPM', 'Scrum Master', 'CSM', 'SAFe',
            'CISSP', 'CEH', 'CISM', 'CISA',
            'Oracle Certified', 'Java Certified'
        ];
        
        const certifications = [];
        commonCertifications.forEach(cert => {
            // Fix: Properly escape the word boundary and special characters in regex
            if (new RegExp(`\\b${cert.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) {
                certifications.push(cert);
            }
        });
        
        return [...new Set(certifications)]; // Remove duplicates
    }
    
    // Search String Generation
    function generateSearchString(params) {
        const { portal, searchMode } = params;
        
        switch (portal) {
            case 'linkedin':
                return generateLinkedInString(params);
            case 'indeed':
                return generateIndeedString(params);
            case 'monster':
                return generateMonsterString(params);
            case 'dice':
                return generateDiceString(params);
            case 'jobdiva':
                return generateJobDivaString(params);
            case 'generic':
            default:
                return generateGenericString(params);
        }
    }
    
    function generateLinkedInString(params) {
        const { 
            searchMode, 
            jobTitles, 
            skills, 
            experience, 
            education, 
            certifications, 
            location, 
            excludeTerms 
        } = params;
        
        let searchString = '';
        
        // Job Titles
        if (jobTitles.length > 0) {
            if (searchMode === 'inclusive') {
                searchString += `(${jobTitles.map(title => `"${title}"`).join(' OR ')})`;
            } else {
                searchString += jobTitles.map(title => `"${title}"`).join(' ');
            }
        }
        
        // Skills
        if (skills.length > 0) {
            if (searchString) searchString += ' ';
            
            if (searchMode === 'inclusive') {
                // Group skills with OR
                searchString += `(${skills.map(skill => `"${skill}"`).join(' OR ')})`;
            } else {
                // All skills required
                searchString += skills.map(skill => `"${skill}"`).join(' ');
            }
        }
        
        // Experience
        if (experience) {
            if (searchString) searchString += ' ';
            searchString += `"${experience} experience"`;
        }
        
        // Education
        if (education.length > 0) {
            if (searchString) searchString += ' ';
            if (searchMode === 'inclusive') {
                searchString += `(${education.map(edu => `"${edu}"`).join(' OR ')})`;
            } else {
                searchString += education.map(edu => `"${edu}"`).join(' ');
            }
        }
        
        // Certifications
        if (certifications.length > 0) {
            if (searchString) searchString += ' ';
            if (searchMode === 'inclusive') {
                searchString += `(${certifications.map(cert => `"${cert}"`).join(' OR ')})`;
            } else {
                searchString += certifications.map(cert => `"${cert}"`).join(' ');
            }
        }
        
        // Location - LinkedIn has specific location filters in UI, but we can add it to search
        if (location) {
            if (searchString) searchString += ' ';
            searchString += `"${location}"`;
        }
        
        // Exclude Terms
        if (excludeTerms.length > 0) {
            excludeTerms.forEach(term => {
                searchString += ` -"${term}"`;
            });
        }
        
        return searchString;
    }
    
    function generateIndeedString(params) {
        const { 
            searchMode, 
            jobTitles, 
            skills, 
            experience, 
            education, 
            certifications, 
            location, 
            excludeTerms 
        } = params;
        
        let searchString = '';
        
        // Job Titles
        if (jobTitles.length > 0) {
            if (searchMode === 'inclusive') {
                searchString += `(${jobTitles.map(title => `"${title}"`).join(' OR ')})`;
            } else {
                searchString += `(${jobTitles.map(title => `"${title}"`).join(' AND ')})`;
            }
        }
        
        // Skills
        if (skills.length > 0) {
            if (searchString) searchString += ' AND ';
            
            if (searchMode === 'inclusive') {
                // Group skills with OR
                searchString += `(${skills.map(skill => `"${skill}"`).join(' OR ')})`;
            } else {
                // All skills required
                searchString += `(${skills.map(skill => `"${skill}"`).join(' AND ')})`;
            }
        }
        
        // Experience
        if (experience) {
            if (searchString) searchString += ' AND ';
            searchString += `"${experience} experience"`;
        }
        
        // Education
        if (education.length > 0) {
            if (searchString) searchString += ' AND ';
            if (searchMode === 'inclusive') {
                searchString += `(${education.map(edu => `"${edu}"`).join(' OR ')})`;
            } else {
                searchString += `(${education.map(edu => `"${edu}"`).join(' AND ')})`;
            }
        }
        
        // Certifications
        if (certifications.length > 0) {
            if (searchString) searchString += ' AND ';
            if (searchMode === 'inclusive') {
                searchString += `(${certifications.map(cert => `"${cert}"`).join(' OR ')})`;
            } else {
                searchString += `(${certifications.map(cert => `"${cert}"`).join(' AND ')})`;
            }
        }
        
        // Location - Indeed has specific location filters in UI, but we can add it to search
        if (location) {
            if (searchString) searchString += ' AND ';
            searchString += `"${location}"`;
        }
        
        // Exclude Terms
        if (excludeTerms.length > 0) {
            excludeTerms.forEach(term => {
                searchString += ` -"${term}"`;
            });
        }
        
        return searchString;
    }
    
    function generateMonsterString(params) {
        // Similar to generic boolean search
        return generateGenericString(params);
    }
    
    function generateDiceString(params) {
        // Similar to generic boolean search
        return generateGenericString(params);
    }
    
    function generateJobDivaString(params) {
        const { 
            searchMode, 
            jobTitles, 
            skills, 
            experience, 
            education, 
            certifications, 
            location, 
            excludeTerms 
        } = params;
        
        // Get JobDiva-specific options
        const jobdivaSearchMode = document.getElementById('jobdiva-search-mode')?.value || 'balanced';
        const prioritySkills = document.getElementById('jobdiva-priority-skills')?.value.split(',').map(item => item.trim()).filter(Boolean) || [];
        const resumeFreshness = document.getElementById('resume-freshness')?.value || 180;
        const resumeQuality = document.querySelector('input[name="resume-quality"]:checked')?.value || 'high';
        const resumesOnly = document.getElementById('filter-resumes-only')?.checked !== false;
        const availableCandidates = document.getElementById('filter-available-candidates')?.checked || false;
        const jobdivaExcludeTerms = document.getElementById('jobdiva-exclude-terms')?.value.split(',').map(item => item.trim()).filter(Boolean) || [];
        
        let searchString = '';
        
        // JobDiva uses specific syntax for exact matches and proximity searches
        // We'll use ~N for proximity searches where N is the number of words between terms
        // We'll use exact: for exact phrase matching with higher precision
        
        // Job Titles - Use exact match with proximity for multi-word titles
        if (jobTitles.length > 0) {
            const titleParts = [];
            
            jobTitles.forEach(title => {
                // For multi-word titles, use proximity search with tight proximity
                const words = title.split(/\s+/).filter(Boolean);
                if (words.length > 1) {
                    // Use exact match for higher precision
                    titleParts.push(`exact:"${title}"`);
                    
                    // Also add proximity search as fallback with different word orders
                    const proximitySearch = words.map(word => `"${word}"`).join(' ~2 ');
                    titleParts.push(`(${proximitySearch})`);
                } else {
                    titleParts.push(`"${title}"`);
                }
            });
            
            // Combine with OR for different titles
            searchString += `(${titleParts.join(' OR ')})`;
        }
        
        // Skills - Handle differently based on priority and search mode
        if (skills.length > 0) {
            if (searchString) searchString += ' AND ';
            
            // Split skills into priority and regular
            const regularSkills = skills.filter(skill => !prioritySkills.includes(skill));
            
            // Process priority skills first - these must be present
            if (prioritySkills.length > 0) {
                const priorityParts = prioritySkills.map(skill => {
                    // For multi-word skills, use proximity search with tight proximity
                    const words = skill.split(/\s+/).filter(Boolean);
                    if (words.length > 1) {
                        return `(exact:"${skill}" OR (${words.map(word => `"${word}"`).join(' ~1 ')}))`;                        
                    } else {
                        return `"${skill}"`;                        
                    }
                });
                
                // All priority skills are required
                searchString += `(${priorityParts.join(' AND ')})`;
                
                // Add regular skills with appropriate operator based on search mode
                if (regularSkills.length > 0) {
                    searchString += ' AND ';
                }
            }
            
            // Process regular skills
            if (regularSkills.length > 0) {
                const skillParts = regularSkills.map(skill => {
                    // For multi-word skills, use proximity search
                    const words = skill.split(/\s+/).filter(Boolean);
                    if (words.length > 1) {
                        return `(exact:"${skill}" OR (${words.map(word => `"${word}"`).join(' ~2 ')}))`;                        
                    } else {
                        return `"${skill}"`;                        
                    }
                });
                
                // Combine based on search mode
                if (jobdivaSearchMode === 'strict') {
                    // All skills required
                    searchString += `(${skillParts.join(' AND ')})`;
                } else if (jobdivaSearchMode === 'balanced') {
                    // For balanced approach, use a mix of AND/OR with required minimum match count
                    if (skillParts.length > 3) {
                        // For many skills, require at least 75% of them
                        const requiredCount = Math.max(1, Math.ceil(skillParts.length * 0.75));
                        searchString += `(${requiredCount} of (${skillParts.join(', ')}))`;                        
                    } else {
                        // For few skills, require all
                        searchString += `(${skillParts.join(' AND ')})`;
                    }
                } else {
                    // For flexible approach, use a mix of AND/OR with lower required minimum match count
                    if (skillParts.length > 3) {
                        // For many skills, require at least 50% of them
                        const requiredCount = Math.max(1, Math.ceil(skillParts.length * 0.5));
                        searchString += `(${requiredCount} of (${skillParts.join(', ')}))`;                        
                    } else {
                        // For few skills, require at least one
                        searchString += `(${skillParts.join(' OR ')})`;
                    }
                }
            }
        }
        
        // Experience
        if (experience) {
            if (searchString) searchString += ' AND ';
            
            // Create variations to catch different ways experience might be written
            const expVariations = [
                `"${experience} experience"`,
                `"${experience}+ years"`,
                `"${experience}+ year"`,
                `"${experience} yr"`,
                `"${experience} yrs"`
            ];
            
            searchString += `(${expVariations.join(' OR ')})`;
        }
        
        // Education
        if (education.length > 0) {
            if (searchString) searchString += ' AND ';
            
            const eduParts = education.map(edu => `"${edu}"`);
            
            if (jobdivaSearchMode === 'strict' || jobdivaSearchMode === 'balanced') {
                searchString += `(${eduParts.join(' AND ')})`;
            } else {
                searchString += `(${eduParts.join(' OR ')})`;
            }
        }
        
        // Certifications
        if (certifications.length > 0) {
            if (searchString) searchString += ' AND ';
            
            const certParts = certifications.map(cert => `"${cert}"`);
            
            if (jobdivaSearchMode === 'strict') {
                searchString += `(${certParts.join(' AND ')})`;
            } else {
                searchString += `(${certParts.join(' OR ')})`;
            }
        }
        
        // Location
        if (location) {
            if (searchString) searchString += ' AND ';
            searchString += `"${location}"`;
        }
        
        // Combine all exclude terms
        const allExcludeTerms = [...excludeTerms, ...jobdivaExcludeTerms];
        
        // Exclude Terms
        if (allExcludeTerms.length > 0) {
            allExcludeTerms.forEach(term => {
                searchString += ` NOT "${term}"`;
            });
        }
        
        // Add JobDiva-specific filters
        if (resumeFreshness) {
            searchString += ` AND "resume.fresh:${resumeFreshness}"`;
        }
        
        if (resumeQuality && resumeQuality !== 'any') {
            searchString += ` AND "resume.quality:${resumeQuality}"`;
        }
        
        if (resumesOnly) {
            searchString += ' AND "document.type:resume"';
        }
        
        if (availableCandidates) {
            searchString += ' AND "candidate.status:available"';
        }
        
        return searchString;
    }
    
    function generateGenericString(params) {
        const { 
            searchMode, 
            jobTitles, 
            skills, 
            experience, 
            education, 
            certifications, 
            location, 
            excludeTerms 
        } = params;
        
        let searchString = '';
        
        // Job Titles
        if (jobTitles.length > 0) {
            if (searchMode === 'inclusive') {
                searchString += `(${jobTitles.map(title => `"${title}"`).join(' OR ')})`;
            } else {
                searchString += `(${jobTitles.map(title => `"${title}"`).join(' AND ')})`;
            }
        }
        
        // Skills
        if (skills.length > 0) {
            if (searchString) searchString += ' AND ';
            
            if (searchMode === 'inclusive') {
                // Group skills with OR
                searchString += `(${skills.map(skill => `"${skill}"`).join(' OR ')})`;
            } else {
                // All skills required
                searchString += `(${skills.map(skill => `"${skill}"`).join(' AND ')})`;
            }
        }
        
        // Experience
        if (experience) {
            if (searchString) searchString += ' AND ';
            searchString += `"${experience} experience"`;
        }
        
        // Education
        if (education.length > 0) {
            if (searchString) searchString += ' AND ';
            if (searchMode === 'inclusive') {
                searchString += `(${education.map(edu => `"${edu}"`).join(' OR ')})`;
            } else {
                searchString += `(${education.map(edu => `"${edu}"`).join(' AND ')})`;
            }
        }
        
        // Certifications
        if (certifications.length > 0) {
            if (searchString) searchString += ' AND ';
            if (searchMode === 'inclusive') {
                searchString += `(${certifications.map(cert => `"${cert}"`).join(' OR ')})`;
            } else {
                searchString += `(${certifications.map(cert => `"${cert}"`).join(' AND ')})`;
            }
        }
        
        // Location
        if (location) {
            if (searchString) searchString += ' AND ';
            searchString += `"${location}"`;
        }
        
        // Exclude Terms
        if (excludeTerms.length > 0) {
            excludeTerms.forEach(term => {
                searchString += ` NOT "${term}"`;
            });
        }
        
        return searchString;
    }
});
