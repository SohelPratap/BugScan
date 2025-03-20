function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
}

function loadContent(section) {
    const content = document.getElementById('content');
    const header = document.getElementById('header');

    switch (section) {
        case 'dashboard':
            header.textContent = 'Dashboard';
            content.innerHTML = '<p>Welcome to the OneAudit Dashboard.</p>';
            break;
        case 'newScan':
            header.textContent = 'New Scan';
            content.innerHTML = '<p>Start a new security scan here.</p>';
            break;
        case 'reports':
            header.textContent = 'Reports';
            content.innerHTML = '<p>View your past security reports here.</p>';
            break;
        default:
            header.textContent = 'Dashboard';
            content.innerHTML = '<p>Welcome! Select an item from the sidebar.</p>';
            break;
    }
}