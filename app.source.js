// Membungkus seluruh aplikasi ke dalam IIFE agar fungsi internal tidak terbaca dari global console
(function () {
    // Fungsi untuk mendeteksi apakah pengguna menggunakan perangkat Mobile (Android/iOS)
    function isMobileDevice() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        const isIOS = /android|iphone|ipad|ipod/i.test(ua.toLowerCase());
        const isMacTablet = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        return isIOS || isMacTablet;
    }

    const STREAM_URLS_BY_THEME = {
    "badminton": {
        "court1": "https://mobilelive-test.ysp.cctv.cn/ysp/2050856001_hd.m3u8",
        "court1alt": "https://052d33b4b506ff051775da149c5848eb.v.smtcdns.net/quickmobilelive-play.ysp.cctv.cn/ysp/2050856001.m3u8",
        "court1hd": "https://dmd-v-fifajs-native-major-hb.youku.com/67756D6080932713CFC02204E/03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa_jieshuo__YMQ-Court1HB_sjb5m.m3u8?title=8220143&ver=1.0.0&uid=0&log_type=log_type&aliyun_uuid=E%2F1MI4j7tCQCAZk8gHAV1jtJ&cdnQuality=h265-abr&quality=2&multi_raw_stream=YMQ-Court1HB&ccode=live05030101&expire=21600&psid=F196BB66003473FEDA706BFFC6F12DEE&ups_client_netip=36.75.155.150&ups_ts=1793688786&ups_userid=0&utid=E%2F1MI4j7tCQCAZk8gHAV1jtJ&vid=8220143_8140741&fn=03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa&vkey=B7e9be3265fbf76f2a2dbe964e2f19770&cug=10&t=f4b1ed37ad0d51c",
        "court2": "https://052d33b4b506ff051775da149c5848eb.v.smtcdns.net/quickmobilelive-play.ysp.cctv.cn/ysp/2050856101.m3u8",
        "court2alt": "https://mobilelive-test.ysp.cctv.cn/ysp/2050856101_hd.m3u8",
        "court2hd": "https://dmd-v-fifajs-native-major-hb.youku.com/67756D6080932713CFC02204E/03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa_jieshuo__YMQ-Court2HB_sjb5m.m3u8?title=8220144&ver=1.0.0&uid=0&log_type=log_type&aliyun_uuid=E%2F1MI4j7tCQCAZk8gHAV1jtJ&cdnQuality=h265-abr&quality=2&multi_raw_stream=YMQ-Court2HB&ccode=live05030101&expire=21600&psid=1B6C3CC53D2D42FAB98A3342D5B89B48&ups_client_netip=36.75.155.150&ups_ts=1793689052&ups_userid=0&utid=E%2F1MI4j7tCQCAZk8gHAV1jtJ&vid=8220144_8140742&fn=03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa&vkey=B7f46421b15624b790c67d59893bca896&cug=10&t=ff871406f711c76",
        "court3": "https://052d33b4b506ff051775da149c5848eb.v.smtcdns.net/quickmobilelive-play.ysp.cctv.cn/ysp/2050856201.m3u8",
        "court3alt": "https://mobilelive-test.ysp.cctv.cn/ysp/2050856201_hd.m3u8",
        "court3hd": "https://dmd-v-fifajs-native-major-hb.youku.com/67756D6080932713CFC02204E/03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa_jieshuo__YMQ-Court3HB_sjb5m.m3u8?title=8220145&ver=1.0.0&uid=0&log_type=log_type&aliyun_uuid=E%2F1MI4j7tCQCAZk8gHAV1jtJ&cdnQuality=h265-abr&quality=2&multi_raw_stream=YMQ-Court3HB&ccode=live05030101&expire=21600&psid=F4D642556C78E52BE96D908CC772556E&ups_client_netip=36.75.155.150&ups_ts=1793689103&ups_userid=0&utid=E%2F1MI4j7tCQCAZk8gHAV1jtJ&vid=8220145_8140743&fn=03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa&vkey=B43aeee51ea615dd01f2757d724e4e419&cug=10&t=f3d2f1a15bee9ef",
        "court4": "https://052d33b4b506ff051775da149c5848eb.v.smtcdns.net/quickmobilelive-play.ysp.cctv.cn/ysp/2050856301.m3u8",
        "court4alt": "https://mobilelive-test.ysp.cctv.cn/ysp/2050856301.m3u8",
        "court4hd": "https://dmd-v-fifajs-native-major-hb.youku.com/67756D6080932713CFC02204E/03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa_jieshuo__YMQ-Court4HB_sjb5m.m3u8?title=8220146&ver=1.0.0&uid=0&log_type=log_type&aliyun_uuid=E%2F1MI4j7tCQCAZk8gHAV1jtJ&cdnQuality=h265-abr&quality=2&multi_raw_stream=YMQ-Court4HB&ccode=live05030101&expire=21600&psid=86BD38C812D6B1BFF7CDDF7BE7659D4A&ups_client_netip=36.75.155.150&ups_ts=1793689139&ups_userid=0&utid=E%2F1MI4j7tCQCAZk8gHAV1jtJ&vid=8220146_8140744&fn=03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa&vkey=B97e9c7607d7af262c877772e64feec30&cug=10&t=ffa35ff514e1116"
    },
    "fifaAseanCup2026": {
        "footballS1": "",
        "footballS2": "",
        "footballS3": ""
    }
};
    const THEME_BY_COURT = {};
    let liveEvents = [];
    let activeTheme = '';

    const SAWERIA_URL = 'https://saweria.co/Shuttleflash';
    const HD_PENDING_COURT_KEY = 'shuttleflash_pending_hd_court';
    const HD_UNLOCK_PREFIX = 'shuttleflash_hd_unlocked_';
    let hasResumedCourt = false;
    let currentLoadedCourt = '';
    const LIVE_EVENTS_URL = new URL('live-events.json', document.currentScript && document.currentScript.src ? document.currentScript.src : window.location.href);
    // Tempel URL iframe dari halaman Publish di akun Cbox Anda.
    const CBOX_EMBED_URL = 'https://www5.cbox.ws/box/?boxid=967352&boxtag=5YPSFc';

    async function loadLiveEvents() {
        const response = await fetch(LIVE_EVENTS_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('HTTP ' + response.status + ' saat memuat live-events.json');
        const data = await response.json();
        if (!data || !Array.isArray(data.events)) throw new Error('Format live-events.json tidak valid');
        liveEvents = data.events;
        liveEvents.forEach(function (event) {
            (event.streams || []).forEach(function (stream) {
                if (stream.id) THEME_BY_COURT[stream.id] = event.id;
            });
        });
        activeTheme = ((liveEvents.find(function (event) { return hasThemeStream(event.id); }) || liveEvents[0]) || {}).id || '';
        renderLiveEvents();
    }

    function renderLiveEvents() {
        const list = document.getElementById('liveEventsList');
        if (!list) return;
        list.replaceChildren();
        liveEvents.forEach(function (event) {
            const card = document.createElement('section');
            card.className = 'event-card';
            card.hidden = !hasThemeStream(event.id);
            const panelId = 'event-streams-' + event.id;
            const banner = document.createElement('button');
            banner.type = 'button'; banner.className = 'event-banner';
            banner.setAttribute('aria-expanded', 'false'); banner.setAttribute('aria-controls', panelId);
            banner.dataset.expandTarget = panelId; banner.dataset.theme = event.id;
            const logo = document.createElement('span'); logo.className = 'event-logo';
            logo.append(document.createTextNode(event.icon || '🏟️'));
            const smallLogo = document.createElement('small');
            smallLogo.textContent = (event.logoText || '').replace(/\\n/g, '\n');
            logo.append(smallLogo);
            const heading = document.createElement('span');
            const title = document.createElement('b'); title.textContent = event.title || event.id;
            const category = document.createElement('small'); category.textContent = event.category || '';
            heading.append(title, category);
            const ornament = document.createElement('span'); ornament.className = 'event-shuttle'; ornament.textContent = '◈';
            const chevron = document.createElement('span'); chevron.className = 'event-chevron'; chevron.style.transform = 'rotate(180deg)'; chevron.textContent = '⌃';
            banner.append(logo, heading, ornament, chevron);
            const isFootball = (event.category || '').toLowerCase() === 'football' || event.id === 'fifaAseanCup2026';
            const panel = document.createElement('div');
            panel.className = 'court-list' + (isFootball ? ' football-court' : '');
            panel.id = panelId;
            panel.hidden = true;
            (event.streams || []).forEach(function (stream) {
                const isHd = isHdCourt(stream.id);
                const isAlt = isAltCourt(stream.id);
                const courtType = isHd ? 'hd' : (isAlt ? 'alt' : 'main');

                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'court-btn court-btn-' + courtType;
                button.dataset.court = stream.id;
                button.dataset.courtType = courtType;
                button.setAttribute('aria-label', 'Pilih siaran ' + (event.title || event.id) + ' ' + (stream.name || stream.number || stream.id));

                const number = document.createElement('span');
                number.className = 'court-number';
                number.textContent = stream.number || 'LIVE';

                const info = document.createElement('span');
                info.className = 'court-info';
                const name = document.createElement('span');
                name.className = 'court-name';
                name.textContent = stream.name || stream.number || stream.id;

                const detail = document.createElement('span');
                detail.className = 'court-meta meta-' + courtType;
                if (isHd) {
                    detail.textContent = 'HD';
                } else if (isAlt) {
                    detail.textContent = 'ALT';
                } else {
                    detail.textContent = isFootball ? (stream.detail || 'LIVE') : 'SD';
                }

                info.append(name, detail);
                const status = document.createElement('span');
                status.className = 'court-status';
                status.setAttribute('aria-hidden', 'true');

                button.append(number, info, status);
                panel.append(button);
            });
            card.append(banner, panel); list.append(card);
        });
        if (currentLoadedCourt) {
            expandEventPanelForCourt(currentLoadedCourt);
        }
    }

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

    function getStoredPendingHdCourt() {
        try {
            const localVal = localStorage.getItem(HD_PENDING_COURT_KEY);
            if (localVal) return localVal.trim();
        } catch (error) {}
        try {
            const sessionVal = sessionStorage.getItem(HD_PENDING_COURT_KEY);
            if (sessionVal) return sessionVal.trim();
        } catch (error) {}
        return null;
    }

    function setStoredPendingHdCourt(court) {
        try {
            localStorage.setItem(HD_PENDING_COURT_KEY, court);
        } catch (error) {}
        try {
            sessionStorage.setItem(HD_PENDING_COURT_KEY, court);
        } catch (error) {}
    }

    function clearStoredPendingHdCourt() {
        try {
            localStorage.removeItem(HD_PENDING_COURT_KEY);
        } catch (error) {}
        try {
            sessionStorage.removeItem(HD_PENDING_COURT_KEY);
        } catch (error) {}
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
        return STREAM_URLS_BY_THEME[getActiveTheme()] || {};
    }

    function getThemeForCourt(court) {
        if (THEME_BY_COURT[court]) return THEME_BY_COURT[court];
        for (const theme in STREAM_URLS_BY_THEME) {
            if (STREAM_URLS_BY_THEME[theme] && typeof STREAM_URLS_BY_THEME[theme][court] === 'string' && STREAM_URLS_BY_THEME[theme][court].trim() !== '') {
                return theme;
            }
        }
        return '';
    }

    function hasStreamUrl(court) {
        const streamUrls = STREAM_URLS_BY_THEME[getThemeForCourt(court)] || {};
        return typeof streamUrls[court] === 'string' && streamUrls[court].trim() !== '';
    }

    function isVisibleCourtForTheme(court) {
        return hasStreamUrl(court);
    }

    function hasThemeStream(theme) {
        const streamUrls = STREAM_URLS_BY_THEME[theme] || {};
        return Object.keys(streamUrls).some(function (court) {
            return typeof streamUrls[court] === 'string' && streamUrls[court].trim() !== '';
        });
    }

    function getFirstAvailableCourt() {
        const firstButton = Array.from(document.querySelectorAll('.court-btn'))
            .find(function (button) {
                return getThemeForCourt(button.dataset.court) === activeTheme && hasStreamUrl(button.dataset.court);
            });
        return firstButton ? firstButton.dataset.court : null;
    }

    function syncCourtButtons() {
        document.querySelectorAll('.event-banner[data-theme]').forEach(function (banner) {
            const card = banner.closest('.event-card');
            if (card) card.hidden = !hasThemeStream(banner.dataset.theme);
        });
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
        return false;
    }

    function unlockHdCourt(court) {
        // Tidak menyimpan status unlock agar setiap klik court HD selalu mengarah ke Saweria
    }

    function redirectToSaweriaBeforeHd(court) {
        setStoredPendingHdCourt(court);
        setStatus('LOADING');
        window.location.href = SAWERIA_URL;
    }

    function expandEventPanelForCourt(court) {
        if (!court) return;
        const theme = getThemeForCourt(court);
        if (!theme) return;
        const banner = document.querySelector('.event-banner[data-theme="' + theme + '"]');
        if (!banner) return;
        const panelId = banner.dataset.expandTarget;
        const panel = panelId ? document.getElementById(panelId) : null;
        if (panel) {
            panel.hidden = false;
            banner.setAttribute('aria-expanded', 'true');
            const chevron = banner.querySelector('.event-chevron');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
        }
        setActiveButton(court);
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
        currentLoadedCourt = court;
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
        if (isHdCourt(court)) {
            redirectToSaweriaBeforeHd(court);
            return;
        }
        loadVideo(court);
    }

    function resumePendingHdCourt() {
        const pendingCourt = getStoredPendingHdCourt();
        if (!pendingCourt || !hasStreamUrl(pendingCourt)) {
            return false;
        }
        hasResumedCourt = true;
        clearStoredPendingHdCourt();
        activeTheme = getThemeForCourt(pendingCourt);
        expandEventPanelForCourt(pendingCourt);
        loadVideo(pendingCourt);
        return true;
    }

    // Inisialisasi Event Listener
    document.getElementById('btnSaweria').addEventListener('click', function () {
        window.open('https://saweria.co/Shuttleflash', '_blank', 'noopener');
    });
    document.getElementById('btnTutorial').addEventListener('click', toggleSaweriaTutorial);
    document.getElementById('liveEventsList').addEventListener('click', function (event) {
        const banner = event.target.closest('.event-banner[data-theme]');
        if (!banner) return;
        activeTheme = banner.dataset.theme;
        const panel = document.getElementById(banner.dataset.expandTarget);
        const expanded = banner.getAttribute('aria-expanded') !== 'true';
        banner.setAttribute('aria-expanded', String(expanded));
        panel.hidden = !expanded;
        banner.querySelector('.event-chevron').style.transform = expanded ? 'rotate(0deg)' : 'rotate(180deg)';
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
    document.getElementById('liveEventsList').addEventListener('click', function (event) {
        const btn = event.target.closest('.court-btn');
        if (!btn) return;
        activeTheme = getThemeForCourt(btn.dataset.court);
        window.dispatchEvent(new CustomEvent('shuttleflash:stop-tv'));
        selectCourt(btn.dataset.court);
    });

    window.addEventListener('pageshow', function () {
        if (getStoredPendingHdCourt()) {
            resumePendingHdCourt();
        }
    });
    resumePendingHdCourt();
    loadLiveEvents().then(function () {
        initThemeSwitcher();
        if (hasResumedCourt) {
            if (currentLoadedCourt) {
                expandEventPanelForCourt(currentLoadedCourt);
            }
            return;
        }
        if (!resumePendingHdCourt()) {
            const firstCourt = getFirstAvailableCourt();
            if (firstCourt) loadVideo(firstCourt);
            else setStatus('STREAM BELUM TERSEDIA');
        }
    }).catch(function (error) {
        console.error('Gagal memuat konfigurasi live event:', error);
        setStatus('GAGAL MEMUAT LIVE EVENT (' + error.message + ')');
    });
})();
