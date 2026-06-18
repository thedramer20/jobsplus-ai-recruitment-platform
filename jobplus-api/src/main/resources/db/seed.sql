USE jobplus;

-- ======================================================
-- RESET — disable FK checks, wipe all data, reset sequences
-- ======================================================

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM audit_log;
DELETE FROM notification;
DELETE FROM message;
DELETE FROM conversation_participant;
DELETE FROM conversation;
DELETE FROM post_comment;
DELETE FROM post_like;
DELETE FROM post;
DELETE FROM connection;
DELETE FROM saved_job;
DELETE FROM application;
DELETE FROM job_skill;
DELETE FROM job;
DELETE FROM company_member;
DELETE FROM user_skill;
DELETE FROM education;
DELETE FROM experience;
DELETE FROM seeker_profile;
DELETE FROM company;
DELETE FROM skill;
DELETE FROM `user`;

ALTER TABLE audit_log          AUTO_INCREMENT = 1;
ALTER TABLE notification       AUTO_INCREMENT = 1;
ALTER TABLE message            AUTO_INCREMENT = 1;
ALTER TABLE conversation       AUTO_INCREMENT = 1;
ALTER TABLE post_comment       AUTO_INCREMENT = 1;
ALTER TABLE post               AUTO_INCREMENT = 1;
ALTER TABLE connection         AUTO_INCREMENT = 1;
ALTER TABLE application        AUTO_INCREMENT = 1;
ALTER TABLE job                AUTO_INCREMENT = 1;
ALTER TABLE company_member     AUTO_INCREMENT = 1;
ALTER TABLE experience         AUTO_INCREMENT = 1;
ALTER TABLE education          AUTO_INCREMENT = 1;
ALTER TABLE company            AUTO_INCREMENT = 1;
ALTER TABLE skill              AUTO_INCREMENT = 1;
ALTER TABLE `user`             AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ======================================================
-- Password hashes
--   Admin@123! → $2b$10$McLdIAr4hK0anTWUgZ8LVOxx.1plLqm/ss7v9HaihwCO.xQuh1rMe
--   Demo@123!  → $2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u
-- ======================================================

-- ======================================================
-- PART 1-A: Admin users (IDs 1–2)
-- ======================================================

INSERT INTO `user` (id, email, password_hash, role, name, headline, location, status, avatar_url) VALUES
(1, 'admin@jobplus.com', '$2b$10$McLdIAr4hK0anTWUgZ8LVOxx.1plLqm/ss7v9HaihwCO.xQuh1rMe', 'ADMIN', 'Admin',     'Platform Administrator', 'Singapore', 'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Admin'),
(2, 'mod@jobplus.com',   '$2b$10$McLdIAr4hK0anTWUgZ8LVOxx.1plLqm/ss7v9HaihwCO.xQuh1rMe', 'ADMIN', 'Moderator', 'Content Moderator',       'Singapore', 'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Moderator');

-- ======================================================
-- PART 1-B: Employer users (IDs 3–10)
-- ======================================================

INSERT INTO `user` (id, email, password_hash, role, name, headline, location, status, avatar_url) VALUES
(3,  'recruiter@techcorp.com',  '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'EMPLOYER', 'Sarah Lim',        'Talent Acquisition Lead at TechCorp Singapore', 'Singapore',    'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah'),
(4,  'hr@finova.com',           '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'EMPLOYER', 'Wei Chen',         'HR Manager at Finova Financial',                'Singapore',    'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Wei'),
(5,  'talent@healthbridge.com', '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'EMPLOYER', 'Priya Nair',       'Talent Partner at HealthBridge',                'Kuala Lumpur', 'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya'),
(6,  'jobs@edunest.com',        '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'EMPLOYER', 'Budi Santoso',     'People Operations at EduNest',                  'Jakarta',      'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Budi'),
(7,  'hiring@retailplus.com',   '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'EMPLOYER', 'Nipa Charoenwong', 'Recruiting Manager at RetailPlus',              'Bangkok',      'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Nipa'),
(8,  'people@greenlogix.com',   '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'EMPLOYER', 'Juan dela Cruz',   'People & Culture at GreenLogix',                'Manila',       'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Juan'),
(9,  'hr@cloudstack.com',       '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'EMPLOYER', 'Mei Lin Tan',      'HR Lead at CloudStack',                         'Singapore',    'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=MeiLin'),
(10, 'talent@mediawave.com',    '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'EMPLOYER', 'Rizki Pratama',    'Talent Manager at MediaWave',                   'Kuala Lumpur', 'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rizki');

-- ======================================================
-- PART 1-C: Companies (IDs 1–12)
-- ======================================================

INSERT INTO company (id, name, industry, size, location, website, description, verified, logo_url) VALUES
(1,  'TechCorp Singapore', 'Software & Technology',      'LARGE',      'Singapore',    'https://techcorp.example.com',     'TechCorp Singapore is a leading enterprise software company building scalable SaaS products for the APAC market. With 800+ engineers across five countries, we are known for engineering rigour, developer autonomy, and a relentless focus on performance.',                              TRUE,  'https://api.dicebear.com/9.x/initials/svg?seed=TC&backgroundColor=4338CA'),
(2,  'Finova Financial',   'Finance & Banking',          'MEDIUM',     'Singapore',    'https://finova.example.com',       'Finova Financial provides next-generation fintech products that democratise access to savings, lending, and investment services across Southeast Asia. Our engineering and data teams move fast while keeping regulatory compliance at the centre of every decision.',                 TRUE,  'https://api.dicebear.com/9.x/initials/svg?seed=FF&backgroundColor=10B981'),
(3,  'HealthBridge',       'Healthcare',                 'MEDIUM',     'Kuala Lumpur', 'https://healthbridge.example.com', 'HealthBridge connects patients, clinicians, and hospital networks through integrated digital health technology. Operating in six countries, we are on a mission to make high-quality healthcare accessible to every person in the region regardless of geography or income.',         TRUE,  'https://api.dicebear.com/9.x/initials/svg?seed=HB&backgroundColor=F59E0B'),
(4,  'EduNest',            'Education Technology',       'SMALL',      'Jakarta',      'https://edunest.example.com',      'EduNest is reimagining how 2 million Indonesian students learn through personalised, AI-driven curriculum. We believe adaptive learning should be affordable and engaging for every student, not just those in top-tier private schools.',                                             FALSE, 'https://api.dicebear.com/9.x/initials/svg?seed=EN&backgroundColor=EF4444'),
(5,  'RetailPlus',         'Retail & E-Commerce',        'LARGE',      'Bangkok',      'https://retailplus.example.com',   'RetailPlus is Southeast Asia''s fastest-growing omnichannel retailer with over 700 stores and a thriving e-commerce platform serving 15 million active customers. We move at startup speed backed by enterprise-grade infrastructure and a team that ships daily.',              TRUE,  'https://api.dicebear.com/9.x/initials/svg?seed=RP&backgroundColor=8B5CF6'),
(6,  'GreenLogix',         'Logistics & Supply Chain',   'MEDIUM',     'Manila',       'https://greenlogix.example.com',   'GreenLogix delivers sustainable logistics solutions across the Philippines and Vietnam. Our proprietary green-fleet routing engine reduces carbon emissions by 30% versus traditional carriers while maintaining same-day delivery windows in major cities.',                         FALSE, 'https://api.dicebear.com/9.x/initials/svg?seed=GL&backgroundColor=06B6D4'),
(7,  'CloudStack',         'Cloud & Infrastructure',     'ENTERPRISE', 'Singapore',    'https://cloudstack.example.com',   'CloudStack is a cloud infrastructure and managed services provider trusted by 400+ enterprises across APAC. We design, migrate, and operate mission-critical environments on AWS, GCP, and Azure with a 99.99% SLA guarantee and a 24/7 NOC team.',                                TRUE,  'https://api.dicebear.com/9.x/initials/svg?seed=CS&backgroundColor=4338CA'),
(8,  'MediaWave',          'Media & Entertainment',      'SMALL',      'Kuala Lumpur', 'https://mediawave.example.com',    'MediaWave is a digital-first media company producing original content for streaming, social, and branded channels across Malaysia, Singapore, and Thailand. Our 60-person team reaches 20 million viewers monthly and is growing fast.',                                             FALSE, 'https://api.dicebear.com/9.x/initials/svg?seed=MW&backgroundColor=10B981'),
(9,  'UrbanBuild',         'Construction & Real Estate', 'MEDIUM',     'Jakarta',      'https://urbanbuild.example.com',   'UrbanBuild is a property development and construction company shaping Jakarta''s skyline with mixed-use residential and commercial projects. We combine deep construction expertise with PropTech tools to deliver projects on time and under budget.',                               FALSE, 'https://api.dicebear.com/9.x/initials/svg?seed=UB&backgroundColor=F59E0B'),
(10, 'FinTrust Asia',      'Finance & Banking',          'LARGE',      'Singapore',    'https://fintrust.example.com',     'FinTrust Asia is a regional financial services group offering wealth management, corporate treasury, and risk advisory across eight APAC markets. Our 2,000-strong team is backed by 30 years of market expertise and an unwavering commitment to client trust.',                   TRUE,  'https://api.dicebear.com/9.x/initials/svg?seed=FA&backgroundColor=EF4444'),
(11, 'Medica Group',       'Healthcare',                 'ENTERPRISE', 'Kuala Lumpur', 'https://medicagroup.example.com',  'Medica Group is a leading private healthcare network operating 18 hospitals and 60 clinics across Malaysia and Singapore. We are investing in digital health, advanced data analytics, and AI-assisted diagnostics to transform how care is delivered at scale.',                   TRUE,  'https://api.dicebear.com/9.x/initials/svg?seed=MG&backgroundColor=8B5CF6'),
(12, 'ByteForge',          'Software & Technology',      'STARTUP',    'Manila',       'https://byteforge.example.com',    'ByteForge is a Manila-based software startup building developer productivity tools used by 50,000 engineers globally. We are a remote-first team of 25 that ships fast, argues in public, and ships some more. If you thrive in ambiguity and own your impact, you will fit right in.', FALSE, 'https://api.dicebear.com/9.x/initials/svg?seed=BF&backgroundColor=06B6D4');

-- ======================================================
-- PART 1-D: Company members (12 rows)
-- ======================================================

INSERT INTO company_member (company_id, user_id, position) VALUES
(1,  3,  'Talent Acquisition Lead'),
(2,  4,  'HR Manager'),
(3,  5,  'Talent Partner'),
(4,  6,  'People Operations Manager'),
(5,  7,  'Recruiting Manager'),
(6,  8,  'People & Culture Manager'),
(7,  9,  'HR Lead'),
(8,  10, 'Talent Manager'),
(9,  8,  'Regional HR Manager'),      -- Juan also covers UrbanBuild
(10, 4,  'Senior HR Manager'),        -- Wei also covers FinTrust Asia
(11, 5,  'Regional Talent Partner'),  -- Priya also covers Medica Group
(12, 9,  'Head of People');           -- Mei Lin also covers ByteForge

-- ======================================================
-- PART 1-E: Skills (IDs 1–20)
-- ======================================================

INSERT INTO skill (id, name) VALUES
(1,  'JavaScript'),
(2,  'TypeScript'),
(3,  'Python'),
(4,  'Java'),
(5,  'SQL'),
(6,  'React'),
(7,  'Node.js'),
(8,  'Vue.js'),
(9,  'DevOps'),
(10, 'AWS'),
(11, 'Docker'),
(12, 'Kubernetes'),
(13, 'Machine Learning'),
(14, 'Data Analysis'),
(15, 'UI/UX Design'),
(16, 'Product Management'),
(17, 'Marketing'),
(18, 'Sales'),
(19, 'Finance'),
(20, 'HR Management');

-- ======================================================
-- PART 2-A: Job seeker users (IDs 11–30)
-- ======================================================

INSERT INTO `user` (id, email, password_hash, role, name, headline, location, status, avatar_url) VALUES
-- Flagship demo account
(11, 'demo@jobplus.com',    '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Alex Morgan',    'Senior Full-Stack Developer | React & Java | Open to Work',     'Singapore',    'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=AlexMorgan'),
-- Existing seekers (re-numbered from old seed)
(12, 'alice@example.com',   '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Alice Tan',      'Senior Software Engineer | Java & Distributed Systems',          'Singapore',    'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alice'),
(13, 'bob@example.com',     '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Bob Rahman',     'UI/UX Designer | Mobile-First & Fintech Products',               'Kuala Lumpur', 'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bob'),
(14, 'carol@example.com',   '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Carol Wijaya',   'Data Analyst | Python · SQL · Retail & E-Commerce',              'Jakarta',      'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Carol'),
(15, 'david@example.com',   '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'David Koh',      'Product Manager | 0-to-1 Products · Health Tech',                'Singapore',    'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=David'),
(16, 'emma@example.com',    '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Emma Jaidee',    'DevOps Engineer | AWS · Kubernetes · CI/CD',                     'Bangkok',      'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Emma'),
(17, 'frank@example.com',   '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Frank Santos',   'Backend Developer | Java Spring Boot · Kafka · Event-Driven',   'Manila',       'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Frank'),
(18, 'grace@example.com',   '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Grace Ng',       'Frontend Developer | React · TypeScript · Performance',          'Singapore',    'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Grace'),
(19, 'henry@example.com',   '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Henry Aziz',     'Marketing Manager | Brand Strategy · APAC Digital Campaigns',   'Kuala Lumpur', 'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Henry'),
(20, 'iris@example.com',    '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Iris Putri',     'Business Analyst | Agile · Process Modelling · SQL',             'Jakarta',      'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Iris'),
(21, 'james@example.com',   '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'James Tan',      'HR Specialist | SHRM-CP · Full-Cycle Recruitment',               'Singapore',    'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=James'),
(22, 'kate@example.com',    '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Kate Somboon',   'Content Writer & Strategist | SEO · Tech & Lifestyle',           'Bangkok',      'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Kate'),
(23, 'leo@example.com',     '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Leo Reyes',      'Financial Analyst | Equity Research · FP&A · Python',           'Manila',       'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Leo'),
-- New seekers
(24, 'nina@example.com',    '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Nina Sharma',    'Data Scientist | ML · Python · Healthcare Analytics',            'Singapore',    'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Nina'),
(25, 'omar@example.com',    '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Omar Kassim',    'Mobile Developer | React Native · iOS · Cross-Platform',         'Kuala Lumpur', 'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Omar'),
(26, 'petra@example.com',   '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Petra Boonnak',  'Software Engineer | Java · Python · Backend Systems',            'Bangkok',      'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Petra'),
(27, 'quinn@example.com',   '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Quinn Velasco',  'Full-Stack Developer | Node.js · React · API Design',            'Manila',       'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Quinn'),
(28, 'rachel@example.com',  '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Rachel Yeo',     'Software Engineer | Java · Cloud · Microservices',               'Singapore',    'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rachel'),
(29, 'sam@example.com',     '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Sam Wiranto',    'Backend Developer | Java · Docker · RESTful APIs',               'Jakarta',      'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sam'),
(30, 'tara@example.com',    '$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u', 'JOB_SEEKER', 'Tara Nakamura',  'Full-Stack Developer | TypeScript · React · Node.js',            'Singapore',    'ACTIVE', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Tara');

-- ======================================================
-- PART 2-B: Seeker profiles (20 rows)
-- open_to_work TRUE: 11,12,16,18,24,25,27,30 (8 total)
-- ======================================================

INSERT INTO seeker_profile (user_id, bio, years_experience, education_summary, open_to_work) VALUES
(11, 'Experienced full-stack developer with 7 years building scalable web applications using React and Java Spring Boot. I have shipped products used by 500K+ users across fintech, SaaS, and e-commerce domains. Currently seeking a senior IC or lead role where I can drive technical architecture and mentor a growing team.',
     7, 'B.Eng. Computer Science, National University of Singapore (NUS)', TRUE),

(12, 'Passionate software engineer with deep expertise in Java and distributed systems. I enjoy solving hard infrastructure problems and have led service migrations handling 10K+ requests per second. Mentoring junior engineers is something I genuinely invest in.',
     6, 'B.Sc. Computer Science, National University of Singapore (NUS)', TRUE),

(13, 'Creative UI/UX designer who bridges aesthetics and usability. I specialise in mobile-first design and user research for fintech and healthcare products, running everything from guerrilla tests to multi-week discovery sprints.',
     4, 'Diploma in Design, Limkokwing University of Creative Technology', FALSE),

(14, 'Data-driven analyst skilled in Python and SQL. I turn messy multi-source datasets into actionable insights for retail and e-commerce stakeholders, and I have a track record of building dashboards executives actually use.',
     3, 'B.Sc. Statistics, University of Indonesia', FALSE),

(15, 'Product manager with a track record of shipping 0-to-1 products in health tech and B2B SaaS. I align cross-functional teams around user value and measurable outcomes, and I write PRDs that engineers and designers enjoy reading.',
     7, 'MBA, Singapore Management University (SMU)', FALSE),

(16, 'DevOps engineer obsessed with reliability and automation. Experienced with Kubernetes, GitOps CI/CD pipelines, and cloud-native architectures on AWS. I treat operational toil as a bug and on-call incidents as design feedback.',
     5, 'B.Eng. Computer Engineering, King Mongkut''s University of Technology Thonburi (KMUTT)', TRUE),

(17, 'Backend developer who builds robust REST APIs and event-driven systems. Strong background in Java Spring Boot, Apache Kafka, and relational database optimisation. I have shipped services processing 5M+ events per day in a logistics environment.',
     4, 'B.Sc. Information Technology, De La Salle University (DLSU) Manila', FALSE),

(18, 'Frontend developer who loves crafting pixel-perfect, accessible UIs. Proficient in React, TypeScript, and web performance optimisation — I pushed a React app from Lighthouse score 54 to 96 through code splitting and lazy loading.',
     3, 'B.Sc. Computer Science, Nanyang Technological University (NTU)', TRUE),

(19, 'Marketing manager with 8 years of experience in brand strategy and digital campaigns. I have led multi-market campaigns across APAC for consumer and B2B brands, managing agencies, budgets up to SGD 2M, and cross-functional creative teams.',
     8, 'B.A. Marketing, University of Malaya', FALSE),

(20, 'Business analyst who translates complex business requirements into clear technical specifications. Experienced in process modelling, stakeholder management, and Agile delivery across EdTech and logistics verticals in Indonesia.',
     5, 'B.Sc. Management Information Systems, University of Indonesia', FALSE),

(21, 'HR specialist focused on talent acquisition, onboarding, and employee engagement. SHRM-CP certified with 4 years of full-cycle recruitment experience across Singapore and Malaysia, managing up to 30 open requisitions simultaneously.',
     4, 'B.A. Human Resource Management, Nanyang Technological University (NTU)', FALSE),

(22, 'Content writer and strategist creating SEO-driven articles, product copy, and social media content for tech and lifestyle brands across Southeast Asia. I have grown organic traffic by 120% for two startups through content-led acquisition.',
     3, 'B.A. Mass Communication, Thammasat University', FALSE),

(23, 'Financial analyst specialising in equity research and FP&A. Strong in financial modelling, DCF valuation, and executive-ready dashboard reporting using Python and Excel. I enjoy turning numbers into a narrative that drives decisions.',
     4, 'B.Sc. Finance, De La Salle University (DLSU) Manila', FALSE),

(24, 'Data scientist applying machine learning to real-world healthcare and fintech problems. Proficient in Python, scikit-learn, and TensorFlow. I have built churn prediction and clinical risk models currently in production at two companies.',
     3, 'M.Sc. Data Science, National University of Singapore (NUS)', TRUE),

(25, 'Mobile developer specialising in React Native cross-platform apps. I have shipped four consumer apps on the App Store and Google Play, with a combined 300K+ downloads. Strong in offline-first architecture and smooth animations.',
     4, 'B.Sc. Computer Science, Universiti Malaya', TRUE),

(26, 'Software engineer with solid Java and Python backend skills. I have built and maintained services for high-traffic retail platforms and enjoy the craft of writing clean, testable, well-documented code that teams can maintain for years.',
     5, 'B.Eng. Software Engineering, King Mongkut''s Institute of Technology Ladkrabang', FALSE),

(27, 'Full-stack developer who owns features end-to-end — from database schema to deployed React UI. Experienced with Node.js microservices and REST API design. I thrive in fast-moving startups and care deeply about developer experience.',
     6, 'B.Sc. Computer Science, De La Salle University (DLSU) Manila', FALSE),

(28, 'Software engineer with a focus on cloud-native Java microservices and Kubernetes deployments. I have contributed to platform migrations cutting infrastructure costs by 25%. I value clean architecture and comprehensive test coverage.',
     4, 'B.Sc. Computer Engineering, Nanyang Technological University (NTU)', TRUE),

(29, 'Backend developer building high-throughput Java services with Docker and RESTful API design. Experienced with MySQL schema design and query optimisation for e-commerce and logistics workloads. Passionate about system reliability.',
     5, 'B.Sc. Informatics Engineering, Universitas Gadjah Mada', FALSE),

(30, 'Full-stack developer with a TypeScript-first approach. I build React frontends and Node.js backends that are fast, tested, and easy to reason about. Currently exploring edge computing and real-time collaborative features.',
     3, 'B.Sc. Computer Science, Nanyang Technological University (NTU)', TRUE);

-- ======================================================
-- PART 2-C: Experience rows
-- Flagship Alex (11): 3 rows — required by spec
-- Alice (12), Emma (16), Frank (17), Grace (18): 2 rows each (richer profiles)
-- ======================================================

INSERT INTO experience (user_id, title, company_name, location, start_date, end_date, current, description) VALUES
-- Alex Morgan (11)
(11, 'Senior Full-Stack Developer',  'DataNexus Pte Ltd',       'Singapore', '2021-03-01', NULL,         TRUE,
 'Lead architect and primary developer of DataNexus''s real-time analytics dashboard serving 200K enterprise users. Introduced a React micro-frontend architecture that reduced build times by 40%. Mentored four junior engineers and drove TypeScript adoption across all frontend codebases.'),
(11, 'Full-Stack Developer',         'Velocis Technologies',    'Singapore', '2018-06-01', '2021-02-28', FALSE,
 'Built and maintained the core SaaS platform serving 50K+ SME customers. Owned the Java Spring Boot API, React frontend, and MySQL schema migrations. Reduced average API response time by 35% through query optimisation and Redis caching.'),
(11, 'Junior Software Engineer',     'CodeLabs Asia',           'Singapore', '2016-08-01', '2018-05-31', FALSE,
 'Developed internal tooling and customer-facing features for a B2B e-commerce platform. First professional exposure to Spring Boot, React, and Agile ceremonies. Contributed to a five-engineer team shipping weekly releases to 10K users.'),

-- Alice Tan (12)
(12, 'Senior Software Engineer',     'Govtech Singapore',       'Singapore', '2020-04-01', NULL,         TRUE,
 'Designing and building microservices for a citizen-facing government portal handling 1M+ monthly sessions. Responsible for service architecture reviews, on-call rotations, and growing a team of three engineers. Core stack: Java, Spring Boot, PostgreSQL, Kubernetes.'),
(12, 'Software Engineer',            'Grab',                    'Singapore', '2017-07-01', '2020-03-31', FALSE,
 'Built and maintained backend services for the driver incentives platform. Optimised batch processing jobs reducing nightly run time from 4 hours to 45 minutes. Collaborated with data engineers on real-time event streaming using Kafka.'),

-- Emma Jaidee (16)
(16, 'DevOps Engineer',              'Agoda',                   'Bangkok',   '2021-01-01', NULL,         TRUE,
 'Owns CI/CD pipeline infrastructure for 30+ microservices on AWS EKS. Reduced deployment lead time from 3 days to 45 minutes through GitOps adoption. On-call lead responsible for SLO monitoring, incident response runbooks, and post-mortems.'),
(16, 'Cloud Infrastructure Intern',  'SCB Tech',                'Bangkok',   '2019-07-01', '2020-12-31', FALSE,
 'Assisted in migrating on-premise workloads to AWS. Set up Terraform modules for VPC and ECS clusters. Gained hands-on experience with CloudWatch alerting and cost optimisation for EC2 and RDS instances.'),

-- Frank Santos (17)
(17, 'Backend Developer',            'Ninja Van Philippines',   'Manila',    '2021-05-01', NULL,         TRUE,
 'Builds and maintains Java Spring Boot services powering the parcel tracking and driver dispatch systems. Integrated Apache Kafka for real-time event streaming, processing 5M+ events per day. Reduced p99 API latency by 28% through connection pooling and index tuning.'),
(17, 'Junior Java Developer',        'UnionBank Digital',       'Manila',    '2019-06-01', '2021-04-30', FALSE,
 'Developed REST APIs for the bank''s mobile banking backend. Participated in a core banking modernisation project, migrating legacy SOAP services to REST. Wrote integration tests with MockMvc and maintained 85% code coverage on assigned modules.'),

-- Grace Ng (18)
(18, 'Frontend Developer',           'Carousell',               'Singapore', '2022-02-01', NULL,         TRUE,
 'Builds React components for the marketplace listing and search experience used by 5M+ monthly active users. Championed a design-system migration cutting CSS bundle size by 30%. Writes Vitest unit tests and collaborates with designers in Figma daily.'),
(18, 'Frontend Intern',              'Shopback',                'Singapore', '2021-06-01', '2021-12-31', FALSE,
 'Built reusable React components for the cashback rewards dashboard. Improved Lighthouse performance score from 61 to 84 on the landing page through image optimisation and deferred script loading. First production experience with TypeScript and Tailwind CSS.');

-- ======================================================
-- PART 2-D: Education rows
-- Alex (11): 2 rows — required by spec
-- Alice, Emma, Frank, Grace: 1 row each (profile completeness)
-- Other seekers: 1 row each via seeker_profile.education_summary
-- ======================================================

INSERT INTO education (user_id, school, degree, field_of_study, start_year, end_year) VALUES
-- Alex Morgan (11) — 2 rows
(11, 'National University of Singapore', 'Bachelor of Engineering', 'Computer Science',                 2012, 2016),
(11, 'Coursera / Amazon Web Services',   'Certification',           'AWS Solutions Architect – Associate',2020, 2020),
-- Alice Tan (12)
(12, 'National University of Singapore', 'Bachelor of Science',     'Computer Science',                 2014, 2018),
-- Emma Jaidee (16)
(16, 'King Mongkut''s University of Technology Thonburi', 'Bachelor of Engineering', 'Computer Engineering', 2015, 2019),
-- Frank Santos (17)
(17, 'De La Salle University Manila',    'Bachelor of Science',     'Information Technology',           2014, 2019),
-- Grace Ng (18)
(18, 'Nanyang Technological University', 'Bachelor of Science',     'Computer Science',                 2017, 2021);

-- ======================================================
-- PART 2-E: User skills
-- Alex: 6 skills · other seekers: 2–5 each
-- Skill IDs: JS=1 TS=2 Python=3 Java=4 SQL=5 React=6 Node.js=7 Vue.js=8
--            DevOps=9 AWS=10 Docker=11 K8s=12 ML=13 DataAnalysis=14
--            UX=15 PM=16 Marketing=17 Sales=18 Finance=19 HR=20
-- ======================================================

INSERT INTO user_skill (user_id, skill_id) VALUES
-- Alex (11): JavaScript, TypeScript, React, Java, SQL, AWS
(11,1),(11,2),(11,6),(11,4),(11,5),(11,10),
-- Alice (12): Java, Python, SQL, Docker
(12,4),(12,3),(12,5),(12,11),
-- Bob (13): UI/UX Design, JavaScript, React
(13,15),(13,1),(13,6),
-- Carol (14): Python, SQL, Data Analysis
(14,3),(14,5),(14,14),
-- David (15): Product Management, SQL, Python
(15,16),(15,5),(15,3),
-- Emma (16): DevOps, Docker, Kubernetes, AWS
(16,9),(16,11),(16,12),(16,10),
-- Frank (17): Java, Python, SQL, Docker
(17,4),(17,3),(17,5),(17,11),
-- Grace (18): JavaScript, TypeScript, React
(18,1),(18,2),(18,6),
-- Henry (19): Marketing, Sales
(19,17),(19,18),
-- Iris (20): SQL, Data Analysis, Product Management
(20,5),(20,14),(20,16),
-- James (21): HR Management, SQL
(21,20),(21,5),
-- Kate (22): Marketing, Sales
(22,17),(22,18),
-- Leo (23): Finance, SQL, Python
(23,19),(23,5),(23,3),
-- Nina (24): Python, Machine Learning, SQL, Data Analysis
(24,3),(24,13),(24,5),(24,14),
-- Omar (25): JavaScript, TypeScript, React
(25,1),(25,2),(25,6),
-- Petra (26): Java, Python, SQL
(26,4),(26,3),(26,5),
-- Quinn (27): JavaScript, TypeScript, React, Node.js, Java
(27,1),(27,2),(27,6),(27,7),(27,4),
-- Rachel (28): Java, Python, SQL, Docker
(28,4),(28,3),(28,5),(28,11),
-- Sam (29): Java, SQL, Docker, Python
(29,4),(29,5),(29,11),(29,3),
-- Tara (30): JavaScript, TypeScript, React, Node.js, SQL
(30,1),(30,2),(30,6),(30,7),(30,5);

-- ======================================================
-- PART 3: Jobs (48 postings across 12 companies)
-- Employment types  → FULL_TIME:25 PART_TIME:5 CONTRACT:8 INTERNSHIP:5 REMOTE:5
-- Experience levels → ENTRY:10 MID:15 SENIOR:12 LEAD:7 MANAGER:4
-- Status            → OPEN:40 CLOSED:6 REMOVED:2
-- Deadlines         → 8 urgent OPEN jobs (J1 J3 J5 J10 J15 J16 J21 J25)
-- Flagship apps     → J1 SHORTLISTED · J25 INTERVIEW · J27 OFFER (Alex Morgan)
-- ======================================================

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline) VALUES

-- ── TechCorp Singapore (company_id=1, posted_by=3) ──────────────────────────
-- J1
(1, 3,
 'Senior Backend Engineer',
 'TechCorp Singapore is looking for a Senior Backend Engineer to join our core platform team. You will design, build, and operate high-throughput microservices that power our talent intelligence products, serving millions of job seekers and recruiters across Southeast Asia. Day-to-day responsibilities include leading API design reviews, optimising database queries on multi-million-row tables, mentoring mid-level engineers, and participating in on-call rotations. Our stack is Java 17, Spring Boot 3, MySQL 8, Apache Kafka, and AWS EKS. You are expected to own features end-to-end: from architecture decision records through production deployment and post-incident retrospectives. Candidates with strong distributed-systems fundamentals, experience with event-driven patterns, and a track record of improving system reliability are strongly preferred.',
 'Singapore', 'FULL_TIME', 'SENIOR', 85000.00, 120000.00, 'OPEN', '2026-03-01 09:00:00', '2026-06-01'),

-- J2
(1, 3,
 'Full-Stack Developer',
 'Join TechCorp Singapore as a Full-Stack Developer and help us build the next generation of our recruitment marketplace. You will work across the entire stack — React on the frontend and Node.js or Java Spring Boot on the backend — delivering features used by hundreds of thousands of daily active users. You will collaborate with product designers to translate Figma mocks into pixel-perfect, accessible UIs, and with data engineers to surface real-time analytics within the product. We value engineers who write clean, testable code, move quickly without breaking things, and can debug a UI regression and a SQL plan in the same afternoon. TypeScript, React Query, and Tailwind CSS are part of our daily toolkit.',
 'Singapore', 'FULL_TIME', 'MID', 55000.00, 78000.00, 'OPEN', '2026-03-15 10:00:00', NULL),

-- J3
(1, 3,
 'Software Engineering Intern',
 'TechCorp Singapore''s internship programme gives you real engineering experience — not grunt work. As a Software Engineering Intern, you will be embedded in a product team, owning a well-scoped feature from design to production over your 12–16 week tenure. Past interns have shipped search ranking improvements, built internal tooling, and refactored core data pipelines. You will attend sprint ceremonies, participate in code reviews, and get a mentor who holds weekly 1-on-1s with you. We expect familiarity with at least one of Python, Java, or JavaScript, a basic understanding of REST APIs, and genuine curiosity about how large-scale systems work. Strong performers are considered for return full-time offers.',
 'Singapore', 'INTERNSHIP', 'ENTRY', 25000.00, 35000.00, 'OPEN', '2026-04-01 08:30:00', '2026-06-15'),

-- J4
(1, 3,
 'Technical Lead – Platform Engineering',
 'TechCorp Singapore is hiring a Technical Lead to guide our Platform Engineering squad responsible for developer tooling, CI/CD pipelines, observability, and internal services. You will set the technical direction for a team of five engineers, run architecture reviews, define quarterly OKRs alongside the engineering manager, and represent the squad in cross-team planning. This role requires deep expertise in AWS, Kubernetes, and at least one compiled language. You will spend roughly 60% of your time coding and 40% on technical leadership activities. If you have previously led the migration of a monolith to microservices, introduced GitOps practices, or built a self-service developer platform, we want to hear from you.',
 'Singapore', 'FULL_TIME', 'LEAD', 105000.00, 148000.00, 'OPEN', '2026-02-20 09:00:00', NULL),

-- ── Finova Financial (company_id=2, posted_by=4) ─────────────────────────────
-- J5
(2, 4,
 'Data Engineer',
 'Finova Financial is seeking a Data Engineer to build and maintain the pipelines that feed our risk and compliance intelligence platform. You will ingest structured and semi-structured data from over 30 upstream sources — market feeds, regulatory filings, transaction systems — and deliver clean, well-modelled datasets to analysts and machine learning teams. Our stack is Python, Apache Spark, dbt, Airflow, and AWS (S3, Glue, Redshift). You will introduce data quality monitoring, maintain lineage documentation, and collaborate closely with data consumers to understand their SLA requirements. Candidates should have solid SQL skills, experience building production-grade pipelines, and a good grasp of dimensional modelling and slowly changing dimensions.',
 'Singapore', 'FULL_TIME', 'MID', 60000.00, 80000.00, 'OPEN', '2026-04-10 09:00:00', '2026-06-10'),

-- J6
(2, 4,
 'Risk Analyst – Credit & Market',
 'Finova Financial''s Risk Analytics team is growing and we need a Risk Analyst with a strong quantitative background to support credit and market risk modelling. You will develop and back-test risk models, produce regulatory capital calculations (Basel III/IV), and build dashboards for senior risk committees. This role sits at the intersection of finance and data — you will write SQL daily, build Python scripts for scenario analysis, and communicate complex risk metrics clearly to non-technical stakeholders. We value intellectual rigour, attention to data accuracy, and the ability to translate quantitative findings into business-level recommendations. Prior exposure to credit risk, VaR, or stress-testing frameworks is a strong plus.',
 'Singapore', 'FULL_TIME', 'MID', 55000.00, 75000.00, 'OPEN', '2026-03-05 10:00:00', NULL),

-- J7
(2, 4,
 'Cloud Infrastructure Engineer',
 'Finova Financial is looking for a Cloud Infrastructure Engineer to join our SRE function on a fully remote basis. You will own the reliability and security of our AWS-based infrastructure — multi-region EKS clusters, RDS Aurora, and a suite of serverless workloads. Key responsibilities include capacity planning, cost optimisation, incident response, and championing infrastructure-as-code using Terraform. You will also collaborate with our compliance team to ensure our environments meet MAS Technology Risk Management guidelines. We are a remote-first team with quarterly in-person meetups in Singapore. Strong candidates will have hands-on Kubernetes experience, familiarity with cloud security best practices, and a disciplined approach to documentation and runbook maintenance.',
 'Singapore (Remote)', 'REMOTE', 'SENIOR', 88000.00, 118000.00, 'OPEN', '2026-04-20 09:30:00', NULL),

-- J8
(2, 4,
 'Head of Technology',
 'Finova Financial is looking for a Head of Technology to lead our engineering and infrastructure organisation as we scale from Series B to Series C. Reporting to the CTO, you will manage three engineering squads (30 headcount), own the technology roadmap, and represent engineering in board-level conversations. You will make build-versus-buy decisions, drive vendor negotiations, establish engineering hiring standards, and ensure the organisation can execute reliably at increased velocity. This role requires a blend of people leadership, strategic thinking, and sufficient technical depth to earn the respect of your engineering teams. Prior experience leading technology in a regulated financial services context is highly desirable.',
 'Singapore', 'FULL_TIME', 'MANAGER', 130000.00, 178000.00, 'OPEN', '2026-02-25 09:00:00', NULL),

-- ── HealthBridge (company_id=3, posted_by=5) ─────────────────────────────────
-- J9
(3, 5,
 'Healthcare Data Analyst',
 'HealthBridge is seeking a Healthcare Data Analyst to transform our clinical and operational data into actionable insights. You will work with large datasets from electronic health records, wearable devices, and patient feedback systems to produce reports, dashboards, and statistical summaries for clinical leadership and hospital partners across Southeast Asia. Daily tasks include writing complex SQL queries, building Power BI and Tableau dashboards, and presenting findings in cross-functional meetings. Familiarity with healthcare data standards such as HL7 FHIR or ICD-10 is a significant advantage. We value analysts who ask the right questions, challenge assumptions in data, and communicate uncertainty clearly to non-technical audiences.',
 'Singapore', 'FULL_TIME', 'MID', 52000.00, 72000.00, 'OPEN', '2026-03-20 09:00:00', NULL),

-- J10
(3, 5,
 'Machine Learning Engineer – Clinical AI',
 'HealthBridge is hiring a Machine Learning Engineer to develop and deploy predictive models that assist clinicians in early diagnosis and care pathway optimisation. You will work alongside physicians, data scientists, and software engineers to move models from research prototype to production — handling data ingestion, feature engineering, model training, evaluation, and serving at scale. Our primary stack is Python (PyTorch, scikit-learn), MLflow, AWS SageMaker, and FastAPI. You will implement rigorous model validation frameworks and maintain explainability documentation required for clinical stakeholder trust. Prior experience deploying ML in a regulated domain (healthcare, finance, or similar) is strongly preferred, along with solid software engineering practices in Python.',
 'Singapore', 'FULL_TIME', 'SENIOR', 90000.00, 120000.00, 'OPEN', '2026-04-15 09:00:00', '2026-06-05'),

-- J11
(3, 5,
 'Product Manager – Digital Health Platforms',
 'HealthBridge is looking for a Product Manager to lead our digital health platform suite — a set of patient-facing mobile apps, clinician portals, and API integrations with hospital systems. You will own the product roadmap, facilitate discovery sessions with clinical end-users, write detailed PRDs, and coordinate delivery across engineering, design, and regulatory teams. This role requires you to balance speed-to-market with the rigorous quality and compliance standards of healthcare software. You should have prior PM experience with complex B2B or B2B2C platforms, strong stakeholder management skills, and comfort with data-driven decision-making. Familiarity with SaMD regulatory frameworks (MDR, FDA 510(k)) is a bonus.',
 'Singapore', 'FULL_TIME', 'LEAD', 102000.00, 145000.00, 'OPEN', '2026-03-01 10:00:00', NULL),

-- J12 — CLOSED
(3, 5,
 'Clinical Software Developer',
 'HealthBridge is hiring a Clinical Software Developer on a 12-month contract to accelerate delivery of our hospital integration layer. You will build and maintain Java Spring Boot services that connect HealthBridge''s platform to hospital EMR systems using HL7 FHIR R4. Tasks include implementing FHIR resource mappings, writing integration tests against sandbox environments, and collaborating with clinical informatics specialists to validate data accuracy. The contract has a strong likelihood of extension or conversion to permanent for high performers. You should be comfortable with Java, REST APIs, SQL, and ideally have some exposure to healthcare interoperability standards. Experience with open-source FHIR servers (HAPI FHIR) is a plus.',
 'Singapore', 'CONTRACT', 'MID', 55000.00, 75000.00, 'CLOSED', '2026-02-18 09:00:00', NULL),

-- ── EduNest (company_id=4, posted_by=6) ──────────────────────────────────────
-- J13
(4, 6,
 'Frontend Developer',
 'EduNest is hiring a Frontend Developer to help build the learner-facing experience for our adaptive learning platform used by over 400,000 students across Indonesia, Malaysia, and the Philippines. You will translate designs into accessible, performant React components, collaborate with backend engineers to integrate REST APIs, and write unit and integration tests using Vitest and React Testing Library. We care deeply about page load performance and accessibility — W3C WCAG 2.1 AA compliance is a baseline requirement for all new UI work. You should have solid JavaScript and TypeScript fundamentals, experience with React, and a good eye for detail. Tailwind CSS, Framer Motion, and TanStack Query experience is a strong advantage.',
 'Jakarta', 'FULL_TIME', 'ENTRY', 32000.00, 48000.00, 'OPEN', '2026-04-05 09:00:00', NULL),

-- J14
(4, 6,
 'Learning Experience Designer',
 'EduNest is looking for a Learning Experience Designer to join our curriculum team on a part-time basis (20–25 hours per week). You will design instructional frameworks for our K-12 and higher education product lines, create assessment rubrics, and collaborate with subject-matter experts to translate academic content into engaging microlearning modules. Your work will directly influence how over 400,000 learners progress through personalised learning paths. Prior experience designing online learning experiences using tools like Articulate 360, Adobe Captivate, or custom LMS authoring environments is required. You should understand pedagogical principles, learning taxonomies (Bloom, Gagné), and UX design fundamentals as they apply to educational contexts.',
 'Jakarta (Hybrid)', 'PART_TIME', 'MID', 28000.00, 42000.00, 'OPEN', '2026-04-25 10:00:00', NULL),

-- J15
(4, 6,
 'EdTech Product Manager',
 'EduNest is seeking an experienced EdTech Product Manager to own our adaptive learning engine — the core recommendation system that personalises content sequences for each learner. You will lead a cross-functional squad of engineers, data scientists, and curriculum designers, managing the full product lifecycle from ideation through launch and iteration. Key responsibilities include conducting user research with students and teachers, defining success metrics, writing feature specifications, prioritising the backlog, and presenting roadmap updates to the leadership team. You should have a proven record of shipping impactful product improvements in a data-driven environment. Experience in education technology, B2C SaaS, or consumer mobile products is strongly preferred.',
 'Jakarta', 'FULL_TIME', 'SENIOR', 82000.00, 115000.00, 'OPEN', '2026-03-10 09:00:00', '2026-06-10'),

-- J16
(4, 6,
 'Content Operations Intern',
 'EduNest''s Content Operations team is looking for a motivated intern to support the production pipeline for our digital learning content. You will assist with quality-checking new modules, tagging content in our CMS, coordinating with freelance educators, and generating production reports. This is a great opportunity to learn how a high-growth EdTech company manages a large content library across multiple markets and languages. You should be organised, detail-oriented, and comfortable with spreadsheets and basic data entry tools. Familiarity with any CMS (WordPress, Contentful, or similar) is a plus. The internship runs for 3 months with a possible extension.',
 'Jakarta', 'INTERNSHIP', 'ENTRY', 18000.00, 24000.00, 'OPEN', '2026-05-01 09:00:00', '2026-06-01'),

-- ── RetailPlus (company_id=5, posted_by=7) ────────────────────────────────────
-- J17
(5, 7,
 'E-commerce Marketing Specialist',
 'RetailPlus is looking for an E-commerce Marketing Specialist to drive customer acquisition and retention across our online retail channels. You will plan and execute paid media campaigns on Google Ads, Meta, and TikTok, analyse campaign performance using GA4 and internal dashboards, and collaborate with the merchandising team on promotional calendars. You will also manage email marketing flows in Klaviyo and contribute to SEO content strategy. We are a data-first marketing team — you should be comfortable building pivot tables, writing SQL queries for ad-hoc analysis, and presenting results clearly to senior stakeholders. Prior experience managing a monthly paid media budget of at least SGD 100K is preferred.',
 'Bangkok', 'FULL_TIME', 'MID', 50000.00, 70000.00, 'OPEN', '2026-03-25 09:00:00', NULL),

-- J18
(5, 7,
 'Supply Chain Analyst',
 'RetailPlus is seeking a Supply Chain Analyst to support our inventory planning and logistics operations across Thailand, Malaysia, and Vietnam. You will build demand forecasting models, analyse supplier lead times, identify bottlenecks in the inbound and outbound logistics flow, and produce weekly operations dashboards for the Supply Chain Director. Proficiency in SQL and Python (pandas, NumPy) is essential for extracting and manipulating data from our ERP and WMS systems. You will also work closely with regional warehouse managers to validate data accuracy and implement process improvements. Knowledge of supply chain methodologies (EOQ, safety stock calculation, ABC analysis) and prior retail or FMCG experience are strong advantages.',
 'Bangkok', 'FULL_TIME', 'MID', 52000.00, 72000.00, 'OPEN', '2026-04-08 09:00:00', NULL),

-- J19
(5, 7,
 'Sales Development Representative',
 'RetailPlus is expanding its B2B marketplace division and needs energetic Sales Development Representatives to generate qualified leads for our enterprise retail solutions. You will prospect new accounts via LinkedIn, cold calling, and email outreach, qualify inbound leads from marketing campaigns, and book discovery calls for senior account executives. This role is an excellent entry point into a fast-paced retail-technology sales career with a clearly defined path to Account Executive. We provide structured onboarding, call coaching, and access to sales intelligence tools (Salesforce, Apollo). You should be a confident communicator, comfortable with rejection, and motivated by measurable targets and commission rewards.',
 'Bangkok', 'FULL_TIME', 'ENTRY', 32000.00, 48000.00, 'OPEN', '2026-05-05 09:00:00', NULL),

-- J20
(5, 7,
 'Head of Digital Retail',
 'RetailPlus is hiring a Head of Digital Retail to lead the strategy and P&L for our online channel across five Southeast Asian markets. Reporting directly to the CEO, you will set the vision for our e-commerce experience, manage a team of 15 across marketing, product, and merchandising, and drive double-digit growth in online GMV year-over-year. You will own the technology roadmap for our digital storefront, lead negotiations with marketplace partners (Lazada, Shopee, TikTok Shop), and represent the digital channel in leadership forums. Candidates must have prior experience running a significant digital retail or marketplace business, strong commercial acumen, and proven people management skills.',
 'Bangkok', 'FULL_TIME', 'MANAGER', 125000.00, 170000.00, 'OPEN', '2026-02-28 09:00:00', NULL),

-- ── GreenLogix (company_id=6, posted_by=8) ────────────────────────────────────
-- J21
(6, 8,
 'Logistics Operations Lead',
 'GreenLogix is seeking a Logistics Operations Lead to oversee our last-mile and middle-mile delivery operations across the Philippines. You will manage a team of eight operations coordinators, own the KPI framework for on-time delivery and cost-per-parcel, and drive continuous improvement initiatives. You will work closely with the technology team to scope operational requirements for our route-optimisation platform, and with commercial teams to onboard new enterprise clients with complex logistics SLAs. This role requires deep operational experience — you should be comfortable in a warehouse, at a driver briefing, and in an executive presentation within the same day. Prior leadership in a courier, 3PL, or e-commerce logistics company is required.',
 'Manila', 'FULL_TIME', 'LEAD', 100000.00, 140000.00, 'OPEN', '2026-03-15 09:00:00', '2026-06-15'),

-- J22
(6, 8,
 'Sustainability Analyst',
 'GreenLogix is hiring a Sustainability Analyst on a 6-month contract to support our ESG reporting and carbon-reduction roadmap. You will collect and validate Scope 1, 2, and 3 emissions data from our fleet and logistics network, build reporting models aligned with GHG Protocol standards, and prepare input for our annual sustainability report. You will also benchmark our carbon intensity against industry peers and identify quick-win reduction opportunities. Strong analytical skills, experience with Excel or Python for data analysis, and an understanding of logistics emissions measurement are required. Familiarity with ISO 14064 or the TCFD framework is a significant advantage.',
 'Manila', 'CONTRACT', 'MID', 42000.00, 58000.00, 'OPEN', '2026-04-01 10:00:00', NULL),

-- J23
(6, 8,
 'Fleet Management Intern',
 'GreenLogix is offering a 3-month internship in our Fleet Management division. As an intern, you will assist fleet coordinators with vehicle maintenance scheduling, driver performance reporting, and telematics data analysis. You will learn how real-time GPS tracking and route-optimisation algorithms are used to reduce fuel consumption and improve delivery SLAs. Daily tasks include updating fleet databases, generating route performance reports, and attending operational team meetings. This is a hands-on role — you will visit depot sites and work alongside experienced fleet managers. We are looking for students or recent graduates in logistics, supply chain management, industrial engineering, or a related field.',
 'Manila', 'INTERNSHIP', 'ENTRY', 18000.00, 25000.00, 'OPEN', '2026-05-10 09:00:00', NULL),

-- J24
(6, 8,
 'Route Optimization Engineer',
 'GreenLogix is looking for a Route Optimization Engineer to join our remote-first technology team and improve the algorithms powering our last-mile delivery network. You will research and implement combinatorial optimisation techniques — vehicle routing, time-window constraints, dynamic re-routing — and validate improvements through simulations and A/B tests on live traffic. Our stack includes Python, OR-Tools, PostgreSQL with PostGIS, and AWS Lambda. You will collaborate with operations analysts to understand real-world logistics constraints and translate them into well-specified algorithmic requirements. Strong mathematical fundamentals (linear programming, graph algorithms), Python proficiency, and prior experience with routing or scheduling problems are essential.',
 'Manila (Remote)', 'REMOTE', 'SENIOR', 85000.00, 115000.00, 'OPEN', '2026-03-28 10:00:00', NULL),

-- ── CloudStack (company_id=7, posted_by=9) ────────────────────────────────────
-- J25 — Alex Morgan's INTERVIEW job
(7, 9,
 'Cloud Architect',
 'CloudStack is hiring a Cloud Architect to lead the design and governance of multi-tenant cloud environments deployed across AWS and GCP for our enterprise SaaS clients. You will produce architecture blueprints, run cloud design workshops with client engineering teams, define reference architectures for common workload patterns, and review infrastructure-as-code pull requests. Security is central to this role — you will design IAM policies, network segmentation strategies, and encryption-at-rest and in-transit schemes that meet ISO 27001 and SOC 2 Type II requirements. You should have deep AWS expertise (Solutions Architect Professional or equivalent), hands-on Kubernetes and Terraform experience, and a track record of delivering complex, production-grade cloud migrations.',
 'Singapore', 'FULL_TIME', 'SENIOR', 92000.00, 125000.00, 'OPEN', '2026-03-05 09:00:00', '2026-06-05'),

-- J26
(7, 9,
 'DevOps Engineer',
 'CloudStack is looking for a DevOps Engineer to join our platform reliability team. You will build and maintain CI/CD pipelines for internal and client-facing workloads, manage Kubernetes clusters on AWS EKS, and develop Terraform modules for our infrastructure provisioning library. You will also set up and tune observability stacks (Prometheus, Grafana, OpenTelemetry), define alerting runbooks, and participate in on-call rotations. We operate in a fast-paced, client-driven environment where reliability expectations are high and incident response turnaround must be fast. You should be comfortable with GitOps workflows, have strong Linux and networking fundamentals, and bring a documented history of reducing toil through automation.',
 'Singapore', 'FULL_TIME', 'MID', 62000.00, 82000.00, 'OPEN', '2026-03-22 09:00:00', NULL),

-- J27 — Alex Morgan's OFFER job
(7, 9,
 'Backend Engineer – Platform',
 'CloudStack is seeking a Backend Engineer to join our Platform Engineering team, building the internal APIs and services that underpin our multi-tenant SaaS control plane. You will design and implement RESTful and event-driven APIs in Java and Python, optimise slow database queries, and contribute to the multi-tenancy isolation layer that keeps customer data safe and correctly scoped. Our engineering culture prizes testability, code review rigour, and incremental delivery over big-bang releases. You will be part of an on-call rotation and expected to respond to and resolve production incidents. Strong SQL skills, familiarity with AWS services, experience with event-driven architectures (Kafka or SQS), and a bias for operational clarity are all important.',
 'Singapore', 'FULL_TIME', 'SENIOR', 88000.00, 118000.00, 'OPEN', '2026-04-12 09:00:00', NULL),

-- J28 — CLOSED
(7, 9,
 'Infrastructure Automation Engineer',
 'CloudStack is looking for an Infrastructure Automation Engineer on a 9-month contract to help migrate 40+ client workloads from hand-crafted CloudFormation stacks to a standardised Terraform module library. You will audit existing infrastructure, write modular Terraform code, run parallel validation environments, and coordinate with client DevOps teams during cutover windows. This contract has a high likelihood of conversion to permanent based on business growth. You should have strong Terraform experience (modules, workspaces, remote state), solid Docker and Kubernetes knowledge, and be comfortable writing Python or Bash scripts for automation glue. The ideal candidate is systematic, documents as they go, and communicates clearly with technical and non-technical stakeholders.',
 'Singapore', 'CONTRACT', 'MID', 58000.00, 78000.00, 'CLOSED', '2026-02-16 09:00:00', NULL),

-- ── MediaWave (company_id=8, posted_by=10) ────────────────────────────────────
-- J29
(8, 10,
 'Digital Marketing Manager',
 'MediaWave is hiring a Digital Marketing Manager to lead paid and organic growth for our network of entertainment and lifestyle media brands across Indonesia and the Philippines. You will manage a team of three specialists, own a multi-channel budget exceeding USD 500K per year, and be accountable for audience growth, CPL, and content engagement KPIs. You will set the strategy for SEO, SEM, email, and social channels, run weekly performance reviews, and present quarterly results to the C-suite. We are looking for a data-driven marketer who combines creative instinct with analytical rigour — someone who can write a compelling campaign brief and interrogate a Google Analytics dashboard with equal confidence.',
 'Jakarta', 'FULL_TIME', 'SENIOR', 80000.00, 110000.00, 'OPEN', '2026-04-18 09:00:00', NULL),

-- J30
(8, 10,
 'Content Creator – Entertainment',
 'MediaWave is looking for a part-time Content Creator to produce short-form video scripts, social media copy, and newsletter content for two of our entertainment channels (combined 2.5M followers). You will stay on top of trending topics, brainstorm content ideas in weekly editorial calls, write scripts optimised for TikTok and Instagram Reels, and contribute to our monthly content calendar. This role suits a pop-culture enthusiast with a sharp writing voice, good sense of pacing for short-form content, and comfort with fast turnaround cycles. Approximately 20 hours per week. Remote-friendly but you must be available for overlap during Jakarta business hours.',
 'Jakarta (Hybrid)', 'PART_TIME', 'ENTRY', 22000.00, 36000.00, 'OPEN', '2026-05-08 10:00:00', NULL),

-- J31
(8, 10,
 'Video Production Intern',
 'MediaWave is offering a 3-month Video Production Internship for film, media, or communications students who want real-world experience in a fast-moving digital media environment. You will assist our production team with shoot logistics, B-roll capture, basic editing in Adobe Premiere Pro, and asset management. You will shadow senior producers on client shoots and learn the end-to-end workflow from concept brief to published video. A portfolio of personal video projects (even casual YouTube or TikTok content) is welcome. Comfort with Adobe Creative Cloud tools and a willingness to learn fast are more important than prior professional experience. Equipment training is provided.',
 'Jakarta', 'INTERNSHIP', 'ENTRY', 15000.00, 22000.00, 'OPEN', '2026-04-30 09:00:00', NULL),

-- J32
(8, 10,
 'Social Media Strategist',
 'MediaWave is bringing on a Social Media Strategist on a 6-month renewable contract to develop and execute platform strategies for three of our media brands. You will conduct competitive audits, define monthly content pillars, brief creators and designers, schedule and publish posts, and monitor performance using native analytics and Sprout Social. You will report weekly on follower growth, engagement rate, and video completion metrics, and make data-backed recommendations to the editorial director. You should have hands-on experience managing brand accounts on Instagram, TikTok, and YouTube — ideally for a media, lifestyle, or consumer brand — with a genuine feel for what formats and hooks perform in each platform''s algorithm.',
 'Jakarta', 'CONTRACT', 'MID', 40000.00, 58000.00, 'OPEN', '2026-03-18 10:00:00', NULL),

-- ── UrbanBuild (company_id=9, posted_by=8) ────────────────────────────────────
-- J33
(9, 8,
 'Civil Engineer – Structural',
 'UrbanBuild is seeking a Civil Engineer with a structural background to join project teams delivering residential tower and mixed-use development projects in the Philippines. You will prepare and review structural engineering drawings, perform load calculations, liaise with geotechnical consultants, and supervise reinforced concrete works on site. You will coordinate with architects, M&E engineers, and quantity surveyors to resolve design conflicts and ensure construction proceeds on programme. Familiarity with NSCP (National Structural Code of the Philippines) and experience using STAAD.Pro, ETABS, or SAP2000 for structural analysis are required. Candidates must be licensed civil engineers (PRC) in good standing.',
 'Manila', 'FULL_TIME', 'MID', 50000.00, 68000.00, 'OPEN', '2026-04-02 09:00:00', NULL),

-- J34
(9, 8,
 'Project Manager – Construction',
 'UrbanBuild is hiring a Project Manager to lead delivery of a PHP 2.5B mixed-use development in Quezon City. You will own the master programme, manage a team of site engineers and coordinators, hold subcontractors accountable to quality and schedule milestones, manage change orders, and report fortnightly to the client and UrbanBuild board. You should have managed at least one large-scale vertical development project end-to-end, have solid understanding of contracts (FIDIC or similar), and be comfortable preparing EVM reports. A degree in civil engineering, project management certification (PMP or equivalent), and strong stakeholder communication skills are expected.',
 'Manila', 'FULL_TIME', 'SENIOR', 85000.00, 115000.00, 'OPEN', '2026-03-12 09:00:00', NULL),

-- J35 — CLOSED
(9, 8,
 'Lead Quantity Surveyor',
 'UrbanBuild is looking for a Lead Quantity Surveyor to oversee cost management across a portfolio of three active construction projects. You will prepare bills of quantities, conduct tender evaluations, certify interim payment applications, manage the variation register, and produce monthly cost reports for senior leadership. You will mentor two junior QS team members and liaise directly with project managers and clients on cost-related matters. Proficiency in CostX, Buildsoft, or similar QS software is required. Candidates should hold a degree in quantity surveying and have at least eight years of post-qualification experience in building construction, with exposure to residential high-rise projects.',
 'Manila', 'PART_TIME', 'LEAD', 70000.00, 95000.00, 'CLOSED', '2026-02-22 09:00:00', NULL),

-- J36 — REMOVED
(9, 8,
 'Site Safety Officer',
 'UrbanBuild is recruiting a Site Safety Officer for a residential project in Bonifacio Global City. You will conduct daily toolbox talks, perform safety inspections of scaffolding, formwork, and lifting operations, investigate near-misses, and maintain DOLE-required safety records. You must hold a current COSH certificate and have at least two years of on-site construction safety experience. Duties also include coordinating with the safety consultant on regulatory submissions and preparing monthly safety statistics for the project manager. Candidates must be comfortable working at heights and in an active construction environment.',
 'Manila', 'CONTRACT', 'ENTRY', 28000.00, 38000.00, 'REMOVED', '2026-04-25 09:00:00', NULL),

-- ── FinTrust Asia (company_id=10, posted_by=4) ────────────────────────────────
-- J37
(10, 4,
 'Financial Analyst',
 'FinTrust Asia is looking for a Financial Analyst to join our investment research team covering ASEAN equity markets. You will build and maintain three-statement financial models, write sector-specific research notes, prepare client-ready presentation decks, and support senior analysts during earnings seasons. You will also extract and clean financial data using Bloomberg Terminal, Refinitiv Eikon, and SQL queries against our internal data warehouse. Strong Excel and PowerPoint skills are essential. CFA Level 1 or above is preferred. We are looking for individuals with a genuine interest in financial markets, intellectual curiosity, and the rigour to maintain accurate models under tight deadlines.',
 'Singapore', 'FULL_TIME', 'MID', 55000.00, 75000.00, 'OPEN', '2026-05-02 09:00:00', NULL),

-- J38
(10, 4,
 'Senior Risk Manager',
 'FinTrust Asia is seeking a Senior Risk Manager to strengthen our enterprise risk management framework as we expand into new ASEAN markets. Reporting to the CRO, you will maintain the risk register, facilitate quarterly risk assessments with business unit heads, develop risk appetite statements, and ensure alignment with MAS Guidelines on Risk Management Practices. You will also support the internal audit cycle and coordinate responses to regulatory examinations. The ideal candidate has deep knowledge of financial services risk frameworks, strong analytical and report-writing skills, and experience working within MAS or equivalent ASEAN regulatory environments. This role can be performed on a primarily remote basis with monthly visits to our Singapore office.',
 'Singapore (Remote)', 'REMOTE', 'SENIOR', 90000.00, 120000.00, 'OPEN', '2026-03-08 09:00:00', NULL),

-- J39 — CLOSED
(10, 4,
 'Director of AML Compliance',
 'FinTrust Asia is hiring a Director of AML Compliance to lead our anti-money laundering programme across all regulated entities in Singapore, Malaysia, and Thailand. You will oversee the compliance team, manage relationships with MAS and equivalent regulators, chair the MLRO committee, drive remediation of findings from MAS inspections, and maintain our AML/CFT policies and risk assessments. You will also lead deployment of transaction monitoring system enhancements and ensure suspicious activity reporting meets regulatory timelines. Candidates must have at least twelve years of AML compliance experience in financial services, detailed knowledge of FATF recommendations, and prior MLRO experience is preferred. ICA Diploma or CAMS certification is required.',
 'Singapore', 'PART_TIME', 'MANAGER', 145000.00, 180000.00, 'CLOSED', '2026-02-20 09:00:00', NULL),

-- J40
(10, 4,
 'VP of Finance Technology',
 'FinTrust Asia is looking for a VP of Finance Technology to lead the digital transformation of our finance operations. You will own the technology roadmap for finance systems — ERP, treasury management, regulatory reporting, and data infrastructure — and manage a team of six system analysts and developers. Working closely with the CFO and CTO, you will evaluate and implement new platforms, drive finance process automation using RPA and APIs, and ensure data integrity across the finance technology stack. You should have prior leadership experience in a fintech or financial services environment, strong project management skills, and sufficient technical depth to engage meaningfully with architects and developers.',
 'Singapore', 'FULL_TIME', 'MANAGER', 130000.00, 175000.00, 'OPEN', '2026-03-30 09:00:00', NULL),

-- ── Medica Group (company_id=11, posted_by=5) ─────────────────────────────────
-- J41
(11, 5,
 'Lead Medical Software Engineer',
 'Medica Group is looking for a Lead Medical Software Engineer to guide the engineering squad responsible for our diagnostic imaging software platform. You will make architectural decisions, conduct code and design reviews, manage sprint delivery, and mentor a team of four engineers. The platform is built in Java and Python, integrates with PACS systems via DICOM, and runs on AWS. You will work closely with radiologists and product managers to translate clinical requirements into well-specified engineering tasks, and own the software quality processes required for our ISO 13485 certification. Candidates need strong Java and Python skills, experience with regulated software development (IEC 62304), and genuine interest in the clinical domain.',
 'Singapore', 'FULL_TIME', 'LEAD', 108000.00, 148000.00, 'OPEN', '2026-04-22 09:00:00', NULL),

-- J42
(11, 5,
 'Data Science Lead – Clinical Analytics',
 'Medica Group is seeking a Data Science Lead to build and manage our clinical analytics capability. You will own the roadmap for predictive models across oncology, cardiology, and radiology workflows, hire and develop a small team of data scientists, and partner with clinical leads to validate model outputs in real-world care settings. You will also represent data science in product planning and ensure models meet explainability requirements for regulatory submissions. This role is remote with quarterly on-site visits to Singapore and partner hospitals. You should have a PhD or equivalent research experience in a quantitative discipline, a strong publication record or industry portfolio in applied ML for healthcare, and proven team leadership experience.',
 'Singapore (Remote)', 'REMOTE', 'LEAD', 115000.00, 150000.00, 'OPEN', '2026-03-14 10:00:00', NULL),

-- J43 — CLOSED
(11, 5,
 'Healthcare IT Consultant',
 'Medica Group is hiring a Healthcare IT Consultant on a 12-month contract to support hospital digital transformation engagements across Malaysia and Singapore. You will assess clients'' current IT landscape, develop implementation roadmaps for EMR and clinical decision support deployments, facilitate stakeholder workshops, and produce detailed gap analyses and solution design documents. You will work alongside clinicians, hospital IT teams, and third-party vendors to ensure deployments go live on schedule and meet clinical workflow requirements. Candidates should have prior healthcare IT consulting experience, familiarity with HL7 FHIR and/or IHE integration profiles, and strong facilitation and written communication skills.',
 'Singapore', 'CONTRACT', 'SENIOR', 85000.00, 115000.00, 'CLOSED', '2026-02-24 09:00:00', NULL),

-- J44 — REMOVED
(11, 5,
 'Clinical Informatics Intern',
 'Medica Group''s Clinical Informatics team is offering a 3-month internship for students in health informatics, biomedical engineering, or computer science. You will help map clinical workflows, support configuration of our clinical decision support rules engine, and assist with data quality assessments on de-identified patient datasets. You will attend weekly clinical team meetings and shadowing sessions at partner clinics. Basic SQL knowledge is required. Familiarity with Python or R for data exploration is a bonus. This is a great opportunity to see how software engineering and clinical practice intersect in a regulated healthcare environment.',
 'Singapore', 'INTERNSHIP', 'ENTRY', 18000.00, 26000.00, 'REMOVED', '2026-05-07 09:00:00', NULL),

-- ── ByteForge (company_id=12, posted_by=9) ────────────────────────────────────
-- J45
(12, 9,
 'Junior Frontend Developer',
 'ByteForge is looking for a Junior Frontend Developer to join our product team and help build beautiful, performant UI for our fintech SaaS products. You will work under the guidance of a senior frontend engineer, implementing React components from Figma designs, integrating REST APIs, writing unit tests, and addressing accessibility and cross-browser issues. We follow a design-system-first approach — you will contribute to and consume our shared component library from day one. This is an excellent role for a new or recent graduate who has a solid grounding in JavaScript and React, has built at least one non-trivial personal or university project, and is eager to grow quickly in a structured, feedback-rich environment.',
 'Singapore', 'PART_TIME', 'ENTRY', 28000.00, 42000.00, 'OPEN', '2026-05-12 09:00:00', NULL),

-- J46 — CLOSED
(12, 9,
 'Node.js Backend Developer',
 'ByteForge is hiring a Node.js Backend Developer on a 6-month renewable contract to accelerate delivery of our payments orchestration API. You will build and document REST endpoints, integrate third-party payment gateways (Stripe, Adyen, PayNow), write integration tests, and ensure PCI-DSS compliance for all payment-data flows. You will work in a team of three developers using TypeScript, Express, Prisma, and PostgreSQL. Strong Node.js and SQL fundamentals are required. Experience with payment gateway integrations or PCI-DSS environments is a significant advantage. The contract is structured to convert to permanent for candidates who demonstrate technical depth and team-fit.',
 'Singapore', 'CONTRACT', 'MID', 60000.00, 80000.00, 'CLOSED', '2026-03-28 09:00:00', NULL),

-- J47
(12, 9,
 'Technical Lead – Payments Platform',
 'ByteForge is seeking a Technical Lead to own the architecture and delivery of our payments platform — the high-reliability transaction processing layer used by over 200 merchant clients. You will design for fault tolerance and idempotency, lead a squad of four engineers, review all major PRs, define the testing strategy, and liaise with compliance and security teams on PCI-DSS and MAS Payment Services Act requirements. You will also drive the evaluation and adoption of new payment rails (PayNow, cross-border real-time payments) as ByteForge expands to Malaysia and Indonesia. Strong candidates have hands-on experience building payment infrastructure in Java or Node.js and have operated systems processing at least SGD 1M in daily transaction volume.',
 'Singapore', 'CONTRACT', 'LEAD', 105000.00, 145000.00, 'OPEN', '2026-04-08 09:00:00', NULL),

-- J48
(12, 9,
 'Remote DevOps Consultant',
 'ByteForge is looking for an experienced Remote DevOps Consultant to help us achieve SOC 2 Type II compliance and strengthen our cloud security posture. You will audit our existing AWS infrastructure, identify gaps against SOC 2 Trust Service Criteria, implement controls (logging, secret management, network segmentation, patch management), and prepare evidence artefacts for our auditor. You will also set up a SIEM solution, define incident response playbooks, and run a tabletop exercise with the engineering team. This engagement is estimated at 4–6 months with a possible extension into ongoing advisory work. Candidates should have deep AWS security knowledge, hands-on Terraform, and prior experience leading SOC 2 or ISO 27001 implementations.',
 'Singapore (Remote)', 'REMOTE', 'SENIOR', 92000.00, 125000.00, 'OPEN', '2026-04-28 10:00:00', NULL);

-- ======================================================
-- PART 3-B: Job skills (2–4 skills per job)
-- Skill IDs: JS=1 TS=2 Python=3 Java=4 SQL=5 React=6
--             Node.js=7 Vue.js=8 DevOps=9 AWS=10 Docker=11
--             K8s=12 ML=13 DataAnalysis=14 UX=15 PM=16
--             Marketing=17 Sales=18 Finance=19 HR=20
-- ======================================================

INSERT INTO job_skill (job_id, skill_id) VALUES
-- J1  Senior Backend Engineer (TechCorp)
(1,4),(1,3),(1,5),(1,10),
-- J2  Full-Stack Developer (TechCorp)
(2,1),(2,2),(2,6),(2,7),
-- J3  Software Engineering Intern (TechCorp)
(3,1),(3,3),
-- J4  Technical Lead – Platform (TechCorp)
(4,4),(4,10),(4,11),(4,12),
-- J5  Data Engineer (Finova)
(5,3),(5,5),(5,10),
-- J6  Risk Analyst (Finova)
(6,5),(6,3),(6,19),
-- J7  Cloud Infrastructure Engineer (Finova)
(7,10),(7,11),(7,12),
-- J8  Head of Technology (Finova)
(8,10),(8,3),(8,16),
-- J9  Healthcare Data Analyst (HealthBridge)
(9,5),(9,3),(9,14),
-- J10 ML Engineer (HealthBridge)
(10,3),(10,13),(10,5),
-- J11 Product Manager – Digital Health (HealthBridge)
(11,16),(11,5),(11,14),
-- J12 Clinical Software Developer (HealthBridge)
(12,4),(12,5),(12,3),
-- J13 Frontend Developer (EduNest)
(13,1),(13,6),(13,2),
-- J14 Learning Experience Designer (EduNest)
(14,15),(14,16),
-- J15 EdTech Product Manager (EduNest)
(15,16),(15,5),(15,3),
-- J16 Content Operations Intern (EduNest)
(16,17),
-- J17 E-commerce Marketing Specialist (RetailPlus)
(17,17),(17,5),
-- J18 Supply Chain Analyst (RetailPlus)
(18,5),(18,14),(18,3),
-- J19 Sales Development Representative (RetailPlus)
(19,18),(19,17),
-- J20 Head of Digital Retail (RetailPlus)
(20,17),(20,18),(20,16),
-- J21 Logistics Operations Lead (GreenLogix)
(21,5),(21,3),(21,14),
-- J22 Sustainability Analyst (GreenLogix)
(22,5),(22,14),
-- J23 Fleet Management Intern (GreenLogix)
(23,5),(23,3),
-- J24 Route Optimization Engineer (GreenLogix)
(24,3),(24,13),(24,5),
-- J25 Cloud Architect (CloudStack)
(25,10),(25,11),(25,12),(25,3),
-- J26 DevOps Engineer (CloudStack)
(26,9),(26,11),(26,12),(26,10),
-- J27 Backend Engineer – Platform (CloudStack)
(27,4),(27,3),(27,5),(27,10),
-- J28 Infrastructure Automation Engineer (CloudStack)
(28,11),(28,12),(28,10),
-- J29 Digital Marketing Manager (MediaWave)
(29,17),(29,5),(29,14),
-- J30 Content Creator (MediaWave)
(30,17),
-- J31 Video Production Intern (MediaWave)
(31,17),
-- J32 Social Media Strategist (MediaWave)
(32,17),(32,18),
-- J33 Civil Engineer (UrbanBuild)
(33,5),(33,3),
-- J34 Project Manager – Construction (UrbanBuild)
(34,16),(34,5),
-- J35 Lead Quantity Surveyor (UrbanBuild)
(35,19),(35,5),
-- J36 Site Safety Officer (UrbanBuild)
(36,5),
-- J37 Financial Analyst (FinTrust Asia)
(37,19),(37,5),(37,3),
-- J38 Senior Risk Manager (FinTrust Asia)
(38,19),(38,5),(38,14),
-- J39 Director of AML Compliance (FinTrust Asia)
(39,19),(39,5),
-- J40 VP Finance Technology (FinTrust Asia)
(40,19),(40,16),(40,5),
-- J41 Lead Medical Software Engineer (Medica)
(41,4),(41,3),(41,5),
-- J42 Data Science Lead (Medica)
(42,3),(42,13),(42,5),(42,14),
-- J43 Healthcare IT Consultant (Medica)
(43,4),(43,5),(43,3),
-- J44 Clinical Informatics Intern (Medica)
(44,5),(44,3),
-- J45 Junior Frontend Developer (ByteForge)
(45,1),(45,6),(45,2),
-- J46 Node.js Backend Developer (ByteForge)
(46,7),(46,1),(46,5),
-- J47 Technical Lead – Payments (ByteForge)
(47,4),(47,7),(47,5),(47,10),
-- J48 Remote DevOps Consultant (ByteForge)
(48,9),(48,11),(48,12),(48,10);

-- ======================================================
-- PART 4: Applications (70) and Saved Jobs (25)
-- Status  → APPLIED:20  REVIEWED:15  SHORTLISTED:12
--           INTERVIEW:10  REJECTED:8  OFFER:5
-- Flagship demo@jobplus.com (user_id 11) → 1 of every status
-- 30 of 70 applications include a cover letter
-- REMOVED jobs (36, 44) receive no applications
-- saved_job: 25 rows; flagship has 5
-- ======================================================

INSERT INTO application (job_id, seeker_id, status, cover_letter, resume_url, applied_at) VALUES

-- ── Alex Morgan (11) — 6 apps, one per status ──
(2,  11, 'APPLIED',
 'With seven years building scalable React and Java applications for products used by 500K+ users, I am excited to bring that experience to TechCorp''s full-stack team. I am particularly drawn to your micro-frontend architecture and would welcome the opportunity to contribute to the platform foundation work described in the posting.',
 NULL, '2026-05-10 09:14:00'),
(26, 11, 'REVIEWED',
 'My experience shipping and operating Java microservices gives me a strong appreciation for the DevOps side of the stack. I have automated CI/CD pipelines for three production environments and am comfortable owning infrastructure reliability end-to-end.',
 NULL, '2026-04-20 10:05:00'),
(7,  11, 'REJECTED',
 'I have designed and maintained cloud infrastructure for SaaS products serving 500K+ users, with hands-on AWS and Kubernetes production experience. I am eager to apply this expertise to Finova''s cloud-native banking platform.',
 NULL, '2026-04-01 11:30:00'),
(1,  11, 'SHORTLISTED',
 'Having architected distributed Java services handling millions of daily transactions, I would bring immediate value to TechCorp''s backend platform team. My seven years spanning both IC and tech-lead responsibilities align closely with what this role demands.',
 NULL, '2026-04-08 08:45:00'),
(25, 11, 'INTERVIEW',
 'Designing scalable, multi-region architectures on AWS is work I have done for the last four years, and CloudStack''s infrastructure vision resonates strongly with my career direction. I am confident in my ability to lead architecture decisions and translate complex requirements into cost-effective, highly available designs.',
 NULL, '2026-03-30 14:22:00'),
(27, 11, 'OFFER',
 'Building resilient, observable backend platforms is where I do my best work. The Backend Engineer role at CloudStack aligns perfectly with my seven years of production Java engineering and my deep interest in developer-experience tooling that accelerates the broader engineering organisation.',
 NULL, '2026-03-20 09:00:00'),

-- ── Alice Tan (12) — 4 apps ──
(12, 12, 'OFFER',
 'As a senior Java engineer with six years of experience building distributed systems, I am well positioned to deliver reliable, compliant software for HealthBridge''s clinical workflows. I am deeply motivated by the intersection of healthcare and technology and would welcome the opportunity to contribute to products that improve patient outcomes.',
 NULL, '2026-03-22 08:30:00'),
(41, 12, 'INTERVIEW',
 'My experience leading service migrations handling 10K+ requests per second makes me a strong candidate for a lead engineering role in a regulated domain like medical software. I take mentorship seriously and would bring both technical rigour and team-building capability to Medica''s engineering leadership.',
 NULL, '2026-04-02 09:15:00'),
(4,  12, 'SHORTLISTED',
 'After three years leading service architecture reviews and growing a team of engineers at Govtech Singapore, I am ready to step into a broader technical leadership remit. TechCorp''s engineering culture and platform scale make this role exactly the challenge I am looking for.',
 NULL, '2026-04-10 10:00:00'),
(28, 12, 'REVIEWED',    NULL, NULL, '2026-04-18 11:20:00'),

-- ── Bob Rahman (13) — 3 apps ──
(14, 13, 'APPLIED',     NULL, NULL, '2026-05-01 14:10:00'),
(11, 13, 'REVIEWED',    NULL, NULL, '2026-04-22 09:45:00'),
(15, 13, 'REJECTED',    NULL, NULL, '2026-04-05 10:30:00'),

-- ── Carol Wijaya (14) — 4 apps ──
(9,  14, 'OFFER',
 'I have three years of experience turning complex health and retail datasets into dashboards executives actually act on, and HealthBridge''s mission to surface insights from clinical data is exactly where I want to focus my career. My Python and SQL skills are production-grade and I am comfortable presenting analytical narratives to non-technical stakeholders.',
 NULL, '2026-03-25 08:00:00'),
(22, 14, 'INTERVIEW',
 'Sustainability metrics sit at the intersection of data analysis and impact storytelling, two areas I have been honing throughout my analytics career. I am excited by GreenLogix''s sustainability mandate and confident I can surface the KPIs that will drive meaningful operational change.',
 NULL, '2026-04-05 13:00:00'),
(5,  14, 'SHORTLISTED',
 'My SQL and Python experience with multi-source retail and logistics datasets translates naturally to data engineering at Finova. I am keen to deepen my pipeline engineering skills and believe this role offers exactly the technical stretch I am looking for.',
 NULL, '2026-04-12 10:30:00'),
(18, 14, 'APPLIED',     NULL, NULL, '2026-05-05 09:20:00'),

-- ── David Koh (15) — 3 apps ──
(11, 15, 'SHORTLISTED',
 'I have shipped three 0-to-1 products in health tech and B2B SaaS, and building digital health tools that reach patients is deeply meaningful work to me. I write PRDs that engineers enjoy working from and use data to challenge assumptions before committing to a roadmap.',
 NULL, '2026-04-15 08:00:00'),
(15, 15, 'REVIEWED',    NULL, NULL, '2026-04-25 14:00:00'),
(20, 15, 'APPLIED',     NULL, NULL, '2026-05-08 10:00:00'),

-- ── Emma Jaidee (16) — 4 apps ──
(26, 16, 'OFFER',
 'I have owned CI/CD infrastructure for 30+ microservices on AWS EKS and reduced deployment lead time from three days to 45 minutes — exactly the kind of impact I am aiming to replicate at CloudStack. GitOps, SLO monitoring, and post-mortems are already part of my daily practice.',
 NULL, '2026-03-28 09:30:00'),
(24, 16, 'INTERVIEW',
 'Applying cloud-native infrastructure thinking to logistics optimisation is a challenge I find genuinely compelling. My AWS and Kubernetes background, combined with experience building reliable event-driven systems, positions me well to own the infrastructure layer of GreenLogix''s route optimisation platform.',
 NULL, '2026-04-07 11:00:00'),
(48, 16, 'SHORTLISTED',
 'Remote DevOps consulting aligns well with my experience driving GitOps adoption across distributed teams in Thailand. I have a track record of bringing discipline to chaotic deployment pipelines and would bring that same structured approach to ByteForge''s client engagements.',
 NULL, '2026-04-13 13:45:00'),
(7,  16, 'REVIEWED',    NULL, NULL, '2026-04-23 08:15:00'),

-- ── Frank Santos (17) — 4 apps ──
(46, 17, 'INTERVIEW',
 'My Java backend experience, combined with four years building event-driven services processing 5M+ daily events, makes me a strong fit for ByteForge''s backend team. I am comfortable moving between Java and Node.js and enjoy the performance and reliability challenges of high-throughput systems.',
 NULL, '2026-04-08 10:20:00'),
(1,  17, 'REVIEWED',    NULL, NULL, '2026-04-19 09:00:00'),
(41, 17, 'SHORTLISTED',
 'Building backend services for healthcare logistics has given me an appreciation for the rigour that medical software demands. I am confident my Java engineering depth and track record with high-throughput systems translate well to Medica''s complex software environment.',
 NULL, '2026-04-11 11:30:00'),
(28, 17, 'APPLIED',     NULL, NULL, '2026-05-03 14:00:00'),

-- ── Grace Ng (18) — 4 apps ──
(2,  18, 'OFFER',
 'I have shipped React features to 5M+ monthly active users at Carousell and championed a design-system migration that meaningfully reduced frontend bundle size. Joining TechCorp''s full-stack team would let me grow both my frontend craft and backend exposure in equal measure.',
 NULL, '2026-04-01 08:00:00'),
(13, 18, 'INTERVIEW',
 'Building accessible, performant user interfaces in an EdTech context combines two things I care about: clean React engineering and products that genuinely help people learn. I would love to bring my Tailwind and TypeScript skills to EduNest''s product team.',
 NULL, '2026-04-06 09:30:00'),
(47, 18, 'SHORTLISTED',
 'Payments UI demands exceptional precision and accessibility, and my track record pushing Lighthouse scores from 54 to 96 reflects the performance discipline that critical financial interfaces require. I am ready to take on a technical leadership challenge at ByteForge.',
 NULL, '2026-04-09 10:00:00'),
(30, 18, 'APPLIED',     NULL, NULL, '2026-05-07 13:00:00'),

-- ── Henry Aziz (19) — 3 apps ──
(29, 19, 'SHORTLISTED',
 'Eight years of managing multi-market digital campaigns across APAC, with budgets up to SGD 2M, make me a strong candidate for MediaWave''s senior marketing leadership. I have built and coached agency teams and know how to turn brand insights into measurable revenue growth.',
 NULL, '2026-04-18 09:00:00'),
(17, 19, 'REVIEWED',    NULL, NULL, '2026-04-28 11:00:00'),
(32, 19, 'APPLIED',     NULL, NULL, '2026-05-11 14:30:00'),

-- ── Iris Putri (20) — 3 apps ──
(9,  20, 'INTERVIEW',   NULL, NULL, '2026-04-04 10:00:00'),
(21, 20, 'REVIEWED',    NULL, NULL, '2026-04-30 09:30:00'),
(18, 20, 'APPLIED',     NULL, NULL, '2026-05-04 13:45:00'),

-- ── James Tan (21) — 2 apps ──
(34, 21, 'REJECTED',    NULL, NULL, '2026-04-12 08:30:00'),
(11, 21, 'APPLIED',     NULL, NULL, '2026-05-13 10:15:00'),

-- ── Kate Somboon (22) — 3 apps ──
(30, 22, 'SHORTLISTED',
 'I have grown organic traffic by 120% for two startups through content-led acquisition, combining SEO strategy with clear, engaging writing across English and Thai markets. MediaWave''s reach across Southeast Asia is the platform I have been building toward.',
 NULL, '2026-04-20 09:00:00'),
(32, 22, 'REVIEWED',    NULL, NULL, '2026-05-01 14:00:00'),
(17, 22, 'APPLIED',     NULL, NULL, '2026-05-09 10:30:00'),

-- ── Leo Reyes (23) — 3 apps ──
(6,  23, 'INTERVIEW',
 'My background in equity research and FP&A gives me a strong quantitative foundation for risk analytics at Finova. I am comfortable building complex financial models in Python and Excel, and I enjoy translating risk findings into executive-ready narratives that drive decision-making.',
 NULL, '2026-04-10 09:45:00'),
(37, 23, 'REVIEWED',    NULL, NULL, '2026-04-24 11:00:00'),
(19, 23, 'APPLIED',     NULL, NULL, '2026-05-06 10:00:00'),

-- ── Nina Sharma (24) — 4 apps ──
(10, 24, 'INTERVIEW',
 'Building ML models for healthcare applications — where false positives have real consequences — is exactly the kind of high-stakes problem I want to work on. I have shipped clinical risk prediction models currently in production and understand the balance between model performance and interpretability that regulated environments demand.',
 NULL, '2026-04-09 08:30:00'),
(42, 24, 'SHORTLISTED',
 'Leading a data science team at a medical technology company is the career milestone I am working toward, and Medica''s scale and data quality make this an exceptional opportunity. I bring both technical depth from model training to production deployment and the communication skills to translate results for clinical and business audiences.',
 NULL, '2026-04-14 10:00:00'),
(5,  24, 'REVIEWED',    NULL, NULL, '2026-04-26 09:15:00'),
(24, 24, 'APPLIED',     NULL, NULL, '2026-05-02 14:00:00'),

-- ── Omar Kassim (25) — 4 apps ──
(13, 25, 'INTERVIEW',
 'My four cross-platform React Native apps prove I can deliver polished, performant interfaces that users love. Transitioning that skill set to a web-first EdTech product is a direction I am actively pursuing, and EduNest''s learner-first design philosophy aligns closely with how I approach mobile UX.',
 NULL, '2026-04-07 11:15:00'),
(2,  25, 'SHORTLISTED',
 'Building apps with 300K+ downloads has given me a strong sense of what makes software fast and reliable. I am excited to bring that product instinct to TechCorp''s full-stack team while expanding my React web and Java API experience on larger engineering infrastructure.',
 NULL, '2026-04-16 09:00:00'),
(45, 25, 'APPLIED',     NULL, NULL, '2026-05-12 13:30:00'),
(47, 25, 'REJECTED',    NULL, NULL, '2026-04-15 10:00:00'),

-- ── Petra Boonnak (26) — 3 apps ──
(46, 26, 'SHORTLISTED',
 'My Java and Python backend skills, combined with three years building retail platform services, prepare me well for the performance demands of ByteForge''s contract engineering work. I write clean, tested code and adapt quickly to new codebases.',
 NULL, '2026-04-22 08:45:00'),
(4,  26, 'REJECTED',    NULL, NULL, '2026-04-20 14:00:00'),
(41, 26, 'APPLIED',     NULL, NULL, '2026-05-14 10:00:00'),

-- ── Quinn Velasco (27) — 4 apps ──
(27, 27, 'REJECTED',
 'Full-stack ownership from database schema to deployed React UI is my natural working style, and CloudStack''s backend platform role is exactly where I want to grow my distributed systems skills. I am particularly excited by the developer-experience focus and the opportunity to work on infrastructure that other engineers rely on daily.',
 NULL, '2026-04-08 09:00:00'),
(47, 27, 'REVIEWED',    NULL, NULL, '2026-05-02 13:00:00'),
(2,  27, 'APPLIED',     NULL, NULL, '2026-05-08 10:00:00'),
(46, 27, 'APPLIED',     NULL, NULL, '2026-05-15 14:00:00'),

-- ── Rachel Yeo (28) — 4 apps ──
(28, 28, 'REJECTED',    NULL, NULL, '2026-04-10 08:00:00'),
(41, 28, 'REVIEWED',    NULL, NULL, '2026-04-29 09:30:00'),
(4,  28, 'APPLIED',     NULL, NULL, '2026-05-06 11:00:00'),
(7,  28, 'APPLIED',     NULL, NULL, '2026-05-10 13:45:00'),

-- ── Sam Wiranto (29) — 3 apps ──
(43, 29, 'REVIEWED',    NULL, NULL, '2026-04-27 10:00:00'),
(33, 29, 'REJECTED',    NULL, NULL, '2026-04-25 09:00:00'),
(1,  29, 'APPLIED',     NULL, NULL, '2026-05-16 08:30:00'),

-- ── Tara Nakamura (30) — 2 apps ──
(2,  30, 'REVIEWED',    NULL, NULL, '2026-05-03 11:00:00'),
(47, 30, 'APPLIED',     NULL, NULL, '2026-05-14 14:30:00');

-- ── Saved jobs (25 rows) ──
-- Alex (11): 5 saved — none overlap his applied jobs (1,2,7,25,26,27)
INSERT IGNORE INTO saved_job (user_id, job_id, saved_at) VALUES
(11, 4,  '2026-05-01 10:00:00'),
(11, 24, '2026-05-03 14:00:00'),
(11, 29, '2026-05-10 09:00:00'),
(11, 34, '2026-05-12 11:00:00'),
(11, 48, '2026-05-15 08:30:00'),
-- Other seekers (20 rows)
(12, 7,  '2026-05-08 10:00:00'),
(12, 27, '2026-05-10 13:00:00'),
(13, 29, '2026-05-05 09:00:00'),
(13, 30, '2026-05-11 14:00:00'),
(14, 24, '2026-05-06 10:30:00'),
(15, 8,  '2026-05-07 09:15:00'),
(16, 10, '2026-05-09 11:00:00'),
(16, 43, '2026-05-13 13:00:00'),
(17, 27, '2026-05-08 08:45:00'),
(18, 27, '2026-05-09 10:00:00'),
(19, 20, '2026-05-04 14:00:00'),
(20, 34, '2026-05-10 09:30:00'),
(21, 8,  '2026-05-11 13:45:00'),
(22, 29, '2026-05-12 10:00:00'),
(23, 38, '2026-05-07 11:00:00'),
(24, 43, '2026-05-14 09:00:00'),
(25, 27, '2026-05-13 10:30:00'),
(27, 4,  '2026-05-09 08:00:00'),
(28, 48, '2026-05-15 11:00:00'),
(29, 4,  '2026-05-16 13:00:00');

-- ======================================================
-- PART 5: Connections (72 total — 57 ACCEPTED, 15 PENDING)
-- Alex (11) → exactly 25 ACCEPTED
-- Every seeker ≥ 4 ACCEPTED connections
-- Smaller id = requester_id  (no duplicate pairs)
-- created_at spread across last 120 days
-- ======================================================

INSERT INTO connection (requester_id, addressee_id, status, created_at) VALUES

-- Alex ↔ Employers (8 ACCEPTED)
( 3, 11, 'ACCEPTED', '2026-02-10 09:00:00'),
( 4, 11, 'ACCEPTED', '2026-02-15 10:30:00'),
( 5, 11, 'ACCEPTED', '2026-01-28 11:00:00'),
( 6, 11, 'ACCEPTED', '2026-03-05 08:45:00'),
( 7, 11, 'ACCEPTED', '2026-03-12 14:00:00'),
( 8, 11, 'ACCEPTED', '2026-01-22 09:30:00'),
( 9, 11, 'ACCEPTED', '2026-04-01 11:15:00'),
(10, 11, 'ACCEPTED', '2026-03-20 10:00:00'),

-- Alex ↔ Seekers 12–28 (17 ACCEPTED)
(11, 12, 'ACCEPTED', '2026-01-20 09:00:00'),
(11, 13, 'ACCEPTED', '2026-01-25 10:00:00'),
(11, 14, 'ACCEPTED', '2026-02-02 11:00:00'),
(11, 15, 'ACCEPTED', '2026-02-08 09:30:00'),
(11, 16, 'ACCEPTED', '2026-02-14 14:00:00'),
(11, 17, 'ACCEPTED', '2026-02-20 10:45:00'),
(11, 18, 'ACCEPTED', '2026-02-27 09:00:00'),
(11, 19, 'ACCEPTED', '2026-03-03 11:30:00'),
(11, 20, 'ACCEPTED', '2026-03-10 08:30:00'),
(11, 21, 'ACCEPTED', '2026-03-15 13:00:00'),
(11, 22, 'ACCEPTED', '2026-03-22 10:00:00'),
(11, 23, 'ACCEPTED', '2026-03-28 09:15:00'),
(11, 24, 'ACCEPTED', '2026-04-04 11:00:00'),
(11, 25, 'ACCEPTED', '2026-04-09 14:30:00'),
(11, 26, 'ACCEPTED', '2026-04-15 09:00:00'),
(11, 27, 'ACCEPTED', '2026-04-21 10:00:00'),
(11, 28, 'ACCEPTED', '2026-04-28 11:00:00'),

-- Seeker cluster 12–15 (6 ACCEPTED)
(12, 13, 'ACCEPTED', '2026-02-05 09:00:00'),
(12, 14, 'ACCEPTED', '2026-02-10 10:30:00'),
(12, 15, 'ACCEPTED', '2026-02-18 11:00:00'),
(13, 14, 'ACCEPTED', '2026-03-01 09:45:00'),
(13, 15, 'ACCEPTED', '2026-03-08 10:00:00'),
(14, 15, 'ACCEPTED', '2026-03-14 08:30:00'),

-- Seeker cluster 16–19 (6 ACCEPTED)
(16, 17, 'ACCEPTED', '2026-02-12 09:00:00'),
(16, 18, 'ACCEPTED', '2026-02-19 10:15:00'),
(16, 19, 'ACCEPTED', '2026-02-25 11:00:00'),
(17, 18, 'ACCEPTED', '2026-03-05 09:30:00'),
(17, 19, 'ACCEPTED', '2026-03-11 10:00:00'),
(18, 19, 'ACCEPTED', '2026-03-18 08:45:00'),

-- Seeker cluster 20–23 (6 ACCEPTED)
(20, 21, 'ACCEPTED', '2026-02-22 09:00:00'),
(20, 22, 'ACCEPTED', '2026-03-01 11:00:00'),
(20, 23, 'ACCEPTED', '2026-03-07 10:30:00'),
(21, 22, 'ACCEPTED', '2026-03-13 09:15:00'),
(21, 23, 'ACCEPTED', '2026-03-19 10:00:00'),
(22, 23, 'ACCEPTED', '2026-03-25 08:30:00'),

-- Seeker cluster 24–27 (6 ACCEPTED)
(24, 25, 'ACCEPTED', '2026-03-02 09:00:00'),
(24, 26, 'ACCEPTED', '2026-03-09 10:00:00'),
(24, 27, 'ACCEPTED', '2026-03-16 11:15:00'),
(25, 26, 'ACCEPTED', '2026-03-23 09:45:00'),
(25, 27, 'ACCEPTED', '2026-03-29 10:30:00'),
(26, 27, 'ACCEPTED', '2026-04-04 09:00:00'),

-- Cross-cluster + seekers 28–30 (8 ACCEPTED)
(27, 28, 'ACCEPTED', '2026-04-11 10:00:00'),
(28, 29, 'ACCEPTED', '2026-04-18 09:30:00'),
(28, 30, 'ACCEPTED', '2026-04-25 11:00:00'),
(29, 30, 'ACCEPTED', '2026-05-02 10:00:00'),
(12, 29, 'ACCEPTED', '2026-04-14 09:00:00'),
(13, 29, 'ACCEPTED', '2026-04-20 10:30:00'),
(14, 30, 'ACCEPTED', '2026-04-26 09:15:00'),
(15, 30, 'ACCEPTED', '2026-05-03 11:00:00'),

-- 15 PENDING requests
( 1, 11, 'PENDING', '2026-05-14 09:00:00'),
( 2, 12, 'PENDING', '2026-05-13 10:00:00'),
( 3, 16, 'PENDING', '2026-05-10 11:00:00'),
( 4, 20, 'PENDING', '2026-05-09 09:30:00'),
( 5, 23, 'PENDING', '2026-05-08 10:00:00'),
( 6, 24, 'PENDING', '2026-05-07 11:15:00'),
( 7, 29, 'PENDING', '2026-05-06 09:00:00'),
( 8, 30, 'PENDING', '2026-05-05 10:30:00'),
( 9, 13, 'PENDING', '2026-05-11 09:45:00'),
(10, 14, 'PENDING', '2026-05-12 11:00:00'),
(15, 20, 'PENDING', '2026-05-15 09:00:00'),
(16, 24, 'PENDING', '2026-05-04 10:00:00'),
(18, 25, 'PENDING', '2026-05-03 09:30:00'),
(19, 28, 'PENDING', '2026-05-13 11:00:00'),
(23, 28, 'PENDING', '2026-05-16 09:00:00');

-- ======================================================
-- PART 6: Posts (5), Likes (20), Comments (10)
-- All 5 posts by Alex Morgan (user_id 11)
-- Like distribution  : post 1→7, 2→6, 3→4, 4→2, 5→1  = 20
-- Comment distribution: post 1→3, 2→3, 3→2, 4→1, 5→1  = 10
-- ======================================================

INSERT INTO post (author_id, content, media_url, created_at) VALUES
(11,
 'Seven years ago I wrote my first REST endpoint on a borrowed laptop. Today I shipped an API serving 2M requests/day. The gap between those two moments is just time and deliberate practice — not talent. If you are early in your engineering career, keep building. The compounding is real.',
 'https://picsum.photos/seed/1/800/400',
 '2026-04-20 09:00:00'),
(11,
 'I just completed a senior engineering panel interview. Here is what actually mattered: 1) Systems design clarity — draw boxes early and label them. 2) Trade-off articulation — explain why, not just what. 3) Debugging under pressure — thinking aloud beat perfect answers every time. Prepare for the conversation, not the correct answer.',
 NULL,
 '2026-04-28 10:30:00'),
(11,
 'Excited to share: the job-matching microservice my team has been building for three months just went live. 40ms p95 latency, zero-downtime deploy, and the first batch of recommendations is already driving a 12% increase in application starts. Big thanks to everyone who gave feedback during beta.',
 'https://picsum.photos/seed/3/800/400',
 '2026-05-05 08:45:00'),
(11,
 'The tech job market in 2026 is the most skills-bifurcated I have seen. Junior roles collapsed. Senior and staff roles are competitive but open. The lesson: go deep in one area now, even before you feel ready. Breadth follows depth, not the other way around.',
 NULL,
 '2026-05-10 11:00:00'),
(11,
 'If you are in a job search right now and it feels slow: the silence between applications is not rejection — it is latency. Keep your portfolio updated, keep reaching out, keep learning. The right role is a filter, not a verdict.',
 'https://picsum.photos/seed/5/800/400',
 '2026-05-15 09:30:00');

-- Likes (20 total)
INSERT INTO post_like (user_id, post_id, created_at) VALUES
-- Post 1 (7 likes)
(12, 1, '2026-04-20 09:45:00'),
(13, 1, '2026-04-20 10:10:00'),
(14, 1, '2026-04-20 11:00:00'),
(15, 1, '2026-04-21 08:30:00'),
(16, 1, '2026-04-21 09:15:00'),
(17, 1, '2026-04-21 10:00:00'),
(18, 1, '2026-04-22 09:00:00'),
-- Post 2 (6 likes)
(19, 2, '2026-04-28 11:00:00'),
(20, 2, '2026-04-28 12:30:00'),
(21, 2, '2026-04-29 09:00:00'),
(22, 2, '2026-04-29 10:15:00'),
(23, 2, '2026-04-29 11:00:00'),
(24, 2, '2026-04-30 09:00:00'),
-- Post 3 (4 likes)
(25, 3, '2026-05-05 09:30:00'),
(26, 3, '2026-05-05 10:00:00'),
(27, 3, '2026-05-05 11:15:00'),
(28, 3, '2026-05-06 09:00:00'),
-- Post 4 (2 likes)
(29, 4, '2026-05-10 12:00:00'),
(30, 4, '2026-05-10 13:30:00'),
-- Post 5 (1 like)
( 3, 5, '2026-05-15 10:00:00');

-- Comments (10 total)
INSERT INTO post_comment (post_id, author_id, content, created_at) VALUES
-- Post 1 (3 comments)
(1, 12, 'This is exactly the kind of perspective I needed today. Seven years of compounding — going to print this and stick it on my monitor.',                               '2026-04-20 10:00:00'),
(1, 13, 'The deliberate practice framing is so important. Too many engineers are waiting to feel ready before they build. Great reminder.',                                   '2026-04-20 10:30:00'),
(1, 15, 'Congrats on the milestone, Alex! 2M requests/day is no joke. Would love to hear more about how you scaled the caching layer.',                                     '2026-04-21 09:00:00'),
-- Post 2 (3 comments)
(2, 16, 'The thinking-aloud point is underrated. I bombed a round because I stayed silent while debugging. Will take this into my next interview.',                          '2026-04-28 11:30:00'),
(2, 19, 'Drawing boxes early in systems design is genuinely the best tactical advice. Interviewers visibly relax once they see structure on the whiteboard.',                '2026-04-29 08:45:00'),
(2, 22, 'I have a systems design round next week — reframing it as a conversation rather than a test really helps. Thank you for this.',                                    '2026-04-30 10:00:00'),
-- Post 3 (2 comments)
(3, 24, 'A 12% lift in application starts from the first batch is a strong signal. Congrats to the whole team — excited to see where this goes.',                          '2026-05-05 09:00:00'),
(3, 25, 'Impressive p95 for a recommendation engine. Are you running embeddings in-process or hitting a separate inference service?',                                        '2026-05-05 10:30:00'),
-- Post 4 (1 comment)
(4, 20, 'The depth-before-breadth point matches everything I have seen in hiring lately. Deep platform and ML engineers are getting multiple offers; generalists are struggling.', '2026-05-10 12:30:00'),
-- Post 5 (1 comment)
(5, 14, 'Three weeks in with no offers yet — keeping the latency framing instead of reading silence as rejection. Thank you for posting this.',                             '2026-05-15 10:00:00');

-- Sync like_count and comment_count
UPDATE post SET like_count = 7, comment_count = 3 WHERE id = 1;
UPDATE post SET like_count = 6, comment_count = 3 WHERE id = 2;
UPDATE post SET like_count = 4, comment_count = 2 WHERE id = 3;
UPDATE post SET like_count = 2, comment_count = 1 WHERE id = 4;
UPDATE post SET like_count = 1, comment_count = 1 WHERE id = 5;

-- ======================================================
-- PART 7: Posts (6 new — IDs 6–11), Likes (15), Comments (6)
-- demo@jobplus.com (user_id 11) → posts 6 & 7
-- Other authors: user 3 (employer), 12, 16, 22 (seekers)
-- posted_at: 2026-05-04 – 2026-05-16 (last 14 days)
-- ======================================================

INSERT INTO post (author_id, content, media_url, created_at) VALUES
(11,
 'Spent the weekend testing every AI job-search tool I could find. Most of them surface the same listings five days late. The real edge still comes from warm introductions and genuine engagement on platforms like this one — the algorithm rewards presence, not passive scrolling.',
 'https://picsum.photos/seed/1/800/400',
 '2026-05-04 09:15:00'),
(11,
 'Two years fully remote. The thing nobody tells you: the craft gets sharper when you remove the performance of busyness. No one sees you at your desk, so the only thing that counts is the output. Remote work did not make me lazier — it made me more honest about where my time actually goes.',
 NULL,
 '2026-05-07 10:30:00'),
(3,
 'We just opened three senior backend roles at TechCorp. No resume black holes — every applicant gets a response within five business days. If you build distributed systems and care about latency, take a look at the link in the first comment.',
 'https://picsum.photos/seed/2/800/400',
 '2026-05-09 08:00:00'),
(12,
 'Turned down an offer yesterday. The salary was right, the stack was interesting, but every person I spoke to in the loop seemed exhausted by 3 PM. Culture is not listed on the job description — you have to feel it during the process. Trust the signals.',
 NULL,
 '2026-05-11 11:45:00'),
(16,
 'Just wrapped a take-home assignment that took 12 hours instead of the promised 4. I submitted it anyway and sent a polite note flagging the scope mismatch. They appreciated the honesty and moved me forward. If a company cannot handle honest feedback before you join, imagine after.',
 NULL,
 '2026-05-14 09:00:00'),
(22,
 'Six months ago I had zero GitHub stars and zero offers. Today I accepted a mid-level SWE role that I genuinely wanted. The only thing that changed: I stopped applying everywhere and started building in public. Specificity beats volume every time.',
 NULL,
 '2026-05-16 14:00:00');

-- Likes (15 total across posts 6–11)
INSERT INTO post_like (user_id, post_id, created_at) VALUES
-- Post 6 (4 likes)
(13, 6, '2026-05-04 10:00:00'),
(17, 6, '2026-05-04 11:30:00'),
(21, 6, '2026-05-05 09:00:00'),
(25, 6, '2026-05-05 10:15:00'),
-- Post 7 (3 likes)
(14, 7, '2026-05-07 11:00:00'),
(18, 7, '2026-05-07 12:00:00'),
(26, 7, '2026-05-08 09:30:00'),
-- Post 8 (3 likes)
(11, 8, '2026-05-09 08:45:00'),
(15, 8, '2026-05-09 09:30:00'),
(23, 8, '2026-05-09 10:00:00'),
-- Post 9 (2 likes)
(19, 9, '2026-05-11 12:30:00'),
(27, 9, '2026-05-12 09:00:00'),
-- Post 10 (2 likes)
(11, 10, '2026-05-14 09:45:00'),
(28, 10, '2026-05-14 10:30:00'),
-- Post 11 (1 like)
(11, 11, '2026-05-16 14:30:00');

-- Comments (6 total)
INSERT INTO post_comment (post_id, author_id, content, created_at) VALUES
-- Post 6 (2 comments)
(6, 14, 'Agreed — the warm intro is still the highest-signal channel by far, AI tools or not. Great point about presence over passive scrolling.', '2026-05-04 10:30:00'),
(6, 20, 'Which tool came closest to being useful? Curious if any of them had real-time listings rather than scraped ones.', '2026-05-04 12:00:00'),
-- Post 7 (2 comments)
(7, 12, 'The honesty angle is something I felt immediately when I went remote. No one to perform for means you actually have to deliver — it is clarifying.', '2026-05-07 11:45:00'),
(7, 24, 'Two years in for me too. The asynchronous thinking it forces on you makes synchronous meetings feel almost wasteful by comparison.', '2026-05-08 08:30:00'),
-- Post 8 (1 comment)
(8, 11, 'Five-business-day response guarantee is rare — appreciate TechCorp setting that standard. Applied.', '2026-05-09 09:00:00'),
-- Post 9 (1 comment)
(9, 13, 'The 3 PM exhaustion tell is real. I started timing final-round calls for early afternoon precisely to see who still has energy that late in the day.', '2026-05-11 13:00:00');

-- Sync like_count and comment_count
UPDATE post SET like_count = 4, comment_count = 2 WHERE id = 6;
UPDATE post SET like_count = 3, comment_count = 2 WHERE id = 7;
UPDATE post SET like_count = 3, comment_count = 1 WHERE id = 8;
UPDATE post SET like_count = 2, comment_count = 1 WHERE id = 9;
UPDATE post SET like_count = 2, comment_count = 0 WHERE id = 10;
UPDATE post SET like_count = 1, comment_count = 0 WHERE id = 11;

-- ======================================================
-- PART 8: Conversations (3), Messages (11), Notifications (10)
-- Conv 1 & 2: demo@jobplus.com (user_id 11) is a participant
-- Conv 3: seeker 12 ↔ employer 4
-- demo@jobplus.com (user_id 11) has 3 unread notifications
-- ======================================================

-- Bare conversation rows; updated_at synced after messages below
INSERT INTO conversation (created_at, updated_at) VALUES
('2026-05-10 09:00:00', '2026-05-10 09:00:00'),
('2026-05-13 14:00:00', '2026-05-13 14:00:00'),
('2026-05-11 10:00:00', '2026-05-11 10:00:00');

INSERT INTO conversation_participant (conversation_id, user_id) VALUES
(1,  3), (1, 11),
(2,  5), (2, 11),
(3,  4), (3, 12);

INSERT INTO message (conversation_id, sender_id, content, read_at, created_at) VALUES
-- Conv 1: user 3 (TechCorp recruiter) ↔ Alex (11) — 4 messages, all read
(1,  3,
 'Hi Alex, I came across your profile and was impressed by your background in distributed systems. We have a Senior Backend Engineer opening at TechCorp that looks like a strong match. Would you be open to a quick 20-minute intro call this week?',
 '2026-05-10 10:30:00', '2026-05-10 09:15:00'),
(1, 11,
 'Hi — thanks for reaching out. The infrastructure work TechCorp is doing has definitely caught my eye. I would be happy to connect. I am free Thursday afternoon or Friday morning.',
 '2026-05-10 11:00:00', '2026-05-10 10:45:00'),
(1,  3,
 'Perfect, let us lock in Thursday at 2 PM. I will send a calendar invite shortly. Looking forward to speaking with you.',
 '2026-05-12 09:00:00', '2026-05-11 14:00:00'),
(1, 11,
 'Confirmed — talk to you Thursday. I will review the job spec and come prepared with questions.',
 '2026-05-12 16:00:00', '2026-05-12 15:30:00'),
-- Conv 2: employer 5 ↔ Alex (11) — 3 messages, last unread by Alex
(2,  5,
 'Alex, great speaking with you today. The team was genuinely impressed by your systems design round. We would like to move forward with a final-stage technical assessment — are you available next Tuesday?',
 '2026-05-13 15:00:00', '2026-05-13 14:00:00'),
(2, 11,
 'That is great news, thank you for the update. Tuesday works for me. Is there anything specific I should prepare for the assessment format?',
 '2026-05-13 17:00:00', '2026-05-13 16:30:00'),
(2,  5,
 'Focus on distributed systems and low-latency design patterns. We will email detailed prep materials by EOD Friday — keep an eye on your inbox.',
 NULL, '2026-05-14 17:00:00'),
-- Conv 3: employer 4 ↔ seeker 12 — 4 messages, all read
(3, 12,
 'Hi, I noticed your Full Stack Developer posting and wanted to reach out directly. I have three years of production experience with React and Node.js and would love to learn more about the team and the growth track.',
 '2026-05-11 11:00:00', '2026-05-11 10:00:00'),
(3,  4,
 'Thanks for reaching out — the role is still open. Could you share a bit about your most recent project and the scale you were working at?',
 '2026-05-11 13:00:00', '2026-05-11 12:00:00'),
(3, 12,
 'Of course. I led frontend development for a B2B SaaS dashboard with around 5,000 daily active users. I built the component library from scratch and cut page load time by 40% through code-splitting and lazy loading.',
 '2026-05-12 10:00:00', '2026-05-11 13:30:00'),
(3,  4,
 'Impressive results. Let me loop in our tech lead for a screening call — I will follow up by end of week with a few available time slots.',
 '2026-05-13 15:00:00', '2026-05-13 14:00:00');

-- Sync updated_at to last message timestamp
UPDATE conversation SET updated_at = '2026-05-12 15:30:00' WHERE id = 1;
UPDATE conversation SET updated_at = '2026-05-14 17:00:00' WHERE id = 2;
UPDATE conversation SET updated_at = '2026-05-13 14:00:00' WHERE id = 3;

-- Notifications (10 total)
-- read_flag=FALSE rows for user 11: APPLICATION_STATUS, CONNECTION_REQUEST, CONNECTION_ACCEPTED → 3 unread ✓
INSERT INTO notification (user_id, type, payload, read_flag, created_at) VALUES
-- APPLICATION_STATUS (4)
(11, 'APPLICATION_STATUS',
 '{"applicationId": 3, "jobId": 2, "jobTitle": "Senior Backend Engineer", "companyName": "TechCorp", "status": "SHORTLISTED"}',
 FALSE, '2026-05-13 08:00:00'),
(12, 'APPLICATION_STATUS',
 '{"applicationId": 5, "jobId": 4, "jobTitle": "Full Stack Developer", "companyName": "Innovate Labs", "status": "INTERVIEW"}',
 TRUE,  '2026-05-12 09:00:00'),
(13, 'APPLICATION_STATUS',
 '{"applicationId": 8, "jobId": 6, "jobTitle": "Frontend Engineer", "companyName": "BrightPath", "status": "REJECTED"}',
 TRUE,  '2026-05-11 14:00:00'),
(14, 'APPLICATION_STATUS',
 '{"applicationId": 12, "jobId": 3, "jobTitle": "Data Analyst", "companyName": "DataSync", "status": "REVIEWED"}',
 TRUE,  '2026-05-10 11:30:00'),
-- CONNECTION_REQUEST (3)
(11, 'CONNECTION_REQUEST',
 '{"requesterId": 7, "requesterName": "Marcus Webb", "requesterTitle": "Engineering Manager at Apex Systems"}',
 FALSE, '2026-05-14 10:00:00'),
(15, 'CONNECTION_REQUEST',
 '{"requesterId": 20, "requesterName": "Jordan Blake", "requesterTitle": "Product Designer"}',
 TRUE,  '2026-05-12 16:00:00'),
(16, 'CONNECTION_REQUEST',
 '{"requesterId": 9, "requesterName": "Diana Chen", "requesterTitle": "Talent Acquisition at NextGen"}',
 TRUE,  '2026-05-11 09:00:00'),
-- CONNECTION_ACCEPTED (2)
(11, 'CONNECTION_ACCEPTED',
 '{"userId": 5, "userName": "Olivia Patel", "userTitle": "Head of Engineering at CloudBridge"}',
 FALSE, '2026-05-15 11:00:00'),
(12, 'CONNECTION_ACCEPTED',
 '{"userId": 23, "userName": "Sam Torres", "userTitle": "Software Engineer"}',
 TRUE,  '2026-05-13 13:00:00'),
-- NEW_MESSAGE (1)
(17, 'NEW_MESSAGE',
 '{"conversationId": 3, "senderId": 4, "senderName": "James Riley", "preview": "Let me loop in our tech lead for a screening call..."}',
 TRUE,  '2026-05-13 14:05:00');

-- ======================================================
-- AUDIT LOG
-- ======================================================
INSERT INTO audit_log (admin_id, action, target_type, target_id, detail, created_at) VALUES
(1, 'USER_SUSPENDED',    'USER',    15, 'Suspended for spam activity',                      '2026-05-01 09:12:00'),
(1, 'USER_ACTIVATED',    'USER',    15, 'Account reinstated after appeal',                  '2026-05-03 11:45:00'),
(2, 'POST_DELETED',      'POST',     7, 'Removed: violates community guidelines',            '2026-05-05 14:20:00'),
(1, 'JOB_STATUS_CHANGED','JOB',      3, 'Status changed from ACTIVE to CLOSED',             '2026-05-07 10:00:00'),
(2, 'USER_ROLE_CHANGED', 'USER',    22, 'Role changed from JOB_SEEKER to EMPLOYER',         '2026-05-08 16:30:00'),
(1, 'COMPANY_VERIFIED',  'COMPANY',  2, 'TechCorp verified after document review',          '2026-05-09 09:00:00'),
(2, 'POST_DELETED',      'POST',    12, 'Removed: misleading job advertisement',             '2026-05-10 13:15:00'),
(1, 'USER_SUSPENDED',    'USER',    18, 'Suspended: multiple harassment reports',           '2026-05-11 15:00:00'),
(2, 'JOB_STATUS_CHANGED','JOB',      8, 'Status changed from ACTIVE to EXPIRED',            '2026-05-12 11:20:00'),
(1, 'COMPANY_VERIFIED',  'COMPANY',  5, 'CloudBridge Technologies verified',                '2026-05-13 10:30:00'),
(2, 'USER_ACTIVATED',    'USER',    18, 'Suspension lifted — warning issued',               '2026-05-14 09:45:00'),
(1, 'POST_DELETED',      'POST',    20, 'Removed: offensive content',                       '2026-05-15 17:00:00'),
(2, 'USER_ROLE_CHANGED', 'USER',    30, 'Role changed from EMPLOYER to JOB_SEEKER',         '2026-05-16 12:00:00'),
(1, 'JOB_STATUS_CHANGED','JOB',     14, 'Status changed from DRAFT to ACTIVE',              '2026-05-17 08:30:00'),
(2, 'COMPANY_VERIFIED',  'COMPANY',  9, 'FinanceHub Corp verified after re-submission',     '2026-05-17 10:10:00'),
(1, 'SUSPEND_USER',     'USER',    13, 'Suspended Bob Rahman for repeated spam reports',    '2026-05-08 08:15:00'),
(2, 'VERIFY_COMPANY',   'COMPANY',  4, 'EduNest verified after updated business documents', '2026-05-09 14:30:00'),
(1, 'REMOVE_JOB',       'JOB',      5, 'Removed Data Engineer listing: misleading salary',  '2026-05-11 10:00:00'),
(2, 'ACTIVATE_USER',    'USER',    16, 'Activated Emma Jaidee account after identity check','2026-05-13 09:45:00'),
(1, 'REJECT_COMPANY',   'COMPANY',  8, 'MediaWave rejected: incomplete registration docs',  '2026-05-15 16:20:00'),
(2, 'DELETE_POST',      'POST',     3, 'Removed post id 3: contained misleading job claims','2026-05-17 11:55:00');

-- ======================================================
-- PART 10: Demo posts for admin (user_id=1) and alice (user_id=2)
-- Posts 12–17, some likes and comments
-- ======================================================

INSERT INTO post (author_id, content, media_url, created_at) VALUES
(1,
 'Launched the new applicant-tracking dashboard this week. Response times from employers dropped by 38% — turns out showing live application counts next to each posting changes behaviour fast. Small UX nudge, big outcome.',
 'https://picsum.photos/seed/admin1/800/400',
 '2026-05-18 09:00:00'),
(1,
 'Platform update: we have added AI-assisted job matching to the search page. Early results show a 22% increase in first-page application rates. If you have been waiting for the right role to appear — this is a good week to search again.',
 NULL,
 '2026-05-20 10:30:00'),
(1,
 'Hiring advice from reviewing 4 000 applications this quarter: the candidates who move fastest are the ones whose cover letter answers one question — why this role, why now. Not a list of skills. A reason.',
 'https://picsum.photos/seed/admin3/800/400',
 '2026-05-23 08:45:00'),
(2,
 'Three months into my job search. What actually worked: setting aside two hours every morning to apply before checking notifications. Momentum beats motivation.',
 NULL,
 '2026-05-19 11:00:00'),
(2,
 'Just finished a technical interview where the interviewer spent 20 minutes explaining why my approach was wrong — then said mine was actually more efficient. Interviews are weird. Keep going.',
 'https://picsum.photos/seed/alice2/800/400',
 '2026-05-21 14:00:00'),
(2,
 'Accepted an offer today. To everyone still searching: the right company will choose you for what you genuinely bring, not for how well you performed a version of yourself. Stay specific about what you want.',
 NULL,
 '2026-05-25 09:30:00');

-- Likes for posts 12–17
INSERT INTO post_like (user_id, post_id, created_at) VALUES
(11, 12, '2026-05-18 09:30:00'),
(12, 12, '2026-05-18 10:00:00'),
(15, 12, '2026-05-18 11:00:00'),
(11, 13, '2026-05-20 11:00:00'),
(16, 13, '2026-05-20 12:30:00'),
(11, 14, '2026-05-23 09:00:00'),
(13, 14, '2026-05-23 09:30:00'),
(17, 14, '2026-05-23 10:00:00'),
(11, 15, '2026-05-19 11:30:00'),
(14, 15, '2026-05-19 12:00:00'),
( 3, 16, '2026-05-21 14:30:00'),
(11, 17, '2026-05-25 10:00:00'),
(12, 17, '2026-05-25 10:30:00'),
(16, 17, '2026-05-25 11:00:00'),
(19, 17, '2026-05-25 11:30:00');

-- Comments for posts 12–17
INSERT INTO post_comment (post_id, author_id, content, created_at) VALUES
(12, 11, 'That nudge effect is real. Showing scarcity or live activity always shifts how urgently people act. Great result.', '2026-05-18 10:00:00'),
(14, 11, 'The why-now framing is something I never see in cover letters but always notice when it is there. Good advice.', '2026-05-23 09:00:00'),
(15, 11, 'Two hours in the morning before notifications is exactly how I applied for my current role. Works every time.', '2026-05-19 11:45:00'),
(17, 11, 'Congratulations! The specificity point is everything — generic applications get generic results.', '2026-05-25 10:15:00'),
(17, 13, 'This post made my day. Still in the middle of my search — holding onto this.', '2026-05-25 11:00:00');

-- Sync like_count and comment_count for posts 12–17
UPDATE post SET like_count = 3, comment_count = 1 WHERE id = 12;
UPDATE post SET like_count = 2, comment_count = 0 WHERE id = 13;
UPDATE post SET like_count = 3, comment_count = 1 WHERE id = 14;
UPDATE post SET like_count = 2, comment_count = 1 WHERE id = 15;
UPDATE post SET like_count = 1, comment_count = 0 WHERE id = 16;
UPDATE post SET like_count = 4, comment_count = 2 WHERE id = 17;
