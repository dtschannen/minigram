(function () {
    'use strict';

    function hideElement(el) {
        if (el && el.style.display !== 'none') {
            el.style.setProperty('display', 'none', 'important');
        }
    }

    function findContentContainer(el) {
        var current = el;
        for (var i = 0; i < 10; i++) {
            if (!current.parentElement) break;
            current = current.parentElement;
            if (current.tagName === 'ARTICLE') return current;
        }
        return null;
    }

    function scanAndHide() {
        // Hide articles containing reels links
        document.querySelectorAll('a[href*="/reels/"], a[href*="/reel/"]').forEach(function (link) {
            var container = findContentContainer(link);
            if (container) hideElement(container);
        });

        // Hide "Reels and short videos" section headers
        document.querySelectorAll('h2').forEach(function (h2) {
            if (/reels and short videos/i.test(h2.textContent.trim())) {
                var container = findContentContainer(h2);
                if (container) hideElement(container);
            }
        });

        // Redirect away from reels pages
        if (/^\/(reels)(\/|$)/.test(window.location.pathname)) {
            window.location.replace('https://www.instagram.com/');
        }
    }

    var debounceTimer = null;
    function debouncedScan() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(scanAndHide, 150);
    }

    function startObserving() {
        scanAndHide();
        var observer = new MutationObserver(debouncedScan);
        observer.observe(document.body, { childList: true, subtree: true });
        setInterval(scanAndHide, 2000);
        window.addEventListener('popstate', scanAndHide);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserving);
    } else {
        startObserving();
    }
})();
