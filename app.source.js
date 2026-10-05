// Membungkus seluruh aplikasi ke dalam IIFE agar fungsi internal tidak terbaca dari global console
(function () {
    // Fungsi untuk mendeteksi apakah pengguna menggunakan perangkat Mobile (Android/iOS)
    function isMobileDevice() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        const isIOS = /android|iphone|ipad|ipod/i.test(ua.toLowerCase());
        const isMacTablet = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        return isIOS || isMacTablet;
    }

    // Court HD harus menggunakan URL HLS (.m3u8), sama seperti court biasa/ALT.
    const BADMINTON_STREAM_URLS = {
        court1: "",
        court2: "",
        court3: "",
        court4: "",
        court1alt: "",
        court2alt: "",
        court3alt: "",
        court4alt: "",
        court1hd: "",
        court2hd: "",
        court3hd: "",
        court4hd: ""
    };

    // Tambahkan URL pertandingan sepak bola di sini saat link siaran tersedia.
    const FIFA_ASEAN_CUP_2026_STREAM_URLS = {
        footballS1: "https://pul-tenm.gkykp.com/live/hd-en-1-4639764.m3u8?txSecret=16ca87f0afd24344ea40bf99c3636193&txTime=6ABFA170",
        footballS2: "https://live.vivo155.com/live/hd-en-1-4639764.m3u8?txSecret=f5721be072992c9579f838081914c37d&txTime=6ABE652F",
        footballS3: ""
    };

    const STREAM_URLS_BY_THEME = {
        badminton: BADMINTON_STREAM_URLS,
        fifaAseanCup2026: FIFA_ASEAN_CUP_2026_STREAM_URLS
    };

    let activeTheme = 'badminton';

    const SAWERIA_URL = 'https://saweria.co/Shuttleflash';
    const HD_PENDING_COURT_KEY = 'shuttleflash_pending_hd_court';
    const HD_UNLOCK_PREFIX = 'shuttleflash_hd_unlocked_';
    // Tempel URL iframe dari halaman Publish di akun Cbox Anda.
    const CBOX_EMBED_URL = 'https://www5.cbox.ws/box/?boxid=967352&boxtag=5YPSFc';

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

    function syncPlayerAspectRatio() {
        const video = document.getElementById('video');
        const wrapper = video && video.closest('.video-wrapper');
        if (wrapper && video.videoWidth > 0 && video.videoHeight > 0) {
            wrapper.style.aspectRatio = video.videoWidth + ' / ' + video.videoHeight;
        }
    }

    const aspectVideo = document.getElementById('video');
    if (aspectVideo) {
        aspectVideo.addEventListener('loadedmetadata', syncPlayerAspectRatio);
        aspectVideo.addEventListener('resize', syncPlayerAspectRatio);
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
        loadCbox();
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
        return activeTheme;
    }

    function getActiveStreamUrls() {
        return STREAM_URLS_BY_THEME[getActiveTheme()] || BADMINTON_STREAM_URLS;
    }

    function getThemeForCourt(court) {
        return Object.prototype.hasOwnProperty.call(FIFA_ASEAN_CUP_2026_STREAM_URLS, court)
            ? 'fifaAseanCup2026'
            : 'badminton';
    }

    function hasStreamUrl(court) {
        const streamUrls = STREAM_URLS_BY_THEME[getThemeForCourt(court)] || BADMINTON_STREAM_URLS;
        return typeof streamUrls[court] === 'string' && streamUrls[court].trim() !== '';
    }

    function isVisibleCourtForTheme(court) {
        return getThemeForCourt(court) === 'fifaAseanCup2026'
            ? Object.prototype.hasOwnProperty.call(FIFA_ASEAN_CUP_2026_STREAM_URLS, court)
            : hasStreamUrl(court);
    }

    function getFirstAvailableCourt() {
        const firstButton = Array.from(document.querySelectorAll('.court-btn'))
            .find(function (button) {
                return getThemeForCourt(button.dataset.court) === activeTheme && hasStreamUrl(button.dataset.court);
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

    function activateDevtoolProtection() {
        document.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        });
        document.addEventListener('keydown', function (event) {
            const key = String(event.key || '').toLowerCase();
            const inspectShortcut = key === 'f12' ||
                (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
                ((event.ctrlKey || event.metaKey) && key === 'u') ||
                (event.metaKey && event.altKey && key === 'i');
            if (inspectShortcut) {
                event.preventDefault();
                hancurkanVideo();
                window.location.replace('about:blank');
            }
        });

        if (typeof window.DisableDevtool === 'function') {
            window.DisableDevtool({
                disableMenu: true,
                clearLog: true,
                url: 'about:blank',
                ondevtoolopen: function () {
                    hancurkanVideo();
                    window.location.replace('about:blank');
                }
            });
        }
    }

    activateDevtoolProtection();

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

    function loadCbox() {
        const frame = document.getElementById('cboxFrame');
        const placeholder = document.getElementById('cboxPlaceholder');
        if (!frame || !placeholder || !CBOX_EMBED_URL.trim()) return;
        if (!/^https:\/\//i.test(CBOX_EMBED_URL.trim())) {
            placeholder.textContent = 'URL Cbox harus menggunakan HTTPS.';
            return;
        }
        frame.src = CBOX_EMBED_URL.trim();
        frame.hidden = false;
        placeholder.hidden = true;
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
        const videoWrapper = video.closest('.video-wrapper');
        if (videoWrapper) videoWrapper.style.removeProperty('aspect-ratio');
        setActiveButton(court);
        setStatus('MEMUAT');

        destroyPlayers();
        const jwContainer = document.getElementById('jwplayer-container');
        jwContainer.hidden = true;
        video.hidden = false;
        video.removeAttribute('src');
        video.load();

        video.onplaying = function () { setStatus(''); };
        video.oncanplay = function () { setStatus(''); };

        try {
            const videoSrc = await getStreamUrl(court);
            if (isHdCourt(court) && !/\.m3u8(?:$|[?#])/i.test(videoSrc)) {
                setStatus('COURT HD MEMERLUKAN URL HLS (.M3U8)');
                return;
            }
            const isDash = videoSrc.includes('.mpd');

            if (isDash) {
    if (typeof dashjs !== 'undefined' && dashjs.supportsMediaSource()) {
        dashPlayer = dashjs.MediaPlayer().create();

        dashPlayer.setProtectionData({
            "org.w3.clearkey": {
                "clearkeys": {
                    "8zrPM47JRv2SGoX4cGNjmQ": "psGi6B_pQani79K8rQ0VMg"
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
        activeTheme = getThemeForCourt(pendingCourt);
        removeSessionValue(HD_PENDING_COURT_KEY);
        unlockHdCourt(pendingCourt);
        loadVideo(pendingCourt);
        return true;
    }

    // Inisialisasi Event Listener
    initThemeSwitcher();
    document.getElementById('btnSaweria').addEventListener('click', function () {
        window.open('https://saweria.co/Shuttleflash', '_blank', 'noopener');
    });
    document.getElementById('btnTutorial').addEventListener('click', toggleSaweriaTutorial);
    document.querySelectorAll('.event-banner[data-theme]').forEach(function (banner) {
        banner.addEventListener('click', function () {
            activeTheme = banner.dataset.theme;
        });
    });
    window.addEventListener('shuttleflash:prepare-tv', function () {
        setActiveButton('');
        setStatus('');
        destroyPlayers();
        const video = document.getElementById('video');
        const jwContainer = document.getElementById('jwplayer-container');
        if (jwContainer) jwContainer.hidden = true;
        if (video) {
            video.hidden = false;
            video.pause();
            video.removeAttribute('src');
            video.load();
        }
    });
    document.querySelectorAll('.court-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            activeTheme = getThemeForCourt(this.dataset.court);
            window.dispatchEvent(new CustomEvent('shuttleflash:stop-tv'));
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
