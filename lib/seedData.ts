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
