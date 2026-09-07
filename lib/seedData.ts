export interface SeedTrack {
  title: string;
  slug: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
}

export interface SeedProject {
  trackSlug: string;
  title: string;
  description: string;
  problem: string;
  brief: string;
  resources: Array<{ title: string; url: string; type: string }>;
  concepts: string[];
  difficultyLevel?: "beginner" | "intermediate" | "advanced";
  platformName?: string;
  estimatedHours?: number;
  prerequisites?: string[];
  skillsLearned?: string[];
  realWorldValue?: string;
  projectOrder: number;
}

export const tracksData: SeedTrack[] = [
  {
    title: "Full Stack JavaScript",
    slug: "full-stack-js",
    level: "intermediate",
    description: "Build production-ready apps with React, Node.js, and MongoDB",
  },
  {
    title: "Python Backend Development",
    slug: "python-backend",
    level: "intermediate",
    description: "Master backend engineering with Python, databases, and APIs",
  },
  {
    title: "PHP & Laravel",
    slug: "php-laravel",
    level: "beginner",
    description: "Full-stack web development with PHP and modern frameworks",
  },
];

const docs = (title: string, url: string, type: string = "docs") => ({ title, url, type });

export const projectsData: SeedProject[] = [
  {
    trackSlug: "full-stack-js",
    title: "E-Commerce Platform",
    description: "A complete online store with payments, inventory, orders, and administration.",
    problem: "Small businesses lose 67% of sales due to poor online shopping experiences. They need a complete platform to sell products online, manage inventory, accept payments, and track orders without hiring a full development team.",
    brief: "Build a full-stack e-commerce store with product listings, shopping cart, checkout, Stripe payment processing, order management, inventory tracking, and an admin dashboard. Deploy to production.",
    concepts: ["React", "Node.js", "Express", "PostgreSQL", "REST API", "Authentication", "Stripe Integration", "Database Optimization"],
    resources: [docs("Stripe Payment Integration", "https://stripe.com/docs/payments"), docs("PostgreSQL for E-commerce", "https://www.postgresql.org/docs"), docs("React Shopping Cart Pattern", "https://react.dev/learn", "tutorial")],
    projectOrder: 1,
  },
  {
    trackSlug: "full-stack-js",
    title: "Real-time Chat Application",
    description: "An instant messaging platform with rooms, profiles, files, and notifications.",
    problem: "Remote teams struggle with slow communication tools that do not integrate with their workflow. They need instant messaging with file sharing, typing indicators, and message history in one app.",
    brief: "Build a real-time messaging platform using Socket.io where users can chat instantly, see typing indicators, share files, view chat history, and receive notifications. Support multiple chat rooms and user profiles.",
    concepts: ["Socket.io", "React Hooks", "Node.js", "WebSockets", "JWT Authentication", "MongoDB", "Real-time Events"],
    resources: [docs("Socket.io Real-time Guide", "https://socket.io/docs"), docs("WebSocket Architecture", "https://www.youtube.com/results?search_query=websockets+nodejs", "video")],
    projectOrder: 2,
  },
  {
    trackSlug: "full-stack-js",
    title: "Blog Platform with SEO",
    description: "A fast publishing platform designed to grow organic search traffic.",
    problem: "Content creators spend money on hosting but their blogs do not rank on Google. They lose organic traffic worth thousands of dollars because their sites are not optimized for search engines.",
    brief: "Create a Next.js blog platform where writers publish MDX articles, automatically optimize SEO with meta tags, sitemaps, and structured data, enable dark mode, track analytics, and see which posts get traffic. Articles should load instantly.",
    concepts: ["Next.js Server Components", "MDX", "SEO Best Practices", "Static Site Generation", "Performance Optimization", "Analytics Integration"],
    resources: [docs("Next.js SEO Guide", "https://nextjs.org/learn/seo/introduction-to-seo", "tutorial"), docs("Core Web Vitals", "https://web.dev/vitals")],
    projectOrder: 3,
  },
  {
    trackSlug: "full-stack-js",
    title: "SaaS Metrics Dashboard",
    description: "A multi-tenant dashboard for real-time revenue, growth, and team metrics.",
    problem: "Startups cannot track revenue, users, and growth in real time. They make decisions using stale data and lose money because problems are not visible quickly enough.",
    brief: "Build a multi-tenant SaaS dashboard where customers connect Stripe, see real-time revenue graphs, track user growth, manage role-based teams, generate invoices, and receive daily metric emails. Each customer must see only their data.",
    concepts: ["React", "TypeScript", "Chart.js/Recharts", "Stripe API", "Role-based Access Control", "Multi-tenancy", "Scheduled Tasks", "Email Notifications"],
    resources: [docs("Stripe API for Revenue", "https://stripe.com/docs/api"), docs("Building Dashboards", "https://www.chartjs.org/docs/latest")],
    projectOrder: 4,
  },
  {
    trackSlug: "python-backend",
    title: "REST API for Job Listings",
    description: "A production job marketplace API with search, applications, analytics, and docs.",
    problem: "Job boards waste development time building custom integrations for each company. They need one REST API for posting jobs, searching listings, and receiving analytics without custom code for every client.",
    brief: "Build a production REST API with FastAPI where companies post jobs with location, salary, and role filters, candidates search and apply, and boards view analytics. Add rate limiting, validation, error handling, Swagger docs, and tests.",
    concepts: ["FastAPI", "Pydantic Validation", "SQLAlchemy ORM", "PostgreSQL", "JWT Authentication", "Rate Limiting", "API Documentation", "Testing"],
    resources: [docs("FastAPI Production Guide", "https://fastapi.tiangolo.com"), docs("API Design Best Practices", "https://restfulapi.net", "tutorial")],
    projectOrder: 1,
  },
  {
    trackSlug: "python-backend",
    title: "Data Pipeline for Analytics",
    description: "An automated ETL pipeline that unifies, cleans, and loads business data.",
    problem: "Companies collect data from ten or more sources but cannot see the full picture. They need an automated system that pulls, cleans, and loads data into one database for analysis.",
    brief: "Build an ETL pipeline that extracts Twitter API, Shopify, and CSV data, transforms it by cleaning, deduplicating, and validating, and loads it into PostgreSQL. Add error recovery, logging, daily scheduling, and support for 100,000-plus records per run.",
    concepts: ["Python", "Pandas", "Airflow/APScheduler", "SQL", "Error Handling", "Logging", "Data Validation"],
    resources: [docs("Apache Airflow Workflow Guide", "https://airflow.apache.org/docs"), docs("Pandas for ETL", "https://pandas.pydata.org/docs")],
    projectOrder: 2,
  },
  {
    trackSlug: "python-backend",
    title: "Web Scraper for Price Monitoring",
    description: "A scheduled competitor-price monitoring service with alerts and reports.",
    problem: "E-commerce businesses need daily competitor price data, but manually checking more than 100 competitors wastes time. They need automated updates to adjust pricing strategy.",
    brief: "Build a Scrapy service that crawls competitor websites daily, extracts product prices, stores them in PostgreSQL, and alerts when prices change. Handle rate limiting, IP rotation, failed requests, and daily reports.",
    concepts: ["Scrapy", "BeautifulSoup", "PostgreSQL", "Cron Jobs", "Error Recovery", "Data Validation", "Logging"],
    resources: [docs("Scrapy Production Scraping", "https://docs.scrapy.org"), docs("Web Scraping Ethics", "https://www.youtube.com/results?search_query=web+scraping+best+practices", "video")],
    projectOrder: 3,
  },
  {
    trackSlug: "python-backend",
    title: "Sentiment Analysis API",
    description: "An ML-backed API that classifies customer feedback at scale.",
    problem: "Brands receive thousands of social mentions daily but cannot understand customer sentiment or detect issues before they become public-relations problems.",
    brief: "Build a FastAPI service that accepts tweets, reviews, and comments and returns positive, negative, or neutral sentiment scores using an ML model. Support batches of 1,000 reviews, caching, performance monitoring, and production load handling.",
    concepts: ["FastAPI", "Scikit-learn/BERT", "Model Versioning", "Caching", "Performance Metrics", "Batch Processing", "Production ML Deployment"],
    resources: [docs("Hugging Face Models", "https://huggingface.co/models"), docs("Deploying ML Models", "https://www.tensorflow.org/tfx", "tutorial")],
    projectOrder: 4,
  },
  {
    trackSlug: "php-laravel",
    title: "Multi-tenant SaaS (Project Management)",
    description: "An affordable isolated workspace and billing platform for small agencies.",
    problem: "Project management tools can cost more than $100 per month per team. Small agencies need affordable isolated client workspaces in one shared application to reduce server costs.",
    brief: "Build a Laravel project-management SaaS where each company tenant has a workspace, task management, team invites, and reporting. Isolate tenant data completely and add per-tenant monthly Stripe billing.",
    concepts: ["Laravel", "Tenant Isolation", "Multi-tenancy Package", "Role-based Access", "Blade Templates", "Eloquent ORM", "Stripe Subscriptions"],
    resources: [docs("Laravel Multi-tenancy", "https://github.com/spatie/laravel-multitenancy"), docs("Laravel Billing (Stripe)", "https://laravel.com/docs/billing")],
    projectOrder: 1,
  },
  {
    trackSlug: "php-laravel",
    title: "E-Commerce Admin Panel",
    description: "A real-time operations console for orders, inventory, refunds, and reports.",
    problem: "Store owners spend five or more hours daily managing orders in spreadsheets and email. They miss orders, ship wrong items, and lose customers through late fulfillment.",
    brief: "Build a Laravel admin dashboard where store owners see orders in real time, mark shipments, manage inventory and low-stock alerts, process refunds, and view best sellers. Add real-time notifications and daily sales, product, and retention reports.",
    concepts: ["Laravel", "Livewire (real-time UI)", "Database Optimization", "Queue Jobs", "Notifications", "Reporting"],
    resources: [docs("Laravel Livewire Real-time Components", "https://livewire.laravel.com"), docs("Database Performance", "https://laravel.com/docs/queries", "tutorial")],
    projectOrder: 2,
  },
  {
    trackSlug: "php-laravel",
    title: "Real-time Customer Support System",
    description: "A support ticket and chat system that helps agents resolve issues quickly.",
    problem: "Support teams miss customer messages because they check email infrequently, leaving customers waiting hours. They need instant notifications and searchable chat history.",
    brief: "Build a support-ticket system with real-time chat using Laravel WebSockets. Show new messages instantly, typing indicators, chat history, ticket status, agent assignment, and urgent-issue notifications.",
    concepts: ["Laravel", "WebSockets", "Broadcasting", "Event System", "Database Subscriptions", "Real-time Updates"],
    resources: [docs("Laravel Broadcasting & WebSockets", "https://laravel.com/docs/broadcasting"), docs("Real-time Architecture", "https://beyondco.de/docs/laravel-websockets/getting-started", "tutorial")],
    projectOrder: 3,
  },
  {
    trackSlug: "php-laravel",
    title: "Secure File Sharing System",
    description: "A trackable file-sharing service with expiry, passwords, and cloud storage.",
    problem: "Teams send confidential files through email, creating security and compliance risks. They need secure, trackable links showing who accessed files, when, and from where.",
    brief: "Build a file-sharing platform where users upload files, create secure expiring links, set seven-day deletion, add password protection, track downloads, integrate AWS S3, and support batch uploads and versioning.",
    concepts: ["Laravel", "AWS S3", "File Security", "Access Logging", "Cloud Storage", "Database Optimization", "Secure Links"],
    resources: [docs("Laravel File Storage", "https://laravel.com/docs/storage"), docs("AWS S3 Security", "https://docs.aws.amazon.com/s3/latest/userguide/security.html")],
    projectOrder: 4,
  },
];

const advanced = (project: Omit<SeedProject, "difficultyLevel">): SeedProject => ({ ...project, prerequisites: ["Complete all 4 beginner projects", ...(project.prerequisites ?? [])], difficultyLevel: "advanced" });

export const advancedProjects: SeedProject[] = [
  advanced({ trackSlug: "full-stack-js", title: "Facebook Clone: Social Graph & Feed", platformName: "Facebook", description: "A social network with a personalized feed, connections, notifications, and privacy controls.", problem: "A social product needs to rank relevant content and protect private posts while thousands of users interact at the same time.", brief: "Build a Facebook-style social network with profiles, friend requests, posts, comments, reactions, a personalized feed, real-time notifications, and privacy-aware visibility rules. Cache feed pages and document the tradeoffs behind your ranking algorithm.", resources: [docs("React Documentation", "https://react.dev"), docs("Socket.io Client API", "https://socket.io/docs/v4/client-api/"), docs("PostgreSQL Recursive Queries", "https://www.postgresql.org/docs/current/queries-with.html"), docs("Redis Documentation", "https://redis.io/docs/latest/")], concepts: ["React", "Node.js", "GraphQL", "PostgreSQL", "Socket.io", "Redis", "Feed Ranking"], estimatedHours: 540, prerequisites: ["React hooks", "Node.js and Express", "PostgreSQL fundamentals"], skillsLearned: ["Feed algorithms", "Graph queries", "Real-time systems", "Privacy-aware data access"], realWorldValue: "Understand the core product and infrastructure tradeoffs behind large social networks.", projectOrder: 5 }),
  advanced({ trackSlug: "full-stack-js", title: "Daraz Clone: Multi-Vendor Commerce", platformName: "Daraz", description: "A marketplace with sellers, faceted discovery, checkout, inventory, and order operations.", problem: "A marketplace must coordinate many sellers, product catalogs, payments, and inventory without overselling or losing order state.", brief: "Build a multi-vendor marketplace with seller onboarding, product management, Elasticsearch-style filtering, cart and checkout flows, payment webhooks, inventory reservations, reviews, coupons, returns, and seller analytics.", resources: [docs("Stripe Payments", "https://stripe.com/docs/payments"), docs("Elasticsearch Reference", "https://www.elastic.co/guide/en/elasticsearch/reference/current/"), docs("XState Documentation", "https://stately.ai/docs/xstate"), docs("Dinero.js", "https://dinerojs.com/")], concepts: ["Next.js", "PostgreSQL", "Search", "Stripe", "Inventory", "Order State Machines", "Multi-vendor Systems"], estimatedHours: 480, prerequisites: ["REST APIs", "Relational data modeling", "Authentication"], skillsLearned: ["Faceted search", "Payment reconciliation", "Inventory reservations", "Commission calculations"], realWorldValue: "Practice the workflows and consistency guarantees used by production marketplaces.", projectOrder: 6 }),
  advanced({ trackSlug: "full-stack-js", title: "YouTube Clone: Video Streaming", platformName: "YouTube", description: "A creator video platform with processing, adaptive playback, recommendations, and analytics.", problem: "Video platforms must process large uploads, deliver the right quality to each viewer, and measure engagement without blocking playback.", brief: "Build a creator platform with video upload, asynchronous FFmpeg processing into multiple qualities, HLS playback, comments, subscriptions, search, recommendations, playlists, and a creator analytics dashboard.", resources: [docs("FFmpeg Documentation", "https://ffmpeg.org/documentation.html"), docs("HLS RFC 8216", "https://www.rfc-editor.org/rfc/rfc8216"), docs("Video.js Guide", "https://videojs.com/guides/"), docs("BullMQ Documentation", "https://docs.bullmq.io/")], concepts: ["FFmpeg", "HLS", "CDN Delivery", "Job Queues", "Time-series Analytics", "Recommendations"], estimatedHours: 600, prerequisites: ["Node.js", "File uploads", "Basic networking"], skillsLearned: ["Video pipelines", "Adaptive streaming", "Async processing", "Engagement analytics"], realWorldValue: "Learn how media products separate upload, processing, storage, delivery, and analytics concerns.", projectOrder: 7 }),
  advanced({ trackSlug: "full-stack-js", title: "TikTok Clone: For You Feed", platformName: "TikTok", description: "A short-form video feed optimized for fast discovery, autoplay, engagement, and creator growth.", problem: "A short-video product must keep scrolling smooth while ranking fresh content from sparse user signals.", brief: "Build a mobile-first short-video experience with vertical autoplay, infinite feed loading, likes, comments, follows, sounds, hashtags, moderation flags, creator analytics, and a transparent recommendation score based on watch time and engagement.", resources: [docs("React Window", "https://react-window.vercel.app/"), docs("Intersection Observer", "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API"), docs("Web Performance", "https://web.dev/performance/"), docs("TikTok Recommendation Overview", "https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you")], concepts: ["React", "Virtualization", "Intersection Observer", "Video UX", "Recommendations", "Moderation"], estimatedHours: 600, prerequisites: ["React state management", "REST APIs", "Browser media APIs"], skillsLearned: ["60fps feed rendering", "Behavioral ranking", "Content moderation workflows", "Mobile-first interaction design"], realWorldValue: "Build the performance-sensitive discovery loop behind modern short-form media apps.", projectOrder: 8 }),
  advanced({ trackSlug: "python-backend", title: "Daraz Backend: Payments & Inventory API", platformName: "Daraz", description: "A resilient marketplace backend for catalog, stock, payments, and fulfillment state.", problem: "Payment retries and concurrent checkouts can create duplicate charges or sell stock that does not exist.", brief: "Build a FastAPI service with idempotent payment webhooks, inventory reservations, seller commissions, order state transitions, refund handling, audit logs, and load-tested endpoints.", resources: [docs("FastAPI", "https://fastapi.tiangolo.com/"), docs("Stripe Webhooks", "https://stripe.com/docs/webhooks"), docs("PostgreSQL Transactions", "https://www.postgresql.org/docs/current/tutorial-transactions.html"), docs("Locust", "https://locust.io/")], concepts: ["FastAPI", "PostgreSQL", "Transactions", "Idempotency", "Webhooks", "Load Testing"], estimatedHours: 480, prerequisites: ["Python", "SQL", "HTTP APIs"], skillsLearned: ["Payment reliability", "Concurrency control", "Order workflows", "Operational testing"], realWorldValue: "Practice backend correctness where money and inventory are involved.", projectOrder: 5 }),
  advanced({ trackSlug: "python-backend", title: "YouTube Analytics Pipeline", platformName: "YouTube", description: "An ETL and reporting pipeline for watch time, retention, and creator revenue metrics.", problem: "Creators need trustworthy metrics from large streams of playback events, even when events arrive late or more than once.", brief: "Build an ingestion pipeline that validates playback events, deduplicates records, aggregates daily and hourly watch metrics, calculates retention cohorts, and exposes a documented analytics API with scheduled jobs and replay support.", resources: [docs("Pandas", "https://pandas.pydata.org/docs/"), docs("Apache Airflow", "https://airflow.apache.org/docs/"), docs("PostgreSQL Window Functions", "https://www.postgresql.org/docs/current/functions-window.html"), docs("Great Expectations", "https://docs.greatexpectations.io/")], concepts: ["Python", "Pandas", "Airflow", "PostgreSQL", "ETL", "Data Quality"], estimatedHours: 520, prerequisites: ["Python", "SQL joins and aggregation", "REST APIs"], skillsLearned: ["Event pipelines", "Deduplication", "Cohort analysis", "Data quality checks"], realWorldValue: "Learn how analytics systems turn noisy product events into reliable decisions.", projectOrder: 6 }),
  advanced({ trackSlug: "python-backend", title: "TikTok Content Moderation Service", platformName: "TikTok", description: "A moderation API that classifies media and routes uncertain content for human review.", problem: "Large content platforms need fast automated triage while keeping an audit trail for uncertain or appealed decisions.", brief: "Build a FastAPI moderation service that accepts text and image metadata, runs configurable classifiers, stores model versions and confidence scores, queues uncertain cases for review, supports appeals, and exposes moderation metrics.", resources: [docs("FastAPI", "https://fastapi.tiangolo.com/"), docs("TensorFlow.js", "https://www.tensorflow.org/js"), docs("Celery", "https://docs.celeryq.dev/"), docs("Sentry", "https://docs.sentry.io/")], concepts: ["FastAPI", "Classification", "Queues", "Model Versioning", "Audit Logs", "Observability"], estimatedHours: 560, prerequisites: ["Python APIs", "Testing", "Basic machine learning concepts"], skillsLearned: ["Moderation pipelines", "Human-in-the-loop systems", "Confidence thresholds", "Production observability"], realWorldValue: "Understand the systems surrounding an ML model, not just the prediction itself.", projectOrder: 7 }),
  advanced({ trackSlug: "python-backend", title: "Social Network Graph Service", platformName: "Facebook", description: "A graph-oriented API for connections, recommendations, and privacy-aware traversal.", problem: "Connection recommendations become expensive and unsafe when graph traversal ignores depth, indexes, or visibility rules.", brief: "Build a Python API for friend requests, mutual connections, two-hop recommendations, blocked users, privacy settings, and cached graph queries. Add recursive SQL, query benchmarks, and tests for inaccessible relationships.", resources: [docs("PostgreSQL Recursive Queries", "https://www.postgresql.org/docs/current/queries-with.html"), docs("Redis", "https://redis.io/docs/latest/"), docs("Pytest", "https://docs.pytest.org/"), docs("OWASP API Security", "https://owasp.org/www-project-api-security/")], concepts: ["Python", "FastAPI", "Recursive SQL", "Redis", "Privacy", "Query Optimization"], estimatedHours: 500, prerequisites: ["Python", "SQL", "API authentication"], skillsLearned: ["Graph traversal", "Privacy enforcement", "Caching", "Database benchmarking"], realWorldValue: "Build intuition for social graphs and the boundaries that make them safe to query.", projectOrder: 8 }),
  advanced({ trackSlug: "php-laravel", title: "Daraz Admin Panel", platformName: "Daraz", description: "A Laravel operations console for sellers, orders, inventory, promotions, and reports.", problem: "Operations teams need one trustworthy place to resolve fulfillment issues and understand marketplace performance.", brief: "Build a Laravel admin panel with role-based seller access, order queues, inventory alerts, refund workflows, promotion management, commission reports, exports, and queued notifications.", resources: [docs("Laravel Documentation", "https://laravel.com/docs"), docs("Laravel Queues", "https://laravel.com/docs/queues"), docs("Laravel Authorization", "https://laravel.com/docs/authorization"), docs("Recharts", "https://recharts.org/")], concepts: ["Laravel", "Livewire", "Eloquent", "Queues", "Authorization", "Reporting"], estimatedHours: 480, prerequisites: ["PHP and Laravel fundamentals", "SQL", "Blade components"], skillsLearned: ["Admin workflows", "Role-based access", "Queued jobs", "Operational reporting"], realWorldValue: "Build the internal tools that keep a multi-vendor business moving.", projectOrder: 5 }),
  advanced({ trackSlug: "php-laravel", title: "YouTube Creator Dashboard", platformName: "YouTube", description: "A creator workspace for publishing, analytics, audience growth, and monetization.", problem: "Creators need understandable performance data and reliable publishing workflows, not a pile of disconnected metrics.", brief: "Build a Laravel creator dashboard with video metadata management, scheduled publishing, watch-time analytics, audience cohorts, revenue calculations, CSV exports, and notification preferences.", resources: [docs("Laravel Task Scheduling", "https://laravel.com/docs/scheduling"), docs("Laravel Notifications", "https://laravel.com/docs/notifications"), docs("PostgreSQL Window Functions", "https://www.postgresql.org/docs/current/functions-window.html"), docs("Chart.js", "https://www.chartjs.org/docs/latest/")], concepts: ["Laravel", "Queues", "Scheduled Tasks", "Analytics", "Subscriptions", "Exports"], estimatedHours: 500, prerequisites: ["Laravel routing and Eloquent", "Authentication", "Basic analytics"], skillsLearned: ["Creator workflows", "Metric modeling", "Scheduled jobs", "Revenue reporting"], realWorldValue: "Connect product analytics to the daily decisions of a creator business.", projectOrder: 6 }),
  advanced({ trackSlug: "php-laravel", title: "Facebook Moderation Console", platformName: "Facebook", description: "A community operations system for reports, review queues, appeals, and audit history.", problem: "Moderators need consistent decisions and traceability when reviewing high volumes of user reports.", brief: "Build a Laravel moderation console with report intake, priority queues, evidence views, moderator roles, decision policies, appeals, audit logs, and aggregate safety metrics. Protect sensitive evidence with authorization policies.", resources: [docs("Laravel Policies", "https://laravel.com/docs/authorization#creating-policies"), docs("Laravel Broadcasting", "https://laravel.com/docs/broadcasting"), docs("OWASP Logging", "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html")], concepts: ["Laravel", "Policies", "Livewire", "Audit Logging", "Moderation", "Workflow Design"], estimatedHours: 480, prerequisites: ["Laravel", "Database relationships", "Authorization basics"], skillsLearned: ["Review queues", "Appeals", "Auditability", "Sensitive-data access control"], realWorldValue: "Practice the policy and workflow design needed for healthy online communities.", projectOrder: 7 }),
  advanced({ trackSlug: "php-laravel", title: "Payment Gateway Integration", platformName: "Stripe + JazzCash", description: "A payment abstraction with webhook reconciliation, refunds, and provider failover.", problem: "Payment providers report different states and retry webhooks, so a checkout system must reconcile safely.", brief: "Build a Laravel payment module that supports Stripe and a Pakistan-focused wallet provider behind one interface. Add signed webhook verification, idempotency keys, refund flows, provider status reconciliation, and a searchable transaction ledger.", resources: [docs("Stripe Payments", "https://stripe.com/docs/payments"), docs("Stripe Webhooks", "https://stripe.com/docs/webhooks"), docs("Laravel Cashier", "https://laravel.com/docs/billing"), docs("Laravel Events", "https://laravel.com/docs/events")], concepts: ["Laravel", "Payment APIs", "Webhooks", "Idempotency", "Events", "Ledger Design"], estimatedHours: 440, prerequisites: ["Laravel", "HTTP APIs", "Database transactions"], skillsLearned: ["Provider abstraction", "Webhook security", "Reconciliation", "Refund workflows"], realWorldValue: "Design payment integrations around failure, retries, and accounting truth.", projectOrder: 8 }),
];
