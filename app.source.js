// Membungkus seluruh aplikasi ke dalam IIFE agar fungsi internal tidak terbaca dari global console
(function () {
    // Fungsi untuk mendeteksi apakah pengguna menggunakan perangkat Mobile (Android/iOS)
    function isMobileDevice() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;

        // Deteksi perangkat iOS (iPhone, iPad, iPod) atau Android
        const isIOS = /android|iphone|ipad|ipod/i.test(ua.toLowerCase());

        // Deteksi tambahan untuk iPadOS (karena terkadang terbaca sebagai Mac desktop)
        const isMacTablet = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

        return isIOS || isMacTablet;
    }

    const STREAM_URLS = {
        court1: "https://0713546501eefc1afcb0b54d64dcb5b8.v.smtcdns.net/play.cbalive.weibisai.com/live/4305631782905061_AiHD.m3u8?txSecret=4cb51243ac3fa73b0466fedfd10dd923&txTime=6A989C60",
        court2: "https://0713546501eefc1afcb0b54d64dcb5b8.v.smtcdns.net/play.cbalive.weibisai.com/live/4305632772373061_AiHD.m3u8?txSecret=f70b50ab08bf840e56277dbb4ca9a41b&txTime=6A989C60",
        court3: "https://2a6096f50ffc05c7c7766fbd1358fce6.v.smtcdns.net/play.cbalive.weibisai.com/live/4305632882467061_AiHD.m3u8?txSecret=061cc159332b53426283a240fa33c628&txTime=6A989C60",
        court4: "",
        court1hd: "https://dmd-v-fifajs-native-major-hb.youku.com/67756D6080932713CFC02204E/03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa_jieshuo__YMQ-Court1HB_sjb5m.m3u8?title=8217169&ver=1.0.0&uid=0&log_type=log_type&aliyun_uuid=2QPNIQdCIkACAZ1V0nstm3qc&cdnQuality=h265-abr&quality=2&multi_raw_stream=YMQ-Court1HB&ccode=live05030101&expire=21600&psid=ADD484B325BAED368023BCFC4EA32925&ups_client_netip=180.245.117.252&ups_ts=1788335398&ups_userid=0&utid=2QPNIQdCIkACAZ1V0nstm3qc&vid=8217169_8138341&fn=03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa&vkey=B4a0030908ebfebec521856dbb690336d&cug=10&t=4f186de7a13faa3",
        court2hd: "https://dmd-v-fifajs-native-major-hb.youku.com/67756D6080932713CFC02204E/03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa_jieshuo__YMQ-Court2HB_sjb5m.m3u8?title=8217180&ver=1.0.0&uid=0&log_type=log_type&aliyun_uuid=2QPNIQdCIkACAZ1V0nstm3qc&cdnQuality=h265-abr&quality=2&multi_raw_stream=YMQ-Court2HB&ccode=live05030101&expire=21600&psid=A48D38FCD7D9CFC46CB55D0197D88A1B&ups_client_netip=180.245.117.252&ups_ts=1788335489&ups_userid=0&utid=2QPNIQdCIkACAZ1V0nstm3qc&vid=8217180_8138347&fn=03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa&vkey=B8e421bf077b4e39d68cec1f1737c5ea7&cug=10&t=45e6fec54ec0225",
        court3hd: "https://dmd-v-fifajs-native-major-hb.youku.com/67756D6080932713CFC02204E/03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa_jieshuo__YMQ-Court3HB_sjb5m.m3u8?title=8217182&ver=1.0.0&uid=0&log_type=log_type&aliyun_uuid=2QPNIQdCIkACAZ1V0nstm3qc&cdnQuality=h265-abr&quality=2&multi_raw_stream=YMQ-Court3HB&ccode=live05030101&expire=21600&psid=9324771572C7365DF4E8DDD07E91792F&ups_client_netip=180.245.117.252&ups_ts=1788335538&ups_userid=0&utid=2QPNIQdCIkACAZ1V0nstm3qc&vid=8217182_8138349&fn=03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa&vkey=B4eb86ad5cdca279ceaab757d96887b6c&cug=10&t=4a4fa03cc3d6a0b",
        court4hd: ""
    };
    const SAWERIA_URL = 'https://saweria.co/Shuttleflash';
    const HD_PENDING_COURT_KEY = 'shuttleflash_pending_hd_court';
    const HD_UNLOCK_PREFIX = 'shuttleflash_hd_unlocked_';

    let hls;
    const hlsOptions = {
        maxMaxBufferLength: 30,
        manifestLoadingMaxRetry: 100,
        manifestLoadingRetryDelay: 1000,
        levelLoadingMaxRetry: 100,
        fragLoadingMaxRetry: 100
    };

    function setStatus(message) {
        document.getElementById('status').textContent = message || '';
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

    function isHdCourt(court) {
        return typeof court === 'string' && court.endsWith('hd');
    }

    function hasStreamUrl(court) {
        return typeof STREAM_URLS[court] === 'string' && STREAM_URLS[court].trim() !== '';
    }

    function getFirstAvailableCourt() {
        const firstButton = Array.from(document.querySelectorAll('.court-btn'))
            .find(function (button) {
                return hasStreamUrl(button.dataset.court);
            });
        return firstButton ? firstButton.dataset.court : null;
    }

    function syncCourtButtons() {
        document.querySelectorAll('.court-btn').forEach(function (button) {
            button.hidden = !hasStreamUrl(button.dataset.court);
        });
    }

    // Jika BUKAN perangkat mobile, tombol court tetap disesuaikan tetapi video tidak dimuat.
    if (!isMobileDevice()) {
        document.addEventListener("DOMContentLoaded", function () {
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
        try {
            const response = await fetch(`schedule.json`, { cache: 'no-store' });
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
        const streamUrl = hasStreamUrl(court) ? STREAM_URLS[court].trim() : '';
        if (!streamUrl) {
            throw new Error('STREAM BELUM TERSEDIA');
        }
        return streamUrl;
    }

    async function loadVideo(court) {
        const video = document.getElementById('video');
        setActiveButton(court);
        setStatus('MEMUAT');
        if (hls) {
            hls.destroy();
            hls = null;
        }
        video.removeAttribute('src');
        video.load();
        video.onplaying = function () { setStatus(''); };
        video.oncanplay = function () { setStatus(''); };

        try {
            const videoSrc = await getStreamUrl(court);
            if (Hls.isSupported()) {
                hls = new Hls(hlsOptions);
                hls.loadSource(videoSrc);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('');
                    video.play().catch(function (e) { console.clear(); });
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
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoSrc;
                video.addEventListener('loadedmetadata', function () {
                    setStatus('');
                    video.play().catch(function (e) { console.clear(); });
                }, { once: true });
            } else {
                setStatus('BROWSER TIDAK MENDUKUNG HLS');
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
        if (hls) {
            hls.destroy();
            hls = null;
        }
        video.pause();
        video.removeAttribute('src');
        video.load();
    }

    // Proteksi 1: Deteksi loop dengan debugger. Jika DevTools terbuka, waktu eksekusi melambat
    setInterval(function () {
        const start = new Date().getTime();
        debugger;
        const end = new Date().getTime();
        if (end - start > 100) {
            hancurkanVideo();
        }
    }, 1000);

    // Proteksi 2: Deteksi perubahan resolusi viewport drastis akibat dok DevTools terlepas
    window.addEventListener('resize', function () {
        const threshold = 160;
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {
            hancurkanVideo();
        }
    });

    // Proteksi 3: Blokir klik kanan secara langsung
    document.addEventListener('contextmenu', event => event.preventDefault());

    // Proteksi 4: Blokir kombinasi tombol keyboard pemicu DevTools (F12, Ctrl+Shift+I, dll)
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

    // Inisialisasi Event Listener Klien
    document.getElementById('btnSaweria').addEventListener('click', function () {
        window.open('https://saweria.co/Shuttleflash', '_blank', 'noopener');
    });
    document.getElementById('btnTutorial').addEventListener('click', toggleSaweriaTutorial);

    document.querySelectorAll('.court-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            selectCourt(this.dataset.court);
        });
    });

    // Load awal program utama
    syncCourtButtons();
    loadSchedule();
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
