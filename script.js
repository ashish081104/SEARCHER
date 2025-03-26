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
                    
                    // Automatically trigger the generate button click to update the search string
                    if (generateBtn) {
                        generateBtn.click();
                    }
                    
                    // Clear the proximity search inputs for next entry
                    document.getElementById('term1').value = '';
                    document.getElementById('term2').value = '';
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
        const context = document.getElementById('context').value;
        
        console.log('Generate button clicked, active tab:', activeTab); // Debug log
        
        // Get values based on active tab
        if (activeTab === 'manual-tab') {
            // Manual entry tab
            jobTitles = document.getElementById('job-title').value.split(',').map(item => item.trim()).filter(Boolean);
            skills = document.getElementById('skills').value.split(',').map(item => item.trim()).filter(Boolean);
            experience = document.getElementById('experience').value.trim();
            education = document.getElementById('education').value.split(',').map(item => item.trim()).filter(Boolean);
            certifications = document.getElementById('certifications').value.split(',').map(item => item.trim()).filter(Boolean);
        } else {
            // Job description tab - use extracted data
            const extractedTitlesText = document.getElementById('extracted-titles').textContent;
            const extractedSkillsText = document.getElementById('extracted-skills').textContent;
            const extractedExpText = document.getElementById('extracted-experience').textContent;
            const extractedEduText = document.getElementById('extracted-education').textContent;
            const extractedCertText = document.getElementById('extracted-certifications').textContent;
            
            console.log('Extracted data:', {
                titles: extractedTitlesText,
                skills: extractedSkillsText,
                experience: extractedExpText,
                education: extractedEduText,
                certifications: extractedCertText
            }); // Debug log
            
            jobTitles = extractedTitlesText !== 'None found' ? extractedTitlesText.split(',').map(item => item.trim()).filter(Boolean) : [];
            skills = extractedSkillsText !== 'None found' ? extractedSkillsText.split(',').map(item => item.trim()).filter(Boolean) : [];
            experience = extractedExpText !== 'Not specified' ? extractedExpText : '';
            education = extractedEduText !== 'None found' ? extractedEduText.split(',').map(item => item.trim()).filter(Boolean) : [];
            certifications = extractedCertText !== 'None found' ? extractedCertText.split(',').map(item => item.trim()).filter(Boolean) : [];
        }
        
        // Common fields for both tabs
        location = document.getElementById('location').value.trim();
        excludeTerms = document.getElementById('exclude').value.split(',').map(item => item.trim()).filter(Boolean);
        
        console.log('Processed data for search string:', {
            jobTitles,
            skills,
            experience,
            education,
            certifications,
            location,
            excludeTerms
        }); // Debug log
        
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
            excludeTerms,
            context
        });
        
        console.log('Generated search string:', searchString); // Debug log
        
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
        // Job titles organized by categories for better context awareness
        const jobTitlesByCategory = {
            softwareDevelopment: [
                'Software Engineer', 'Developer', 'Programmer', 'Web Developer',
                'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 
                'Mobile Developer', 'iOS Developer', 'Android Developer',
                'Java Developer', 'Python Developer', 'JavaScript Developer',
                'React Developer', 'Angular Developer', 'Vue Developer',
                'Node.js Developer', '.NET Developer', 'C# Developer', 'PHP Developer',
                'Ruby Developer', 'Golang Developer', 'Scala Developer', 'Kotlin Developer',
                'Swift Developer', 'Rust Developer'
            ],
            dataScience: [
                'Data Scientist', 'Machine Learning Engineer', 'AI Engineer', 
                'Deep Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer',
                'Data Analyst', 'Business Analyst', 'Business Intelligence Analyst', 
                'BI Analyst', 'Data Engineer', 'Analytics Engineer', 'Reporting Analyst',
                'Quantitative Analyst', 'Research Scientist'
            ],
            devOps: [
                'DevOps Engineer', 'SRE', 'Site Reliability Engineer', 'Cloud Engineer',
                'Systems Administrator', 'Network Engineer', 'Database Administrator',
                'Platform Engineer', 'Infrastructure Engineer', 'Release Engineer',
                'Automation Engineer', 'Configuration Manager', 'AWS Engineer',
                'Azure Engineer', 'GCP Engineer', 'Kubernetes Engineer', 'Docker Specialist'
            ],
            security: [
                'Security Engineer', 'Information Security Analyst', 'Cybersecurity Specialist',
                'Security Architect', 'Penetration Tester', 'Ethical Hacker', 'Security Consultant',
                'Compliance Specialist', 'Security Operations Analyst', 'SOC Analyst'
            ],
            design: [
                'UX Designer', 'UI Designer', 'Product Designer', 'Interaction Designer',
                'Visual Designer', 'Graphic Designer', 'Web Designer', 'Mobile Designer'
            ],
            qualityAssurance: [
                'QA Engineer', 'Test Engineer', 'Quality Assurance Analyst', 'Test Analyst',
                'Automation Tester', 'Manual Tester', 'SDET', 'QA Lead'
            ],
            management: [
                'Product Manager', 'Project Manager', 'Technical Project Manager',
                'Program Manager', 'Scrum Master', 'Agile Coach', 'Engineering Manager',
                'Technical Lead', 'Team Lead', 'Development Manager', 'IT Manager',
                'CTO', 'CIO', 'VP of Engineering', 'Director of Engineering'
            ],
            architecture: [
                'Software Architect', 'Solutions Architect', 'System Architect', 
                'Enterprise Architect', 'Cloud Architect', 'Data Architect',
                'Security Architect', 'Network Architect', 'Infrastructure Architect',
                'Technical Architect', 'Architect'
            ]
        };
        
        // Flatten the job titles for searching
        const commonTitles = Object.values(jobTitlesByCategory).flat();
        
        // Check for seniority levels in the text
        const seniorityLevels = ['Junior', 'Mid', 'Senior', 'Lead', 'Principal', 'Staff'];
        const hasSeniorityIndicator = seniorityLevels.some(level => 
            new RegExp(`\\b${level.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
        );
        
        const titles = [];
        
        // First check for exact matches of job titles
        commonTitles.forEach(title => {
            if (new RegExp(`\\b${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) {
                titles.push(title);
            }
        });
        
        // If seniority is indicated, add seniority prefixes to relevant titles
        if (hasSeniorityIndicator) {
            seniorityLevels.forEach(level => {
                if (new RegExp(`\\b${level.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) {
                    // Get base titles that match the context
                    const matchingBaseTitles = titles.length > 0 ? titles : commonTitles;
                    
                    matchingBaseTitles.forEach(baseTitle => {
                        // Check if this specific seniority + title combination exists in the text
                        const seniorityTitle = `${level} ${baseTitle}`;
                        if (new RegExp(`\\b${seniorityTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) {
                            titles.push(seniorityTitle);
                        }
                    });
                }
            });
        }
        
        // Look for job title in the beginning of the text
        const titleMatch = text.match(/^\s*([\w\s]+)(?:\n|:)/i);
        if (titleMatch && titleMatch[1].trim()) {
            titles.unshift(titleMatch[1].trim());
        }
        
        // Look for phrases like "we need a "JOB TITLE" who..."
        const needMatch = text.match(/\bneed\s+a\s+["']?([\w\s]+)["']?\s+who/i);
        if (needMatch && needMatch[1].trim()) {
            titles.unshift(needMatch[1].trim());
        }
        
        // Look for phrases like "Job Title: X" or "Position: X"
        const jobTitleMatch = text.match(/(?:job title|position|role):\s*["']?([\w\s]+)["']?/i);
        if (jobTitleMatch && jobTitleMatch[1].trim()) {
            titles.unshift(jobTitleMatch[1].trim());
        }
        
        return [...new Set(titles)]; // Remove duplicates
    }
    
    function extractSkills(text) {
        // Comprehensive skills database organized by categories
        const skillsDatabase = {
            // Programming Languages
            programmingLanguages: [
                'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'Ruby', 'PHP', 'Go', 'Rust', 
                'Swift', 'Kotlin', 'Scala', 'Perl', 'Haskell', 'Clojure', 'Groovy', 'R', 'MATLAB', 'Objective-C',
                'Dart', 'Lua', 'Elixir', 'F#', 'COBOL', 'Fortran', 'Assembly', 'VBA', 'Delphi', 'PowerShell',
                'Bash', 'Shell', 'VB.NET', 'Visual Basic', 'PL/SQL', 'T-SQL', 'Julia'
            ],
            
            // Web Development
            webDevelopment: [
                'HTML', 'CSS', 'SASS', 'LESS', 'React', 'Angular', 'Vue', 'Svelte', 'jQuery', 'Bootstrap',
                'Tailwind CSS', 'Material UI', 'Chakra UI', 'Ember.js', 'Backbone.js', 'Next.js', 'Nuxt.js',
                'Gatsby', 'Redux', 'MobX', 'RxJS', 'Webpack', 'Babel', 'ESLint', 'Prettier', 'Vite', 'Parcel',
                'PWA', 'Web Components', 'Shadow DOM', 'Service Workers', 'WebSockets', 'WebRTC', 'Web Assembly',
                'Storybook', 'Styled Components', 'CSS Modules', 'CSS-in-JS', 'AJAX', 'Fetch API', 'Axios',
                'Progressive Enhancement', 'Responsive Design', 'Cross-browser Compatibility', 'SEO'
            ],
            
            // Backend Development
            backendDevelopment: [
                'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Spring Boot', 'ASP.NET', 'ASP.NET Core',
                'Laravel', 'Ruby on Rails', 'Phoenix', 'FastAPI', 'NestJS', 'Symfony', 'CodeIgniter', 'CakePHP',
                'Koa', 'Hapi', 'Sails.js', 'Meteor', 'Strapi', 'Adonis.js', 'Play Framework', 'Vert.x',
                'Quarkus', 'Micronaut', 'Gin', 'Echo', 'Fiber', 'Rocket', 'Actix', 'Axum', 'Dropwizard',
                'Jersey', 'Grails', 'Sinatra', 'Tornado', 'Pyramid', 'Bottle', 'Web2py', 'Vapor', 'Yii', 'Zend'
            ],
            
            // Databases
            databases: [
                'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'SQLite', 'Redis', 'Elasticsearch',
                'Microsoft SQL Server', 'MariaDB', 'Cassandra', 'DynamoDB', 'Couchbase', 'Firebase', 'Neo4j',
                'CouchDB', 'InfluxDB', 'Realm', 'RethinkDB', 'ArangoDB', 'H2', 'HSQLDB', 'Firebird', 'DB2',
                'Snowflake', 'BigQuery', 'Redshift', 'Teradata', 'Sybase', 'Informix', 'Memcached', 'Hazelcast',
                'Ignite', 'TiDB', 'CockroachDB', 'YugabyteDB', 'Supabase', 'PlanetScale', 'Fauna', 'Pinecone',
                'Clickhouse', 'TimescaleDB', 'Druid', 'HBase', 'Cosmos DB', 'Spanner', 'AlloyDB', 'Bigtable'
            ],
            
            // Cloud & DevOps
            cloudDevOps: [
                'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CircleCI', 'GitHub Actions',
                'GitLab CI/CD', 'Travis CI', 'Ansible', 'Chef', 'Puppet', 'SaltStack', 'Prometheus', 'Grafana',
                'ELK Stack', 'Logstash', 'Kibana', 'Datadog', 'New Relic', 'Splunk', 'Nagios', 'Zabbix', 'Consul',
                'Vault', 'Nomad', 'Packer', 'Vagrant', 'Istio', 'Envoy', 'Linkerd', 'Helm', 'ArgoCD', 'Fluentd',
                'OpenShift', 'Cloud Foundry', 'Heroku', 'Vercel', 'Netlify', 'Digital Ocean', 'Linode', 'Vultr',
                'Serverless Framework', 'OpenFaaS', 'Knative', 'CloudFormation', 'Pulumi', 'Crossplane'
            ],
            
            // Version Control & Project Management
            versionControlProjectManagement: [
                'Git', 'SVN', 'Mercurial', 'Jira', 'Confluence', 'Agile', 'Scrum', 'Kanban', 'Waterfall',
                'GitHub', 'GitLab', 'Bitbucket', 'Azure DevOps', 'Trello', 'Asana', 'Monday.com', 'ClickUp',
                'Notion', 'Basecamp', 'Pivotal Tracker', 'Redmine', 'YouTrack', 'Linear', 'Shortcut', 'Wrike',
                'Smartsheet', 'Airtable', 'Teamwork', 'Workfront', 'Zoho Projects', 'Teamgantt', 'Taiga',
                'Freedcamp', 'Targetprocess', 'Planview', 'Clarizen', 'LiquidPlanner', 'Mavenlink', 'Hive'
            ],
            
            // API & Architecture
            apiArchitecture: [
                'REST', 'GraphQL', 'gRPC', 'WebSockets', 'Microservices', 'Serverless', 'SOA', 'Event-Driven',
                'CQRS', 'Event Sourcing', 'Domain-Driven Design', 'Clean Architecture', 'Hexagonal Architecture',
                'Onion Architecture', 'MVC', 'MVP', 'MVVM', 'Flux', 'Redux', 'SOAP', 'OData', 'JSON-RPC',
                'XML-RPC', 'OpenAPI', 'Swagger', 'API Gateway', 'OAuth', 'JWT', 'SAML', 'OpenID Connect',
                'API First', 'Contract Testing', 'API Versioning', 'Rate Limiting', 'Throttling', 'Caching',
                'Idempotency', 'Pagination', 'Filtering', 'Sorting', 'HATEOAS', 'Richardson Maturity Model'
            ],
            
            // Data Science & AI
            dataScienceAI: [
                'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn', 'Pandas', 'NumPy', 'SciPy', 'Matplotlib',
                'Seaborn', 'Plotly', 'Dash', 'NLTK', 'spaCy', 'Gensim', 'Hugging Face', 'Transformers', 'BERT',
                'GPT', 'LLM', 'RAG', 'Machine Learning', 'Deep Learning', 'Neural Networks', 'CNN', 'RNN', 'LSTM',
                'GAN', 'Reinforcement Learning', 'NLP', 'Computer Vision', 'Speech Recognition', 'Time Series',
                'Anomaly Detection', 'Recommendation Systems', 'Clustering', 'Classification', 'Regression',
                'Dimensionality Reduction', 'Feature Engineering', 'Hyperparameter Tuning', 'Cross-Validation',
                'Transfer Learning', 'Ensemble Methods', 'Boosting', 'Bagging', 'Random Forest', 'XGBoost', 'LightGBM'
            ],
            
            // Design & UX
            designUX: [
                'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects',
                'Premiere Pro', 'UI Design', 'UX Design', 'User Research', 'Usability Testing', 'Wireframing',
                'Prototyping', 'Information Architecture', 'Interaction Design', 'Visual Design', 'Responsive Design',
                'Accessibility', 'WCAG', 'Section 508', 'Design Systems', 'Design Thinking', 'User-Centered Design',
                'Atomic Design', 'Material Design', 'Human Interface Guidelines', 'A/B Testing', 'Heatmaps',
                'User Flows', 'Personas', 'Journey Mapping', 'Storyboarding', 'Card Sorting', 'Tree Testing'
            ],
            
            // Testing & QA
            testingQA: [
                'Testing', 'Jest', 'Mocha', 'Cypress', 'Selenium', 'JUnit', 'pytest', 'TestNG', 'NUnit',
                'xUnit', 'Jasmine', 'Karma', 'Protractor', 'WebdriverIO', 'Playwright', 'Puppeteer', 'Appium',
                'Espresso', 'XCTest', 'Detox', 'Robot Framework', 'Cucumber', 'Gherkin', 'BDD', 'TDD',
                'Unit Testing', 'Integration Testing', 'Functional Testing', 'End-to-End Testing', 'Performance Testing',
                'Load Testing', 'Stress Testing', 'Security Testing', 'Penetration Testing', 'Accessibility Testing',
                'Regression Testing', 'Smoke Testing', 'Sanity Testing', 'Exploratory Testing', 'Manual Testing',
                'Automated Testing', 'JMeter', 'Gatling', 'Locust', 'k6', 'SonarQube', 'Checkmarx', 'Fortify'
            ],
            
            // Mobile Development
            mobileDevelopment: [
                'Android', 'iOS', 'Swift', 'Objective-C', 'Kotlin', 'Java for Android', 'React Native', 'Flutter',
                'Xamarin', 'Ionic', 'Cordova', 'PhoneGap', 'NativeScript', 'SwiftUI', 'Jetpack Compose',
                'Android Jetpack', 'ARKit', 'ARCore', 'CoreML', 'MLKit', 'Firebase', 'Realm', 'SQLite',
                'Room', 'Core Data', 'RxJava', 'RxSwift', 'Combine', 'MVVM', 'MVI', 'Clean Architecture',
                'App Store Connect', 'Google Play Console', 'TestFlight', 'Fastlane', 'Mobile CI/CD',
                'Push Notifications', 'Deep Linking', 'App Indexing', 'In-App Purchases', 'Mobile Analytics'
            ],
            
            // Business Intelligence & Data
            businessIntelligence: [
                'Power BI', 'Tableau', 'Looker', 'Qlik', 'Domo', 'Excel', 'Data Analysis', 'SQL Server',
                'SSRS', 'SSIS', 'SSAS', 'DAX', 'Power Query', 'M Language', 'Data Modeling', 'Data Visualization',
                'ETL', 'Data Warehousing', 'Business Intelligence', 'Statistical Analysis', 'R', 'SAS', 'SPSS',
                'Alteryx', 'Snowflake', 'BigQuery', 'Redshift', 'Data Lake', 'Data Mart', 'OLAP', 'OLTP',
                'Star Schema', 'Snowflake Schema', 'Dimensional Modeling', 'Fact Tables', 'Dimension Tables',
                'KPIs', 'Dashboards', 'Reports', 'Ad Hoc Analysis', 'Self-Service BI', 'Data Governance'
            ],
            
            // Cybersecurity
            cybersecurity: [
                'Network Security', 'Application Security', 'Cloud Security', 'DevSecOps', 'Penetration Testing',
                'Vulnerability Assessment', 'Security Auditing', 'Compliance', 'Risk Management', 'Incident Response',
                'Forensics', 'Malware Analysis', 'Threat Intelligence', 'SIEM', 'SOC', 'Firewall', 'IDS/IPS',
                'WAF', 'DLP', 'Encryption', 'PKI', 'Authentication', 'Authorization', 'IAM', 'SSO', 'MFA',
                'OWASP', 'CISSP', 'CEH', 'Security+', 'CISM', 'CISA', 'OSCP', 'Kali Linux', 'Metasploit',
                'Wireshark', 'Burp Suite', 'Nmap', 'Nessus', 'OpenVAS', 'Snort', 'Suricata', 'Zero Trust'
            ],
            
            // Soft Skills
            softSkills: [
                'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking', 'Time Management',
                'Leadership', 'Adaptability', 'Creativity', 'Collaboration', 'Emotional Intelligence',
                'Conflict Resolution', 'Decision Making', 'Negotiation', 'Presentation Skills', 'Mentoring',
                'Customer Service', 'Active Listening', 'Attention to Detail', 'Analytical Thinking',
                'Strategic Planning', 'Organizational Skills', 'Self-Motivation', 'Work Ethic', 'Flexibility'
            ],
            
            // Pharmaceutical Industry
            pharmaceutical: [
                'GMP', 'GLP', 'GCP', 'GDP', 'ICH Guidelines', 'FDA Regulations', 'EMA Regulations', 'MHRA',
                'Pharmacovigilance', 'Clinical Trials', 'Regulatory Affairs', 'Quality Assurance', 'Quality Control',
                'Validation', 'Qualification', 'CAPA', 'Deviation Management', 'Change Control', 'Risk Assessment',
                'Batch Record Review', 'Drug Development', 'Formulation Development', 'Process Development',
                'Method Development', 'Method Validation', 'Stability Studies', 'Dissolution Testing',
                'HPLC', 'GC', 'Mass Spectrometry', 'NMR', 'FTIR', 'UV-Vis Spectroscopy', 'Karl Fischer',
                'Particle Size Analysis', 'Bioassay', 'Microbiology', 'Sterility Testing', 'Endotoxin Testing',
                'Bioburden Testing', 'Aseptic Processing', 'Lyophilization', 'Tablet Compression', 'Coating',
                'Granulation', 'Blending', 'Extrusion', 'Filling', 'Packaging', 'Labeling', 'Serialization',
                'Track and Trace', 'Cold Chain', 'Temperature Mapping', 'Environmental Monitoring',
                'Clean Room Operations', 'Isolator Technology', 'RABS', 'Blow-Fill-Seal', 'Pharmacokinetics',
                'Pharmacodynamics', 'Toxicology', 'Drug Metabolism', 'Bioavailability', 'Bioequivalence',
                'Clinical Research', 'Medical Writing', 'Regulatory Submissions', 'eCTD', 'IND', 'NDA', 'ANDA',
                'BLA', 'MAA', 'DMF', 'CMC', 'Pharmacopoeia', 'USP', 'EP', 'JP', 'IP', 'BP', 'Compendial Methods',
                'PAT', 'QbD', 'DoE', 'Process Validation', 'Cleaning Validation', 'Computer System Validation',
                'Equipment Qualification', 'IQ', 'OQ', 'PQ', 'Calibration', 'Preventive Maintenance',
                'LIMS', 'EBR', 'MES', 'ERP for Pharma', 'TrackWise', 'LabWare', 'Empower', 'Chromeleon'
            ],
            
            // Management
            management: [
                'Strategic Management', 'Operations Management', 'Project Management', 'Change Management',
                'Risk Management', 'Performance Management', 'Talent Management', 'Resource Management',
                'Quality Management', 'Supply Chain Management', 'Procurement Management', 'Vendor Management',
                'Contract Management', 'Stakeholder Management', 'Crisis Management', 'Conflict Management',
                'Time Management', 'Cost Management', 'Budget Management', 'Asset Management', 'Facility Management',
                'Inventory Management', 'Warehouse Management', 'Logistics Management', 'Fleet Management',
                'Customer Relationship Management', 'Business Process Management', 'Knowledge Management',
                'Innovation Management', 'Product Management', 'Brand Management', 'Marketing Management',
                'Sales Management', 'Revenue Management', 'Account Management', 'Team Management', 'Leadership',
                'Coaching', 'Mentoring', 'Delegation', 'Decision Making', 'Problem Solving', 'Negotiation',
                'Conflict Resolution', 'Strategic Planning', 'Business Planning', 'Succession Planning',
                'Workforce Planning', 'Capacity Planning', 'Resource Planning', 'Demand Planning',
                'Performance Evaluation', 'KPI Management', 'OKR', 'Balanced Scorecard', 'Six Sigma',
                'Lean Management', 'Agile Management', 'Scrum', 'Kanban', 'PRINCE2', 'PMBOK', 'PMP',
                'CAPM', 'MSP', 'ITIL', 'COBIT', 'ISO 9001', 'TQM', 'BPR', 'Kaizen', '5S', 'JIT',
                'Value Stream Mapping', 'Root Cause Analysis', 'FMEA', 'PESTEL Analysis', 'SWOT Analysis',
                'Porter\'s Five Forces', 'BCG Matrix', 'Ansoff Matrix', 'McKinsey 7S Framework', 'Balanced Scorecard',
                'Business Model Canvas', 'Value Proposition Canvas', 'Blue Ocean Strategy', 'Organizational Development',
                'Change Leadership', 'Digital Transformation', 'Business Transformation', 'Organizational Behavior',
                'Organizational Culture', 'Organizational Structure', 'Matrix Management', 'Cross-functional Teams'
            ],
            
            // Finance
            finance: [
                'Financial Analysis', 'Financial Modeling', 'Financial Planning', 'Financial Reporting',
                'Financial Statements', 'Balance Sheet', 'Income Statement', 'Cash Flow Statement',
                'Statement of Changes in Equity', 'Ratio Analysis', 'Profitability Analysis', 'Liquidity Analysis',
                'Solvency Analysis', 'Efficiency Analysis', 'Valuation', 'DCF', 'NPV', 'IRR', 'WACC', 'CAPM',
                'Enterprise Value', 'Equity Value', 'EBITDA', 'EBIT', 'Gross Margin', 'Operating Margin',
                'Net Margin', 'ROI', 'ROE', 'ROA', 'ROCE', 'EPS', 'P/E Ratio', 'P/B Ratio', 'EV/EBITDA',
                'Dividend Yield', 'Dividend Policy', 'Capital Structure', 'Debt-to-Equity', 'Leverage',
                'Working Capital Management', 'Cash Management', 'Treasury Management', 'FX Management',
                'Risk Management', 'Hedging', 'Derivatives', 'Options', 'Futures', 'Swaps', 'Forwards',
                'Fixed Income', 'Bonds', 'Yield Curve', 'Duration', 'Convexity', 'Credit Analysis',
                'Equity Research', 'Fundamental Analysis', 'Technical Analysis', 'Quantitative Analysis',
                'Portfolio Management', 'Asset Allocation', 'Modern Portfolio Theory', 'CAPM', 'Alpha',
                'Beta', 'Sharpe Ratio', 'Treynor Ratio', 'Jensen\'s Alpha', 'Investment Banking',
                'M&A', 'Due Diligence', 'Valuation', 'LBO', 'MBO', 'IPO', 'SEO', 'Private Equity',
                'Venture Capital', 'Angel Investing', 'Crowdfunding', 'Corporate Finance', 'Capital Budgeting',
                'Cost of Capital', 'Dividend Policy', 'Share Repurchases', 'Corporate Restructuring',
                'Accounting', 'Bookkeeping', 'General Ledger', 'Accounts Payable', 'Accounts Receivable',
                'Fixed Assets', 'Depreciation', 'Amortization', 'Accruals', 'Prepayments', 'Revenue Recognition',
                'GAAP', 'IFRS', 'US GAAP', 'Tax Accounting', 'Audit', 'Internal Controls', 'SOX Compliance',
                'Financial Planning & Analysis', 'Budgeting', 'Forecasting', 'Variance Analysis',
                'Cost Accounting', 'Activity-Based Costing', 'Standard Costing', 'Marginal Costing',
                'Management Accounting', 'Banking', 'Commercial Banking', 'Retail Banking', 'Private Banking',
                'Credit Analysis', 'Loan Underwriting', 'Mortgage Lending', 'Insurance', 'Underwriting',
                'Claims Management', 'Actuarial Science', 'Reinsurance', 'Blockchain', 'Cryptocurrency',
                'DeFi', 'Smart Contracts', 'NFTs', 'Fintech', 'Regtech', 'Insurtech', 'Payment Processing',
                'QuickBooks', 'SAP Finance', 'Oracle Financials', 'Microsoft Dynamics', 'Bloomberg Terminal',
                'FactSet', 'Capital IQ', 'Excel for Finance', 'VBA for Finance', 'Python for Finance', 'R for Finance'
            ]
        };
        
        // Flatten the skills database for searching
        const commonSkills = Object.values(skillsDatabase).flat();
        
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
        
        // Look for phrases like "knowledge of tools like X, Y, and Z"
        const knowledgePatterns = [
            /knowledge of\s+([\w\s,]+)(?:and|like)\s+([\w\s,]+)/i,
            /experience with\s+([\w\s,]+)(?:and|like|or)\s+([\w\s,]+)/i,
            /proficient in\s+([\w\s,]+)(?:and|like|or)\s+([\w\s,]+)/i,
            /familiar with\s+([\w\s,]+)(?:and|like|or)\s+([\w\s,]+)/i,
            /expertise in\s+([\w\s,]+)(?:and|like|or)\s+([\w\s,]+)/i
        ];
        
        knowledgePatterns.forEach(pattern => {
            const knowledgeMatch = text.match(pattern);
            if (knowledgeMatch) {
                const toolsText = knowledgeMatch[0];
                commonSkills.forEach(skill => {
                    if (new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(toolsText)) {
                        skills.push(skill);
                    }
                });
            }
        });
        
        // Look for years of experience with specific skills
        const experiencePattern = /(\d+)\+?\s*(?:years?|yrs?)(?:\s*of)?\s*experience\s*(?:with|in|using)?\s*([^.,]+)/gi;
        let match;
        while ((match = experiencePattern.exec(text)) !== null) {
            const skillText = match[2].trim();
            commonSkills.forEach(skill => {
                if (new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(skillText)) {
                    skills.push(skill);
                }
            });
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
        const { 
            portal, 
            searchMode, 
            jobTitles, 
            skills, 
            experience, 
            education, 
            certifications, 
            location, 
            excludeTerms, 
            context 
        } = params;
        
        // Filter job titles based on context if provided
        const filteredJobTitles = context ? filterJobTitles(jobTitles, context) : jobTitles;
        
        // Update params with filtered job titles
        const updatedParams = {
            ...params,
            jobTitles: filteredJobTitles
        };
        
        // Generate search string based on portal
        switch (portal) {
            case 'linkedin':
                return generateLinkedInString(updatedParams);
            case 'indeed':
                return generateIndeedString(updatedParams);
            case 'monster':
                return generateMonsterString(updatedParams);
            case 'dice':
                return generateDiceString(updatedParams);
            case 'jobdiva':
                return generateJobDivaString(updatedParams);
            case 'generic':
            default:
                return generateGenericString(updatedParams);
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
        
        // US-specific options - default to false
        const usOnlySearch = document.getElementById('us-only-search')?.checked || false;
        const usWorkAuth = document.getElementById('us-work-auth')?.checked || false;
        
        // Build search parts in order of importance
        let searchComponents = [];
        
        // --- US-SPECIFIC TERMS (OPTIONAL) ---
        // Only add if explicitly requested by the user
        if (usOnlySearch) {
            // Use a more concise approach for US-specific terms
            const usTerms = [];
            
            // Location indicators
            usTerms.push('("United States" OR "USA" OR "U.S.")');
            
            // Education indicators (select top schools + general terms)
            usTerms.push('("MIT" OR "Stanford" OR "Harvard" OR "Berkeley" OR "Carnegie Mellon" OR "GPA" OR "cum laude")');
            
            // Industry indicators
            usTerms.push('("Fortune 500" OR "Silicon Valley" OR "FAANG" OR "IEEE" OR "ACM")');
            
            // Only require ONE of these categories to match (not all)
            searchComponents.push(`(${usTerms.join(' OR ')})`);
        }
        
        // --- JOB TITLES ---
        if (jobTitles.length > 0) {
            // For job titles, be more selective with variations
            const titleTerms = [];
            
            jobTitles.forEach(title => {
                // Always include the exact title
                titleTerms.push(`"${title}"`);
                
                // Only add most common variations (not all possible ones)
                // For senior roles, add senior variation
                if (!title.toLowerCase().includes('senior') && !title.toLowerCase().includes('jr') && 
                    !title.toLowerCase().includes('junior')) {
                    titleTerms.push(`"Senior ${title}"`);
                }
                
                // For multi-word titles, add proximity search instead of all variations
                const words = title.split(/\s+/).filter(word => word.length > 3);
                if (words.length > 1) {
                    titleTerms.push(`(${words.map(w => `"${w}"`).join(' NEAR/5 ')})`);
                }
            });
            
            // Combine with OR for different titles
            searchComponents.push(`(${titleTerms.join(' OR ')})`);
        }
        
        // --- SKILLS ---
        // Process priority/must-have skills - these must be present
        if (prioritySkills.length > 0) {
            const skillTerms = prioritySkills.map(skill => `"${skill}"`);
            // All priority skills are required - use AND between them
            searchComponents.push(`(${skillTerms.join(' AND ')})`);
        }
        
        // Process regular/nice-to-have skills - be more selective
        if (skills.length > 0) {
            // Filter out priority skills to avoid duplication
            const regularSkills = skills.filter(skill => !prioritySkills.includes(skill));
            
            if (regularSkills.length > 0) {
                // Limit to top 5 skills maximum to avoid overly complex queries
                const topSkills = regularSkills.slice(0, 5);
                const skillTerms = topSkills.map(skill => `"${skill}"`);
                
                // For balanced approach, require at least some skills
                if (jobdivaSearchMode === 'strict') {
                    // All skills required
                    searchComponents.push(`(${skillTerms.join(' AND ')})`);
                } else if (jobdivaSearchMode === 'balanced' && skillTerms.length >= 3) {
                    // For 3+ skills, require at least 2
                    const combinations = [];
                    for (let i = 0; i < Math.min(skillTerms.length, 4); i++) {
                        for (let j = i + 1; j < Math.min(skillTerms.length, 4); j++) {
                            combinations.push(`(${skillTerms[i]} AND ${skillTerms[j]})`);
                        }
                    }
                    searchComponents.push(`(${combinations.join(' OR ')})`);
                } else {
                    // For fewer skills or flexible mode, use OR
                    searchComponents.push(`(${skillTerms.join(' OR ')})`);
                }
            }
        }
        
        // --- EXPERIENCE ---
        if (experience) {
            // Parse experience value to handle ranges
            let years;
            const rangeMatch = experience.match(/(\d+)\s*-\s*(\d+)/);
            if (rangeMatch) {
                years = parseInt(rangeMatch[1]); // Use the minimum years
            } else {
                const singleMatch = experience.match(/(\d+)/);
                years = singleMatch ? parseInt(singleMatch[1]) : null;
            }
            
            if (years) {
                // Use fewer variations - focus on most common patterns
                const expVariations = [
                    `"${years} years"`,
                    `"${years}+ years"`,
                    `(${years} NEAR/3 experience)`
                ];
                
                // Add experience level terms based on years
                if (years >= 8) {
                    expVariations.push(`"senior"`);
                } else if (years <= 2) {
                    expVariations.push(`"junior"`);
                }
                
                searchComponents.push(`(${expVariations.join(' OR ')})`);
            }
        }
        
        // --- EDUCATION ---
        if (education.length > 0) {
            const eduTerms = [];
            
            education.forEach(edu => {
                // Add exact phrase
                eduTerms.push(`"${edu}"`);
                
                // For multi-word education terms, add proximity search
                const words = edu.split(/\s+/).filter(Boolean);
                if (words.length > 1) {
                    eduTerms.push(`(${words.map(w => `"${w}"`).join(' NEAR/5 ')})`);
                }
                
                // Add only the most common degree variations
                if (edu.match(/bachelor|bs|b\.s\.|ba|b\.a\./i)) {
                    eduTerms.push(`"bachelor's degree"`);
                    eduTerms.push(`"BS"`);
                }
                
                if (edu.match(/master|ms|m\.s\.|ma|m\.a\./i)) {
                    eduTerms.push(`"master's degree"`);
                    eduTerms.push(`"MS"`);
                }
            });
            
            // Combine with OR - we want any matching education
            searchComponents.push(`(${eduTerms.join(' OR ')})`);
        }
        
        // --- CERTIFICATIONS ---
        if (certifications.length > 0) {
            const certTerms = certifications.map(cert => `"${cert}"`);
            // Combine with OR - any certification is fine
            searchComponents.push(`(${certTerms.join(' OR ')})`);
        }
        
        // --- LOCATION ---
        if (location) {
            // Just use the exact location and a few key variations
            const locationTerms = [
                `"${location}"`,
                `"${location} area"`
            ];
            
            // Add remote work variations if applicable
            if (location.toLowerCase().includes('remote')) {
                locationTerms.push(`"remote work"`);
                locationTerms.push(`"work from home"`);
            }
            
            searchComponents.push(`(${locationTerms.join(' OR ')})`);
        }
        
        // --- COMBINE ALL SEARCH COMPONENTS ---
        let searchString = searchComponents.join(' AND ');
        
        // --- EXCLUDE TERMS ---
        // Combine all exclude terms
        const allExcludeTerms = [...excludeTerms, ...jobdivaExcludeTerms];
        
        if (allExcludeTerms.length > 0) {
            // Limit to top 5 exclude terms to keep string manageable
            const topExcludeTerms = allExcludeTerms.slice(0, 5);
            topExcludeTerms.forEach(term => {
                searchString += ` NOT "${term}"`;
            });
        }
        
        // --- ADD JOBDIVA-SPECIFIC FILTERS ---
        // Resume freshness - use JobDiva's specific syntax
        if (resumeFreshness) {
            searchString += ` AND updatedwithin:${resumeFreshness}`;
        }
        
        // Resume quality
        if (resumeQuality && resumeQuality !== 'any') {
            switch (resumeQuality) {
                case 'high':
                    searchString += ' AND quality:high';
                    break;
                case 'medium':
                    searchString += ' AND quality:medium';
                    break;
                case 'low':
                    // Don't add any quality filter for low
                    break;
            }
        }
        
        // Resumes only
        if (resumesOnly) {
            searchString += ' AND documenttype:resume';
        }
        
        // Available candidates
        if (availableCandidates) {
            searchString += ' AND status:available';
        }
        
        // US-specific filters - only add if explicitly requested
        if (usOnlySearch) {
            searchString += ' AND country:US';
        }
        
        if (usWorkAuth) {
            searchString += ' AND workauthorization:US';
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
    
    // Add a new function to filter job titles based on context
    function filterJobTitles(titles, context) {
        // If no context is provided, return all titles
        if (!context || !context.trim()) {
            return titles;
        }
        
        const contextLower = context.toLowerCase();
        
        // Define categories to exclude based on context keywords
        const excludeCategories = [];
        
        // Check for context keywords to determine which categories to exclude
        if (contextLower.includes('developer') || 
            contextLower.includes('programmer') || 
            contextLower.includes('coder') ||
            contextLower.includes('engineer')) {
            
            // If the context is specifically about developers/programmers
            // we might want to exclude management or architecture roles
            if (!contextLower.includes('architect') && !contextLower.includes('lead')) {
                excludeCategories.push('architecture');
            }
            
            if (!contextLower.includes('manager') && !contextLower.includes('lead')) {
                excludeCategories.push('management');
            }
        }
        
        // If we have categories to exclude, filter the titles
        if (excludeCategories.length > 0) {
            // Recreate the category mapping to check which titles belong to which category
            const jobTitlesByCategory = {
                softwareDevelopment: [
                    'Software Engineer', 'Developer', 'Programmer', 'Web Developer',
                    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 
                    'Mobile Developer', 'iOS Developer', 'Android Developer',
                    'Java Developer', 'Python Developer', 'JavaScript Developer',
                    'React Developer', 'Angular Developer', 'Vue Developer',
                    'Node.js Developer', '.NET Developer', 'C# Developer', 'PHP Developer',
                    'Ruby Developer', 'Golang Developer', 'Scala Developer', 'Kotlin Developer',
                    'Swift Developer', 'Rust Developer'
                ],
                dataScience: [
                    'Data Scientist', 'Machine Learning Engineer', 'AI Engineer', 
                    'Deep Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer',
                    'Data Analyst', 'Business Analyst', 'Business Intelligence Analyst', 
                    'BI Analyst', 'Data Engineer', 'Analytics Engineer', 'Reporting Analyst',
                    'Quantitative Analyst', 'Research Scientist'
                ],
                devOps: [
                    'DevOps Engineer', 'SRE', 'Site Reliability Engineer', 'Cloud Engineer',
                    'Systems Administrator', 'Network Engineer', 'Database Administrator',
                    'Platform Engineer', 'Infrastructure Engineer', 'Release Engineer',
                    'Automation Engineer', 'Configuration Manager', 'AWS Engineer',
                    'Azure Engineer', 'GCP Engineer', 'Kubernetes Engineer', 'Docker Specialist'
                ],
                security: [
                    'Security Engineer', 'Information Security Analyst', 'Cybersecurity Specialist',
                    'Security Architect', 'Penetration Tester', 'Ethical Hacker', 'Security Consultant',
                    'Compliance Specialist', 'Security Operations Analyst', 'SOC Analyst'
                ],
                design: [
                    'UX Designer', 'UI Designer', 'Product Designer', 'Interaction Designer',
                    'Visual Designer', 'Graphic Designer', 'Web Designer', 'Mobile Designer'
                ],
                qualityAssurance: [
                    'QA Engineer', 'Test Engineer', 'Quality Assurance Analyst', 'Test Analyst',
                    'Automation Tester', 'Manual Tester', 'SDET', 'QA Lead'
                ],
                management: [
                    'Product Manager', 'Project Manager', 'Technical Project Manager',
                    'Program Manager', 'Scrum Master', 'Agile Coach', 'Engineering Manager',
                    'Technical Lead', 'Team Lead', 'Development Manager', 'IT Manager',
                    'CTO', 'CIO', 'VP of Engineering', 'Director of Engineering'
                ],
                architecture: [
                    'Software Architect', 'Solutions Architect', 'System Architect', 
                    'Enterprise Architect', 'Cloud Architect', 'Data Architect',
                    'Security Architect', 'Network Architect', 'Infrastructure Architect',
                    'Technical Architect', 'Architect'
                ]
            };
            
            // Create a mapping of title to category
            const titleToCategoryMap = {};
            Object.entries(jobTitlesByCategory).forEach(([category, categoryTitles]) => {
                categoryTitles.forEach(title => {
                    titleToCategoryMap[title.toLowerCase()] = category;
                });
            });
            
            // Filter out titles from excluded categories
            return titles.filter(title => {
                const titleLower = title.toLowerCase();
                const category = titleToCategoryMap[titleLower];
                
                // If we can't determine the category, keep the title
                if (!category) return true;
                
                // Keep the title if its category is not in the excluded list
                return !excludeCategories.includes(category);
            });
        }
        
        return titles;
    }
});
