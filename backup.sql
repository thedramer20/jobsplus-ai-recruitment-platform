-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: jobplus
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `application`
--

DROP TABLE IF EXISTS `application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `job_id` bigint NOT NULL,
  `seeker_id` bigint NOT NULL,
  `status` enum('APPLIED','REVIEWED','SHORTLISTED','INTERVIEW','REJECTED','OFFER') DEFAULT 'APPLIED',
  `cover_letter` text,
  `resume_url` varchar(500) DEFAULT NULL,
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_app_job_id` (`job_id`),
  KEY `idx_app_seeker_id` (`seeker_id`),
  KEY `idx_app_status` (`status`),
  CONSTRAINT `fk_application_job` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_application_seeker` FOREIGN KEY (`seeker_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application`
--

LOCK TABLES `application` WRITE;
/*!40000 ALTER TABLE `application` DISABLE KEYS */;
INSERT INTO `application` VALUES (1,2,11,'APPLIED','With seven years building scalable React and Java applications for products used by 500K+ users, I am excited to bring that experience to TechCorp\'s full-stack team. I am particularly drawn to your micro-frontend architecture and would welcome the opportunity to contribute to the platform foundation work described in the posting.',NULL,'2026-05-10 09:14:00','2026-05-17 11:06:28'),(2,26,11,'REVIEWED','My experience shipping and operating Java microservices gives me a strong appreciation for the DevOps side of the stack. I have automated CI/CD pipelines for three production environments and am comfortable owning infrastructure reliability end-to-end.',NULL,'2026-04-20 10:05:00','2026-05-17 11:06:28'),(3,7,11,'REJECTED','I have designed and maintained cloud infrastructure for SaaS products serving 500K+ users, with hands-on AWS and Kubernetes production experience. I am eager to apply this expertise to Finova\'s cloud-native banking platform.',NULL,'2026-04-01 11:30:00','2026-05-17 11:06:28'),(4,1,11,'SHORTLISTED','Having architected distributed Java services handling millions of daily transactions, I would bring immediate value to TechCorp\'s backend platform team. My seven years spanning both IC and tech-lead responsibilities align closely with what this role demands.',NULL,'2026-04-08 08:45:00','2026-05-17 11:06:28'),(5,25,11,'INTERVIEW','Designing scalable, multi-region architectures on AWS is work I have done for the last four years, and CloudStack\'s infrastructure vision resonates strongly with my career direction. I am confident in my ability to lead architecture decisions and translate complex requirements into cost-effective, highly available designs.',NULL,'2026-03-30 14:22:00','2026-05-17 11:06:28'),(6,27,11,'OFFER','Building resilient, observable backend platforms is where I do my best work. The Backend Engineer role at CloudStack aligns perfectly with my seven years of production Java engineering and my deep interest in developer-experience tooling that accelerates the broader engineering organisation.',NULL,'2026-03-20 09:00:00','2026-05-17 11:06:28'),(7,12,12,'OFFER','As a senior Java engineer with six years of experience building distributed systems, I am well positioned to deliver reliable, compliant software for HealthBridge\'s clinical workflows. I am deeply motivated by the intersection of healthcare and technology and would welcome the opportunity to contribute to products that improve patient outcomes.',NULL,'2026-03-22 08:30:00','2026-05-17 11:06:28'),(8,41,12,'INTERVIEW','My experience leading service migrations handling 10K+ requests per second makes me a strong candidate for a lead engineering role in a regulated domain like medical software. I take mentorship seriously and would bring both technical rigour and team-building capability to Medica\'s engineering leadership.',NULL,'2026-04-02 09:15:00','2026-05-17 11:06:28'),(9,4,12,'SHORTLISTED','After three years leading service architecture reviews and growing a team of engineers at Govtech Singapore, I am ready to step into a broader technical leadership remit. TechCorp\'s engineering culture and platform scale make this role exactly the challenge I am looking for.',NULL,'2026-04-10 10:00:00','2026-05-17 11:06:28'),(10,28,12,'REVIEWED',NULL,NULL,'2026-04-18 11:20:00','2026-05-17 11:06:28'),(11,14,13,'APPLIED',NULL,NULL,'2026-05-01 14:10:00','2026-05-17 11:06:28'),(12,11,13,'REVIEWED',NULL,NULL,'2026-04-22 09:45:00','2026-05-17 11:06:28'),(13,15,13,'REJECTED',NULL,NULL,'2026-04-05 10:30:00','2026-05-17 11:06:28'),(14,9,14,'OFFER','I have three years of experience turning complex health and retail datasets into dashboards executives actually act on, and HealthBridge\'s mission to surface insights from clinical data is exactly where I want to focus my career. My Python and SQL skills are production-grade and I am comfortable presenting analytical narratives to non-technical stakeholders.',NULL,'2026-03-25 08:00:00','2026-05-17 11:06:28'),(15,22,14,'INTERVIEW','Sustainability metrics sit at the intersection of data analysis and impact storytelling, two areas I have been honing throughout my analytics career. I am excited by GreenLogix\'s sustainability mandate and confident I can surface the KPIs that will drive meaningful operational change.',NULL,'2026-04-05 13:00:00','2026-05-17 11:06:28'),(16,5,14,'SHORTLISTED','My SQL and Python experience with multi-source retail and logistics datasets translates naturally to data engineering at Finova. I am keen to deepen my pipeline engineering skills and believe this role offers exactly the technical stretch I am looking for.',NULL,'2026-04-12 10:30:00','2026-05-17 11:06:28'),(17,18,14,'APPLIED',NULL,NULL,'2026-05-05 09:20:00','2026-05-17 11:06:28'),(18,11,15,'SHORTLISTED','I have shipped three 0-to-1 products in health tech and B2B SaaS, and building digital health tools that reach patients is deeply meaningful work to me. I write PRDs that engineers enjoy working from and use data to challenge assumptions before committing to a roadmap.',NULL,'2026-04-15 08:00:00','2026-05-17 11:06:28'),(19,15,15,'REVIEWED',NULL,NULL,'2026-04-25 14:00:00','2026-05-17 11:06:28'),(20,20,15,'APPLIED',NULL,NULL,'2026-05-08 10:00:00','2026-05-17 11:06:28'),(21,26,16,'OFFER','I have owned CI/CD infrastructure for 30+ microservices on AWS EKS and reduced deployment lead time from three days to 45 minutes ??? exactly the kind of impact I am aiming to replicate at CloudStack. GitOps, SLO monitoring, and post-mortems are already part of my daily practice.',NULL,'2026-03-28 09:30:00','2026-05-17 11:06:28'),(22,24,16,'INTERVIEW','Applying cloud-native infrastructure thinking to logistics optimisation is a challenge I find genuinely compelling. My AWS and Kubernetes background, combined with experience building reliable event-driven systems, positions me well to own the infrastructure layer of GreenLogix\'s route optimisation platform.',NULL,'2026-04-07 11:00:00','2026-05-17 11:06:28'),(23,48,16,'SHORTLISTED','Remote DevOps consulting aligns well with my experience driving GitOps adoption across distributed teams in Thailand. I have a track record of bringing discipline to chaotic deployment pipelines and would bring that same structured approach to ByteForge\'s client engagements.',NULL,'2026-04-13 13:45:00','2026-05-17 11:06:28'),(24,7,16,'REVIEWED',NULL,NULL,'2026-04-23 08:15:00','2026-05-17 11:06:28'),(25,46,17,'INTERVIEW','My Java backend experience, combined with four years building event-driven services processing 5M+ daily events, makes me a strong fit for ByteForge\'s backend team. I am comfortable moving between Java and Node.js and enjoy the performance and reliability challenges of high-throughput systems.',NULL,'2026-04-08 10:20:00','2026-05-17 11:06:28'),(26,1,17,'REVIEWED',NULL,NULL,'2026-04-19 09:00:00','2026-05-17 11:06:28'),(27,41,17,'SHORTLISTED','Building backend services for healthcare logistics has given me an appreciation for the rigour that medical software demands. I am confident my Java engineering depth and track record with high-throughput systems translate well to Medica\'s complex software environment.',NULL,'2026-04-11 11:30:00','2026-05-17 11:06:28'),(28,28,17,'APPLIED',NULL,NULL,'2026-05-03 14:00:00','2026-05-17 11:06:28'),(29,2,18,'OFFER','I have shipped React features to 5M+ monthly active users at Carousell and championed a design-system migration that meaningfully reduced frontend bundle size. Joining TechCorp\'s full-stack team would let me grow both my frontend craft and backend exposure in equal measure.',NULL,'2026-04-01 08:00:00','2026-05-17 11:06:28'),(30,13,18,'INTERVIEW','Building accessible, performant user interfaces in an EdTech context combines two things I care about: clean React engineering and products that genuinely help people learn. I would love to bring my Tailwind and TypeScript skills to EduNest\'s product team.',NULL,'2026-04-06 09:30:00','2026-05-17 11:06:28'),(31,47,18,'SHORTLISTED','Payments UI demands exceptional precision and accessibility, and my track record pushing Lighthouse scores from 54 to 96 reflects the performance discipline that critical financial interfaces require. I am ready to take on a technical leadership challenge at ByteForge.',NULL,'2026-04-09 10:00:00','2026-05-17 11:06:28'),(32,30,18,'APPLIED',NULL,NULL,'2026-05-07 13:00:00','2026-05-17 11:06:28'),(33,29,19,'SHORTLISTED','Eight years of managing multi-market digital campaigns across APAC, with budgets up to SGD 2M, make me a strong candidate for MediaWave\'s senior marketing leadership. I have built and coached agency teams and know how to turn brand insights into measurable revenue growth.',NULL,'2026-04-18 09:00:00','2026-05-17 11:06:28'),(34,17,19,'REVIEWED',NULL,NULL,'2026-04-28 11:00:00','2026-05-17 11:06:28'),(35,32,19,'APPLIED',NULL,NULL,'2026-05-11 14:30:00','2026-05-17 11:06:28'),(36,9,20,'INTERVIEW',NULL,NULL,'2026-04-04 10:00:00','2026-05-17 11:06:28'),(37,21,20,'REVIEWED',NULL,NULL,'2026-04-30 09:30:00','2026-05-17 11:06:28'),(38,18,20,'APPLIED',NULL,NULL,'2026-05-04 13:45:00','2026-05-17 11:06:28'),(39,34,21,'REJECTED',NULL,NULL,'2026-04-12 08:30:00','2026-05-17 11:06:28'),(40,11,21,'APPLIED',NULL,NULL,'2026-05-13 10:15:00','2026-05-17 11:06:28'),(41,30,22,'SHORTLISTED','I have grown organic traffic by 120% for two startups through content-led acquisition, combining SEO strategy with clear, engaging writing across English and Thai markets. MediaWave\'s reach across Southeast Asia is the platform I have been building toward.',NULL,'2026-04-20 09:00:00','2026-05-17 11:06:28'),(42,32,22,'REVIEWED',NULL,NULL,'2026-05-01 14:00:00','2026-05-17 11:06:28'),(43,17,22,'APPLIED',NULL,NULL,'2026-05-09 10:30:00','2026-05-17 11:06:28'),(44,6,23,'INTERVIEW','My background in equity research and FP&A gives me a strong quantitative foundation for risk analytics at Finova. I am comfortable building complex financial models in Python and Excel, and I enjoy translating risk findings into executive-ready narratives that drive decision-making.',NULL,'2026-04-10 09:45:00','2026-05-17 11:06:28'),(45,37,23,'REVIEWED',NULL,NULL,'2026-04-24 11:00:00','2026-05-17 11:06:28'),(46,19,23,'APPLIED',NULL,NULL,'2026-05-06 10:00:00','2026-05-17 11:06:28'),(47,10,24,'INTERVIEW','Building ML models for healthcare applications ??? where false positives have real consequences ??? is exactly the kind of high-stakes problem I want to work on. I have shipped clinical risk prediction models currently in production and understand the balance between model performance and interpretability that regulated environments demand.',NULL,'2026-04-09 08:30:00','2026-05-17 11:06:28'),(48,42,24,'SHORTLISTED','Leading a data science team at a medical technology company is the career milestone I am working toward, and Medica\'s scale and data quality make this an exceptional opportunity. I bring both technical depth from model training to production deployment and the communication skills to translate results for clinical and business audiences.',NULL,'2026-04-14 10:00:00','2026-05-17 11:06:28'),(49,5,24,'REVIEWED',NULL,NULL,'2026-04-26 09:15:00','2026-05-17 11:06:28'),(50,24,24,'APPLIED',NULL,NULL,'2026-05-02 14:00:00','2026-05-17 11:06:28'),(51,13,25,'INTERVIEW','My four cross-platform React Native apps prove I can deliver polished, performant interfaces that users love. Transitioning that skill set to a web-first EdTech product is a direction I am actively pursuing, and EduNest\'s learner-first design philosophy aligns closely with how I approach mobile UX.',NULL,'2026-04-07 11:15:00','2026-05-17 11:06:28'),(52,2,25,'SHORTLISTED','Building apps with 300K+ downloads has given me a strong sense of what makes software fast and reliable. I am excited to bring that product instinct to TechCorp\'s full-stack team while expanding my React web and Java API experience on larger engineering infrastructure.',NULL,'2026-04-16 09:00:00','2026-05-17 11:06:28'),(53,45,25,'APPLIED',NULL,NULL,'2026-05-12 13:30:00','2026-05-17 11:06:28'),(54,47,25,'REJECTED',NULL,NULL,'2026-04-15 10:00:00','2026-05-17 11:06:28'),(55,46,26,'SHORTLISTED','My Java and Python backend skills, combined with three years building retail platform services, prepare me well for the performance demands of ByteForge\'s contract engineering work. I write clean, tested code and adapt quickly to new codebases.',NULL,'2026-04-22 08:45:00','2026-05-17 11:06:28'),(56,4,26,'REJECTED',NULL,NULL,'2026-04-20 14:00:00','2026-05-17 11:06:28'),(57,41,26,'APPLIED',NULL,NULL,'2026-05-14 10:00:00','2026-05-17 11:06:28'),(58,27,27,'REJECTED','Full-stack ownership from database schema to deployed React UI is my natural working style, and CloudStack\'s backend platform role is exactly where I want to grow my distributed systems skills. I am particularly excited by the developer-experience focus and the opportunity to work on infrastructure that other engineers rely on daily.',NULL,'2026-04-08 09:00:00','2026-05-17 11:06:28'),(59,47,27,'REVIEWED',NULL,NULL,'2026-05-02 13:00:00','2026-05-17 11:06:28'),(60,2,27,'APPLIED',NULL,NULL,'2026-05-08 10:00:00','2026-05-17 11:06:28'),(61,46,27,'APPLIED',NULL,NULL,'2026-05-15 14:00:00','2026-05-17 11:06:28'),(62,28,28,'REJECTED',NULL,NULL,'2026-04-10 08:00:00','2026-05-17 11:06:28'),(63,41,28,'REVIEWED',NULL,NULL,'2026-04-29 09:30:00','2026-05-17 11:06:28'),(64,4,28,'APPLIED',NULL,NULL,'2026-05-06 11:00:00','2026-05-17 11:06:28'),(65,7,28,'APPLIED',NULL,NULL,'2026-05-10 13:45:00','2026-05-17 11:06:28'),(66,43,29,'REVIEWED',NULL,NULL,'2026-04-27 10:00:00','2026-05-17 11:06:28'),(67,33,29,'REJECTED',NULL,NULL,'2026-04-25 09:00:00','2026-05-17 11:06:28'),(68,1,29,'APPLIED',NULL,NULL,'2026-05-16 08:30:00','2026-05-17 11:06:28'),(69,2,30,'REVIEWED',NULL,NULL,'2026-05-03 11:00:00','2026-05-17 11:06:28'),(70,47,30,'APPLIED',NULL,NULL,'2026-05-14 14:30:00','2026-05-17 11:06:28');
/*!40000 ALTER TABLE `application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_id` bigint NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` bigint DEFAULT NULL,
  `detail` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_audit_log_admin` (`admin_id`),
  CONSTRAINT `fk_audit_log_admin` FOREIGN KEY (`admin_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `size` enum('STARTUP','SMALL','MEDIUM','LARGE','ENTERPRISE') DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `description` text,
  `verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
INSERT INTO `company` VALUES (1,'TechCorp Singapore',NULL,'Software & Technology','LARGE','Singapore','https://techcorp.example.com','TechCorp Singapore is a leading enterprise software company building scalable SaaS products for the APAC market. With 800+ engineers across five countries, we are known for engineering rigour, developer autonomy, and a relentless focus on performance.',1,'2026-05-17 11:06:28'),(2,'Finova Financial',NULL,'Finance & Banking','MEDIUM','Singapore','https://finova.example.com','Finova Financial provides next-generation fintech products that democratise access to savings, lending, and investment services across Southeast Asia. Our engineering and data teams move fast while keeping regulatory compliance at the centre of every decision.',1,'2026-05-17 11:06:28'),(3,'HealthBridge',NULL,'Healthcare','MEDIUM','Kuala Lumpur','https://healthbridge.example.com','HealthBridge connects patients, clinicians, and hospital networks through integrated digital health technology. Operating in six countries, we are on a mission to make high-quality healthcare accessible to every person in the region regardless of geography or income.',1,'2026-05-17 11:06:28'),(4,'EduNest',NULL,'Education Technology','SMALL','Jakarta','https://edunest.example.com','EduNest is reimagining how 2 million Indonesian students learn through personalised, AI-driven curriculum. We believe adaptive learning should be affordable and engaging for every student, not just those in top-tier private schools.',0,'2026-05-17 11:06:28'),(5,'RetailPlus',NULL,'Retail & E-Commerce','LARGE','Bangkok','https://retailplus.example.com','RetailPlus is Southeast Asia\'s fastest-growing omnichannel retailer with over 700 stores and a thriving e-commerce platform serving 15 million active customers. We move at startup speed backed by enterprise-grade infrastructure and a team that ships daily.',1,'2026-05-17 11:06:28'),(6,'GreenLogix',NULL,'Logistics & Supply Chain','MEDIUM','Manila','https://greenlogix.example.com','GreenLogix delivers sustainable logistics solutions across the Philippines and Vietnam. Our proprietary green-fleet routing engine reduces carbon emissions by 30% versus traditional carriers while maintaining same-day delivery windows in major cities.',0,'2026-05-17 11:06:28'),(7,'CloudStack',NULL,'Cloud & Infrastructure','ENTERPRISE','Singapore','https://cloudstack.example.com','CloudStack is a cloud infrastructure and managed services provider trusted by 400+ enterprises across APAC. We design, migrate, and operate mission-critical environments on AWS, GCP, and Azure with a 99.99% SLA guarantee and a 24/7 NOC team.',1,'2026-05-17 11:06:28'),(8,'MediaWave',NULL,'Media & Entertainment','SMALL','Kuala Lumpur','https://mediawave.example.com','MediaWave is a digital-first media company producing original content for streaming, social, and branded channels across Malaysia, Singapore, and Thailand. Our 60-person team reaches 20 million viewers monthly and is growing fast.',0,'2026-05-17 11:06:28'),(9,'UrbanBuild',NULL,'Construction & Real Estate','MEDIUM','Jakarta','https://urbanbuild.example.com','UrbanBuild is a property development and construction company shaping Jakarta\'s skyline with mixed-use residential and commercial projects. We combine deep construction expertise with PropTech tools to deliver projects on time and under budget.',0,'2026-05-17 11:06:28'),(10,'FinTrust Asia',NULL,'Finance & Banking','LARGE','Singapore','https://fintrust.example.com','FinTrust Asia is a regional financial services group offering wealth management, corporate treasury, and risk advisory across eight APAC markets. Our 2,000-strong team is backed by 30 years of market expertise and an unwavering commitment to client trust.',1,'2026-05-17 11:06:28'),(11,'Medica Group',NULL,'Healthcare','ENTERPRISE','Kuala Lumpur','https://medicagroup.example.com','Medica Group is a leading private healthcare network operating 18 hospitals and 60 clinics across Malaysia and Singapore. We are investing in digital health, advanced data analytics, and AI-assisted diagnostics to transform how care is delivered at scale.',1,'2026-05-17 11:06:28'),(12,'ByteForge',NULL,'Software & Technology','STARTUP','Manila','https://byteforge.example.com','ByteForge is a Manila-based software startup building developer productivity tools used by 50,000 engineers globally. We are a remote-first team of 25 that ships fast, argues in public, and ships some more. If you thrive in ambiguity and own your impact, you will fit right in.',0,'2026-05-17 11:06:28');
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_member`
--

DROP TABLE IF EXISTS `company_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_member` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `position` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_member` (`company_id`,`user_id`),
  KEY `fk_company_member_user` (`user_id`),
  CONSTRAINT `fk_company_member_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_company_member_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_member`
--

LOCK TABLES `company_member` WRITE;
/*!40000 ALTER TABLE `company_member` DISABLE KEYS */;
INSERT INTO `company_member` VALUES (1,1,3,'Talent Acquisition Lead','2026-05-17 11:06:28'),(2,2,4,'HR Manager','2026-05-17 11:06:28'),(3,3,5,'Talent Partner','2026-05-17 11:06:28'),(4,4,6,'People Operations Manager','2026-05-17 11:06:28'),(5,5,7,'Recruiting Manager','2026-05-17 11:06:28'),(6,6,8,'People & Culture Manager','2026-05-17 11:06:28'),(7,7,9,'HR Lead','2026-05-17 11:06:28'),(8,8,10,'Talent Manager','2026-05-17 11:06:28'),(9,9,8,'Regional HR Manager','2026-05-17 11:06:28'),(10,10,4,'Senior HR Manager','2026-05-17 11:06:28'),(11,11,5,'Regional Talent Partner','2026-05-17 11:06:28'),(12,12,9,'Head of People','2026-05-17 11:06:28');
/*!40000 ALTER TABLE `company_member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `connection`
--

DROP TABLE IF EXISTS `connection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `connection` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `requester_id` bigint NOT NULL,
  `addressee_id` bigint NOT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED') DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_connection` (`requester_id`,`addressee_id`),
  KEY `idx_conn_requester_id` (`requester_id`),
  KEY `idx_conn_addressee_id` (`addressee_id`),
  CONSTRAINT `fk_connection_addressee` FOREIGN KEY (`addressee_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_connection_requester` FOREIGN KEY (`requester_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `connection`
--

LOCK TABLES `connection` WRITE;
/*!40000 ALTER TABLE `connection` DISABLE KEYS */;
/*!40000 ALTER TABLE `connection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation`
--

DROP TABLE IF EXISTS `conversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation`
--

LOCK TABLES `conversation` WRITE;
/*!40000 ALTER TABLE `conversation` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation_participant`
--

DROP TABLE IF EXISTS `conversation_participant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_participant` (
  `conversation_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`conversation_id`,`user_id`),
  KEY `fk_conv_part_user` (`user_id`),
  CONSTRAINT `fk_conv_part_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conv_part_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_participant`
--

LOCK TABLES `conversation_participant` WRITE;
/*!40000 ALTER TABLE `conversation_participant` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversation_participant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `education`
--

DROP TABLE IF EXISTS `education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `education` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `school` varchar(150) DEFAULT NULL,
  `degree` varchar(100) DEFAULT NULL,
  `field_of_study` varchar(100) DEFAULT NULL,
  `start_year` int DEFAULT NULL,
  `end_year` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_edu_user_id` (`user_id`),
  CONSTRAINT `fk_education_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `education`
--

LOCK TABLES `education` WRITE;
/*!40000 ALTER TABLE `education` DISABLE KEYS */;
INSERT INTO `education` VALUES (1,11,'National University of Singapore','Bachelor of Engineering','Computer Science',2012,2016,'2026-05-17 11:06:28'),(2,11,'Coursera / Amazon Web Services','Certification','AWS Solutions Architect ??? Associate',2020,2020,'2026-05-17 11:06:28'),(3,12,'National University of Singapore','Bachelor of Science','Computer Science',2014,2018,'2026-05-17 11:06:28'),(4,16,'King Mongkut\'s University of Technology Thonburi','Bachelor of Engineering','Computer Engineering',2015,2019,'2026-05-17 11:06:28'),(5,17,'De La Salle University Manila','Bachelor of Science','Information Technology',2014,2019,'2026-05-17 11:06:28'),(6,18,'Nanyang Technological University','Bachelor of Science','Computer Science',2017,2021,'2026-05-17 11:06:28');
/*!40000 ALTER TABLE `education` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `experience`
--

DROP TABLE IF EXISTS `experience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `experience` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `title` varchar(150) NOT NULL,
  `company_name` varchar(150) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `current` tinyint(1) DEFAULT '0',
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_exp_user_id` (`user_id`),
  CONSTRAINT `fk_experience_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `experience`
--

LOCK TABLES `experience` WRITE;
/*!40000 ALTER TABLE `experience` DISABLE KEYS */;
INSERT INTO `experience` VALUES (1,11,'Senior Full-Stack Developer','DataNexus Pte Ltd','Singapore','2021-03-01',NULL,1,'Lead architect and primary developer of DataNexus\'s real-time analytics dashboard serving 200K enterprise users. Introduced a React micro-frontend architecture that reduced build times by 40%. Mentored four junior engineers and drove TypeScript adoption across all frontend codebases.','2026-05-17 11:06:28'),(2,11,'Full-Stack Developer','Velocis Technologies','Singapore','2018-06-01','2021-02-28',0,'Built and maintained the core SaaS platform serving 50K+ SME customers. Owned the Java Spring Boot API, React frontend, and MySQL schema migrations. Reduced average API response time by 35% through query optimisation and Redis caching.','2026-05-17 11:06:28'),(3,11,'Junior Software Engineer','CodeLabs Asia','Singapore','2016-08-01','2018-05-31',0,'Developed internal tooling and customer-facing features for a B2B e-commerce platform. First professional exposure to Spring Boot, React, and Agile ceremonies. Contributed to a five-engineer team shipping weekly releases to 10K users.','2026-05-17 11:06:28'),(4,12,'Senior Software Engineer','Govtech Singapore','Singapore','2020-04-01',NULL,1,'Designing and building microservices for a citizen-facing government portal handling 1M+ monthly sessions. Responsible for service architecture reviews, on-call rotations, and growing a team of three engineers. Core stack: Java, Spring Boot, PostgreSQL, Kubernetes.','2026-05-17 11:06:28'),(5,12,'Software Engineer','Grab','Singapore','2017-07-01','2020-03-31',0,'Built and maintained backend services for the driver incentives platform. Optimised batch processing jobs reducing nightly run time from 4 hours to 45 minutes. Collaborated with data engineers on real-time event streaming using Kafka.','2026-05-17 11:06:28'),(6,16,'DevOps Engineer','Agoda','Bangkok','2021-01-01',NULL,1,'Owns CI/CD pipeline infrastructure for 30+ microservices on AWS EKS. Reduced deployment lead time from 3 days to 45 minutes through GitOps adoption. On-call lead responsible for SLO monitoring, incident response runbooks, and post-mortems.','2026-05-17 11:06:28'),(7,16,'Cloud Infrastructure Intern','SCB Tech','Bangkok','2019-07-01','2020-12-31',0,'Assisted in migrating on-premise workloads to AWS. Set up Terraform modules for VPC and ECS clusters. Gained hands-on experience with CloudWatch alerting and cost optimisation for EC2 and RDS instances.','2026-05-17 11:06:28'),(8,17,'Backend Developer','Ninja Van Philippines','Manila','2021-05-01',NULL,1,'Builds and maintains Java Spring Boot services powering the parcel tracking and driver dispatch systems. Integrated Apache Kafka for real-time event streaming, processing 5M+ events per day. Reduced p99 API latency by 28% through connection pooling and index tuning.','2026-05-17 11:06:28'),(9,17,'Junior Java Developer','UnionBank Digital','Manila','2019-06-01','2021-04-30',0,'Developed REST APIs for the bank\'s mobile banking backend. Participated in a core banking modernisation project, migrating legacy SOAP services to REST. Wrote integration tests with MockMvc and maintained 85% code coverage on assigned modules.','2026-05-17 11:06:28'),(10,18,'Frontend Developer','Carousell','Singapore','2022-02-01',NULL,1,'Builds React components for the marketplace listing and search experience used by 5M+ monthly active users. Championed a design-system migration cutting CSS bundle size by 30%. Writes Vitest unit tests and collaborates with designers in Figma daily.','2026-05-17 11:06:28'),(11,18,'Frontend Intern','Shopback','Singapore','2021-06-01','2021-12-31',0,'Built reusable React components for the cashback rewards dashboard. Improved Lighthouse performance score from 61 to 84 on the landing page through image optimisation and deferred script loading. First production experience with TypeScript and Tailwind CSS.','2026-05-17 11:06:28');
/*!40000 ALTER TABLE `experience` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job`
--

DROP TABLE IF EXISTS `job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `posted_by` bigint NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `employment_type` enum('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','REMOTE') NOT NULL,
  `experience_level` enum('ENTRY','MID','SENIOR','LEAD','MANAGER') NOT NULL,
  `salary_min` decimal(10,2) DEFAULT NULL,
  `salary_max` decimal(10,2) DEFAULT NULL,
  `status` enum('OPEN','CLOSED','REMOVED') DEFAULT 'OPEN',
  `posted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deadline` date DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_job_company_id` (`company_id`),
  KEY `idx_job_posted_by` (`posted_by`),
  KEY `idx_job_status` (`status`),
  KEY `idx_job_posted_at` (`posted_at`),
  CONSTRAINT `fk_job_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_job_posted_by` FOREIGN KEY (`posted_by`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job`
--

LOCK TABLES `job` WRITE;
/*!40000 ALTER TABLE `job` DISABLE KEYS */;
INSERT INTO `job` VALUES (1,1,3,'Senior Backend Engineer','TechCorp Singapore is looking for a Senior Backend Engineer to join our core platform team. You will design, build, and operate high-throughput microservices that power our talent intelligence products, serving millions of job seekers and recruiters across Southeast Asia. Day-to-day responsibilities include leading API design reviews, optimising database queries on multi-million-row tables, mentoring mid-level engineers, and participating in on-call rotations. Our stack is Java 17, Spring Boot 3, MySQL 8, Apache Kafka, and AWS EKS. You are expected to own features end-to-end: from architecture decision records through production deployment and post-incident retrospectives. Candidates with strong distributed-systems fundamentals, experience with event-driven patterns, and a track record of improving system reliability are strongly preferred.','Singapore','FULL_TIME','SENIOR',85000.00,120000.00,'OPEN','2026-03-01 09:00:00','2026-06-01','2026-05-17 11:06:28'),(2,1,3,'Full-Stack Developer','Join TechCorp Singapore as a Full-Stack Developer and help us build the next generation of our recruitment marketplace. You will work across the entire stack ??? React on the frontend and Node.js or Java Spring Boot on the backend ??? delivering features used by hundreds of thousands of daily active users. You will collaborate with product designers to translate Figma mocks into pixel-perfect, accessible UIs, and with data engineers to surface real-time analytics within the product. We value engineers who write clean, testable code, move quickly without breaking things, and can debug a UI regression and a SQL plan in the same afternoon. TypeScript, React Query, and Tailwind CSS are part of our daily toolkit.','Singapore','FULL_TIME','MID',55000.00,78000.00,'OPEN','2026-03-15 10:00:00',NULL,'2026-05-17 11:06:28'),(3,1,3,'Software Engineering Intern','TechCorp Singapore\'s internship programme gives you real engineering experience ??? not grunt work. As a Software Engineering Intern, you will be embedded in a product team, owning a well-scoped feature from design to production over your 12???16 week tenure. Past interns have shipped search ranking improvements, built internal tooling, and refactored core data pipelines. You will attend sprint ceremonies, participate in code reviews, and get a mentor who holds weekly 1-on-1s with you. We expect familiarity with at least one of Python, Java, or JavaScript, a basic understanding of REST APIs, and genuine curiosity about how large-scale systems work. Strong performers are considered for return full-time offers.','Singapore','INTERNSHIP','ENTRY',25000.00,35000.00,'OPEN','2026-04-01 08:30:00','2026-06-15','2026-05-17 11:06:28'),(4,1,3,'Technical Lead ??? Platform Engineering','TechCorp Singapore is hiring a Technical Lead to guide our Platform Engineering squad responsible for developer tooling, CI/CD pipelines, observability, and internal services. You will set the technical direction for a team of five engineers, run architecture reviews, define quarterly OKRs alongside the engineering manager, and represent the squad in cross-team planning. This role requires deep expertise in AWS, Kubernetes, and at least one compiled language. You will spend roughly 60% of your time coding and 40% on technical leadership activities. If you have previously led the migration of a monolith to microservices, introduced GitOps practices, or built a self-service developer platform, we want to hear from you.','Singapore','FULL_TIME','LEAD',105000.00,148000.00,'OPEN','2026-02-20 09:00:00',NULL,'2026-05-17 11:06:28'),(5,2,4,'Data Engineer','Finova Financial is seeking a Data Engineer to build and maintain the pipelines that feed our risk and compliance intelligence platform. You will ingest structured and semi-structured data from over 30 upstream sources ??? market feeds, regulatory filings, transaction systems ??? and deliver clean, well-modelled datasets to analysts and machine learning teams. Our stack is Python, Apache Spark, dbt, Airflow, and AWS (S3, Glue, Redshift). You will introduce data quality monitoring, maintain lineage documentation, and collaborate closely with data consumers to understand their SLA requirements. Candidates should have solid SQL skills, experience building production-grade pipelines, and a good grasp of dimensional modelling and slowly changing dimensions.','Singapore','FULL_TIME','MID',60000.00,80000.00,'OPEN','2026-04-10 09:00:00','2026-06-10','2026-05-17 11:06:28'),(6,2,4,'Risk Analyst ??? Credit & Market','Finova Financial\'s Risk Analytics team is growing and we need a Risk Analyst with a strong quantitative background to support credit and market risk modelling. You will develop and back-test risk models, produce regulatory capital calculations (Basel III/IV), and build dashboards for senior risk committees. This role sits at the intersection of finance and data ??? you will write SQL daily, build Python scripts for scenario analysis, and communicate complex risk metrics clearly to non-technical stakeholders. We value intellectual rigour, attention to data accuracy, and the ability to translate quantitative findings into business-level recommendations. Prior exposure to credit risk, VaR, or stress-testing frameworks is a strong plus.','Singapore','FULL_TIME','MID',55000.00,75000.00,'OPEN','2026-03-05 10:00:00',NULL,'2026-05-17 11:06:28'),(7,2,4,'Cloud Infrastructure Engineer','Finova Financial is looking for a Cloud Infrastructure Engineer to join our SRE function on a fully remote basis. You will own the reliability and security of our AWS-based infrastructure ??? multi-region EKS clusters, RDS Aurora, and a suite of serverless workloads. Key responsibilities include capacity planning, cost optimisation, incident response, and championing infrastructure-as-code using Terraform. You will also collaborate with our compliance team to ensure our environments meet MAS Technology Risk Management guidelines. We are a remote-first team with quarterly in-person meetups in Singapore. Strong candidates will have hands-on Kubernetes experience, familiarity with cloud security best practices, and a disciplined approach to documentation and runbook maintenance.','Singapore (Remote)','REMOTE','SENIOR',88000.00,118000.00,'OPEN','2026-04-20 09:30:00',NULL,'2026-05-17 11:06:28'),(8,2,4,'Head of Technology','Finova Financial is looking for a Head of Technology to lead our engineering and infrastructure organisation as we scale from Series B to Series C. Reporting to the CTO, you will manage three engineering squads (30 headcount), own the technology roadmap, and represent engineering in board-level conversations. You will make build-versus-buy decisions, drive vendor negotiations, establish engineering hiring standards, and ensure the organisation can execute reliably at increased velocity. This role requires a blend of people leadership, strategic thinking, and sufficient technical depth to earn the respect of your engineering teams. Prior experience leading technology in a regulated financial services context is highly desirable.','Singapore','FULL_TIME','MANAGER',130000.00,178000.00,'OPEN','2026-02-25 09:00:00',NULL,'2026-05-17 11:06:28'),(9,3,5,'Healthcare Data Analyst','HealthBridge is seeking a Healthcare Data Analyst to transform our clinical and operational data into actionable insights. You will work with large datasets from electronic health records, wearable devices, and patient feedback systems to produce reports, dashboards, and statistical summaries for clinical leadership and hospital partners across Southeast Asia. Daily tasks include writing complex SQL queries, building Power BI and Tableau dashboards, and presenting findings in cross-functional meetings. Familiarity with healthcare data standards such as HL7 FHIR or ICD-10 is a significant advantage. We value analysts who ask the right questions, challenge assumptions in data, and communicate uncertainty clearly to non-technical audiences.','Singapore','FULL_TIME','MID',52000.00,72000.00,'OPEN','2026-03-20 09:00:00',NULL,'2026-05-17 11:06:28'),(10,3,5,'Machine Learning Engineer ??? Clinical AI','HealthBridge is hiring a Machine Learning Engineer to develop and deploy predictive models that assist clinicians in early diagnosis and care pathway optimisation. You will work alongside physicians, data scientists, and software engineers to move models from research prototype to production ??? handling data ingestion, feature engineering, model training, evaluation, and serving at scale. Our primary stack is Python (PyTorch, scikit-learn), MLflow, AWS SageMaker, and FastAPI. You will implement rigorous model validation frameworks and maintain explainability documentation required for clinical stakeholder trust. Prior experience deploying ML in a regulated domain (healthcare, finance, or similar) is strongly preferred, along with solid software engineering practices in Python.','Singapore','FULL_TIME','SENIOR',90000.00,120000.00,'OPEN','2026-04-15 09:00:00','2026-06-05','2026-05-17 11:06:28'),(11,3,5,'Product Manager ??? Digital Health Platforms','HealthBridge is looking for a Product Manager to lead our digital health platform suite ??? a set of patient-facing mobile apps, clinician portals, and API integrations with hospital systems. You will own the product roadmap, facilitate discovery sessions with clinical end-users, write detailed PRDs, and coordinate delivery across engineering, design, and regulatory teams. This role requires you to balance speed-to-market with the rigorous quality and compliance standards of healthcare software. You should have prior PM experience with complex B2B or B2B2C platforms, strong stakeholder management skills, and comfort with data-driven decision-making. Familiarity with SaMD regulatory frameworks (MDR, FDA 510(k)) is a bonus.','Singapore','FULL_TIME','LEAD',102000.00,145000.00,'OPEN','2026-03-01 10:00:00',NULL,'2026-05-17 11:06:28'),(12,3,5,'Clinical Software Developer','HealthBridge is hiring a Clinical Software Developer on a 12-month contract to accelerate delivery of our hospital integration layer. You will build and maintain Java Spring Boot services that connect HealthBridge\'s platform to hospital EMR systems using HL7 FHIR R4. Tasks include implementing FHIR resource mappings, writing integration tests against sandbox environments, and collaborating with clinical informatics specialists to validate data accuracy. The contract has a strong likelihood of extension or conversion to permanent for high performers. You should be comfortable with Java, REST APIs, SQL, and ideally have some exposure to healthcare interoperability standards. Experience with open-source FHIR servers (HAPI FHIR) is a plus.','Singapore','CONTRACT','MID',55000.00,75000.00,'CLOSED','2026-02-18 09:00:00',NULL,'2026-05-17 11:06:28'),(13,4,6,'Frontend Developer','EduNest is hiring a Frontend Developer to help build the learner-facing experience for our adaptive learning platform used by over 400,000 students across Indonesia, Malaysia, and the Philippines. You will translate designs into accessible, performant React components, collaborate with backend engineers to integrate REST APIs, and write unit and integration tests using Vitest and React Testing Library. We care deeply about page load performance and accessibility ??? W3C WCAG 2.1 AA compliance is a baseline requirement for all new UI work. You should have solid JavaScript and TypeScript fundamentals, experience with React, and a good eye for detail. Tailwind CSS, Framer Motion, and TanStack Query experience is a strong advantage.','Jakarta','FULL_TIME','ENTRY',32000.00,48000.00,'OPEN','2026-04-05 09:00:00',NULL,'2026-05-17 11:06:28'),(14,4,6,'Learning Experience Designer','EduNest is looking for a Learning Experience Designer to join our curriculum team on a part-time basis (20???25 hours per week). You will design instructional frameworks for our K-12 and higher education product lines, create assessment rubrics, and collaborate with subject-matter experts to translate academic content into engaging microlearning modules. Your work will directly influence how over 400,000 learners progress through personalised learning paths. Prior experience designing online learning experiences using tools like Articulate 360, Adobe Captivate, or custom LMS authoring environments is required. You should understand pedagogical principles, learning taxonomies (Bloom, Gagn??), and UX design fundamentals as they apply to educational contexts.','Jakarta (Hybrid)','PART_TIME','MID',28000.00,42000.00,'OPEN','2026-04-25 10:00:00',NULL,'2026-05-17 11:06:28'),(15,4,6,'EdTech Product Manager','EduNest is seeking an experienced EdTech Product Manager to own our adaptive learning engine ??? the core recommendation system that personalises content sequences for each learner. You will lead a cross-functional squad of engineers, data scientists, and curriculum designers, managing the full product lifecycle from ideation through launch and iteration. Key responsibilities include conducting user research with students and teachers, defining success metrics, writing feature specifications, prioritising the backlog, and presenting roadmap updates to the leadership team. You should have a proven record of shipping impactful product improvements in a data-driven environment. Experience in education technology, B2C SaaS, or consumer mobile products is strongly preferred.','Jakarta','FULL_TIME','SENIOR',82000.00,115000.00,'OPEN','2026-03-10 09:00:00','2026-06-10','2026-05-17 11:06:28'),(16,4,6,'Content Operations Intern','EduNest\'s Content Operations team is looking for a motivated intern to support the production pipeline for our digital learning content. You will assist with quality-checking new modules, tagging content in our CMS, coordinating with freelance educators, and generating production reports. This is a great opportunity to learn how a high-growth EdTech company manages a large content library across multiple markets and languages. You should be organised, detail-oriented, and comfortable with spreadsheets and basic data entry tools. Familiarity with any CMS (WordPress, Contentful, or similar) is a plus. The internship runs for 3 months with a possible extension.','Jakarta','INTERNSHIP','ENTRY',18000.00,24000.00,'OPEN','2026-05-01 09:00:00','2026-06-01','2026-05-17 11:06:28'),(17,5,7,'E-commerce Marketing Specialist','RetailPlus is looking for an E-commerce Marketing Specialist to drive customer acquisition and retention across our online retail channels. You will plan and execute paid media campaigns on Google Ads, Meta, and TikTok, analyse campaign performance using GA4 and internal dashboards, and collaborate with the merchandising team on promotional calendars. You will also manage email marketing flows in Klaviyo and contribute to SEO content strategy. We are a data-first marketing team ??? you should be comfortable building pivot tables, writing SQL queries for ad-hoc analysis, and presenting results clearly to senior stakeholders. Prior experience managing a monthly paid media budget of at least SGD 100K is preferred.','Bangkok','FULL_TIME','MID',50000.00,70000.00,'OPEN','2026-03-25 09:00:00',NULL,'2026-05-17 11:06:28'),(18,5,7,'Supply Chain Analyst','RetailPlus is seeking a Supply Chain Analyst to support our inventory planning and logistics operations across Thailand, Malaysia, and Vietnam. You will build demand forecasting models, analyse supplier lead times, identify bottlenecks in the inbound and outbound logistics flow, and produce weekly operations dashboards for the Supply Chain Director. Proficiency in SQL and Python (pandas, NumPy) is essential for extracting and manipulating data from our ERP and WMS systems. You will also work closely with regional warehouse managers to validate data accuracy and implement process improvements. Knowledge of supply chain methodologies (EOQ, safety stock calculation, ABC analysis) and prior retail or FMCG experience are strong advantages.','Bangkok','FULL_TIME','MID',52000.00,72000.00,'OPEN','2026-04-08 09:00:00',NULL,'2026-05-17 11:06:28'),(19,5,7,'Sales Development Representative','RetailPlus is expanding its B2B marketplace division and needs energetic Sales Development Representatives to generate qualified leads for our enterprise retail solutions. You will prospect new accounts via LinkedIn, cold calling, and email outreach, qualify inbound leads from marketing campaigns, and book discovery calls for senior account executives. This role is an excellent entry point into a fast-paced retail-technology sales career with a clearly defined path to Account Executive. We provide structured onboarding, call coaching, and access to sales intelligence tools (Salesforce, Apollo). You should be a confident communicator, comfortable with rejection, and motivated by measurable targets and commission rewards.','Bangkok','FULL_TIME','ENTRY',32000.00,48000.00,'OPEN','2026-05-05 09:00:00',NULL,'2026-05-17 11:06:28'),(20,5,7,'Head of Digital Retail','RetailPlus is hiring a Head of Digital Retail to lead the strategy and P&L for our online channel across five Southeast Asian markets. Reporting directly to the CEO, you will set the vision for our e-commerce experience, manage a team of 15 across marketing, product, and merchandising, and drive double-digit growth in online GMV year-over-year. You will own the technology roadmap for our digital storefront, lead negotiations with marketplace partners (Lazada, Shopee, TikTok Shop), and represent the digital channel in leadership forums. Candidates must have prior experience running a significant digital retail or marketplace business, strong commercial acumen, and proven people management skills.','Bangkok','FULL_TIME','MANAGER',125000.00,170000.00,'OPEN','2026-02-28 09:00:00',NULL,'2026-05-17 11:06:28'),(21,6,8,'Logistics Operations Lead','GreenLogix is seeking a Logistics Operations Lead to oversee our last-mile and middle-mile delivery operations across the Philippines. You will manage a team of eight operations coordinators, own the KPI framework for on-time delivery and cost-per-parcel, and drive continuous improvement initiatives. You will work closely with the technology team to scope operational requirements for our route-optimisation platform, and with commercial teams to onboard new enterprise clients with complex logistics SLAs. This role requires deep operational experience ??? you should be comfortable in a warehouse, at a driver briefing, and in an executive presentation within the same day. Prior leadership in a courier, 3PL, or e-commerce logistics company is required.','Manila','FULL_TIME','LEAD',100000.00,140000.00,'OPEN','2026-03-15 09:00:00','2026-06-15','2026-05-17 11:06:28'),(22,6,8,'Sustainability Analyst','GreenLogix is hiring a Sustainability Analyst on a 6-month contract to support our ESG reporting and carbon-reduction roadmap. You will collect and validate Scope 1, 2, and 3 emissions data from our fleet and logistics network, build reporting models aligned with GHG Protocol standards, and prepare input for our annual sustainability report. You will also benchmark our carbon intensity against industry peers and identify quick-win reduction opportunities. Strong analytical skills, experience with Excel or Python for data analysis, and an understanding of logistics emissions measurement are required. Familiarity with ISO 14064 or the TCFD framework is a significant advantage.','Manila','CONTRACT','MID',42000.00,58000.00,'OPEN','2026-04-01 10:00:00',NULL,'2026-05-17 11:06:28'),(23,6,8,'Fleet Management Intern','GreenLogix is offering a 3-month internship in our Fleet Management division. As an intern, you will assist fleet coordinators with vehicle maintenance scheduling, driver performance reporting, and telematics data analysis. You will learn how real-time GPS tracking and route-optimisation algorithms are used to reduce fuel consumption and improve delivery SLAs. Daily tasks include updating fleet databases, generating route performance reports, and attending operational team meetings. This is a hands-on role ??? you will visit depot sites and work alongside experienced fleet managers. We are looking for students or recent graduates in logistics, supply chain management, industrial engineering, or a related field.','Manila','INTERNSHIP','ENTRY',18000.00,25000.00,'OPEN','2026-05-10 09:00:00',NULL,'2026-05-17 11:06:28'),(24,6,8,'Route Optimization Engineer','GreenLogix is looking for a Route Optimization Engineer to join our remote-first technology team and improve the algorithms powering our last-mile delivery network. You will research and implement combinatorial optimisation techniques ??? vehicle routing, time-window constraints, dynamic re-routing ??? and validate improvements through simulations and A/B tests on live traffic. Our stack includes Python, OR-Tools, PostgreSQL with PostGIS, and AWS Lambda. You will collaborate with operations analysts to understand real-world logistics constraints and translate them into well-specified algorithmic requirements. Strong mathematical fundamentals (linear programming, graph algorithms), Python proficiency, and prior experience with routing or scheduling problems are essential.','Manila (Remote)','REMOTE','SENIOR',85000.00,115000.00,'OPEN','2026-03-28 10:00:00',NULL,'2026-05-17 11:06:28'),(25,7,9,'Cloud Architect','CloudStack is hiring a Cloud Architect to lead the design and governance of multi-tenant cloud environments deployed across AWS and GCP for our enterprise SaaS clients. You will produce architecture blueprints, run cloud design workshops with client engineering teams, define reference architectures for common workload patterns, and review infrastructure-as-code pull requests. Security is central to this role ??? you will design IAM policies, network segmentation strategies, and encryption-at-rest and in-transit schemes that meet ISO 27001 and SOC 2 Type II requirements. You should have deep AWS expertise (Solutions Architect Professional or equivalent), hands-on Kubernetes and Terraform experience, and a track record of delivering complex, production-grade cloud migrations.','Singapore','FULL_TIME','SENIOR',92000.00,125000.00,'OPEN','2026-03-05 09:00:00','2026-06-05','2026-05-17 11:06:28'),(26,7,9,'DevOps Engineer','CloudStack is looking for a DevOps Engineer to join our platform reliability team. You will build and maintain CI/CD pipelines for internal and client-facing workloads, manage Kubernetes clusters on AWS EKS, and develop Terraform modules for our infrastructure provisioning library. You will also set up and tune observability stacks (Prometheus, Grafana, OpenTelemetry), define alerting runbooks, and participate in on-call rotations. We operate in a fast-paced, client-driven environment where reliability expectations are high and incident response turnaround must be fast. You should be comfortable with GitOps workflows, have strong Linux and networking fundamentals, and bring a documented history of reducing toil through automation.','Singapore','FULL_TIME','MID',62000.00,82000.00,'OPEN','2026-03-22 09:00:00',NULL,'2026-05-17 11:06:28'),(27,7,9,'Backend Engineer ??? Platform','CloudStack is seeking a Backend Engineer to join our Platform Engineering team, building the internal APIs and services that underpin our multi-tenant SaaS control plane. You will design and implement RESTful and event-driven APIs in Java and Python, optimise slow database queries, and contribute to the multi-tenancy isolation layer that keeps customer data safe and correctly scoped. Our engineering culture prizes testability, code review rigour, and incremental delivery over big-bang releases. You will be part of an on-call rotation and expected to respond to and resolve production incidents. Strong SQL skills, familiarity with AWS services, experience with event-driven architectures (Kafka or SQS), and a bias for operational clarity are all important.','Singapore','FULL_TIME','SENIOR',88000.00,118000.00,'OPEN','2026-04-12 09:00:00',NULL,'2026-05-17 11:06:28'),(28,7,9,'Infrastructure Automation Engineer','CloudStack is looking for an Infrastructure Automation Engineer on a 9-month contract to help migrate 40+ client workloads from hand-crafted CloudFormation stacks to a standardised Terraform module library. You will audit existing infrastructure, write modular Terraform code, run parallel validation environments, and coordinate with client DevOps teams during cutover windows. This contract has a high likelihood of conversion to permanent based on business growth. You should have strong Terraform experience (modules, workspaces, remote state), solid Docker and Kubernetes knowledge, and be comfortable writing Python or Bash scripts for automation glue. The ideal candidate is systematic, documents as they go, and communicates clearly with technical and non-technical stakeholders.','Singapore','CONTRACT','MID',58000.00,78000.00,'CLOSED','2026-02-16 09:00:00',NULL,'2026-05-17 11:06:28'),(29,8,10,'Digital Marketing Manager','MediaWave is hiring a Digital Marketing Manager to lead paid and organic growth for our network of entertainment and lifestyle media brands across Indonesia and the Philippines. You will manage a team of three specialists, own a multi-channel budget exceeding USD 500K per year, and be accountable for audience growth, CPL, and content engagement KPIs. You will set the strategy for SEO, SEM, email, and social channels, run weekly performance reviews, and present quarterly results to the C-suite. We are looking for a data-driven marketer who combines creative instinct with analytical rigour ??? someone who can write a compelling campaign brief and interrogate a Google Analytics dashboard with equal confidence.','Jakarta','FULL_TIME','SENIOR',80000.00,110000.00,'OPEN','2026-04-18 09:00:00',NULL,'2026-05-17 11:06:28'),(30,8,10,'Content Creator ??? Entertainment','MediaWave is looking for a part-time Content Creator to produce short-form video scripts, social media copy, and newsletter content for two of our entertainment channels (combined 2.5M followers). You will stay on top of trending topics, brainstorm content ideas in weekly editorial calls, write scripts optimised for TikTok and Instagram Reels, and contribute to our monthly content calendar. This role suits a pop-culture enthusiast with a sharp writing voice, good sense of pacing for short-form content, and comfort with fast turnaround cycles. Approximately 20 hours per week. Remote-friendly but you must be available for overlap during Jakarta business hours.','Jakarta (Hybrid)','PART_TIME','ENTRY',22000.00,36000.00,'OPEN','2026-05-08 10:00:00',NULL,'2026-05-17 11:06:28'),(31,8,10,'Video Production Intern','MediaWave is offering a 3-month Video Production Internship for film, media, or communications students who want real-world experience in a fast-moving digital media environment. You will assist our production team with shoot logistics, B-roll capture, basic editing in Adobe Premiere Pro, and asset management. You will shadow senior producers on client shoots and learn the end-to-end workflow from concept brief to published video. A portfolio of personal video projects (even casual YouTube or TikTok content) is welcome. Comfort with Adobe Creative Cloud tools and a willingness to learn fast are more important than prior professional experience. Equipment training is provided.','Jakarta','INTERNSHIP','ENTRY',15000.00,22000.00,'OPEN','2026-04-30 09:00:00',NULL,'2026-05-17 11:06:28'),(32,8,10,'Social Media Strategist','MediaWave is bringing on a Social Media Strategist on a 6-month renewable contract to develop and execute platform strategies for three of our media brands. You will conduct competitive audits, define monthly content pillars, brief creators and designers, schedule and publish posts, and monitor performance using native analytics and Sprout Social. You will report weekly on follower growth, engagement rate, and video completion metrics, and make data-backed recommendations to the editorial director. You should have hands-on experience managing brand accounts on Instagram, TikTok, and YouTube ??? ideally for a media, lifestyle, or consumer brand ??? with a genuine feel for what formats and hooks perform in each platform\'s algorithm.','Jakarta','CONTRACT','MID',40000.00,58000.00,'OPEN','2026-03-18 10:00:00',NULL,'2026-05-17 11:06:28'),(33,9,8,'Civil Engineer ??? Structural','UrbanBuild is seeking a Civil Engineer with a structural background to join project teams delivering residential tower and mixed-use development projects in the Philippines. You will prepare and review structural engineering drawings, perform load calculations, liaise with geotechnical consultants, and supervise reinforced concrete works on site. You will coordinate with architects, M&E engineers, and quantity surveyors to resolve design conflicts and ensure construction proceeds on programme. Familiarity with NSCP (National Structural Code of the Philippines) and experience using STAAD.Pro, ETABS, or SAP2000 for structural analysis are required. Candidates must be licensed civil engineers (PRC) in good standing.','Manila','FULL_TIME','MID',50000.00,68000.00,'OPEN','2026-04-02 09:00:00',NULL,'2026-05-17 11:06:28'),(34,9,8,'Project Manager ??? Construction','UrbanBuild is hiring a Project Manager to lead delivery of a PHP 2.5B mixed-use development in Quezon City. You will own the master programme, manage a team of site engineers and coordinators, hold subcontractors accountable to quality and schedule milestones, manage change orders, and report fortnightly to the client and UrbanBuild board. You should have managed at least one large-scale vertical development project end-to-end, have solid understanding of contracts (FIDIC or similar), and be comfortable preparing EVM reports. A degree in civil engineering, project management certification (PMP or equivalent), and strong stakeholder communication skills are expected.','Manila','FULL_TIME','SENIOR',85000.00,115000.00,'OPEN','2026-03-12 09:00:00',NULL,'2026-05-17 11:06:28'),(35,9,8,'Lead Quantity Surveyor','UrbanBuild is looking for a Lead Quantity Surveyor to oversee cost management across a portfolio of three active construction projects. You will prepare bills of quantities, conduct tender evaluations, certify interim payment applications, manage the variation register, and produce monthly cost reports for senior leadership. You will mentor two junior QS team members and liaise directly with project managers and clients on cost-related matters. Proficiency in CostX, Buildsoft, or similar QS software is required. Candidates should hold a degree in quantity surveying and have at least eight years of post-qualification experience in building construction, with exposure to residential high-rise projects.','Manila','PART_TIME','LEAD',70000.00,95000.00,'CLOSED','2026-02-22 09:00:00',NULL,'2026-05-17 11:06:28'),(36,9,8,'Site Safety Officer','UrbanBuild is recruiting a Site Safety Officer for a residential project in Bonifacio Global City. You will conduct daily toolbox talks, perform safety inspections of scaffolding, formwork, and lifting operations, investigate near-misses, and maintain DOLE-required safety records. You must hold a current COSH certificate and have at least two years of on-site construction safety experience. Duties also include coordinating with the safety consultant on regulatory submissions and preparing monthly safety statistics for the project manager. Candidates must be comfortable working at heights and in an active construction environment.','Manila','CONTRACT','ENTRY',28000.00,38000.00,'REMOVED','2026-04-25 09:00:00',NULL,'2026-05-17 11:06:28'),(37,10,4,'Financial Analyst','FinTrust Asia is looking for a Financial Analyst to join our investment research team covering ASEAN equity markets. You will build and maintain three-statement financial models, write sector-specific research notes, prepare client-ready presentation decks, and support senior analysts during earnings seasons. You will also extract and clean financial data using Bloomberg Terminal, Refinitiv Eikon, and SQL queries against our internal data warehouse. Strong Excel and PowerPoint skills are essential. CFA Level 1 or above is preferred. We are looking for individuals with a genuine interest in financial markets, intellectual curiosity, and the rigour to maintain accurate models under tight deadlines.','Singapore','FULL_TIME','MID',55000.00,75000.00,'OPEN','2026-05-02 09:00:00',NULL,'2026-05-17 11:06:28'),(38,10,4,'Senior Risk Manager','FinTrust Asia is seeking a Senior Risk Manager to strengthen our enterprise risk management framework as we expand into new ASEAN markets. Reporting to the CRO, you will maintain the risk register, facilitate quarterly risk assessments with business unit heads, develop risk appetite statements, and ensure alignment with MAS Guidelines on Risk Management Practices. You will also support the internal audit cycle and coordinate responses to regulatory examinations. The ideal candidate has deep knowledge of financial services risk frameworks, strong analytical and report-writing skills, and experience working within MAS or equivalent ASEAN regulatory environments. This role can be performed on a primarily remote basis with monthly visits to our Singapore office.','Singapore (Remote)','REMOTE','SENIOR',90000.00,120000.00,'OPEN','2026-03-08 09:00:00',NULL,'2026-05-17 11:06:28'),(39,10,4,'Director of AML Compliance','FinTrust Asia is hiring a Director of AML Compliance to lead our anti-money laundering programme across all regulated entities in Singapore, Malaysia, and Thailand. You will oversee the compliance team, manage relationships with MAS and equivalent regulators, chair the MLRO committee, drive remediation of findings from MAS inspections, and maintain our AML/CFT policies and risk assessments. You will also lead deployment of transaction monitoring system enhancements and ensure suspicious activity reporting meets regulatory timelines. Candidates must have at least twelve years of AML compliance experience in financial services, detailed knowledge of FATF recommendations, and prior MLRO experience is preferred. ICA Diploma or CAMS certification is required.','Singapore','PART_TIME','MANAGER',145000.00,180000.00,'CLOSED','2026-02-20 09:00:00',NULL,'2026-05-17 11:06:28'),(40,10,4,'VP of Finance Technology','FinTrust Asia is looking for a VP of Finance Technology to lead the digital transformation of our finance operations. You will own the technology roadmap for finance systems ??? ERP, treasury management, regulatory reporting, and data infrastructure ??? and manage a team of six system analysts and developers. Working closely with the CFO and CTO, you will evaluate and implement new platforms, drive finance process automation using RPA and APIs, and ensure data integrity across the finance technology stack. You should have prior leadership experience in a fintech or financial services environment, strong project management skills, and sufficient technical depth to engage meaningfully with architects and developers.','Singapore','FULL_TIME','MANAGER',130000.00,175000.00,'OPEN','2026-03-30 09:00:00',NULL,'2026-05-17 11:06:28'),(41,11,5,'Lead Medical Software Engineer','Medica Group is looking for a Lead Medical Software Engineer to guide the engineering squad responsible for our diagnostic imaging software platform. You will make architectural decisions, conduct code and design reviews, manage sprint delivery, and mentor a team of four engineers. The platform is built in Java and Python, integrates with PACS systems via DICOM, and runs on AWS. You will work closely with radiologists and product managers to translate clinical requirements into well-specified engineering tasks, and own the software quality processes required for our ISO 13485 certification. Candidates need strong Java and Python skills, experience with regulated software development (IEC 62304), and genuine interest in the clinical domain.','Singapore','FULL_TIME','LEAD',108000.00,148000.00,'OPEN','2026-04-22 09:00:00',NULL,'2026-05-17 11:06:28'),(42,11,5,'Data Science Lead ??? Clinical Analytics','Medica Group is seeking a Data Science Lead to build and manage our clinical analytics capability. You will own the roadmap for predictive models across oncology, cardiology, and radiology workflows, hire and develop a small team of data scientists, and partner with clinical leads to validate model outputs in real-world care settings. You will also represent data science in product planning and ensure models meet explainability requirements for regulatory submissions. This role is remote with quarterly on-site visits to Singapore and partner hospitals. You should have a PhD or equivalent research experience in a quantitative discipline, a strong publication record or industry portfolio in applied ML for healthcare, and proven team leadership experience.','Singapore (Remote)','REMOTE','LEAD',115000.00,150000.00,'OPEN','2026-03-14 10:00:00',NULL,'2026-05-17 11:06:28'),(43,11,5,'Healthcare IT Consultant','Medica Group is hiring a Healthcare IT Consultant on a 12-month contract to support hospital digital transformation engagements across Malaysia and Singapore. You will assess clients\' current IT landscape, develop implementation roadmaps for EMR and clinical decision support deployments, facilitate stakeholder workshops, and produce detailed gap analyses and solution design documents. You will work alongside clinicians, hospital IT teams, and third-party vendors to ensure deployments go live on schedule and meet clinical workflow requirements. Candidates should have prior healthcare IT consulting experience, familiarity with HL7 FHIR and/or IHE integration profiles, and strong facilitation and written communication skills.','Singapore','CONTRACT','SENIOR',85000.00,115000.00,'CLOSED','2026-02-24 09:00:00',NULL,'2026-05-17 11:06:28'),(44,11,5,'Clinical Informatics Intern','Medica Group\'s Clinical Informatics team is offering a 3-month internship for students in health informatics, biomedical engineering, or computer science. You will help map clinical workflows, support configuration of our clinical decision support rules engine, and assist with data quality assessments on de-identified patient datasets. You will attend weekly clinical team meetings and shadowing sessions at partner clinics. Basic SQL knowledge is required. Familiarity with Python or R for data exploration is a bonus. This is a great opportunity to see how software engineering and clinical practice intersect in a regulated healthcare environment.','Singapore','INTERNSHIP','ENTRY',18000.00,26000.00,'REMOVED','2026-05-07 09:00:00',NULL,'2026-05-17 11:06:28'),(45,12,9,'Junior Frontend Developer','ByteForge is looking for a Junior Frontend Developer to join our product team and help build beautiful, performant UI for our fintech SaaS products. You will work under the guidance of a senior frontend engineer, implementing React components from Figma designs, integrating REST APIs, writing unit tests, and addressing accessibility and cross-browser issues. We follow a design-system-first approach ??? you will contribute to and consume our shared component library from day one. This is an excellent role for a new or recent graduate who has a solid grounding in JavaScript and React, has built at least one non-trivial personal or university project, and is eager to grow quickly in a structured, feedback-rich environment.','Singapore','PART_TIME','ENTRY',28000.00,42000.00,'OPEN','2026-05-12 09:00:00',NULL,'2026-05-17 11:06:28'),(46,12,9,'Node.js Backend Developer','ByteForge is hiring a Node.js Backend Developer on a 6-month renewable contract to accelerate delivery of our payments orchestration API. You will build and document REST endpoints, integrate third-party payment gateways (Stripe, Adyen, PayNow), write integration tests, and ensure PCI-DSS compliance for all payment-data flows. You will work in a team of three developers using TypeScript, Express, Prisma, and PostgreSQL. Strong Node.js and SQL fundamentals are required. Experience with payment gateway integrations or PCI-DSS environments is a significant advantage. The contract is structured to convert to permanent for candidates who demonstrate technical depth and team-fit.','Singapore','CONTRACT','MID',60000.00,80000.00,'CLOSED','2026-03-28 09:00:00',NULL,'2026-05-17 11:06:28'),(47,12,9,'Technical Lead ??? Payments Platform','ByteForge is seeking a Technical Lead to own the architecture and delivery of our payments platform ??? the high-reliability transaction processing layer used by over 200 merchant clients. You will design for fault tolerance and idempotency, lead a squad of four engineers, review all major PRs, define the testing strategy, and liaise with compliance and security teams on PCI-DSS and MAS Payment Services Act requirements. You will also drive the evaluation and adoption of new payment rails (PayNow, cross-border real-time payments) as ByteForge expands to Malaysia and Indonesia. Strong candidates have hands-on experience building payment infrastructure in Java or Node.js and have operated systems processing at least SGD 1M in daily transaction volume.','Singapore','CONTRACT','LEAD',105000.00,145000.00,'OPEN','2026-04-08 09:00:00',NULL,'2026-05-17 11:06:28'),(48,12,9,'Remote DevOps Consultant','ByteForge is looking for an experienced Remote DevOps Consultant to help us achieve SOC 2 Type II compliance and strengthen our cloud security posture. You will audit our existing AWS infrastructure, identify gaps against SOC 2 Trust Service Criteria, implement controls (logging, secret management, network segmentation, patch management), and prepare evidence artefacts for our auditor. You will also set up a SIEM solution, define incident response playbooks, and run a tabletop exercise with the engineering team. This engagement is estimated at 4???6 months with a possible extension into ongoing advisory work. Candidates should have deep AWS security knowledge, hands-on Terraform, and prior experience leading SOC 2 or ISO 27001 implementations.','Singapore (Remote)','REMOTE','SENIOR',92000.00,125000.00,'OPEN','2026-04-28 10:00:00',NULL,'2026-05-17 11:06:28');
/*!40000 ALTER TABLE `job` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_skill`
--

DROP TABLE IF EXISTS `job_skill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_skill` (
  `job_id` bigint NOT NULL,
  `skill_id` bigint NOT NULL,
  PRIMARY KEY (`job_id`,`skill_id`),
  KEY `fk_job_skill_skill` (`skill_id`),
  CONSTRAINT `fk_job_skill_job` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_job_skill_skill` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_skill`
--

LOCK TABLES `job_skill` WRITE;
/*!40000 ALTER TABLE `job_skill` DISABLE KEYS */;
INSERT INTO `job_skill` VALUES (2,1),(3,1),(13,1),(45,1),(46,1),(2,2),(13,2),(45,2),(1,3),(3,3),(5,3),(6,3),(8,3),(9,3),(10,3),(12,3),(15,3),(18,3),(21,3),(23,3),(24,3),(25,3),(27,3),(33,3),(37,3),(41,3),(42,3),(43,3),(44,3),(1,4),(4,4),(12,4),(27,4),(41,4),(43,4),(47,4),(1,5),(5,5),(6,5),(9,5),(10,5),(11,5),(12,5),(15,5),(17,5),(18,5),(21,5),(22,5),(23,5),(24,5),(27,5),(29,5),(33,5),(34,5),(35,5),(36,5),(37,5),(38,5),(39,5),(40,5),(41,5),(42,5),(43,5),(44,5),(46,5),(47,5),(2,6),(13,6),(45,6),(2,7),(46,7),(47,7),(26,9),(48,9),(1,10),(4,10),(5,10),(7,10),(8,10),(25,10),(26,10),(27,10),(28,10),(47,10),(48,10),(4,11),(7,11),(25,11),(26,11),(28,11),(48,11),(4,12),(7,12),(25,12),(26,12),(28,12),(48,12),(10,13),(24,13),(42,13),(9,14),(11,14),(18,14),(21,14),(22,14),(29,14),(38,14),(42,14),(14,15),(8,16),(11,16),(14,16),(15,16),(20,16),(34,16),(40,16),(16,17),(17,17),(19,17),(20,17),(29,17),(30,17),(31,17),(32,17),(19,18),(20,18),(32,18),(6,19),(35,19),(37,19),(38,19),(39,19),(40,19);
/*!40000 ALTER TABLE `job_skill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  `content` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_message_sender` (`sender_id`),
  KEY `idx_message_conv_id` (`conversation_id`),
  CONSTRAINT `fk_message_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_message_sender` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `type` varchar(50) NOT NULL,
  `payload` json DEFAULT NULL,
  `read_flag` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notification_user_id` (`user_id`),
  KEY `idx_notification_read_flag` (`read_flag`),
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `author_id` bigint NOT NULL,
  `content` text NOT NULL,
  `media_url` varchar(500) DEFAULT NULL,
  `like_count` int DEFAULT '0',
  `comment_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_author_id` (`author_id`),
  CONSTRAINT `fk_post_author` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_comment`
--

DROP TABLE IF EXISTS `post_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_comment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `post_id` bigint NOT NULL,
  `author_id` bigint NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_post_comment_post` (`post_id`),
  KEY `fk_post_comment_author` (`author_id`),
  CONSTRAINT `fk_post_comment_author` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_post_comment_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_comment`
--

LOCK TABLES `post_comment` WRITE;
/*!40000 ALTER TABLE `post_comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_like`
--

DROP TABLE IF EXISTS `post_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_like` (
  `user_id` bigint NOT NULL,
  `post_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`post_id`),
  KEY `fk_post_like_post` (`post_id`),
  CONSTRAINT `fk_post_like_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_like_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_like`
--

LOCK TABLES `post_like` WRITE;
/*!40000 ALTER TABLE `post_like` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_job`
--

DROP TABLE IF EXISTS `saved_job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_job` (
  `user_id` bigint NOT NULL,
  `job_id` bigint NOT NULL,
  `saved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`job_id`),
  KEY `fk_saved_job_job` (`job_id`),
  CONSTRAINT `fk_saved_job_job` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_saved_job_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_job`
--

LOCK TABLES `saved_job` WRITE;
/*!40000 ALTER TABLE `saved_job` DISABLE KEYS */;
INSERT INTO `saved_job` VALUES (11,4,'2026-05-01 10:00:00'),(11,24,'2026-05-03 14:00:00'),(11,29,'2026-05-10 09:00:00'),(11,34,'2026-05-12 11:00:00'),(11,48,'2026-05-15 08:30:00'),(12,7,'2026-05-08 10:00:00'),(12,27,'2026-05-10 13:00:00'),(13,29,'2026-05-05 09:00:00'),(13,30,'2026-05-11 14:00:00'),(14,24,'2026-05-06 10:30:00'),(15,8,'2026-05-07 09:15:00'),(16,10,'2026-05-09 11:00:00'),(16,43,'2026-05-13 13:00:00'),(17,27,'2026-05-08 08:45:00'),(18,27,'2026-05-09 10:00:00'),(19,20,'2026-05-04 14:00:00'),(20,34,'2026-05-10 09:30:00'),(21,8,'2026-05-11 13:45:00'),(22,29,'2026-05-12 10:00:00'),(23,38,'2026-05-07 11:00:00'),(24,43,'2026-05-14 09:00:00'),(25,27,'2026-05-13 10:30:00'),(27,4,'2026-05-09 08:00:00'),(28,48,'2026-05-15 11:00:00'),(29,4,'2026-05-16 13:00:00');
/*!40000 ALTER TABLE `saved_job` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seeker_profile`
--

DROP TABLE IF EXISTS `seeker_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seeker_profile` (
  `user_id` bigint NOT NULL,
  `bio` text,
  `years_experience` int DEFAULT NULL,
  `education_summary` varchar(500) DEFAULT NULL,
  `resume_url` varchar(500) DEFAULT NULL,
  `open_to_work` tinyint(1) DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_seeker_profile_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seeker_profile`
--

LOCK TABLES `seeker_profile` WRITE;
/*!40000 ALTER TABLE `seeker_profile` DISABLE KEYS */;
INSERT INTO `seeker_profile` VALUES (11,'Experienced full-stack developer with 7 years building scalable web applications using React and Java Spring Boot. I have shipped products used by 500K+ users across fintech, SaaS, and e-commerce domains. Currently seeking a senior IC or lead role where I can drive technical architecture and mentor a growing team.',7,'B.Eng. Computer Science, National University of Singapore (NUS)',NULL,1,'2026-05-17 11:06:28'),(12,'Passionate software engineer with deep expertise in Java and distributed systems. I enjoy solving hard infrastructure problems and have led service migrations handling 10K+ requests per second. Mentoring junior engineers is something I genuinely invest in.',6,'B.Sc. Computer Science, National University of Singapore (NUS)',NULL,1,'2026-05-17 11:06:28'),(13,'Creative UI/UX designer who bridges aesthetics and usability. I specialise in mobile-first design and user research for fintech and healthcare products, running everything from guerrilla tests to multi-week discovery sprints.',4,'Diploma in Design, Limkokwing University of Creative Technology',NULL,0,'2026-05-17 11:06:28'),(14,'Data-driven analyst skilled in Python and SQL. I turn messy multi-source datasets into actionable insights for retail and e-commerce stakeholders, and I have a track record of building dashboards executives actually use.',3,'B.Sc. Statistics, University of Indonesia',NULL,0,'2026-05-17 11:06:28'),(15,'Product manager with a track record of shipping 0-to-1 products in health tech and B2B SaaS. I align cross-functional teams around user value and measurable outcomes, and I write PRDs that engineers and designers enjoy reading.',7,'MBA, Singapore Management University (SMU)',NULL,0,'2026-05-17 11:06:28'),(16,'DevOps engineer obsessed with reliability and automation. Experienced with Kubernetes, GitOps CI/CD pipelines, and cloud-native architectures on AWS. I treat operational toil as a bug and on-call incidents as design feedback.',5,'B.Eng. Computer Engineering, King Mongkut\'s University of Technology Thonburi (KMUTT)',NULL,1,'2026-05-17 11:06:28'),(17,'Backend developer who builds robust REST APIs and event-driven systems. Strong background in Java Spring Boot, Apache Kafka, and relational database optimisation. I have shipped services processing 5M+ events per day in a logistics environment.',4,'B.Sc. Information Technology, De La Salle University (DLSU) Manila',NULL,0,'2026-05-17 11:06:28'),(18,'Frontend developer who loves crafting pixel-perfect, accessible UIs. Proficient in React, TypeScript, and web performance optimisation ??? I pushed a React app from Lighthouse score 54 to 96 through code splitting and lazy loading.',3,'B.Sc. Computer Science, Nanyang Technological University (NTU)',NULL,1,'2026-05-17 11:06:28'),(19,'Marketing manager with 8 years of experience in brand strategy and digital campaigns. I have led multi-market campaigns across APAC for consumer and B2B brands, managing agencies, budgets up to SGD 2M, and cross-functional creative teams.',8,'B.A. Marketing, University of Malaya',NULL,0,'2026-05-17 11:06:28'),(20,'Business analyst who translates complex business requirements into clear technical specifications. Experienced in process modelling, stakeholder management, and Agile delivery across EdTech and logistics verticals in Indonesia.',5,'B.Sc. Management Information Systems, University of Indonesia',NULL,0,'2026-05-17 11:06:28'),(21,'HR specialist focused on talent acquisition, onboarding, and employee engagement. SHRM-CP certified with 4 years of full-cycle recruitment experience across Singapore and Malaysia, managing up to 30 open requisitions simultaneously.',4,'B.A. Human Resource Management, Nanyang Technological University (NTU)',NULL,0,'2026-05-17 11:06:28'),(22,'Content writer and strategist creating SEO-driven articles, product copy, and social media content for tech and lifestyle brands across Southeast Asia. I have grown organic traffic by 120% for two startups through content-led acquisition.',3,'B.A. Mass Communication, Thammasat University',NULL,0,'2026-05-17 11:06:28'),(23,'Financial analyst specialising in equity research and FP&A. Strong in financial modelling, DCF valuation, and executive-ready dashboard reporting using Python and Excel. I enjoy turning numbers into a narrative that drives decisions.',4,'B.Sc. Finance, De La Salle University (DLSU) Manila',NULL,0,'2026-05-17 11:06:28'),(24,'Data scientist applying machine learning to real-world healthcare and fintech problems. Proficient in Python, scikit-learn, and TensorFlow. I have built churn prediction and clinical risk models currently in production at two companies.',3,'M.Sc. Data Science, National University of Singapore (NUS)',NULL,1,'2026-05-17 11:06:28'),(25,'Mobile developer specialising in React Native cross-platform apps. I have shipped four consumer apps on the App Store and Google Play, with a combined 300K+ downloads. Strong in offline-first architecture and smooth animations.',4,'B.Sc. Computer Science, Universiti Malaya',NULL,1,'2026-05-17 11:06:28'),(26,'Software engineer with solid Java and Python backend skills. I have built and maintained services for high-traffic retail platforms and enjoy the craft of writing clean, testable, well-documented code that teams can maintain for years.',5,'B.Eng. Software Engineering, King Mongkut\'s Institute of Technology Ladkrabang',NULL,0,'2026-05-17 11:06:28'),(27,'Full-stack developer who owns features end-to-end ??? from database schema to deployed React UI. Experienced with Node.js microservices and REST API design. I thrive in fast-moving startups and care deeply about developer experience.',6,'B.Sc. Computer Science, De La Salle University (DLSU) Manila',NULL,0,'2026-05-17 11:06:28'),(28,'Software engineer with a focus on cloud-native Java microservices and Kubernetes deployments. I have contributed to platform migrations cutting infrastructure costs by 25%. I value clean architecture and comprehensive test coverage.',4,'B.Sc. Computer Engineering, Nanyang Technological University (NTU)',NULL,1,'2026-05-17 11:06:28'),(29,'Backend developer building high-throughput Java services with Docker and RESTful API design. Experienced with MySQL schema design and query optimisation for e-commerce and logistics workloads. Passionate about system reliability.',5,'B.Sc. Informatics Engineering, Universitas Gadjah Mada',NULL,0,'2026-05-17 11:06:28'),(30,'Full-stack developer with a TypeScript-first approach. I build React frontends and Node.js backends that are fast, tested, and easy to reason about. Currently exploring edge computing and real-time collaborative features.',3,'B.Sc. Computer Science, Nanyang Technological University (NTU)',NULL,1,'2026-05-17 11:06:28');
/*!40000 ALTER TABLE `seeker_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skill`
--

DROP TABLE IF EXISTS `skill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skill` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skill`
--

LOCK TABLES `skill` WRITE;
/*!40000 ALTER TABLE `skill` DISABLE KEYS */;
INSERT INTO `skill` VALUES (10,'AWS'),(14,'Data Analysis'),(9,'DevOps'),(11,'Docker'),(19,'Finance'),(20,'HR Management'),(4,'Java'),(1,'JavaScript'),(12,'Kubernetes'),(13,'Machine Learning'),(17,'Marketing'),(7,'Node.js'),(16,'Product Management'),(3,'Python'),(6,'React'),(18,'Sales'),(5,'SQL'),(2,'TypeScript'),(15,'UI/UX Design'),(8,'Vue.js');
/*!40000 ALTER TABLE `skill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('JOB_SEEKER','EMPLOYER','ADMIN') NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `headline` varchar(220) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `status` enum('ACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_email` (`email`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin@jobplus.com','$2b$10$McLdIAr4hK0anTWUgZ8LVOxx.1plLqm/ss7v9HaihwCO.xQuh1rMe','ADMIN','Admin','Platform Administrator',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(2,'mod@jobplus.com','$2b$10$McLdIAr4hK0anTWUgZ8LVOxx.1plLqm/ss7v9HaihwCO.xQuh1rMe','ADMIN','Moderator','Content Moderator',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(3,'recruiter@techcorp.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','EMPLOYER','Sarah Lim','Talent Acquisition Lead at TechCorp Singapore',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(4,'hr@finova.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','EMPLOYER','Wei Chen','HR Manager at Finova Financial',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(5,'talent@healthbridge.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','EMPLOYER','Priya Nair','Talent Partner at HealthBridge',NULL,'Kuala Lumpur','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(6,'jobs@edunest.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','EMPLOYER','Budi Santoso','People Operations at EduNest',NULL,'Jakarta','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(7,'hiring@retailplus.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','EMPLOYER','Nipa Charoenwong','Recruiting Manager at RetailPlus',NULL,'Bangkok','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(8,'people@greenlogix.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','EMPLOYER','Juan dela Cruz','People & Culture at GreenLogix',NULL,'Manila','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(9,'hr@cloudstack.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','EMPLOYER','Mei Lin Tan','HR Lead at CloudStack',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(10,'talent@mediawave.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','EMPLOYER','Rizki Pratama','Talent Manager at MediaWave',NULL,'Kuala Lumpur','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(11,'demo@jobplus.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Alex Morgan','Senior Full-Stack Developer | React & Java | Open to Work',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(12,'alice@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Alice Tan','Senior Software Engineer | Java & Distributed Systems',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(13,'bob@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Bob Rahman','UI/UX Designer | Mobile-First & Fintech Products',NULL,'Kuala Lumpur','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(14,'carol@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Carol Wijaya','Data Analyst | Python ?? SQL ?? Retail & E-Commerce',NULL,'Jakarta','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(15,'david@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','David Koh','Product Manager | 0-to-1 Products ?? Health Tech',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(16,'emma@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Emma Jaidee','DevOps Engineer | AWS ?? Kubernetes ?? CI/CD',NULL,'Bangkok','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(17,'frank@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Frank Santos','Backend Developer | Java Spring Boot ?? Kafka ?? Event-Driven',NULL,'Manila','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(18,'grace@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Grace Ng','Frontend Developer | React ?? TypeScript ?? Performance',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(19,'henry@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Henry Aziz','Marketing Manager | Brand Strategy ?? APAC Digital Campaigns',NULL,'Kuala Lumpur','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(20,'iris@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Iris Putri','Business Analyst | Agile ?? Process Modelling ?? SQL',NULL,'Jakarta','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(21,'james@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','James Tan','HR Specialist | SHRM-CP ?? Full-Cycle Recruitment',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(22,'kate@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Kate Somboon','Content Writer & Strategist | SEO ?? Tech & Lifestyle',NULL,'Bangkok','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(23,'leo@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Leo Reyes','Financial Analyst | Equity Research ?? FP&A ?? Python',NULL,'Manila','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(24,'nina@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Nina Sharma','Data Scientist | ML ?? Python ?? Healthcare Analytics',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(25,'omar@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Omar Kassim','Mobile Developer | React Native ?? iOS ?? Cross-Platform',NULL,'Kuala Lumpur','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(26,'petra@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Petra Boonnak','Software Engineer | Java ?? Python ?? Backend Systems',NULL,'Bangkok','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(27,'quinn@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Quinn Velasco','Full-Stack Developer | Node.js ?? React ?? API Design',NULL,'Manila','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(28,'rachel@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Rachel Yeo','Software Engineer | Java ?? Cloud ?? Microservices',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(29,'sam@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Sam Wiranto','Backend Developer | Java ?? Docker ?? RESTful APIs',NULL,'Jakarta','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(30,'tara@example.com','$2b$10$F37j2konia.irgT4/YxA6.dV286iv2al85IwHB7Roxp.SdbP3Qs/u','JOB_SEEKER','Tara Nakamura','Full-Stack Developer | TypeScript ?? React ?? Node.js',NULL,'Singapore','ACTIVE','2026-05-17 11:06:28','2026-05-17 11:06:28'),(31,'fewvewgh@gmail.com','$2a$10$uoNF/swKYnZ80JBtnmA9jezdrSOINprywFXOOtdMisbImee3r3nGq','JOB_SEEKER','t43t5t5h54h',NULL,NULL,NULL,'ACTIVE','2026-05-17 12:42:33','2026-05-17 12:42:33'),(32,'hvbdwchjvechj@gmail.com','$2a$10$ydc72tvXLNz6C1YJzSMOQ.j1ltvOqp7faXAqPjmYpy..IUpXF7hX.','JOB_SEEKER',',mjvgkhjvjk',NULL,NULL,NULL,'ACTIVE','2026-05-17 12:48:42','2026-05-17 12:48:42');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_skill`
--

DROP TABLE IF EXISTS `user_skill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_skill` (
  `user_id` bigint NOT NULL,
  `skill_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`skill_id`),
  KEY `fk_user_skill_skill` (`skill_id`),
  CONSTRAINT `fk_user_skill_skill` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_skill_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_skill`
--

LOCK TABLES `user_skill` WRITE;
/*!40000 ALTER TABLE `user_skill` DISABLE KEYS */;
INSERT INTO `user_skill` VALUES (11,1),(13,1),(18,1),(25,1),(27,1),(30,1),(11,2),(18,2),(25,2),(27,2),(30,2),(12,3),(14,3),(15,3),(17,3),(23,3),(24,3),(26,3),(28,3),(29,3),(11,4),(12,4),(17,4),(26,4),(27,4),(28,4),(29,4),(11,5),(12,5),(14,5),(15,5),(17,5),(20,5),(21,5),(23,5),(24,5),(26,5),(28,5),(29,5),(30,5),(11,6),(13,6),(18,6),(25,6),(27,6),(30,6),(27,7),(30,7),(16,9),(11,10),(16,10),(12,11),(16,11),(17,11),(28,11),(29,11),(16,12),(24,13),(14,14),(20,14),(24,14),(13,15),(15,16),(20,16),(19,17),(22,17),(19,18),(22,18),(23,19),(21,20);
/*!40000 ALTER TABLE `user_skill` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-17 12:50:13
