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
        court1: "https://cdn-vl-gcp-bornan-e-01.vos360.video/Content/LiveEvent/42ef9c34-2ae5-4b11-b6dc-f3a5378a582d/HLS_ENC/index.m3u8",
        court2: "",
        court3: "",
        court4: "",
        court1alt: "https://live1.quickscoreboardz.com/live/channel61.m3u8?wsSecret=c43eac440d751b11f68edad8ac7396d4&wsABSTime=1790690286",
        court2alt: "",
        court3alt: "",
        court4alt: "",
        court1hd: "https://tglmp01.akamaized.net/out/v1/d43dbc5da1334ec088ed9eb5796eee7c/manifest.mpd",
        court2hd: "",
        court3hd: "",
        court4hd: ""
    };

    // Isi dengan Player Library URL milik Anda dari dashboard JW Player.
    // Untuk cloud-hosted, URL library sudah membawa lisensi player.
    // Untuk self-hosted, isi juga JWPLAYER_LICENSE_KEY milik Anda.
    const JWPLAYER_LIBRARY_URL = '//ssl.p.jwpcdn.com/player/v/8.21.0/jwplayer.js';
    const JWPLAYER_LICENSE_KEY = 'XSuP4qMl+9tK17QNb+4+th2Pm9AWgMO/cYH8CI0HGGr7bdjo';
    // Isi URL HD dan ClearKey resmi masing-masing court bila berbeda.
    const JWPLAYER_HD_CONFIG = {
        court1hd: { keyId: 'f33acf338ec946fd921a85f870636399', key: 'a6c1a2e81fe941a9e2efd2bcad0d1532' },
        court2hd: { keyId: '', key: '' },
        court3hd: { keyId: '', key: '' },
        court4hd: { keyId: '', key: '' }
    };

    const STREAM_URLS_BY_THEME = {
        badminton: BADMINTON_STREAM_URLS
    };

    const SAWERIA_URL = 'https://saweria.co/Shuttleflash';
    const HD_PENDING_COURT_KEY = 'shuttleflash_pending_hd_court';
    const HD_UNLOCK_PREFIX = 'shuttleflash_hd_unlocked_';
    // Tempel URL iframe dari halaman Publish di akun Cbox Anda.
    const CBOX_EMBED_URL = 'https://www5.cbox.ws/box/?boxid=967352&boxtag=5YPSFc';

    let hls = null;
    let dashPlayer = null;
    let jwPlayerInstance = null;
    let jwPlayerLoadPromise = null;

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
            }
        });

        if (typeof window.DisableDevtool === 'function') {
            window.DisableDevtool({
                disableMenu: true,
                clearLog: true,
                url: 'about:blank',
                ondevtoolopen: function (type, next) {
                    hancurkanVideo();
                    if (typeof next === 'function') {
                        next();
                    } else {
                        window.location.replace('about:blank');
                    }
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

    function loadJwPlayerLibrary() {
        if (typeof window.jwplayer === 'function') return Promise.resolve();
        if (!JWPLAYER_LIBRARY_URL) {
            return Promise.reject(new Error('ISI JWPLAYER_LIBRARY_URL MILIK ANDA DI public/app.js'));
        }
        if (!jwPlayerLoadPromise) {
            jwPlayerLoadPromise = new Promise(function (resolve, reject) {
                const script = document.createElement('script');
                script.src = JWPLAYER_LIBRARY_URL;
                script.async = true;
                script.onload = function () {
                    if (typeof window.jwplayer !== 'function') {
                        reject(new Error('LIBRARY JW PLAYER TIDAK VALID'));
                        return;
                    }
                    if (JWPLAYER_LICENSE_KEY) {
                        window.jwplayer.key = JWPLAYER_LICENSE_KEY;
                    }
                    resolve();
                };
                script.onerror = function () {
                    jwPlayerLoadPromise = null;
                    reject(new Error('GAGAL MEMUAT LIBRARY JW PLAYER'));
                };
                document.head.appendChild(script);
            });
        }
        return jwPlayerLoadPromise;
    }

    async function loadHdWithJwPlayer(court, videoSrc) {
        const drmConfig = JWPLAYER_HD_CONFIG[court];
        const source = {
            file: videoSrc,
            type: videoSrc.includes('.mpd') ? 'dash' : 'hls'
        };
        if (source.type === 'dash') {
            if (!drmConfig || !drmConfig.keyId || !drmConfig.key) {
                throw new Error('ISI KID DAN CLEARKEY RESMI UNTUK ' + court.toUpperCase() + ' DI public/app.js');
            }
            source.drm = {
                clearkey: {
                    keyId: drmConfig.keyId,
                    key: drmConfig.key
                }
            };
        }
        await loadJwPlayerLibrary();
        const jwContainer = document.getElementById('jwplayer-container');
        jwContainer.hidden = false;
        jwPlayerInstance = window.jwplayer('jwplayer-container').setup({
            playlist: [{
                sources: [source]
            }],
            width: '100%',
            height: '100%',
            aspectratio: '16:9',
            autostart: true,
            mute: true
        });
        jwPlayerInstance.on('ready', function () { setStatus(''); });
        jwPlayerInstance.on('play', function () { setStatus(''); });
        jwPlayerInstance.on('error', function (event) {
            console.error('Detail Error JW Player:', event);
            setStatus('GAGAL JW PLAYER: ' + (event.message || 'Error'));
        });
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
        if (jwPlayerInstance) {
            jwPlayerInstance.remove();
            jwPlayerInstance = null;
        }
    }

    async function loadVideo(court) {
        const video = document.getElementById('video');
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
            const isDash = videoSrc.includes('.mpd');

            if (isHdCourt(court)) {
                video.hidden = true;
                await loadHdWithJwPlayer(court, videoSrc);
                return;
            }

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
