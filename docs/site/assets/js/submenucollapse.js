// lern-apps: overlay of the v4 theme script (docToolchain main-4.x@6de96fb7); re-sync with the theme when upgrading.
// Only change: the localStorage key carries the app's name in the catalog of lernapps.net (rule own-data-only).
const SCHLUESSEL = 'lernapps:mathe-karte:openDetails';
    function saveMenuState() {
        const openDetails = Array.from(document.querySelectorAll('details[open]')).map(el => el.id);
        localStorage.setItem(SCHLUESSEL, JSON.stringify(openDetails));
    }

    function restoreMenuState() {
        const openDetails = JSON.parse(localStorage.getItem(SCHLUESSEL)) || [];
        openDetails.forEach(id => {
            const details = document.getElementById(id);
            if (details) details.open = true;
        });
    }
    function openActiveItemPath() {
        const activeItem = document.querySelector('a.td-sidebar-link.active');
        if (activeItem) {
            let parent = activeItem.closest('details');
            while (parent) {
                parent.open = true;
                parent = parent.parentElement.closest('details');
            }
        }
    }
    document.querySelectorAll('details').forEach(details => {
        details.addEventListener('toggle', function() {
            saveMenuState();
        });
    });

    document.querySelectorAll('summary a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });

    // Zustand beim Laden der Seite wiederherstellen
    window.addEventListener('load', () => {
        restoreMenuState();
        openActiveItemPath();
    });
