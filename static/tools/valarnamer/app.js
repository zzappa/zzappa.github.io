(function () {
    'use strict';

    const nameElement = document.getElementById('name');
    const descriptionElement = document.getElementById('description');
    const statusElement = document.getElementById('github-status');
    const newNameButton = document.getElementById('new-name');
    let namesPromise;
    let selection = 0;
    let activeCheck;

    function loadNames() {
        if (!namesPromise) {
            namesPromise = fetch('names.json')
                .then(response => {
                    if (!response.ok) throw new Error('Unable to load names');
                    return response.json();
                })
                .then(names => {
                    if (!Array.isArray(names) || !names.length) throw new Error('No names available');
                    return names;
                })
                .catch(error => {
                    namesPromise = undefined;
                    throw error;
                });
        }
        return namesPromise;
    }

    function githubUsername(name) {
        return name.toLowerCase()
            .replace(/[æœøðþłß]/g, character => ({
                'æ': 'ae', 'œ': 'oe', 'ø': 'o', 'ð': 'd',
                'þ': 'th', 'ł': 'l', 'ß': 'ss'
            })[character])
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/['’]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 39)
            .replace(/-+$/g, '');
    }

    async function showRandomName() {
        const current = ++selection;
        if (activeCheck) activeCheck.abort();
        statusElement.textContent = 'Loading…';

        let names;
        try {
            names = await loadNames();
        } catch (error) {
            if (current === selection) {
                nameElement.textContent = 'Could not load names';
                descriptionElement.textContent = 'Please try again.';
                statusElement.textContent = '';
            }
            return;
        }
        if (current !== selection) return;

        const entry = names[Math.floor(Math.random() * names.length)];
        const name = entry.name;
        const username = githubUsername(name);
        nameElement.textContent = name.toUpperCase();
        descriptionElement.textContent = entry.desc;

        if (!username) {
            statusElement.textContent = 'Could not make a GitHub username from this name';
            return;
        }

        statusElement.textContent = `Checking GitHub: ${username}…`;
        const controller = new AbortController();
        activeCheck = controller;
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
            const response = await fetch('https://api.github.com/users/' + encodeURIComponent(username), {
                signal: controller.signal
            });
            if (current !== selection) return;
            if (response.status === 200) {
                statusElement.textContent = `GitHub: ${username} is taken`;
            } else if (response.status === 404) {
                statusElement.textContent = `GitHub: no account found for ${username}`;
            } else if (response.status === 403 || response.status === 429) {
                statusElement.textContent = `GitHub: could not check ${username} (rate limit or access restriction)`;
            } else {
                statusElement.textContent = `GitHub: could not check ${username}`;
            }
        } catch (error) {
            if (current === selection) statusElement.textContent = `GitHub: could not check ${username}`;
        } finally {
            clearTimeout(timeout);
            if (activeCheck === controller) activeCheck = undefined;
        }
    }

    newNameButton.addEventListener('click', showRandomName);
    showRandomName();
})();
