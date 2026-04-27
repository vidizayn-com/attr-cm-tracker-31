const fs = require('fs');

const tpl = fs.readFileSync('mockup-dashboard.html', 'utf8');

const create = (file, title, subtitle, mainHtml) => {
    // Determine which file we are generating to set the active class
    let content = tpl.replace(/(<a href="mockup-dashboard.html" class="nav-link) active(")/, '$1$2');
    content = content.replace(new RegExp('(<a href="' + file + '" class="nav-link)(")'), '$1 active$2');

    // Replace main content
    const newMain = `
    <main class="main-content">
        <header class="top-header">
            <div class="page-title">
                <h2>${title}</h2>
                <p>${subtitle}</p>
            </div>
            <div class="header-actions">
                <div class="search-bar">
                    <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input type="text" placeholder="Search...">
                </div>
            </div>
        </header>
        <section class="dashboard-grid">
            ${mainHtml}
        </section>
    </main>`;

    content = content.replace(/<main class="main-content">[\s\S]*?<\/main>/, newMain);

    fs.writeFileSync(file, content);
};

// 1. Pool
create(
    'mockup-pool.html', 
    'Patient Pool', 
    'Review unassigned patients and match them to specialists.', 
    `
    <div class="glass-card" style="grid-column: span 12; display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; gap: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
            <div style="flex:1; font-weight:600; color:var(--text-muted)">Patient Name</div>
            <div style="flex:1; font-weight:600; color:var(--text-muted)">Hospital</div>
            <div style="flex:1; font-weight:600; color:var(--text-muted)">Required Department</div>
            <div style="flex:1; font-weight:600; color:var(--text-muted)">Status</div>
            <div style="width: 100px; font-weight:600; color:var(--text-muted)">Action</div>
        </div>
        <div style="display: flex; gap: 1rem; align-items:center; background: rgba(255,255,255,0.4); padding: 12px; border-radius:12px;">
            <div style="flex:1; font-weight:600;">Ahmet Yilmaz</div>
            <div style="flex:1;">City Hospital</div>
            <div style="flex:1;"><span style="background: rgba(99,102,241,0.1); color: #4f46e5; padding: 4px 10px; border-radius: 8px; font-size:0.8rem; font-weight:600;">Genetic Expert</span></div>
            <div style="flex:1;">Waiting Assignment</div>
            <div style="width: 100px;"><button style="background:var(--primary); color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">Assign</button></div>
        </div>
    </div>
    `
);

// 2. Reports
create(
    'mockup-reports.html', 
    'Report Tracker', 
    'Track upcoming and overdue patient diagnosis reports.', 
    `
    <div class="glass-card" style="grid-column: span 12; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
        <div style="background: #fef2f2; border-left: 4px solid var(--danger); padding: 1.5rem; border-radius: 12px;">
            <h3 style="margin:0 0 0.5rem 0; color:var(--danger)">Overdue</h3>
            <div style="font-size:2rem; font-weight:700;">3</div>
            <p style="margin:0; font-size:0.85rem; color:#991b1b">Patients require urgent attention.</p>
        </div>
        <div style="background: #fffbeb; border-left: 4px solid var(--accent); padding: 1.5rem; border-radius: 12px;">
            <h3 style="margin:0 0 0.5rem 0; color:#d97706">Pending Restudy</h3>
            <div style="font-size:2rem; font-weight:700;">8</div>
            <p style="margin:0; font-size:0.85rem; color:#b45309">Due within 20 days.</p>
        </div>
        <div style="background: #ecfdf5; border-left: 4px solid var(--success); padding: 1.5rem; border-radius: 12px;">
            <h3 style="margin:0 0 0.5rem 0; color:var(--success)">Completed </h3>
            <div style="font-size:2rem; font-weight:700;">45</div>
            <p style="margin:0; font-size:0.85rem; color:#065f46">Up to date reports.</p>
        </div>
    </div>
    `
);

// 3. Diagnostics
create(
    'mockup-diagnostics.html', 
    'Diagnostic Progress', 
    'Overview of patient stages from Initial Visit to Final Report.', 
    `
    <div class="glass-card" style="grid-column: span 12; height: 300px; display:flex; align-items:center; justify-content:center; color:#64748b; background: rgba(59,130,246,0.05); border: 2px dashed rgba(59,130,246,0.2);">
        <div style="text-align:center;">
             <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:48px; height:48px; color:var(--primary); margin-bottom:1rem;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
             <h3 style="margin:0; color:var(--primary-dark);">Diagnostic Visualization Area</h3>
             <p style="margin:4px 0 0; font-size:0.9rem;">(Interactive patient journey graphs will be displayed here in full dev.)</p>
        </div>
    </div>
    `
);

console.log("Mockups successfully generated.");
