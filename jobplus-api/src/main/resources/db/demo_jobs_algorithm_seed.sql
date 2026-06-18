-- Additional demo jobs to strengthen algorithm evaluation coverage.
-- Safe to run multiple times: each job insert checks for an existing title+company_id pair.

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline)
SELECT 1, 3, 'AI Product Analyst',
       'TechCorp Singapore is hiring an AI Product Analyst to bridge product strategy, analytics, and model-driven features inside our recruitment platform. You will define success metrics for recommendation quality, analyse funnel drop-offs, run A/B experiments, and help translate user pain points into measurable product opportunities. Strong SQL, dashboarding, and product thinking are essential. Prior exposure to ranking systems, recommendation loops, or search relevance is a plus.',
       'Singapore', 'FULL_TIME', 'MID', 62000.00, 84000.00, 'OPEN', '2026-06-10 09:00:00', NULL
WHERE NOT EXISTS (SELECT 1 FROM job WHERE company_id = 1 AND title = 'AI Product Analyst');

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline)
SELECT 1, 3, 'Search Relevance Engineer',
       'TechCorp Singapore is looking for a Search Relevance Engineer to improve ranking quality across jobs, candidates, and recruiter-facing search surfaces. You will work on scoring logic, feature engineering, query understanding, and offline evaluation datasets. Candidates should be comfortable with Java or Python, SQL, and experimentation workflows. This role is ideal for someone who enjoys turning vague matching problems into explainable ranking systems.',
       'Singapore', 'FULL_TIME', 'SENIOR', 90000.00, 125000.00, 'OPEN', '2026-06-10 09:15:00', NULL
WHERE NOT EXISTS (SELECT 1 FROM job WHERE company_id = 1 AND title = 'Search Relevance Engineer');

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline)
SELECT 2, 4, 'Fraud Analytics Specialist',
       'Finova Financial is expanding its fraud and anomaly detection capability and needs a Fraud Analytics Specialist to analyse transaction patterns, investigate suspicious behaviour, and build monitoring dashboards. You will combine SQL, Python, and finance domain knowledge to surface actionable risk signals for operations teams. Experience with rule-based monitoring, behavioural pattern analysis, or fraud operations is highly valued.',
       'Singapore', 'FULL_TIME', 'MID', 58000.00, 79000.00, 'OPEN', '2026-06-10 09:30:00', NULL
WHERE NOT EXISTS (SELECT 1 FROM job WHERE company_id = 2 AND title = 'Fraud Analytics Specialist');

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline)
SELECT 3, 5, 'Healthcare Business Intelligence Analyst',
       'HealthBridge is hiring a Healthcare Business Intelligence Analyst to support hospital performance reporting, clinical operations dashboards, and leadership decision support. You will clean multi-source healthcare data, define KPI logic, and create robust reports for operational and clinical stakeholders. Strong SQL, data analysis, and communication skills are required; familiarity with healthcare workflows is a bonus.',
       'Singapore', 'FULL_TIME', 'MID', 54000.00, 73000.00, 'OPEN', '2026-06-10 09:45:00', NULL
WHERE NOT EXISTS (SELECT 1 FROM job WHERE company_id = 3 AND title = 'Healthcare Business Intelligence Analyst');

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline)
SELECT 4, 6, 'Learning Analytics Specialist',
       'EduNest is seeking a Learning Analytics Specialist to measure learner progress, identify completion bottlenecks, and support the continuous improvement of adaptive learning experiences. You will query platform data, design dashboards, and work with product and curriculum teams to recommend changes backed by evidence. Ideal candidates bring a mix of SQL, data interpretation, and genuine curiosity about how learners engage with digital products.',
       'Jakarta', 'FULL_TIME', 'MID', 50000.00, 70000.00, 'OPEN', '2026-06-10 10:00:00', NULL
WHERE NOT EXISTS (SELECT 1 FROM job WHERE company_id = 4 AND title = 'Learning Analytics Specialist');

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline)
SELECT 5, 7, 'Marketplace Operations Manager',
       'RetailPlus is looking for a Marketplace Operations Manager to oversee seller performance, catalogue quality, and operational SLA adherence across our regional commerce platform. You will manage cross-functional workflows between support, logistics, and merchandising teams, while also identifying process automation opportunities. Strong operational judgment, SQL literacy, and KPI management experience are important for this role.',
       'Bangkok', 'FULL_TIME', 'MANAGER', 76000.00, 102000.00, 'OPEN', '2026-06-10 10:15:00', NULL
WHERE NOT EXISTS (SELECT 1 FROM job WHERE company_id = 5 AND title = 'Marketplace Operations Manager');

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline)
SELECT 6, 8, 'Sustainability Data Analyst',
       'GreenLogix is building out its ESG and sustainability reporting function and needs a Sustainability Data Analyst to measure operational emissions, benchmark logistics efficiency, and support leadership reporting. You will work with route, fleet, and supplier data to build monthly reporting packs and identify carbon reduction opportunities. Candidates with strong SQL or Python skills and an interest in sustainability metrics will do well here.',
       'Kuala Lumpur', 'FULL_TIME', 'MID', 52000.00, 71000.00, 'OPEN', '2026-06-10 10:30:00', NULL
WHERE NOT EXISTS (SELECT 1 FROM job WHERE company_id = 6 AND title = 'Sustainability Data Analyst');

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline)
SELECT 7, 9, 'Platform Reliability Engineer',
       'CloudStack is hiring a Platform Reliability Engineer to improve the stability, scalability, and observability of the shared services used across our SaaS control plane. You will work on infrastructure automation, incident response, monitoring quality, and reliability metrics, collaborating closely with backend engineers and product teams. Strong DevOps, AWS, Docker, and Kubernetes experience is expected.',
       'Singapore', 'FULL_TIME', 'SENIOR', 88000.00, 118000.00, 'OPEN', '2026-06-10 10:45:00', NULL
WHERE NOT EXISTS (SELECT 1 FROM job WHERE company_id = 7 AND title = 'Platform Reliability Engineer');

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline)
SELECT 8, 10, 'Audience Growth Analyst',
       'MediaWave is looking for an Audience Growth Analyst to study content performance, identify audience patterns, and recommend channel strategies that improve reach and engagement. You will analyse campaign and content data, build dashboards for editors and marketers, and turn raw metrics into actions. This role fits someone strong in data analysis, marketing metrics, and storytelling with data.',
       'Jakarta', 'FULL_TIME', 'MID', 46000.00, 65000.00, 'OPEN', '2026-06-10 11:00:00', NULL
WHERE NOT EXISTS (SELECT 1 FROM job WHERE company_id = 8 AND title = 'Audience Growth Analyst');

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline)
SELECT 10, 4, 'Investment Data Operations Analyst',
       'FinTrust Asia is seeking an Investment Data Operations Analyst to maintain high-quality market and portfolio data for analysts and portfolio managers. The role combines SQL-heavy data validation, process improvement, and collaboration with finance stakeholders who depend on accurate reporting. It is a good fit for candidates who like precision, workflows, and financial datasets.',
       'Singapore', 'FULL_TIME', 'ENTRY', 42000.00, 60000.00, 'OPEN', '2026-06-10 11:15:00', NULL
WHERE NOT EXISTS (SELECT 1 FROM job WHERE company_id = 10 AND title = 'Investment Data Operations Analyst');

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline)
SELECT 11, 5, 'Clinical Data Quality Engineer',
       'Medica Group is hiring a Clinical Data Quality Engineer to validate structured medical data, improve pipeline reliability, and help ensure downstream analytics and software modules use trustworthy inputs. You will work with healthcare data formats, write validation checks, and collaborate with software and clinical teams on data quality standards. SQL, Python, and attention to detail are key.',
       'Singapore', 'FULL_TIME', 'MID', 60000.00, 82000.00, 'OPEN', '2026-06-10 11:30:00', NULL
WHERE NOT EXISTS (SELECT 1 FROM job WHERE company_id = 11 AND title = 'Clinical Data Quality Engineer');

INSERT INTO job (company_id, posted_by, title, description, location, employment_type, experience_level, salary_min, salary_max, status, posted_at, deadline)
SELECT 12, 9, 'Payments Data Engineer',
       'ByteForge is expanding its payments intelligence capability and needs a Payments Data Engineer to build event pipelines, reporting datasets, and operational dashboards used by internal teams and merchant clients. You will model transactional data, improve reporting latency, and partner with product and engineering on data contracts. Strong SQL, Python or Java, and a solid understanding of APIs or event-based systems are highly desirable.',
       'Singapore', 'FULL_TIME', 'MID', 70000.00, 94000.00, 'OPEN', '2026-06-10 11:45:00', NULL
WHERE NOT EXISTS (SELECT 1 FROM job WHERE company_id = 12 AND title = 'Payments Data Engineer');

-- Job-skill links for the additional demo jobs.
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 14 FROM job j
WHERE j.company_id = 1 AND j.title = 'AI Product Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 14);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 16 FROM job j
WHERE j.company_id = 1 AND j.title = 'AI Product Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 16);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 5 FROM job j
WHERE j.company_id = 1 AND j.title = 'AI Product Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 5);

INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 4 FROM job j
WHERE j.company_id = 1 AND j.title = 'Search Relevance Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 4);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 3 FROM job j
WHERE j.company_id = 1 AND j.title = 'Search Relevance Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 3);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 5 FROM job j
WHERE j.company_id = 1 AND j.title = 'Search Relevance Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 5);

INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 19 FROM job j
WHERE j.company_id = 2 AND j.title = 'Fraud Analytics Specialist'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 19);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 14 FROM job j
WHERE j.company_id = 2 AND j.title = 'Fraud Analytics Specialist'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 14);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 5 FROM job j
WHERE j.company_id = 2 AND j.title = 'Fraud Analytics Specialist'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 5);

INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 14 FROM job j
WHERE j.company_id = 3 AND j.title = 'Healthcare Business Intelligence Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 14);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 5 FROM job j
WHERE j.company_id = 3 AND j.title = 'Healthcare Business Intelligence Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 5);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 3 FROM job j
WHERE j.company_id = 3 AND j.title = 'Healthcare Business Intelligence Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 3);

INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 14 FROM job j
WHERE j.company_id = 4 AND j.title = 'Learning Analytics Specialist'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 14);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 5 FROM job j
WHERE j.company_id = 4 AND j.title = 'Learning Analytics Specialist'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 5);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 16 FROM job j
WHERE j.company_id = 4 AND j.title = 'Learning Analytics Specialist'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 16);

INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 16 FROM job j
WHERE j.company_id = 5 AND j.title = 'Marketplace Operations Manager'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 16);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 5 FROM job j
WHERE j.company_id = 5 AND j.title = 'Marketplace Operations Manager'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 5);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 18 FROM job j
WHERE j.company_id = 5 AND j.title = 'Marketplace Operations Manager'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 18);

INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 14 FROM job j
WHERE j.company_id = 6 AND j.title = 'Sustainability Data Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 14);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 5 FROM job j
WHERE j.company_id = 6 AND j.title = 'Sustainability Data Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 5);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 3 FROM job j
WHERE j.company_id = 6 AND j.title = 'Sustainability Data Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 3);

INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 9 FROM job j
WHERE j.company_id = 7 AND j.title = 'Platform Reliability Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 9);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 10 FROM job j
WHERE j.company_id = 7 AND j.title = 'Platform Reliability Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 10);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 11 FROM job j
WHERE j.company_id = 7 AND j.title = 'Platform Reliability Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 11);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 12 FROM job j
WHERE j.company_id = 7 AND j.title = 'Platform Reliability Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 12);

INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 17 FROM job j
WHERE j.company_id = 8 AND j.title = 'Audience Growth Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 17);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 14 FROM job j
WHERE j.company_id = 8 AND j.title = 'Audience Growth Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 14);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 5 FROM job j
WHERE j.company_id = 8 AND j.title = 'Audience Growth Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 5);

INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 19 FROM job j
WHERE j.company_id = 10 AND j.title = 'Investment Data Operations Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 19);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 5 FROM job j
WHERE j.company_id = 10 AND j.title = 'Investment Data Operations Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 5);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 14 FROM job j
WHERE j.company_id = 10 AND j.title = 'Investment Data Operations Analyst'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 14);

INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 5 FROM job j
WHERE j.company_id = 11 AND j.title = 'Clinical Data Quality Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 5);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 3 FROM job j
WHERE j.company_id = 11 AND j.title = 'Clinical Data Quality Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 3);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 14 FROM job j
WHERE j.company_id = 11 AND j.title = 'Clinical Data Quality Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 14);

INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 5 FROM job j
WHERE j.company_id = 12 AND j.title = 'Payments Data Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 5);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 3 FROM job j
WHERE j.company_id = 12 AND j.title = 'Payments Data Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 3);
INSERT INTO job_skill (job_id, skill_id)
SELECT j.id, 19 FROM job j
WHERE j.company_id = 12 AND j.title = 'Payments Data Engineer'
  AND NOT EXISTS (SELECT 1 FROM job_skill js WHERE js.job_id = j.id AND js.skill_id = 19);
