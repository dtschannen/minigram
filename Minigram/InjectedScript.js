(function () {
    'use strict';

    function hideElement(el) {
        if (el && el.style.display !== 'none') {
            el.style.setProperty('display', 'none', 'important');
        }
    }

    function findContentContainer(el) {
        let current = el;
        for (let i = 0; i < 10; i++) {
            if (!current.parentElement) break;
            current = current.parentElement;
            if (current.tagName === 'ARTICLE') return current;
        }
        return null;
    }

    const textPatterns = [
        /suggested for you/i,
        /recommended/i,
        /reels and short videos/i,
        /based on your activity/i,
        /posts you might like/i,
    ];

    function scanAndHide() {
        // --- Reels links: hide parent article ---
        document.querySelectorAll('a[href*="/reels/"], a[href*="/reel/"]').forEach(function (link) {
            var container = findContentContainer(link);
            if (container) hideElement(container);
        });

        // --- Text-pattern scanning via TreeWalker ---
        var walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        var node;
        while ((node = walker.nextNode())) {
            var text = node.textContent.trim();
            if (!text) continue;
            for (var i = 0; i < textPatterns.length; i++) {
                if (textPatterns[i].test(text)) {
                    var container = findContentContainer(node);
                    if (container) hideElement(container);
                    break;
                }
            }
        }

        // --- Sponsored / Ad posts ---
        document.querySelectorAll('article').forEach(function (article) {
            var links = article.querySelectorAll('[role="link"]');
            links.forEach(function (link) {
                var t = link.textContent.trim();
                if (/^Sponsored$/i.test(t) || /^Ad$/i.test(t)) {
                    hideElement(article);
                }
            });
            var spans = article.querySelectorAll('span');
            spans.forEach(function (span) {
                var t = span.textContent.trim();
                if (/^Sponsored$/i.test(t) || /^Ad$/i.test(t)) {
                    hideElement(article);
                }
            });
        });

        // --- Explore page: hide discover grid but keep search ---
        if (window.location.pathname.startsWith('/explore')) {
            // Hide grid containers with trending content
            document.querySelectorAll('[style*="display: grid"]').forEach(function (grid) {
                if (grid.querySelector('a[href*="/p/"]') || grid.querySelector('a[href*="/reel/"]')) {
                    hideElement(grid);
                }
            });
        }

        // --- App download banners ---
        var allElements = document.querySelectorAll('[style*="position: fixed"], [style*="position: sticky"]');
        allElements.forEach(function (el) {
            if (el.querySelector('a[href*="apps.apple.com"]') ||
                el.querySelector('a[href*="itunes.apple.com"]') ||
                el.querySelector('a[href*="instagram://"]')) {
                hideElement(el);
            }
            var innerText = el.textContent || '';
            if (/use the app/i.test(innerText) || /open in app/i.test(innerText) || /get the app/i.test(innerText)) {
                hideElement(el);
            }
        });

        // --- Redirect away from reels pages (but NOT explore) ---
        if (/^\/(reels)(\/|$)/.test(window.location.pathname)) {
            window.location.replace('https://www.instagram.com/');
        }
    }

    // --- MutationObserver with debounce ---
    var debounceTimer = null;
    function debouncedScan() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(scanAndHide, 150);
    }

    function startObserving() {
        scanAndHide();

        var observer = new MutationObserver(debouncedScan);
        observer.observe(document.body, { childList: true, subtree: true });

        // Periodic fallback scan
        setInterval(scanAndHide, 2000);

        // Re-scan on navigation
        window.addEventListener('popstate', scanAndHide);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserving);
    } else {
        startObserving();
    }
})();
