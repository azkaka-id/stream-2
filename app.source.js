// Membungkus seluruh aplikasi ke dalam IIFE agar fungsi internal tidak terbaca dari global console
(function () {
    // Fungsi untuk mendeteksi apakah pengguna menggunakan perangkat Mobile (Android/iOS)
    function isMobileDevice() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        const isIOS = /android|iphone|ipad|ipod/i.test(ua.toLowerCase());
        const isMacTablet = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        return isIOS || isMacTablet;
    }

    // Masukkan tautan .mpd atau .m3u8 Anda di sini
    const BADMINTON_STREAM_URLS = {
        court1: "https://cdn-vl-gcp-bornan-e-01.vos360.video/Content/LiveEvent/b73d64f4-a528-4296-b051-5711e6a64f0e/HLS_ENC/index.m3u8",
        court2: "https://cdn-vl-gcp-bornan-e-01.vos360.video/Content/LiveEvent/dba6af30-ebdd-4a92-a3b8-b8303d926188/HLS_ENC/index.m3u8",
        court3: "",
        court4: "",
        court1alt: "https://live1.quickscoreboardz.com/live/channel65.m3u8?wsSecret=050f9a0ad6ac4ae48cb7cf0b6d600a1b&wsABSTime=1790598696",
        court2alt: "https://live1.quickscoreboardz.com/live/channel66.m3u8?wsSecret=83f2bc4a0173af139092fd6a40414277&wsABSTime=1790598744",
        court3alt: "",
        court4alt: "",
        court1hd: "",
        court2hd: "",
        court3hd: "",
        court4hd: ""
    };

    const STREAM_URLS_BY_THEME = {
        badminton: BADMINTON_STREAM_URLS
    };

    const SAWERIA_URL = 'https://saweria.co/Shuttleflash';
    const HD_PENDING_COURT_KEY = 'shuttleflash_pending_hd_court';
    const HD_UNLOCK_PREFIX = 'shuttleflash_hd_unlocked_';
    const SCHEDULE_FILES = {
        badminton: 'schedule-badminton.json'
    };

    let hls = null;
    let dashPlayer = null;

    const hlsOptions = {
        maxMaxBufferLength: 30,
        manifestLoadingMaxRetry: 100,
        manifestLoadingRetryDelay: 1000,
        levelLoadingMaxRetry: 100,
        fragLoadingMaxRetry: 100
    };

    function setStatus(message) {
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = message || '';
    }

    function getSessionValue(key) {
        try {
            return sessionStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function setSessionValue(key, value) {
        try {
            sessionStorage.setItem(key, value);
        } catch (error) {
            console.clear();
        }
    }

    function removeSessionValue(key) {
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.clear();
        }
    }

    function initThemeSwitcher() {
        syncCourtButtons();
        loadSchedule();
    }

    function isHdCourt(court) {
        return typeof court === 'string' && court.endsWith('hd');
    }

    function isAltCourt(court) {
        return typeof court === 'string' && court.endsWith('alt');
    }

    function getCourtNumber(court) {
        const match = String(court || '').match(/^court(\d+)/);
        return match ? match[1] : '';
    }

    function getActiveTheme() {
        return 'badminton';
    }

    function getActiveStreamUrls() {
        return STREAM_URLS_BY_THEME[getActiveTheme()] || BADMINTON_STREAM_URLS;
    }

    function hasStreamUrl(court) {
        const streamUrls = getActiveStreamUrls();
        return typeof streamUrls[court] === 'string' && streamUrls[court].trim() !== '';
    }

    function isVisibleCourtForTheme(court) {
        return hasStreamUrl(court);
    }

    function getFirstAvailableCourt() {
        const firstButton = Array.from(document.querySelectorAll('.court-btn'))
            .find(function (button) {
                return isVisibleCourtForTheme(button.dataset.court);
            });
        return firstButton ? firstButton.dataset.court : null;
    }

    function syncCourtButtons() {
        document.querySelectorAll('.court-btn').forEach(function (button) {
            const court = button.dataset.court;
            const courtName = button.querySelector('.court-name');
            const courtMeta = button.querySelector('.court-meta');
            button.hidden = !isVisibleCourtForTheme(court);
            if (courtName && !courtName.dataset.defaultText) {
                courtName.dataset.defaultText = courtName.textContent.trim();
            }
            if (courtMeta && !courtMeta.dataset.defaultText) {
                courtMeta.dataset.defaultText = courtMeta.textContent.trim();
            }
            if (!button.dataset.defaultLabel) {
                button.dataset.defaultLabel = button.getAttribute('aria-label') || '';
            }
            if (courtName && courtName.dataset.defaultText) {
                courtName.textContent = courtName.dataset.defaultText;
            }
            if (courtMeta && courtMeta.dataset.defaultText) {
                courtMeta.textContent = courtMeta.dataset.defaultText;
            }
            if (button.dataset.defaultLabel) {
                button.setAttribute('aria-label', button.dataset.defaultLabel);
            }
        });
    }

    if (!isMobileDevice()) {
        document.addEventListener("DOMContentLoaded", function () {
            initThemeSwitcher();
            syncCourtButtons();
            const statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.textContent = "AKSES KHUSUS PERANGKAT MOBILE (ANDROID & IOS)";
            }
            const videoEl = document.getElementById('video');
            if (videoEl) {
                videoEl.remove();
            }
        });
        return;
    }

    function getHdUnlockKey(court) {
        return HD_UNLOCK_PREFIX + court;
    }

    function isHdUnlocked(court) {
        return getSessionValue(getHdUnlockKey(court)) === '1';
    }

    function unlockHdCourt(court) {
        setSessionValue(getHdUnlockKey(court), '1');
    }

    function redirectToSaweriaBeforeHd(court) {
        setSessionValue(HD_PENDING_COURT_KEY, court);
        setStatus('LOADING');
        window.location.href = SAWERIA_URL;
    }

    function setActiveButton(court) {
        document.querySelectorAll('.court-btn').forEach(function (button) {
            button.classList.toggle('active', button.dataset.court === court);
        });
    }

    function toggleSaweriaTutorial() {
        const button = document.getElementById('btnTutorial');
        const tutorial = document.getElementById('saweriaTutorial');
        const isShown = tutorial.classList.toggle('show');
        tutorial.setAttribute('aria-hidden', String(!isShown));
        button.setAttribute('aria-expanded', String(isShown));
    }

    function appendText(parent, text, className) {
        const element = document.createElement('span');
        element.className = className;
        element.textContent = text || '';
        parent.appendChild(element);
        return element;
    }

    function createMatchItem(match) {
        const item = document.createElement('li');
        item.className = 'match-item';
        const head = document.createElement('div');
        head.className = 'match-head';
        const category = document.createElement('div');
        category.className = 'match-category';
        appendText(category, match.code || ' ', 'match-code');
        appendText(category, match.discipline || '-', 'match-discipline');
        const court = document.createElement('div');
        court.className = 'match-court';
        court.textContent = [match.court, match.match].filter(Boolean).join('   ') || '-';
        head.appendChild(category);
        head.appendChild(court);
        const teams = document.createElement('div');
        teams.className = 'match-teams';
        const team1 = document.createElement('div');
        team1.className = 'team-row';
        team1.textContent = match.team1 || '-';
        const team2 = document.createElement('div');
        team2.className = 'team-row';
        appendText(team2, 'vs', 'vs-text');
        team2.appendChild(document.createTextNode(' ' + (match.team2 || '-')));
        if (match.seed) {
            team2.appendChild(document.createTextNode(' '));
            appendText(team2, match.seed, 'seed');
        }
        teams.appendChild(team1);
        teams.appendChild(team2);
        const time = document.createElement('div');
        time.className = 'match-time';
        appendText(time, match.time || '-', 'time-main');
        appendText(time, match.localTime || '', 'time-local');
        item.appendChild(head);
        item.appendChild(teams);
        item.appendChild(time);
        return item;
    }

    function showScheduleMessage(message) {
        const matchList = document.getElementById('matchList');
        matchList.textContent = '';
        const item = document.createElement('li');
        item.className = 'match-item match-empty';
        item.textContent = message;
        matchList.appendChild(item);
    }

    async function loadSchedule() {
        const scheduleTitle = document.getElementById('scheduleTitle');
        const matchList = document.getElementById('matchList');
        const scheduleFile = SCHEDULE_FILES[getActiveTheme()] || SCHEDULE_FILES.badminton;
        try {
            const response = await fetch(scheduleFile, { cache: 'no-store' });
            if (!response.ok) throw new Error('Jadwal belum tersedia');
            const schedule = await response.json();
            const matches = Array.isArray(schedule.matches) ? schedule.matches : [];
            scheduleTitle.textContent = schedule.title || "Today's Matches (WIB)";
            matchList.textContent = '';
            if (!matches.length) {
                showScheduleMessage('Belum ada jadwal pertandingan.');
                return;
            }
            matches.forEach(function (match) {
                matchList.appendChild(createMatchItem(match));
            });
        } catch (error) {
            showScheduleMessage('Gagal memuat jadwal.');
        }
    }

    async function getStreamUrl(court) {
        const streamUrls = getActiveStreamUrls();
        const streamUrl = hasStreamUrl(court) ? streamUrls[court].trim() : '';
        if (!streamUrl) {
            throw new Error('STREAM BELUM TERSEDIA');
        }
        return streamUrl;
    }

    function destroyPlayers() {
        if (hls) {
            hls.destroy();
            hls = null;
        }
        if (dashPlayer) {
            dashPlayer.reset();
            dashPlayer = null;
        }
    }

    async function loadVideo(court) {
        const video = document.getElementById('video');
        setActiveButton(court);
        setStatus('MEMUAT');

        destroyPlayers();
        video.removeAttribute('src');
        video.load();

        video.onplaying = function () { setStatus(''); };
        video.oncanplay = function () { setStatus(''); };

        try {
            const videoSrc = await getStreamUrl(court);
            const isDash = videoSrc.includes('.mpd');

            if (isDash) {
    if (typeof dashjs !== 'undefined' && dashjs.supportsMediaSource()) {
        dashPlayer = dashjs.MediaPlayer().create();

        // ClearKey mengharapkan KID dan key dalam format base64url, bukan hex.
        dashPlayer.setProtectionData({
            "org.w3.clearkey": {
                "clearkeys": {
                    "b_ucU68oT9WQIX7eHrp2Xg": "Sr8f0m6MRaW2uuYM9v_CuQ"
                }
            }
        });

        dashPlayer.initialize(video, videoSrc, true);

        dashPlayer.on(dashjs.MediaPlayer.events.ERROR, function (e) {
            console.error("Detail Error Dash:", e);
            setStatus('GAGAL DASH: ' + ((e.error && e.error.message) ? e.error.message : 'Error'));
        });
    } else {
        setStatus('BROWSER TIDAK MENDUKUNG DASH (.MPD)');
    }
}
            // 2. Dukungan M3U8 (HLS)
            else if (Hls.isSupported()) {
                hls = new Hls(hlsOptions);
                hls.loadSource(videoSrc);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('');
                    video.play().catch(function () { console.clear(); });
                });
                hls.on(Hls.Events.LEVEL_LOADED, function () { setStatus(''); });
                hls.on(Hls.Events.FRAG_LOADED, function () { setStatus(''); });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (!data.fatal) return;
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        if (video.paused || video.readyState < 3) {
                            setStatus('MENCOBA MEMUAT ULANG STREAM');
                        }
                        hls.startLoad();
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus('MENCOBA MEMULIHKAN STREAM');
                        hls.recoverMediaError();
                        return;
                    }
                    hls.destroy();
                    setStatus('GAGAL MEMUAT STREAM');
                });
            }
            // 3. Native HLS (Safari iOS / macOS)
            else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoSrc;
                video.addEventListener('loadedmetadata', function () {
                    setStatus('');
                    video.play().catch(function () { console.clear(); });
                }, { once: true });
            } else {
                setStatus('BROWSER TIDAK MENDUKUNG FORMAT INI');
            }
        } catch (error) {
            setStatus(error.message);
        }
    }

    function selectCourt(court) {
        if (isHdCourt(court) && !isHdUnlocked(court)) {
            redirectToSaweriaBeforeHd(court);
            return;
        }
        loadVideo(court);
    }

    function resumePendingHdCourt() {
        const pendingCourt = getSessionValue(HD_PENDING_COURT_KEY);
        if (!pendingCourt || !hasStreamUrl(pendingCourt)) {
            return false;
        }
        removeSessionValue(HD_PENDING_COURT_KEY);
        unlockHdCourt(pendingCourt);
        loadVideo(pendingCourt);
        return true;
    }

    // ============================================
    // MODUL BLOKIR & PEMUTUS ALIRAN VIDEO (ANTI-INSPECT)
    // ============================================
    function hancurkanVideo() {
        const video = document.getElementById('video');
        setStatus('AKSES DITOLAK: PROTEKSI DIHENTIKAN');
        destroyPlayers();
        if (video) {
            video.pause();
            video.removeAttribute('src');
            video.load();
        }
    }

    setInterval(function () {
        const start = new Date().getTime();
        debugger;
        const end = new Date().getTime();
        if (end - start > 100) {
            hancurkanVideo();
        }
    }, 1000);

    window.addEventListener('resize', function () {
        const threshold = 160;
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {
            hancurkanVideo();
        }
    });

    document.addEventListener('contextmenu', event => event.preventDefault());

    document.addEventListener('keydown', function (e) {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'U')
        ) {
            e.preventDefault();
            hancurkanVideo();
        }
    });

    // Inisialisasi Event Listener
    initThemeSwitcher();
    document.getElementById('btnSaweria').addEventListener('click', function () {
        window.open('https://saweria.co/Shuttleflash', '_blank', 'noopener');
    });
    document.getElementById('btnTutorial').addEventListener('click', toggleSaweriaTutorial);
    document.querySelectorAll('.court-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            selectCourt(this.dataset.court);
        });
    });

    syncCourtButtons();
    window.addEventListener('pageshow', resumePendingHdCourt);
    if (!resumePendingHdCourt()) {
        const firstCourt = getFirstAvailableCourt();
        if (firstCourt) {
            loadVideo(firstCourt);
        } else {
            setStatus('STREAM BELUM TERSEDIA');
        }
    }
})();
