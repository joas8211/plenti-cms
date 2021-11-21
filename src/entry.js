if (location.hash == '#cms') {
    history.replaceState(null, '', location.href.split('#')[0]);
}

const parameters = location.search.slice(1).split('&');
if (parameters.indexOf('cms') != -1) {
    import('./init.js');
} else {
    window.addEventListener('hashchange', () => {
        if (location.hash != '#cms') return;
        import('./init.js');
    });
}