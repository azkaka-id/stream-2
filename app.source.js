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
        court1: "https://052d33b4b506ff051775da149c5848eb.v.smtcdns.net/play.cbalive.weibisai.com/live/4290265445561061_AiSD.m3u8?txSecret=5f74c88b1f5fa4b647fbb97920cfcbd6&txTime=6A84F200",
        court2: "https://052d33b4b506ff051775da149c5848eb.v.smtcdns.net/play.cbalive.weibisai.com/live/4290265765127061_AiSD.m3u8?txSecret=e38fc74a4bf7128e6638c7fa18478387&txTime=6A84F200",
        court3: "https://052d33b4b506ff051775da149c5848eb.v.smtcdns.net/play.cbalive.weibisai.com/live/4290265949646061_AiSD.m3u8?txSecret=766c13bb20f570c3a229db305dc82e3f&txTime=6A84F200",
        court4: "https://052d33b4b506ff051775da149c5848eb.v.smtcdns.net/play.cbalive.weibisai.com/live/4290266123993061_AiSD.m3u8?txSecret=050bb2f18b9246f5a5cd9e10a5b234f9&txTime=6A84F200"
    };

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
            loadVideo(this.dataset.court);
        });
    });

    // Load awal program utama
    loadSchedule();
    loadVideo('court1');
})();
