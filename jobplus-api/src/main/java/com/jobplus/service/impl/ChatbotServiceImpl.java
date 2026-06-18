package com.jobplus.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobplus.dto.request.ChatMessageDTO;
import com.jobplus.dto.request.ChatTurnDTO;
import com.jobplus.dto.response.ChatReplyDTO;
import com.jobplus.dto.response.JobLinkDTO;
import com.jobplus.mapper.CompanyMapper;
import com.jobplus.mapper.JobMapper;
import com.jobplus.mapper.SeekerProfileMapper;
import com.jobplus.mapper.SkillMapper;
import com.jobplus.mapper.UserMapper;
import com.jobplus.model.Company;
import com.jobplus.model.CompanyFilterParams;
import com.jobplus.model.Job;
import com.jobplus.model.JobFilterParams;
import com.jobplus.model.User;
import com.jobplus.service.ChatbotService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ChatbotServiceImpl implements ChatbotService {

    private final UserMapper          userMapper;
    private final SeekerProfileMapper seekerProfileMapper;
    private final SkillMapper         skillMapper;
    private final JobMapper           jobMapper;
    private final CompanyMapper       companyMapper;

    @Value("${ai.provider:none}") private String aiProvider;
    @Value("${ai.api.key:}")      private String apiKey;
    @Value("${ai.model:gpt-3.5-turbo}") private String aiModel;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ChatbotServiceImpl(UserMapper userMapper,
                               SeekerProfileMapper seekerProfileMapper,
                               SkillMapper skillMapper,
                               JobMapper jobMapper,
                               CompanyMapper companyMapper) {
        this.userMapper          = userMapper;
        this.seekerProfileMapper = seekerProfileMapper;
        this.skillMapper         = skillMapper;
        this.jobMapper           = jobMapper;
        this.companyMapper       = companyMapper;
        this.restTemplate        = new RestTemplate();
        this.objectMapper        = new ObjectMapper();
    }

    // ── Entry point ───────────────────────────────────────────────────────────

    @Override
    public ChatReplyDTO chat(ChatMessageDTO dto, Long userId) {
        log.info("Chatbot: provider={}, hasKey={}, userId={}", aiProvider, !apiKey.isBlank(), userId);
        String lang  = detectLanguage(dto.getMessage());
        String lower = normalize(dto.getMessage(), lang);

        log.info("Chatbot: detected lang={}, normalized={}", lang, lower.substring(0, Math.min(80, lower.length())));

        // 1. Job availability / search queries → always hit the DB for structured results
        if (isJobAvailabilityQuery(lower, lang)) {
            return buildJobAvailabilityReply(lower, userId, lang);
        }

        // 2. Company queries → answer with live company data
        if (isCompanyQuery(lower, lang)) {
            return buildCompanyReply(lang);
        }

        // 3. If an AI provider is configured, call it with a rich system prompt
        if (isAiAvailable()) {
            try {
                return callChatCompletion(dto, buildSystemPrompt(userId, lang), apiUrl());
            } catch (Exception e) {
                log.warn("Chatbot: AI call failed, using smart fallback: {}", e.getMessage());
            }
        }

        // 4. Smart rule-based fallback (uses live DB data where relevant)
        return smartFallback(lower, userId, lang);
    }

    // ── Language detection ────────────────────────────────────────────────────

    private String detectLanguage(String msg) {
        long arabicChars  = msg.chars().filter(c -> c >= 0x0600 && c <= 0x06FF).count();
        long chineseChars = msg.chars().filter(c ->
                (c >= 0x4E00 && c <= 0x9FFF) || (c >= 0x3400 && c <= 0x4DBF)).count();
        if (arabicChars > 0 && arabicChars >= chineseChars) return "ar";
        if (chineseChars > 0) return "zh";
        return "en";
    }

    // ── Normalisation ─────────────────────────────────────────────────────────

    private String normalize(String msg, String lang) {
        if (!"en".equals(lang)) return msg.trim();   // preserve Arabic / Chinese as-is
        return msg.toLowerCase()
                // job
                .replace("jop", "job").replace("joob", "job").replace("jbs", "jobs")
                // position / role
                .replace("postion", "position").replace("positon", "position").replace("postition", "position")
                // engineering
                .replace("engeineering", "engineering").replace("enginnering", "engineering")
                .replace("enginering", "engineering").replace("enginneering", "engineering")
                // software
                .replace("sofware", "software").replace("saftware", "software")
                // developer
                .replace("devloper", "developer").replace("develper", "developer").replace("develope", "developer")
                // available
                .replace("availble", "available").replace("availalbe", "available").replace("availabel", "available")
                // resume / interview / salary
                .replace("resme", "resume").replace("reume", "resume").replace("reusme", "resume")
                .replace("interivew", "interview").replace("intervew", "interview")
                .replace("salery", "salary").replace("slary", "salary")
                // company
                .replace("compny", "company").replace("comapny", "company")
                // miscellaneous
                .replace("reqiurements", "requirements").replace("requirments", "requirements")
                .replace("skillset", "skills").replace("experiance", "experience");
    }

    // ── Intent detection ──────────────────────────────────────────────────────

    private boolean isJobAvailabilityQuery(String lower, String lang) {
        if ("ar".equals(lang)) {
            return lower.contains("وظيف") || lower.contains("وظائف") || lower.contains("فرصة عمل")
                || lower.contains("عمل") || lower.contains("توظيف") || lower.contains("مسمى وظيفي")
                || lower.contains("وظائف متاحة") || lower.contains("ابحث عن عمل")
                || lower.contains("هل يوجد") || lower.contains("هل هناك")
                || lower.contains("مطلوب") || lower.contains("شاغر") || lower.contains("تعيين");
        }
        if ("zh".equals(lang)) {
            return lower.contains("工作") || lower.contains("职位") || lower.contains("招聘")
                || lower.contains("求职") || lower.contains("岗位") || lower.contains("职缺")
                || lower.contains("找工作") || lower.contains("有没有") || lower.contains("是否有")
                || lower.contains("职务") || lower.contains("空缺") || lower.contains("就业");
        }
        // English patterns
        if (lower.matches(".*(is|are).*(job|position|role|opening|vacancy).*(available|open|listed|posted|there|on jobplus).*")) return true;
        if (lower.matches(".*(available|open|listed|posted).*(job|position|role|opening|vacancy).*")) return true;
        if (lower.matches(".*(is there|are there|any|do you have|show me|find me|find|available|list|what jobs|search for|looking for|want a).*(job|position|role|opening|vacancy|work|hiring).*")) return true;
        if (lower.matches(".*(job|position|role|opening|vacancy|hiring).*(available|open|exist|listed|posted|on jobplus).*")) return true;
        if (lower.matches(".*\\b(show|find|list|search|browse).*(job|position|role).*")) return true;
        if (lower.matches(".*(what|which|how many).*(job|position|role|opening|vacancy).*")) return true;
        if (lower.matches(".*(software|frontend|backend|fullstack|data|devops|product|design|marketing|sales|finance|java|python|react|mobile|ios|android|qa|cloud|security).*(job|role|position|opening|vacancy).*")) return true;
        return false;
    }

    private boolean isCompanyQuery(String lower, String lang) {
        if ("ar".equals(lang)) {
            return lower.contains("شركة") || lower.contains("شركات") || lower.contains("صاحب العمل")
                || lower.contains("أصحاب العمل") || lower.contains("مؤسسة") || lower.contains("منظمة");
        }
        if ("zh".equals(lang)) {
            return lower.contains("公司") || lower.contains("企业") || lower.contains("雇主")
                || lower.contains("机构") || lower.contains("单位");
        }
        return lower.matches(".*(what|which|list|show|tell me|how many).*(compan|employer|organization|firm).*")
            || lower.matches(".*(compan|employer|organization|firm).*(on jobplus|here|registered|listed|available|hiring).*")
            || lower.contains("partner companies") || lower.contains("hiring companies");
    }

    // ── Intent detection (rule-based) ─────────────────────────────────────────

    private Intent detectIntent(String lower, String lang) {
        if ("ar".equals(lang)) {
            if (lower.matches(".*(مرحبا|أهلا|السلام عليكم|صباح الخير|مساء الخير|هاي|هلو).*")) return Intent.GREETING;
            if (lower.contains("السيرة الذاتية") || lower.contains("ريزومي") || lower.contains("cv") || lower.contains("سيرة ذاتية")) return Intent.RESUME;
            if (lower.contains("مقابلة") || lower.contains("إنترفيو") || lower.contains("تحضير للمقابلة")) return Intent.INTERVIEW;
            if (lower.contains("راتب") || lower.contains("أجر") || lower.contains("تفاوض") || lower.contains("مرتب")) return Intent.SALARY;
            if (lower.contains("تواصل") || lower.contains("لينكدإن") || lower.contains("شبكة علاقات")) return Intent.NETWORKING;
            if (lower.contains("مهارة") || lower.contains("مهارات") || lower.contains("تطوير") || lower.contains("تعلم") || lower.contains("دورة")) return Intent.SKILLS;
            if (lower.contains("تقدمت") || lower.contains("طلب توظيف") || lower.contains("متابعة") || lower.contains("انتظار رد")) return Intent.APPLICATION;
            if (lower.contains("خطاب تغطية") || lower.contains("رسالة تعريفية")) return Intent.COVER_LETTER;
            return Intent.OTHER;
        }
        if ("zh".equals(lang)) {
            if (lower.matches(".*(你好|您好|嗨|早上好|下午好|晚上好|hi|hello).*")) return Intent.GREETING;
            if (lower.contains("简历") || lower.contains("履历") || lower.contains("cv")) return Intent.RESUME;
            if (lower.contains("面试") || lower.contains("面经") || lower.contains("准备面试")) return Intent.INTERVIEW;
            if (lower.contains("薪资") || lower.contains("工资") || lower.contains("谈薪") || lower.contains("薪水")) return Intent.SALARY;
            if (lower.contains("人脉") || lower.contains("领英") || lower.contains("社交")) return Intent.NETWORKING;
            if (lower.contains("技能") || lower.contains("学习") || lower.contains("课程") || lower.contains("提升")) return Intent.SKILLS;
            if (lower.contains("投了简历") || lower.contains("申请") || lower.contains("等待回复") || lower.contains("跟进")) return Intent.APPLICATION;
            if (lower.contains("求职信") || lower.contains("自荐信")) return Intent.COVER_LETTER;
            return Intent.OTHER;
        }
        // English
        if (lower.matches(".*(\\bhello\\b|\\bhi\\b|\\bhey\\b|good morning|good afternoon|good evening|howdy|greetings|what.s up|whats up|start|begin).*"))
            return Intent.GREETING;
        if (lower.contains("cover letter") || lower.contains("covering letter"))
            return Intent.COVER_LETTER;
        if (lower.matches(".*(\\bresume\\b|\\bcv\\b|curriculum vitae|my resume|update.*resume|resume.*tips).*"))
            return Intent.RESUME;
        if (lower.matches(".*(interview|behavioral|behaviour|technical interview|whiteboard|prep for|preparing for|mock interview).*"))
            return Intent.INTERVIEW;
        if (lower.matches(".*(salary|\\bpay\\b|compensation|negotiat|\\bwage\\b|\\boffer\\b|\\bctc\\b|package|raise|increment|earn).*"))
            return Intent.SALARY;
        if (lower.matches(".*(network|linkedin|referral|\\bmentor\\b|informational|connect with|people in).*"))
            return Intent.NETWORKING;
        if (lower.matches(".*(\\bskill|upskill|course|certification|certif|training|learn|study|bootcamp|improve).*"))
            return Intent.SKILLS;
        if (lower.matches(".*(applied|application|heard back|follow.?up|ghosted|no response|rejection|recruiter|ats|applicant tracking|waiting).*"))
            return Intent.APPLICATION;
        if (lower.matches(".*(\\bjob\\b|\\bjobs\\b|\\bwork\\b|\\bhiring\\b|employment|position|career|opening|vacancy|find.*work|job search|job hunt|get hired|hired).*"))
            return Intent.JOB_SEARCH;
        return Intent.OTHER;
    }

    // ── Company reply ─────────────────────────────────────────────────────────

    private ChatReplyDTO buildCompanyReply(String lang) {
        try {
            List<Company> companies = companyMapper.findAll(
                    CompanyFilterParams.builder().page(0).pageSize(200).offset(0).build());
            if (companies.isEmpty()) {
                return ChatReplyDTO.builder()
                        .reply(t(lang,
                            "No companies are listed on JobPlus yet, but new employers join regularly!\n\nWould you like tips on finding companies in your target industry?",
                            "لا توجد شركات مسجلة في JobPlus حتى الآن، لكن أصحاب عمل جدد ينضمون باستمرار!\n\nهل تريد نصائح للعثور على شركات في مجالك؟",
                            "JobPlus上目前还没有注册公司，但新雇主会定期加入！\n\n需要我帮你查找目标行业的公司吗？"))
                        .build();
            }
            String header = t(lang,
                "There are **" + companies.size() + " companies** currently active on JobPlus. Here's a sample:\n\n",
                "يوجد حالياً **" + companies.size() + " شركة** نشطة على JobPlus. إليك بعضها:\n\n",
                "JobPlus上目前有 **" + companies.size() + " 家公司** 在招聘，以下是部分列表：\n\n");
            StringBuilder sb = new StringBuilder(header);
            int max = Math.min(10, companies.size());
            for (int i = 0; i < max; i++) {
                sb.append("• ").append(companies.get(i).getName());
                if (companies.get(i).getIndustry() != null) sb.append(" (").append(companies.get(i).getIndustry()).append(")");
                sb.append("\n");
            }
            if (companies.size() > 10) sb.append(t(lang,
                "…and " + (companies.size() - 10) + " more.\n",
                "…و " + (companies.size() - 10) + " أخرى.\n",
                "…以及另外 " + (companies.size() - 10) + " 家。\n"));
            sb.append("\n").append(t(lang,
                "Would you like me to find open jobs at a specific company or industry?",
                "هل تريد البحث عن وظائف في شركة معينة أو قطاع معين؟",
                "需要我帮你查找特定公司或行业的职位吗？"));
            return ChatReplyDTO.builder().reply(sb.toString()).build();
        } catch (Exception e) {
            log.warn("Chatbot: company reply failed: {}", e.getMessage());
            return ChatReplyDTO.builder()
                    .reply(t(lang,
                        "I couldn't fetch the company list right now. Try browsing the Companies section, or ask me about specific job roles!",
                        "لم أتمكن من جلب قائمة الشركات الآن. حاول تصفح قسم الشركات أو اسألني عن وظائف محددة!",
                        "暂时无法获取公司列表。请浏览公司版块，或者告诉我你想找什么职位！"))
                    .build();
        }
    }

    // ── Job availability reply (always uses live DB) ──────────────────────────

    private ChatReplyDTO buildJobAvailabilityReply(String lower, Long userId, String lang) {
        try {
            String keyword = extractJobKeyword(lower, lang);

            List<Company> companies = companyMapper.findAll(
                    CompanyFilterParams.builder().page(0).pageSize(200).offset(0).build());
            Map<Long, String> companyNames = new HashMap<>();
            for (Company c : companies) companyNames.put(c.getId(), c.getName());

            List<Job> jobs = jobMapper.findWithFilters(
                    JobFilterParams.builder().keyword(keyword).page(0).size(8).offset(0).build());

            if (jobs.isEmpty() && keyword != null) {
                List<Job> allJobs = jobMapper.findWithFilters(
                        JobFilterParams.builder().page(0).size(8).offset(0).build());
                if (allJobs.isEmpty()) {
                    return ChatReplyDTO.builder()
                            .reply(t(lang,
                                "I couldn't find any open **" + keyword + "** positions on JobPlus right now. New roles are posted regularly!\n\n• Want to polish your resume for " + keyword + " applications?\n• I can help you set up job alerts.",
                                "لم أجد أي وظائف **" + keyword + "** مفتوحة على JobPlus الآن. يتم نشر وظائف جديدة بانتظام!\n\n• هل تريد تحسين سيرتك الذاتية لوظائف " + keyword + "؟\n• يمكنني مساعدتك في إعداد تنبيهات الوظائف.",
                                "目前JobPlus上没有找到 **" + keyword + "** 相关职位。新职位会定期发布！\n\n• 想优化你的简历以申请 " + keyword + " 职位吗？\n• 我可以帮你设置职位提醒。"))
                            .build();
                }
                return ChatReplyDTO.builder()
                        .reply(t(lang,
                            "No exact match for **" + keyword + "** right now, but here are all open positions on JobPlus — tap any to view and apply:",
                            "لا توجد نتائج مطابقة تماماً لـ **" + keyword + "** الآن، لكن إليك جميع الوظائف المفتوحة على JobPlus — اضغط على أي منها للتفاصيل والتقديم:",
                            "目前没有完全匹配 **" + keyword + "** 的职位，以下是JobPlus上所有开放职位，点击查看详情并申请："))
                        .jobs(buildJobLinks(allJobs, companyNames))
                        .build();
            }

            if (jobs.isEmpty()) {
                return ChatReplyDTO.builder()
                        .reply(t(lang,
                            "There are no open listings on JobPlus at the moment, but new roles are added every week!\n\nWhile you wait:\n• Let me review your resume so you're application-ready\n• I can prep you for interviews\n\nWhat would you like to work on?",
                            "لا توجد وظائف مفتوحة على JobPlus في الوقت الحالي، لكن وظائف جديدة تُضاف كل أسبوع!\n\nفي الوقت الحالي:\n• يمكنني مراجعة سيرتك الذاتية\n• يمكنني إعدادك للمقابلات\n\nماذا تريد أن نعمل عليه؟",
                            "目前JobPlus上没有开放职位，但每周都会新增职位！\n\n在等待期间：\n• 我可以帮你优化简历\n• 我可以帮你准备面试\n\n你想从哪里开始？"))
                        .build();
            }

            String userHint = buildUserHint(userId, lang);
            String intro = keyword != null
                    ? t(lang,
                        "✅ Found **" + jobs.size() + "** open **" + keyword + "** position" + (jobs.size() > 1 ? "s" : "") + " on JobPlus." + userHint + " Tap any to view and apply:",
                        "✅ وجدت **" + jobs.size() + "** وظيفة **" + keyword + "** مفتوحة على JobPlus." + userHint + " اضغط على أي منها للتفاصيل والتقديم:",
                        "✅ 在JobPlus上找到 **" + jobs.size() + "** 个 **" + keyword + "** 职位。" + userHint + " 点击查看详情并申请：")
                    : t(lang,
                        "Here are the open positions on JobPlus right now. Tap any to view full details and apply:",
                        "إليك الوظائف المفتوحة على JobPlus الآن. اضغط على أي منها لعرض التفاصيل والتقديم:",
                        "以下是JobPlus上当前的开放职位，点击查看详情并申请：");

            return ChatReplyDTO.builder()
                    .reply(intro)
                    .jobs(buildJobLinks(jobs, companyNames))
                    .build();

        } catch (Exception e) {
            log.warn("Chatbot: job availability reply failed: {}", e.getMessage());
            return ChatReplyDTO.builder().reply(Intent.JOB_SEARCH.en[0]).build();
        }
    }

    private String buildUserHint(Long userId, String lang) {
        if (userId == null) return "";
        try {
            User user = userMapper.findById(userId);
            if (user != null && user.getHeadline() != null) {
                return t(lang,
                    " Based on your profile as **" + user.getHeadline() + "**, these look like a great fit.",
                    " بناءً على ملفك الشخصي كـ **" + user.getHeadline() + "**، هذه الوظائف تبدو مناسبة لك.",
                    " 根据你的 **" + user.getHeadline() + "** 背景，这些职位非常适合你。");
            }
        } catch (Exception ignored) {}
        return "";
    }

    // ── Smart rule-based fallback ─────────────────────────────────────────────

    private ChatReplyDTO smartFallback(String lower, Long userId, String lang) {
        Intent intent = detectIntent(lower, lang);
        int variant   = Math.abs(lower.hashCode()) % 3;

        if (intent == Intent.JOB_SEARCH) {
            return buildJobAvailabilityReply(lower, userId, lang);
        }

        if (intent == Intent.GREETING && userId != null) {
            try {
                User user = userMapper.findById(userId);
                if (user != null) {
                    String name = user.getName().split(" ")[0];
                    return ChatReplyDTO.builder()
                            .reply(t(lang,
                                "Hi " + name + "! 👋 I'm **JobPlus AI**, your personal career advisor.\n\nI can see you're logged in — I have access to live job listings and your profile.\n\nWhat can I help you with?\n• 🔍 Find matching jobs\n• 📄 Resume or cover letter help\n• 🎯 Interview prep\n• 💰 Salary negotiation",
                                "أهلاً " + name + "! 👋 أنا **JobPlus AI**، مستشارك المهني الشخصي.\n\nأرى أنك مسجل الدخول — لدي وصول إلى قوائم الوظائف الحية وملفك الشخصي.\n\nكيف يمكنني مساعدتك؟\n• 🔍 البحث عن وظائف مناسبة\n• 📄 مساعدة في السيرة الذاتية\n• 🎯 التحضير للمقابلات\n• 💰 التفاوض على الراتب",
                                name + "，你好！👋 我是 **JobPlus AI**，你的专属职业顾问。\n\n我可以看到你已登录，可以访问实时职位列表和你的档案。\n\n我能帮你做什么？\n• 🔍 查找匹配职位\n• 📄 简历或求职信优化\n• 🎯 面试准备\n• 💰 薪资谈判"))
                            .build();
                }
            } catch (Exception ignored) {}
        }

        String reply = switch (lang) {
            case "ar" -> intent.ar[variant % intent.ar.length];
            case "zh" -> intent.zh[variant % intent.zh.length];
            default   -> intent.en[variant % intent.en.length];
        };
        return ChatReplyDTO.builder().reply(reply).build();
    }

    // ── System prompt (for AI mode) ───────────────────────────────────────────

    private String buildSystemPrompt(Long userId, String lang) {
        String langInstruction = switch (lang) {
            case "ar" -> "IMPORTANT: The user is writing in Arabic. You MUST respond entirely in Arabic (Modern Standard Arabic or Gulf dialect as appropriate).";
            case "zh" -> "IMPORTANT: The user is writing in Chinese. You MUST respond entirely in Simplified Chinese (简体中文).";
            default   -> "Respond in English.";
        };

        StringBuilder sb = new StringBuilder();
        sb.append("You are JobPlus AI, an expert career advisor embedded in the JobPlus job platform. ")
          .append("Today's date is ").append(LocalDate.now()).append(".\n\n")
          .append(langInstruction).append("\n\n")
          .append("Your capabilities:\n")
          .append("- Help users find jobs on JobPlus using the LIVE JOB DATA below\n")
          .append("- Give expert advice on resumes, cover letters, interview prep, salary negotiation, and networking\n")
          .append("- Personalise advice based on the user's profile and the real available roles\n\n")
          .append("Rules:\n")
          .append("- Be concise: max 3 short paragraphs unless the user asks for detail\n")
          .append("- Always end with ONE specific follow-up question to keep the conversation going\n")
          .append("- When a job in the database matches what the user asks for, mention it by name and company\n")
          .append("- NEVER make up job listings — only refer to the data below\n")
          .append("- Speak in a friendly, direct, expert tone — like a senior recruiter who genuinely wants to help\n")
          .append("- Understand messages in English, Arabic, and Chinese — always reply in the user's language\n");

        if (userId != null) {
            try {
                User user = userMapper.findById(userId);
                if (user != null) {
                    sb.append("\nCURRENT USER:\n")
                      .append("- Name: ").append(user.getName()).append("\n")
                      .append("- Role: ").append(user.getRole().name()).append("\n");
                    if (user.getHeadline() != null) sb.append("- Headline: ").append(user.getHeadline()).append("\n");
                }
            } catch (Exception ignored) {}

            try {
                var skills = skillMapper.findByUserId(userId);
                if (skills != null && !skills.isEmpty()) {
                    sb.append("- Skills: ");
                    skills.forEach(s -> sb.append(s.getName()).append(", "));
                    sb.append("\n");
                }
            } catch (Exception ignored) {}
        }

        sb.append(buildJobContext());
        return sb.toString();
    }

    private String buildJobContext() {
        try {
            List<Company> companies = companyMapper.findAll(
                    CompanyFilterParams.builder().page(0).pageSize(200).offset(0).build());
            Map<Long, String> companyNames = new HashMap<>();
            for (Company c : companies) companyNames.put(c.getId(), c.getName());

            List<Job> jobs = jobMapper.findWithFilters(
                    JobFilterParams.builder().page(0).size(50).offset(0).build());

            if (jobs.isEmpty()) return "\n\nLIVE JOBS: None currently listed on JobPlus.";

            StringBuilder sb = new StringBuilder("\n\nLIVE JOB LISTINGS ON JOBPLUS (").append(jobs.size()).append(" open roles):\n");
            for (Job job : jobs) {
                String company = companyNames.getOrDefault(job.getCompanyId(), "Unknown Company");
                sb.append("• [ID:").append(job.getId()).append("] ")
                  .append(job.getTitle()).append(" @ ").append(company);
                if (job.getLocation() != null) sb.append(" | ").append(job.getLocation());
                if (job.getEmploymentType() != null) sb.append(" | ").append(formatEmploymentType(job.getEmploymentType().name()));
                if (job.getSalaryMin() != null && job.getSalaryMax() != null) {
                    sb.append(" | $").append(job.getSalaryMin().intValue() / 1000)
                      .append("K–$").append(job.getSalaryMax().intValue() / 1000).append("K");
                }
                sb.append("\n");
            }
            sb.append("\nUse this data when the user asks about job availability. Do not invent listings.");
            return sb.toString();
        } catch (Exception e) {
            log.warn("Chatbot: failed to build job context: {}", e.getMessage());
            return "";
        }
    }

    // ── AI provider call ──────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private ChatReplyDTO callChatCompletion(ChatMessageDTO dto, String systemPrompt, String apiUrl) throws Exception {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        if (dto.getConversationHistory() != null) {
            for (ChatTurnDTO turn : dto.getConversationHistory()) {
                messages.add(Map.of("role", turn.getRole(), "content", turn.getContent()));
            }
        }
        messages.add(Map.of("role", "user", "content", dto.getMessage()));

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", aiModel);
        requestBody.put("messages", messages);
        requestBody.put("max_tokens", 800);
        requestBody.put("temperature", 0.7);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        Map<String, String> message = (Map<String, String>) choices.get(0).get("message");
        return ChatReplyDTO.builder().reply(message.get("content")).build();
    }

    private boolean isAiAvailable() {
        return !apiKey.isBlank()
            && ("openai".equalsIgnoreCase(aiProvider) || "groq".equalsIgnoreCase(aiProvider));
    }

    private String apiUrl() {
        return "groq".equalsIgnoreCase(aiProvider)
                ? "https://api.groq.com/openai/v1/chat/completions"
                : "https://api.openai.com/v1/chat/completions";
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Pick the string for the current language. */
    private String t(String lang, String en, String ar, String zh) {
        return switch (lang) {
            case "ar" -> ar;
            case "zh" -> zh;
            default   -> en;
        };
    }

    private List<JobLinkDTO> buildJobLinks(List<Job> jobs, Map<Long, String> companyNames) {
        List<JobLinkDTO> links = new ArrayList<>();
        for (Job job : jobs) {
            String company = companyNames.getOrDefault(job.getCompanyId(), "Unknown Company");
            String salaryRange = null;
            if (job.getSalaryMin() != null && job.getSalaryMax() != null) {
                salaryRange = "$" + job.getSalaryMin().intValue() / 1000
                            + "K–$" + job.getSalaryMax().intValue() / 1000 + "K";
            }
            links.add(JobLinkDTO.builder()
                    .id(job.getId())
                    .title(job.getTitle())
                    .company(company)
                    .location(job.getLocation())
                    .type(job.getEmploymentType() != null ? formatEmploymentType(job.getEmploymentType().name()) : null)
                    .salaryRange(salaryRange)
                    .build());
        }
        return links;
    }

    private String extractJobKeyword(String lower, String lang) {
        if ("ar".equals(lang)) {
            if (lower.contains("مطور واجهة") || lower.contains("فرونت إند") || lower.contains("front end")) return "frontend";
            if (lower.contains("مطور خلفية") || lower.contains("باك إند") || lower.contains("back end")) return "backend";
            if (lower.contains("مطور برامج") || lower.contains("مهندس برمجيات")) return "software engineer";
            if (lower.contains("علم البيانات") || lower.contains("بيانات")) return "data scientist";
            if (lower.contains("ذكاء اصطناعي") || lower.contains("تعلم آلة")) return "machine learning";
            if (lower.contains("تصميم") || lower.contains("مصمم")) return "ux designer";
            if (lower.contains("تسويق")) return "marketing";
            if (lower.contains("مبيعات")) return "sales";
            if (lower.contains("محاسب") || lower.contains("محاسبة")) return "accountant";
            if (lower.contains("موارد بشرية") || lower.contains("HR")) return "human resources";
            if (lower.contains("مدير مشروع")) return "project manager";
            if (lower.contains("جافا")) return "java developer";
            if (lower.contains("بايثون")) return "python developer";
            if (lower.contains("أمن سيبراني") || lower.contains("أمن المعلومات")) return "security engineer";
            return null;
        }
        if ("zh".equals(lang)) {
            if (lower.contains("前端") || lower.contains("前端开发")) return "frontend";
            if (lower.contains("后端") || lower.contains("后端开发")) return "backend";
            if (lower.contains("全栈") || lower.contains("全栈开发")) return "fullstack";
            if (lower.contains("软件工程师") || lower.contains("软件开发")) return "software engineer";
            if (lower.contains("数据科学") || lower.contains("数据分析")) return "data scientist";
            if (lower.contains("机器学习") || lower.contains("人工智能") || lower.contains("AI")) return "machine learning";
            if (lower.contains("产品经理") || lower.contains("PM")) return "product manager";
            if (lower.contains("ui") || lower.contains("设计师") || lower.contains("ux")) return "ux designer";
            if (lower.contains("市场营销") || lower.contains("营销")) return "marketing";
            if (lower.contains("销售")) return "sales";
            if (lower.contains("java") || lower.contains("Java")) return "java developer";
            if (lower.contains("python") || lower.contains("Python")) return "python developer";
            if (lower.contains("运维") || lower.contains("devops")) return "devops";
            if (lower.contains("安全") || lower.contains("网络安全")) return "security engineer";
            if (lower.contains("财务") || lower.contains("会计")) return "accountant";
            if (lower.contains("人力资源") || lower.contains("hr")) return "human resources";
            if (lower.contains("项目经理")) return "project manager";
            return null;
        }
        // English
        String[][] patterns = {
            {"software engineer",    "software engineering", "software dev"},
            {"software developer",   "software development"},
            {"frontend",             "front end", "front-end", "react developer", "vue developer", "angular developer"},
            {"backend",              "back end", "back-end", "server side"},
            {"fullstack",            "full stack", "full-stack"},
            {"devops",               "dev ops", "sre", "site reliability"},
            {"data scientist",       "data science"},
            {"data engineer",        "data engineering"},
            {"machine learning",     "ml engineer", "deep learning"},
            {"ai engineer",          "artificial intelligence"},
            {"product manager",      "product management", "pm role"},
            {"project manager",      "project management"},
            {"ux designer",          "ux design", "ui designer", "ui/ux", "ux/ui"},
            {"graphic designer",     "graphic design"},
            {"data analyst",         "data analysis"},
            {"business analyst",     "business analysis"},
            {"marketing",            "digital marketing", "marketing manager", "growth"},
            {"sales",                "account executive", "account manager", "business development"},
            {"customer service",     "customer support", "customer success"},
            {"human resources",      "hr manager", "recruiter", "talent acquisition"},
            {"finance",              "financial analyst", "financial"},
            {"accountant",           "accounting"},
            {"java developer",       "java engineer", "java"},
            {"python developer",     "python engineer", "python"},
            {"react developer",      "react"},
            {"node developer",       "nodejs", "node.js"},
            {"mobile developer",     "mobile development", "cross platform"},
            {"ios developer",        "ios", "swift developer"},
            {"android developer",    "android", "kotlin developer"},
            {"qa engineer",          "quality assurance", "tester", "test engineer"},
            {"cloud engineer",       "cloud architect", "aws engineer", "azure engineer", "gcp"},
            {"security engineer",    "cybersecurity", "infosec", "penetration tester"},
            {"database administrator", "dba", "database engineer"},
            {"network engineer",     "network administrator", "networking"},
            {"game developer",       "game development", "unity developer", "unreal"},
            {"blockchain developer", "blockchain", "web3", "smart contracts"},
            {"content writer",       "content creator", "copywriter", "technical writer"},
        };
        for (String[] group : patterns) {
            for (String pattern : group) {
                if (lower.contains(pattern)) return group[0];
            }
        }
        return null;
    }

    private String formatEmploymentType(String type) {
        return switch (type) {
            case "FULL_TIME"  -> "Full-time";
            case "PART_TIME"  -> "Part-time";
            case "CONTRACT"   -> "Contract";
            case "INTERNSHIP" -> "Internship";
            case "FREELANCE"  -> "Freelance";
            default           -> type;
        };
    }

    // ── Intent enum with trilingual replies ───────────────────────────────────

    private enum Intent {

        GREETING(
            new String[]{
                "Hi! 👋 I'm **JobPlus AI**, your personal career advisor.\n\nI have live access to all open job listings on this platform, plus expertise in resumes, interview prep, salary negotiation, and career strategy.\n\nWhat can I help you with?\n• 🔍 Search open jobs\n• 📄 Resume review\n• 🎯 Interview prep\n• 💰 Salary negotiation\n\nWhat's the biggest thing you're working on right now?",
                "Hello! Great to have you here. 🚀\n\nI can search **live job listings on JobPlus**, help with your resume, prep you for interviews, or talk through salary negotiation.\n\nAre you actively job hunting, preparing to start your search, or looking to level up your current role?",
                "Hey! I'm **JobPlus AI** — your career advisor with real-time access to this platform's job listings.\n\nYou can ask me things like:\n• *\"Are there any software engineering jobs?\"*\n• *\"Help me write a resume for a product manager role\"*\n• *\"How do I negotiate my salary?\"*\n\nWhat's on your mind?"
            },
            new String[]{
                "أهلاً! 👋 أنا **JobPlus AI**، مستشارك المهني الشخصي.\n\nلدي وصول مباشر لجميع الوظائف المفتوحة على المنصة، بالإضافة إلى خبرة في السير الذاتية، التحضير للمقابلات، التفاوض على الراتب، والاستراتيجية المهنية.\n\nكيف يمكنني مساعدتك؟\n• 🔍 البحث عن وظائف\n• 📄 مراجعة السيرة الذاتية\n• 🎯 التحضير للمقابلات\n• 💰 التفاوض على الراتب\n\nما الذي تعمل عليه الآن؟",
                "مرحباً! يسعدني وجودك هنا. 🚀\n\nيمكنني البحث في **قوائم الوظائف الحية على JobPlus**، مساعدتك في سيرتك الذاتية، التحضير للمقابلات، أو مناقشة التفاوض على الراتب.\n\nهل أنت في مرحلة البحث النشط عن عمل، أم تستعد لبدء البحث؟",
                "هلا! أنا **JobPlus AI** — مستشارك المهني مع وصول فوري لقوائم الوظائف.\n\nيمكنك أن تسألني:\n• *\"هل توجد وظائف هندسة برمجيات؟\"*\n• *\"ساعدني في كتابة سيرة ذاتية لمنصب مدير منتج\"*\n• *\"كيف أتفاوض على راتبي؟\"*\n\nماذا يدور في ذهنك؟"
            },
            new String[]{
                "你好！👋 我是 **JobPlus AI**，你的专属职业顾问。\n\n我可以实时访问平台上所有开放职位，并在简历、面试准备、薪资谈判和职业规划方面提供专业建议。\n\n我能帮你做什么？\n• 🔍 搜索职位\n• 📄 简历优化\n• 🎯 面试准备\n• 💰 薪资谈判\n\n你现在最想解决什么问题？",
                "你好！很高兴见到你。🚀\n\n我可以搜索 **JobPlus上的实时职位**，帮你优化简历，准备面试，或讨论薪资谈判策略。\n\n你是在积极找工作、准备开始找工作，还是想提升现有职位？",
                "嗨！我是 **JobPlus AI** — 你的职业顾问，可以实时查看平台职位。\n\n你可以问我：\n• *\"有没有软件工程师职位？\"*\n• *\"帮我写一份产品经理简历\"*\n• *\"怎么谈判薪资？\"*\n\n你想聊什么？"
            }
        ),

        JOB_SEARCH(
            new String[]{
                "Let me search the live JobPlus listings for you. 🔍\n\nThe most effective job search combines: (1) direct applications, (2) recruiter outreach on LinkedIn, and (3) referrals — which fill **60% of roles before they're even posted**.\n\nWhat type of role and industry are you targeting?",
                "I'm searching our live job database for you. 🔍\n\nPro tip: Build a target list of 20–30 companies you'd genuinely want to work for and track their openings directly.\n\nWhat's your target role?",
                "On it! 🔍 Let me check what's open on JobPlus.\n\nThe job boards only show **30–40% of actual openings**. The rest come through referrals and direct outreach. I can help with both.\n\nWhat role are you looking for?"
            },
            new String[]{
                "دعني أبحث في قوائم الوظائف الحية على JobPlus. 🔍\n\nأفضل استراتيجية للبحث تجمع: (1) التقديم المباشر، (2) التواصل مع المجنّدين على LinkedIn، و(3) التوصيات — التي تملأ **60% من الوظائف قبل نشرها**.\n\nما نوع الوظيفة والقطاع الذي تستهدفه؟",
                "أبحث في قاعدة بيانات الوظائف الحية. 🔍\n\nnصيحة احترافية: ابنِ قائمة بـ 20-30 شركة تريد العمل فيها وتابع وظائفها مباشرة.\n\nما هي وظيفتك المستهدفة؟",
                "بالتأكيد! 🔍 دعني أرى ما هو متاح على JobPlus.\n\nلوحات الوظائف تظهر فقط **30-40% من الوظائف الفعلية**. الباقي يأتي عبر التوصيات والتواصل المباشر.\n\nما الوظيفة التي تبحث عنها؟"
            },
            new String[]{
                "让我帮你搜索JobPlus上的实时职位。🔍\n\n最有效的求职策略包括：(1) 直接申请，(2) 通过LinkedIn联系招聘官，(3) 内推——内推能填补 **60%的职位，甚至在公开发布之前**。\n\n你目标的职位类型和行业是什么？",
                "我正在为你搜索实时职位数据库。🔍\n\n专业建议：列出20-30家你真正想工作的公司，直接关注他们的职位动态。\n\n你的目标职位是什么？",
                "好的！🔍 让我看看JobPlus上有什么开放职位。\n\n招聘网站只展示 **30-40%的实际职缺**，其余的通过内推和直接联系填补。我可以两方面都帮你。\n\n你在找什么职位？"
            }
        ),

        RESUME(
            new String[]{
                "Your resume has **6 seconds** of recruiter attention. Here's what wins:\n\n• Open with a 2-line summary: role title + years + top achievement\n• Every bullet = **Action verb + what you did + measurable result**\n  ✅ *\"Reduced API response time by 40%, improving retention 12%\"*\n  ❌ *\"Responsible for API performance\"*\n• Put your strongest signal in the **top third of page one**\n\nWhat industry and seniority level are you targeting?",
                "**ATS filters reject ~75% of resumes** before a human sees them. Beat it by:\n\n• Mirror the exact job title in your headline\n• Include keywords **verbatim** from the job description\n• Avoid tables, text boxes, and graphics\n• Most relevant experience on page one\n\nAre you getting interviews but not advancing, or are applications going silent?",
                "Resume structure that consistently gets interviews:\n\n1. **Summary** (2 lines — role, years, top win)\n2. **Core Skills** (8–10 keywords from job descriptions)\n3. **Experience** (impact bullets, not duty lists)\n4. **Education**\n\nHow many years of experience do you have?"
            },
            new String[]{
                "سيرتك الذاتية تحصل على **6 ثوانٍ** من انتباه المجند. إليك ما ينجح:\n\n• ابدأ بملخص من سطرين: المسمى الوظيفي + سنوات الخبرة + أبرز إنجاز\n• كل نقطة = **فعل قوي + ما فعلته + نتيجة قابلة للقياس**\n  ✅ *\"خفضت وقت استجابة API بنسبة 40%\"*\n  ❌ *\"مسؤول عن أداء API\"*\n• ضع أقوى نقاطك في **الثلث العلوي من الصفحة الأولى**\n\nما هو القطاع والمستوى الوظيفي الذي تستهدفه؟",
                "**أنظمة ATS تحجب ~75% من السير الذاتية** قبل أن يراها أي إنسان. تغلب عليها بـ:\n\n• طابق عنوان الوظيفة المطلوبة بالضبط في ملفك\n• أدرج الكلمات المفتاحية **حرفياً** من إعلان الوظيفة\n• تجنب الجداول والصور\n\nهل تحصل على مقابلات لكنك لا تتقدم، أم أن طلباتك لا تحظى بأي رد؟",
                "هيكل السيرة الذاتية الذي يحصد المقابلات:\n\n1. **الملخص** (سطران — الوظيفة، الخبرة، أبرز إنجاز)\n2. **المهارات الأساسية** (8-10 كلمات مفتاحية)\n3. **الخبرة** (نقاط إنجاز، لا قائمة مهام)\n4. **التعليم**\n\nكم سنة خبرة لديك؟"
            },
            new String[]{
                "你的简历只有 **6秒钟** 的招聘官注意力。以下是制胜要点：\n\n• 开头用两行总结：职位+年限+最大成就\n• 每个要点 = **动作动词 + 做了什么 + 可量化结果**\n  ✅ *\"将API响应时间降低40%，用户留存率提升12%\"*\n  ❌ *\"负责API性能\"*\n• 最强的内容放在**第一页的前三分之一**\n\n你目标的行业和职级是什么？",
                "**ATS系统会过滤掉约75%的简历**，人工都看不到。应对方法：\n\n• 在标题中精确匹配职位名称\n• **逐字**使用职位描述中的关键词\n• 避免使用表格、文本框和图片\n\n你现在是有面试机会但不能通过，还是投了简历完全没有回音？",
                "稳定拿到面试的简历结构：\n\n1. **摘要**（两行：职位、年限、最大成就）\n2. **核心技能**（8-10个关键词）\n3. **工作经验**（成果导向，非职责列表）\n4. **教育背景**\n\n你有多少年工作经验？"
            }
        ),

        COVER_LETTER(
            new String[]{
                "A great cover letter has **three paragraphs**:\n\n1. A specific insight about their business — proves you researched them\n2. Connect **one specific achievement** of yours to their exact problem\n3. State clearly why *this company*, not just this role\n\nKeep it under **280 words**. What company and role are you writing this for?",
                "Hook them in the first sentence:\n✅ *\"Your engineering blog post on distributed caching made me look deeper — and the Senior Engineer role is exactly where I want to apply what I've built.\"*\n\nSpecific always beats generic. What role and company?",
                "Cover letters matter most when something on your resume raises a question — a gap, a pivot, switching industries.\n\nThree things to include:\n• A genuine insight about their product or mission\n• Your most relevant achievement (with a number)\n• A clear reason why you're excited about *them specifically*\n\nIs there anything you want to contextualize?"
            },
            new String[]{
                "خطاب التغطية الممتاز يتكون من **ثلاثة فقرات**:\n\n1. رؤية محددة حول أعمالهم — تُثبت أنك بحثت عنهم\n2. ربط **إنجاز محدد** منك بمشكلتهم الفعلية\n3. توضيح لماذا *هذه الشركة تحديداً*\n\nاجعله أقل من **280 كلمة**. لأي شركة ووظيفة تكتب هذا؟",
                "اجذبهم في الجملة الأولى:\n✅ *\"مقالكم التقني عن التخزين المؤقت الموزع دفعني للبحث أكثر — ووظيفة المهندس الأول هي بالضبط حيث أريد تطبيق ما بنيته.\"*\n\nالتحديد يتفوق دائماً على العمومية. لأي وظيفة وشركة؟",
                "خطاب التغطية مهم بشكل خاص عندما يثير شيء في سيرتك سؤالاً — فجوة، تحول مسار، أو تغيير صناعة.\n\nثلاثة أشياء يجب تضمينها:\n• رؤية حقيقية حول منتجهم أو رسالتهم\n• إنجازك الأكثر صلة (مع رقم)\n• سبب واضح لحماسك تجاه *هذه الشركة تحديداً*\n\nهل هناك شيء تريد توضيحه؟"
            },
            new String[]{
                "出色的求职信有**三段话**：\n\n1. 对公司业务的具体洞察——证明你做了功课\n2. 将你的**一个具体成就**与他们的实际问题挂钩\n3. 清楚说明为什么是*这家公司*，不只是这个职位\n\n保持在**280字以内**。你在为哪家公司和职位写这封信？",
                "用第一句话吸引住他们：\n✅ *\"贵公司关于分布式缓存的技术博客让我深入研究——高级工程师职位正是我想发挥所学的地方。\"*\n\n具体永远胜过笼统。是什么职位和公司？",
                "当你的简历有疑问时，求职信最重要——比如空档期、转行或跨行业。\n\n三个必须包含的内容：\n• 对他们产品或使命的真诚见解\n• 你最相关的成就（带数字）\n• 你对*这家公司*具体感兴趣的原因\n\n有什么你想特别说明的吗？"
            }
        ),

        INTERVIEW(
            new String[]{
                "STAR (Situation, Task, Action, Result) is table stakes. Differentiate yourself by ending each answer with:\n\n*\"The lesson I took from that is X, and here's how I'd apply it in this role: Y.\"*\n\nFor *\"Tell me about a failure\"* — pick a real one, own it fully, show clear growth.\n\nIs this behavioral, technical, or a final round?",
                "Research **three things** before any interview:\n\n1. The company's last 3 blog posts or press releases\n2. The interviewer's LinkedIn — find a genuine connection point\n3. Glassdoor reviews from the last 6 months\n\nWhat's the role and company? I'll give targeted prep advice.",
                "Prepare **exactly 5 questions** to ask at the end:\n\n• *\"What does success look like in the first 90 days?\"*\n• *\"What's the biggest challenge the team is navigating?\"*\n• *\"How does the team make decisions?\"*\n\nStrong questions matter as much as strong answers. What stage — phone screen, first round, or final?"
            },
            new String[]{
                "STAR (الموقف، المهمة، الإجراء، النتيجة) هو الحد الأدنى. ميّز نفسك بإنهاء كل إجابة بـ:\n\n*\"الدرس الذي تعلمته هو X، وإليك كيف سأطبقه في هذا الدور: Y.\"*\n\nهل هذه مقابلة سلوكية أم تقنية أم جولة نهائية؟",
                "ابحث عن **ثلاثة أشياء** قبل أي مقابلة:\n\n1. آخر 3 مقالات أو إعلانات صحفية للشركة\n2. LinkedIn المحاور — ابحث عن نقطة تواصل حقيقية\n3. تقييمات Glassdoor من آخر 6 أشهر\n\nما هي الوظيفة والشركة؟",
                "حضّر **5 أسئلة بالضبط** تطرحها في النهاية:\n\n• *\"ما الذي يبدو عليه النجاح في أول 90 يوماً؟\"*\n• *\"ما هو أكبر تحدٍّ تواجهه الفرقة حالياً؟\"*\n• *\"كيف تتخذ الفرقة قراراتها؟\"*\n\nالأسئلة القوية مهمة مثل الإجابات القوية. ما المرحلة التي أنت فيها؟"
            },
            new String[]{
                "STAR法（情境、任务、行动、结果）是基本要求。通过在每个回答结尾加这句话来脱颖而出：\n\n*\"我从中学到的是X，以下是我将如何在这个职位上应用它：Y。\"*\n\n这是行为面试、技术面试还是最终轮？",
                "面试前研究**三件事**：\n\n1. 公司最近3篇博客文章或新闻\n2. 面试官的LinkedIn——找到真实的联结点\n3. 过去6个月的Glassdoor评论\n\n职位和公司是什么？我来给你有针对性的建议。",
                "准备**恰好5个问题**在最后提问：\n\n• *\"前90天的成功标准是什么？\"*\n• *\"团队目前面临的最大挑战是什么？\"*\n• *\"团队如何做决策？\"*\n\n好问题和好回答同样重要。你现在是哪个阶段？"
            }
        ),

        SALARY(
            new String[]{
                "**Never give a number first.** When asked for expectations:\n\n*\"I'd like to understand the full scope of the role before discussing numbers — can you share the budgeted range?\"*\n\nIf they push: give a range where your **target is near the bottom third**.\n\nWhat role and city are you negotiating for?",
                "**Negotiation rule: whoever speaks first loses leverage.**\n\n*\"I appreciate the offer. Based on my research, I was expecting closer to [X]. Is there flexibility?\"*\n\nThen go **silent**. Most offers have 10–20% room.\n\nDo you have a competing offer?",
                "Base salary is only part of the picture. If they won't move on salary, negotiate:\n\n• **Signing bonus** — one-time cost, lower visibility\n• **Extra PTO** or remote days\n• **Earlier performance review**\n• **Equity** or stock options\n\nWhat benefits matter most beyond base salary?"
            },
            new String[]{
                "**لا تعطِ رقماً أولاً أبداً.** عند سؤالك عن توقعاتك:\n\n*\"أود فهم النطاق الكامل للدور قبل مناقشة الأرقام — هل يمكنك مشاركة النطاق المخصص؟\"*\n\nإذا ضغطوا: أعطِ نطاقاً يكون **هدفك قرب الثلث الأدنى** منه.\n\nما الوظيفة والمدينة التي تتفاوض فيها؟",
                "**قاعدة التفاوض: من يتكلم أولاً يخسر النفوذ.**\n\n*\"أقدّر العرض. بناءً على بحثي، كنت أتوقع ما يقترب من [X]. هل هناك مرونة؟\"*\n\nثم **اصمت** — الصمت يخلق ضغطاً. معظم العروض بها مجال 10-20%.\n\nهل لديك عرض منافس؟",
                "الراتب الأساسي ليس كل شيء. إذا لم يتحركوا في الراتب، فاوض على:\n\n• **مكافأة الانضمام** — تكلفة لمرة واحدة\n• **إجازة إضافية** أو أيام عمل عن بُعد\n• **مراجعة أداء مبكرة**\n• **أسهم** أو خيارات الأسهم\n\nما المزايا الأكثر أهمية لك بعد الراتب الأساسي؟"
            },
            new String[]{
                "**永远不要先报数字。** 当被问到期望薪资时：\n\n*\"我想先全面了解职位范围，再讨论薪资——能分享预算范围吗？\"*\n\n如果他们坚持：给一个**你的目标在下三分之一**的范围。\n\n你在为哪个职位、哪个城市谈判？",
                "**谈判规则：先开口的人失去筹码。**\n\n*\"感谢这个offer。根据我的调研，我期望的薪资接近[X]。有灵活空间吗？\"*\n\n然后**保持沉默**。大多数offer有10-20%的谈判空间。\n\n你有竞争性offer吗？",
                "基本工资只是薪酬的一部分。如果他们不肯在工资上让步，可以谈：\n\n• **签约奖金**——一次性费用，阻力更小\n• **额外假期**或远程办公天数\n• **提前绩效评估**\n• **股权**或股票期权\n\n除了基本工资，你最看重哪些福利？"
            }
        ),

        NETWORKING(
            new String[]{
                "The most effective LinkedIn outreach is **3 sentences**:\n\n1. Specific reason you're reaching out\n2. A genuine question about their experience\n3. A low-commitment ask: *\"Would you be open to a 15-minute call?\"*\n\n**Never ask for a job in the first message.**\n\nAre you trying to get referrals, learn about a company, or break into a new field?",
                "**Informational interviews** are the most underused tool in job searching.\n\nMessage 10 people in your target role — ask for 20 minutes. 3–4 will say yes. One of those typically opens a door.\n\nWhat's your target industry?",
                "Build your network **before** you need it.\n\nAdd value to 3 connections per week — share an article, comment on their post, congratulate a win. When you need a referral, you're asking a colleague, not a stranger.\n\nAre you starting from scratch, or do you have an existing network to activate?"
            },
            new String[]{
                "التواصل الأكثر فعالية على LinkedIn يتكون من **3 جمل**:\n\n1. السبب المحدد للتواصل\n2. سؤال حقيقي عن تجربتهم\n3. طلب منخفض الالتزام: *\"هل أنت مفتوح لمكالمة 15 دقيقة؟\"*\n\n**لا تطلب وظيفة في الرسالة الأولى أبداً.**\n\nهل تحاول الحصول على توصيات، أم التعرف على شركة، أم الدخول لمجال جديد؟",
                "**المقابلات الاستعلامية** هي الأداة الأقل استخداماً في البحث عن عمل.\n\nأرسل رسائل لـ 10 أشخاص في دورك المستهدف — اطلب 20 دقيقة. 3-4 سيوافقون. إحدى تلك المحادثات عادةً تفتح باباً.\n\nما هو قطاعك المستهدف؟",
                "ابنِ شبكة علاقاتك **قبل** أن تحتاجها.\n\nأضف قيمة لـ 3 متواصلين أسبوعياً — شارك مقالاً، علّق على منشور، هنّئ على إنجاز. عندما تحتاج توصية، ستطلب من زميل لا من غريب.\n\nهل تبدأ من الصفر أم لديك شبكة موجودة تريد تفعيلها؟"
            },
            new String[]{
                "最有效的LinkedIn外联只需要**3句话**：\n\n1. 联系他们的具体原因\n2. 关于他们经历的真诚问题\n3. 低承诺请求：*\"你愿意进行15分钟的通话吗？\"*\n\n**第一条消息永远不要直接要求工作机会。**\n\n你是想获得内推、了解某家公司，还是进入新领域？",
                "**信息性访谈**是求职中最被低估的工具。\n\n向你目标职位的10个人发消息——请求20分钟。3-4个人会答应。其中一次谈话通常能打开一扇门。\n\n你的目标行业是什么？",
                "在你**需要之前**就建立人脉。\n\n每周为3个联系人增加价值——分享一篇文章、评论他们的帖子、祝贺一个成就。当你需要内推时，你是在向同事请求，而不是陌生人。\n\n你是从零开始，还是有现有人脉可以激活？"
            }
        ),

        SKILLS(
            new String[]{
                "The fastest way to validate a new skill: **build something real with it** and put it on GitHub.\n\nPick one project that solves a real problem. Shipping beats studying.\n\nWhat skill are you developing, and what role is it for?",
                "For **technical skills**: structured courses → then practice under pressure.\nFor **soft skills**: mock interviews or Toastmasters.\n\nThe fastest learners combine structured input with deliberate practice.\n\nIs this a technical, leadership, or domain skill?",
                "Before investing in a course: **check job postings for the roles you want** and list the top 10 skills that appear repeatedly. Prioritize those.\n\nOne well-practiced in-demand skill beats five mediocre ones.\n\nWhat roles are you targeting?"
            },
            new String[]{
                "أسرع طريقة للتحقق من مهارة جديدة: **ابنِ شيئاً حقيقياً بها** وضعه على GitHub.\n\naختر مشروعاً يحل مشكلة حقيقية. الإنجاز يتفوق على الدراسة.\n\nما المهارة التي تطورها ولأي دور؟",
                "للمهارات **التقنية**: دورات منظمة ← ثم ممارسة تحت الضغط.\nللمهارات **الناعمة**: مقابلات وهمية أو نادي المتحدثين.\n\nأسرع المتعلمين يجمعون بين المدخلات المنظمة والممارسة المتعمدة.\n\nهل هذه مهارة تقنية أم قيادية أم متخصصة؟",
                "قبل الاستثمار في دورة: **تحقق من إعلانات الوظائف التي تريدها** وقم بإدراج أفضل 10 مهارات تظهر بشكل متكرر. أولوّ تلك المهارات.\n\nمهارة واحدة متقنة ومطلوبة تتفوق على خمس مهارات متوسطة.\n\nما الوظائف التي تستهدفها؟"
            },
            new String[]{
                "验证新技能最快的方式：**用它构建真实的东西**并放到GitHub上。\n\n选择一个解决真实问题的项目。完成胜过学习。\n\n你在培养什么技能，目标是哪个职位？",
                "**技术技能**：结构化课程 → 然后在压力下练习。\n**软技能**：模拟面试。\n\n最快的学习者结合结构化输入和刻意练习。\n\n这是技术技能、领导力技能还是专业领域技能？",
                "在投资课程之前：**查看你目标职位的招聘要求**，列出重复出现最多的10个技能，优先培养这些。\n\n一个精通的热门技能胜过五个平庸的技能。\n\n你目标的是什么职位？"
            }
        ),

        APPLICATION(
            new String[]{
                "Haven't heard back after 5 business days? Send this:\n\n*\"Hi [name], I applied for [role] last week and remain genuinely excited. Happy to provide any additional info.\"*\n\nOne follow-up is professional. Two starts to feel like pressure.\n\nHow long ago did you apply?",
                "Getting **ghosted after interviews**? Send this after 3 days past the promised date:\n\n*\"Hi [name], I wanted to check in on the [role] decision timeline. I remain very interested.\"*\n\nNo response after two attempts? Focus your energy on live opportunities.\n\nWhat stage did you reach?",
                "**ATS tip**: Copy every required skill from the job description, then check how many appear **verbatim** in your resume. If fewer than 60% match, you're likely getting filtered.\n\nMirror their exact language.\n\nAre you getting zero responses, or getting screens but not advancing?"
            },
            new String[]{
                "لم تتلقَّ رداً بعد 5 أيام عمل؟ أرسل هذا:\n\n*\"مرحباً [الاسم]، تقدمت لوظيفة [الوظيفة] الأسبوع الماضي ولا أزال متحمساً للغاية. يسعدني تقديم أي معلومات إضافية.\"*\n\nمتابعة واحدة احترافية. اثنتان تبدأن كضغط.\n\nمنذ متى تقدمت؟",
                "تتلقى **رداً صامتاً بعد المقابلات**؟ أرسل هذا بعد 3 أيام من الموعد المحدد:\n\n*\"مرحباً [الاسم]، أردت المتابعة بشأن جدول اتخاذ قرار [الوظيفة]. لا أزال مهتماً جداً.\"*\n\nلا رد بعد محاولتين؟ ركّز طاقتك على الفرص الحية.\n\nأي مرحلة وصلت إليها؟",
                "**نصيحة ATS**: انسخ كل مهارة مطلوبة من الوصف الوظيفي، ثم تحقق من عدد الكلمات التي تظهر **حرفياً** في سيرتك. إذا كانت أقل من 60%، فأنت على الأرجح تُصفّى.\n\nطابق لغتهم بالضبط.\n\nهل تحصل على صفر ردود، أم تحصل على مقابلات لكن لا تتقدم؟"
            },
            new String[]{
                "5个工作日后没有收到回音？发送这条：\n\n*\"您好[姓名]，我上周申请了[职位]，仍然非常感兴趣。如需更多信息，随时可以提供。\"*\n\n一次跟进是专业的，两次开始让人觉得有压力。\n\n你是多久前申请的？",
                "**面试后被「晒」了**？在承诺日期3天后发这条：\n\n*\"您好[姓名]，想跟进一下[职位]的决策时间线。我仍然非常感兴趣。\"*\n\n两次尝试后没有回复？将精力集中在其他机会上。\n\n你进行到哪个阶段了？",
                "**ATS技巧**：把职位描述中的每个必要技能复制出来，检查有多少**逐字**出现在你的简历中。如果不到60%匹配，你很可能被过滤掉了。\n\n精确复制他们的用语。\n\n你是完全没有回音，还是有初筛但没有推进？"
            }
        ),

        OTHER(
            new String[]{
                "Career growth compounds from small, consistent actions — one skill built, one connection made, one application sent every day.\n\nWhat specific part of your career are you trying to move forward? I can give much more targeted advice with a bit more context.",
                "The best career move is often **lateral before vertical** — a role that expands your skills into a new function or industry.\n\nAre you looking to advance in your current field, or considering a pivot?",
                "Your reputation — what colleagues say about your work and how you show up — is your most durable career asset. It travels further than any resume.\n\nI can help with: job searching, resumes, interviews, salary negotiation, networking, or skill building.\n\nWhat challenge are you trying to solve right now?"
            },
            new String[]{
                "النمو المهني يتراكم من خلال أفعال صغيرة ومستمرة — مهارة واحدة تُبنى، تواصل واحد يُقام، طلب واحد يُرسل كل يوم.\n\nما الجزء المحدد من مسيرتك المهنية الذي تحاول تطويره؟ يمكنني تقديم نصائح أكثر دقة مع مزيد من السياق.",
                "أفضل خطوة مهنية غالباً ما تكون **أفقية قبل الرأسية** — دور يوسع مهاراتك في وظيفة أو صناعة جديدة.\n\nهل تبحث عن التقدم في مجالك الحالي، أم تفكر في تحول مسار؟",
                "سمعتك — ما يقوله زملاؤك عن عملك وكيف تظهر — هي أكثر أصولك المهنية ديمومة. تمتد أبعد من أي سيرة ذاتية.\n\nيمكنني المساعدة في: البحث عن عمل، السير الذاتية، المقابلات، التفاوض على الراتب، التواصل، أو بناء المهارات.\n\nما التحدي الذي تحاول حله الآن؟"
            },
            new String[]{
                "职业成长源于小而持续的行动——每天积累一项技能、建立一个联系、发送一份申请。\n\n你想在职业生涯的哪个具体方面取得进展？多一些背景信息，我可以给出更有针对性的建议。",
                "最好的职业步骤往往是**横向移动先于纵向晋升**——一个能将你的技能扩展到新职能或行业的职位。\n\n你是希望在当前领域晋升，还是考虑转型？",
                "你的声誉——同事们如何评价你的工作和你的表现——是你最持久的职业资产，比任何简历都走得更远。\n\n我可以帮助：求职、简历、面试、薪资谈判、人脉建设或技能提升。\n\n你现在想解决什么挑战？"
            }
        );

        final String[] en;
        final String[] ar;
        final String[] zh;

        Intent(String[] en, String[] ar, String[] zh) {
            this.en = en;
            this.ar = ar;
            this.zh = zh;
        }
    }
}
