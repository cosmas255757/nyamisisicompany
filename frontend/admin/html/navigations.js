document.addEventListener("DOMContentLoaded", () => {
    const headerHTML = `
        <header id="main-header">
            <div class="header-container">
                <h1 id="page-title">Admin Portal</h1>
                
                <button class="menu-toggle" aria-label="Toggle Navigation">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </button>

                <nav class="nav-menu">
                    <a href="admin_dashboard.html" class="nav-btn">Dashboard</a>
                    <a href="user_management.html" class="nav-btn">Users</a>
                    <a href="loan_portfolio.html" class="nav-btn">Portfolio</a>
                    <a href="application_review_queue.html" class="nav-btn">Queue</a>
                    <a href="collections_delinquency.html" class="nav-btn">Collections</a>
                    <a href="reports_analysis.html" class="nav-btn">Reports</a>
                    <a href="settings.html" class="nav-btn">Settings</a>
                </nav>
            </div>
        </header>
    `;

    const headerStyles = `
        #main-header {
            background-color: #ffffff;
            border-bottom: 1px solid #e5e7eb;
            padding: 0.75rem 1.5rem;
            position: sticky;
            top: 0;
            z-index: 1000;
            font-family: 'Inter', system-ui, sans-serif;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            animation: slideDown 0.5s ease;
        }

        .header-container {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        #main-header h1 { 
            font-size: 1.25rem; 
            color: #111827;
            font-weight: 700;
        }

        .nav-menu { display: flex; gap: 8px; transition: all 0.3s ease; }

        .nav-btn {
            text-decoration: none;
            color: #6b7280;
            padding: 8px 16px;
            border-radius: 6px;
            transition: all 0.2s ease;
            font-size: 0.9rem;
            font-weight: 500;
        }

        .nav-btn:hover {
            background-color: #f3f4f6;
            color: #111827;
            transform: translateY(-1px);
        }

        .nav-btn.active {
            background-color: #eef2ff;
            color: #4f46e5;
            font-weight: 600;
        }

        .menu-toggle {
            display: none;
            flex-direction: column;
            gap: 5px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
        }

        .bar {
            width: 25px;
            height: 3px;
            background-color: #374151;
            border-radius: 3px;
            transition: 0.3s;
        }

        @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 1024px) {
            .menu-toggle { display: flex; }
            
            .nav-menu {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                flex-direction: column;
                padding: 1rem;
                gap: 5px;
                border-bottom: 1px solid #e5e7eb;
                display: none; /* Hidden by default */
                transform: translateY(-10px);
                opacity: 0;
            }

            .nav-menu.active {
                display: flex;
                transform: translateY(0);
                opacity: 1;
            }

            .nav-btn { width: 100%; }
        }

        .menu-toggle.open .bar:nth-child(1) { transform: translateY(8px) rotate(45deg); }
        .menu-toggle.open .bar:nth-child(2) { opacity: 0; }
        .menu-toggle.open .bar:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
    `;

    const styleTag = document.createElement("style");
    styleTag.textContent = headerStyles;
    document.head.appendChild(styleTag);
    document.body.insertAdjacentHTML("afterbegin", headerHTML);

    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const pageTitle = document.querySelector('#page-title');
    const navLinks = document.querySelectorAll('.nav-btn');
    const currentPath = window.location.pathname.split("/").pop();

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            pageTitle.textContent = "💼 " + link.textContent;
        }
    });

    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
            menuToggle.classList.remove('open');
            navMenu.classList.remove('active');
        }
    });
});
