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

    // Jika BUKAN perangkat mobile (artinya dibuka dari Laptop/Komputer)
    if (!isMobileDevice()) {
        // Hentikan eksekusi atau kosongkan halaman/tampilkan pesan blokir
        document.addEventListener("DOMContentLoaded", function () {
            const statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.textContent = "AKSES KHUSUS PERANGKAT MOBILE (ANDROID & IOS)";
            }
            const videoEl = document.getElementById('video');
            if (videoEl) {
                videoEl.remove(); // Menghapus elemen video agar bersih dari DOM komputer
            }
        });
        return; // Menghentikan seluruh skrip agar link stream tidak pernah direquest ke server
    }

    const STREAM_URLS = {
        court1: "https://052d33b4b506ff051775da149c5848eb.v.smtcdns.net/play.cbalive.weibisai.com/live/4290270400120061_AiHD.m3u8?txSecret=607bbbc579307252de0fbb447e32d831&txTime=6A87CD40",
        court2: "https://052d33b4b506ff051775da149c5848eb.v.smtcdns.net/play.cbalive.weibisai.com/live/4290270557898061_AiHD.m3u8?txSecret=a51c1cd29d53e8feb2cbad6b01818526&txTime=6A87CD40",
        court3: "https://052d33b4b506ff051775da149c5848eb.v.smtcdns.net/play.cbalive.weibisai.com/live/4290270672511061_AiHD.m3u8?txSecret=723ebccf3a27b3f0fb52c15363016c30&txTime=6A87CD40",
        court4: "https://052d33b4b506ff051775da149c5848eb.v.smtcdns.net/play.cbalive.weibisai.com/live/4290270823711061_AiHD.m3u8?txSecret=da888055a8c121264f886034ade92263&txTime=6A87CD40",
        court1hd: "https://dmd-v-fifajs-native-major-hb.youku.com/67756D6080932713CFC02204E/03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa_jieshuo__YMQ-Court1HB_sjb5m.m3u8?title=8216427&ver=1.0.0&uid=0&log_type=log_type&aliyun_uuid=2QPNIQdCIkACAZ1V0nstm3qc&cdnQuality=h265-abr&quality=2&multi_raw_stream=YMQ-Court1HB&ccode=live05030101&expire=21600&psid=B76FCA7A9D6D99353F1E67AA7FF00AED&ups_client_netip=216.243.116.77&ups_ts=1787205040&ups_userid=0&utid=2QPNIQdCIkACAZ1V0nstm3qc&vid=8216427_8137684&fn=03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa&vkey=Bbf59d648aea8e03893ef547eda06b915&cug=10&t=44a55994b83c9fa",
        court2hd: "https://dmd-v-fifajs-native-major-hb.youku.com/67756D6080932713CFC02204E/03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa_jieshuo__YMQ-Court2HB_sjb5m.m3u8?title=8216428&ver=1.0.0&uid=0&log_type=log_type&aliyun_uuid=2QPNIQdCIkACAZ1V0nstm3qc&cdnQuality=h265-abr&quality=2&multi_raw_stream=YMQ-Court2HB&ccode=live05030101&expire=21600&psid=E5D809932F13C3B16CBBF24E2C1907FD&ups_client_netip=216.243.116.77&ups_ts=1787205294&ups_userid=0&utid=2QPNIQdCIkACAZ1V0nstm3qc&vid=8216428_8137685&fn=03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa&vkey=B82063a157897c2dda57102e15ed4665e&cug=10&t=4410f7ce2635c19",
        court3hd: "https://dmd-v-fifajs-native-major-hb.youku.com/67756D6080932713CFC02204E/03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa_jieshuo__YMQ-Court3HB_sjb5m.m3u8?title=8216429&ver=1.0.0&uid=0&log_type=log_type&aliyun_uuid=2QPNIQdCIkACAZ1V0nstm3qc&cdnQuality=h265-abr&quality=2&multi_raw_stream=YMQ-Court3HB&ccode=live05030101&expire=21600&psid=C8586C3CED9B34401C435AE445CB4547&ups_client_netip=216.243.116.77&ups_ts=1787205383&ups_userid=0&utid=2QPNIQdCIkACAZ1V0nstm3qc&vid=8216429_8137686&fn=03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa&vkey=B0af61ce5a9a705f1346c610c22f9859a&cug=10&t=40d70f398c8b220",
        court4hd: "https://dmd-v-fifajs-native-major-hb.youku.com/67756D6080932713CFC02204E/03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa_jieshuo__YMQ-Court4HB_sjb5m.m3u8?title=8216430&ver=1.0.0&uid=0&log_type=log_type&aliyun_uuid=2QPNIQdCIkACAZ1V0nstm3qc&cdnQuality=h265-abr&quality=2&multi_raw_stream=YMQ-Court4HB&ccode=live05030101&expire=21600&psid=C37847F92C0FDAB79D98CBEC07EF6553&ups_client_netip=216.243.116.77&ups_ts=1787205599&ups_userid=0&utid=2QPNIQdCIkACAZ1V0nstm3qc&vid=8216430_8137687&fn=03000700005FC8D27A3229D2F2B8944FBAFF26-37D1-4CEC-99D0-BADBBFEA7560--fifa&vkey=B79c8222fb536465ae120e3b5fc21b851&cug=10&t=421fdbd71bc268a"
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
        const streamUrl = STREAM_URLS[court];
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
        if (!pendingCourt || !STREAM_URLS[pendingCourt]) {
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
    loadSchedule();
    window.addEventListener('pageshow', resumePendingHdCourt);
    if (!resumePendingHdCourt()) {
        loadVideo('court1');
    }
})();
