(function () {
    const channelList = document.getElementById('tvChannelList');
    const playlistStatus = document.getElementById('tvPlaylistStatus');
    const video = document.getElementById('video');
    const playerStatus = document.getElementById('tvPlayerStatus');
    const jwContainer = document.getElementById('jwplayer-container');
    if (!channelList || !playlistStatus || !video || !jwContainer) return;

    function isMobileDevice() {
        const ua = navigator.userAgent || navigator.vendor || window.opera || '';
        const phoneOrTablet = /android|iphone|ipad|ipod/i.test(ua.toLowerCase());
        const ipadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        return phoneOrTablet || ipadOs;
    }

    if (!isMobileDevice()) {
        playlistStatus.textContent = 'Live TV hanya dapat diputar di perangkat Android dan iOS.';
        channelList.replaceChildren();
        return;
    }

    const jwLibraryUrl = '//ssl.p.jwpcdn.com/player/v/8.21.0/jwplayer.js';
    const jwLicenseKey = 'XSuP4qMl+9tK17QNb+4+th2Pm9AWgMO/cYH8CI0HGGr7bdjo';

    let jwPlayer = null;
    let jwLoadPromise = null;
    let channels = [];
    let playbackAttempt = 0;

    // Konfigurasi channel Live TV ada di sini. Field `options` setara dengan
    // #EXTVLCOPT dan `kodi` setara dengan #KODIPROP pada playlist M3U.
    // Catatan: semua nilai di file public dapat dilihat pengunjung situs.
    const LIVE_TV_CHANNELS = [
         {
             name: 'Asian Games 2026 1',
             group: 'Sports Channels',
             logo: 'https://shorter.me/zXW9J',
             url: 'https://tglmp03.akamaized.net/out/v1/7cfe6d15c127407588568af9f4574a21/manifest.mpd',
            // options: {
            //   'http-user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:155.0) Gecko/20100101 Firefox/155.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0',
            //     'http-referrer': 'https://m.rctiplus.com/'
            // },
             kodi: {
                 'inputstream.adaptive.manifest_type': 'mpd',
                 'inputstream.adaptive.license_type': 'clearkey',
                 'inputstream.adaptive.license_key': '1a83ee088e5343d095ac7f4d8d3cd945:dc0da9fdfae3c69c322b67db207a87a1'
             }
         },
         {
             name: 'Asian Games 2026 2',
             group: 'Sports Channels',
             logo: 'https://shorter.me/zXW9J',
             url: 'https://tglmp01.akamaized.net/out/v1/5fa3fdc8720b4317b14df756e81b78c1/manifest.mpd',
            // options: {
            //   'http-user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:155.0) Gecko/20100101 Firefox/155.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0',
            //     'http-referrer': 'https://m.rctiplus.com/'
            // },
             kodi: {
                 'inputstream.adaptive.manifest_type': 'mpd',
                 'inputstream.adaptive.license_type': 'clearkey',
                 'inputstream.adaptive.license_key': '6c9c38c2de3f41afa12f9872ad6c3903:d6f5a6750b32d2addec0c98fff14de9d'
             }
         },
         {
             name: 'Asian Games 2026 3',
             group: 'Sports Channels',
             logo: 'https://shorter.me/zXW9J',
             url: 'https://tglmp02.akamaized.net/out/v1/2f39077458694b06bdfb15ef16f55d45/manifest.mpd',
            // options: {
            //   'http-user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:155.0) Gecko/20100101 Firefox/155.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0',
            //     'http-referrer': 'https://m.rctiplus.com/'
            // },
             kodi: {
                 'inputstream.adaptive.manifest_type': 'mpd',
                 'inputstream.adaptive.license_type': 'clearkey',
                 'inputstream.adaptive.license_key': '3da197d13d754505887a04aedd17922e:0028b47ca60594991910c6f6048c51a0'
             }
         },
         {
             name: 'Asian Games 2026 4',
             group: 'Sports Channels',
             logo: 'https://shorter.me/zXW9J',
             url: 'https://tglmp04.akamaized.net/out/v1/4604623e7ff4462a962275664ccd8ee5/manifest.mpd',
            // options: {
            //   'http-user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:155.0) Gecko/20100101 Firefox/155.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0',
            //     'http-referrer': 'https://m.rctiplus.com/'
            // },
             kodi: {
                 'inputstream.adaptive.manifest_type': 'mpd',
                 'inputstream.adaptive.license_type': 'clearkey',
                 'inputstream.adaptive.license_key': 'ea1f7f86732d47e897e38c3168851569:55b7ed4cc25fa476f6682c447af128d5'
             }
         },
         {
             name: 'Asian Games 2026 5',
             group: 'Sports Channels',
             logo: 'https://shorter.me/zXW9J',
             url: 'https://tglmp03.akamaized.net/out/v1/926637c1aba44cffa74adc74bf786816/manifest.mpd',
            // options: {
            //   'http-user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:155.0) Gecko/20100101 Firefox/155.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0',
            //     'http-referrer': 'https://m.rctiplus.com/'
            // },
             kodi: {
                 'inputstream.adaptive.manifest_type': 'mpd',
                 'inputstream.adaptive.license_type': 'clearkey',
                 'inputstream.adaptive.license_key': '93dccb38f8c84d448d5a7422eb44462b:af8f1c6acedc34551a82f3bb49adfdea'
             }
         },
         {
             name: 'Asian Games 2026 6',
             group: 'Sports Channels',
             logo: 'https://shorter.me/zXW9J',
             url: 'https://tglmp01.akamaized.net/out/v1/d43dbc5da1334ec088ed9eb5796eee7c/manifest.mpd',
            // options: {
            //   'http-user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:155.0) Gecko/20100101 Firefox/155.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0',
            //     'http-referrer': 'https://m.rctiplus.com/'
            // },
             kodi: {
                 'inputstream.adaptive.manifest_type': 'mpd',
                 'inputstream.adaptive.license_type': 'clearkey',
                 'inputstream.adaptive.license_key': 'f33acf338ec946fd921a85f870636399:a6c1a2e81fe941a9e2efd2bcad0d1532'
             }
         }
    ];

    function getClearKey(channel) {
        const type = channel.kodi['inputstream.adaptive.license_type'] || '';
        if (!/clearkey/i.test(type)) return null;
        const value = channel.kodi['inputstream.adaptive.license_key'] || '';
        const separator = value.indexOf(':');
        if (separator < 1) return null;
        const kid = value.slice(0, separator).replace(/-/g, '').toLowerCase();
        const key = value.slice(separator + 1).replace(/-/g, '').toLowerCase();
        if (!/^[a-f0-9]{32}$/.test(kid) || !/^[a-f0-9]{32}$/.test(key)) return null;
        return { kid: kid, key: key };
    }

    function isDashChannel(url, channel) {
        const manifestType = (channel.kodi['inputstream.adaptive.manifest_type'] || '').trim().toLowerCase();
        return /\.mpd(?:$|[?#])/i.test(url.href) || ['mpd', 'dash', 'application/dash+xml'].includes(manifestType) || Boolean(channel.kodi['inputstream.adaptive.license_type']);
    }

    function loadJwPlayer() {
        if (typeof window.jwplayer === 'function') {
            window.jwplayer.key = jwLicenseKey;
            return Promise.resolve();
        }
        if (!jwLoadPromise) {
            jwLoadPromise = new Promise(function (resolve, reject) {
                const script = document.createElement('script');
                script.src = jwLibraryUrl;
                script.async = true;
                script.onload = function () {
                    if (typeof window.jwplayer !== 'function') return reject(new Error('JW Player tidak termuat dengan benar.'));
                    window.jwplayer.key = jwLicenseKey;
                    resolve();
                };
                script.onerror = function () {
                    jwLoadPromise = null;
                    reject(new Error('Library JW Player gagal dimuat.'));
                };
                document.head.appendChild(script);
            });
        }
        return jwLoadPromise;
    }

    async function playWithJw(url, channel, preserveStatus, attempt) {
        const clearkey = getClearKey(channel);
        if (/clearkey/i.test(channel.kodi['inputstream.adaptive.license_type'] || '') && !clearkey) {
            throw new Error('Format ClearKey tidak valid. Periksa KID dan KEY resmi dari penyedia.');
        }
        await loadJwPlayer();
        if (attempt !== playbackAttempt) return;
        window.jwplayer.key = jwLicenseKey;
        video.hidden = true;
        jwContainer.hidden = false;
        const source = { file: url.href };
        if (isDashChannel(url, channel)) source.type = 'dash';
        else if (/\.m3u8(?:$|[?#])/i.test(url.href)) source.type = 'hls';
        if (clearkey) source.drm = { clearkey: { keyId: clearkey.kid, key: clearkey.key } };
        jwPlayer = window.jwplayer('jwplayer-container').setup({
            playlist: [{ sources: [source] }],
            width: '100%',
            height: '100%',
            aspectratio: '16:9',
            autostart: true,
            mute: true
        });
        jwPlayer.on('ready', function () { if (attempt === playbackAttempt && !preserveStatus) playerStatus.textContent = ''; });
        jwPlayer.on('meta', function (event) {
            if (attempt === playbackAttempt && event && event.width && event.height) {
                const playerWrapper = video.closest('.video-wrapper');
                if (playerWrapper) playerWrapper.style.aspectRatio = '16 / 9';
                if (typeof jwPlayer.setConfig === 'function') {
                    try {
                        jwPlayer.setConfig({
                            aspectratio: '16:9',
                            stretching: 'uniform'
                        });
                    } catch (error) { /* Keep the outer frame fitted if runtime config is unsupported. */ }
                }
            }
        });
        jwPlayer.on('error', function (event) {
            if (attempt !== playbackAttempt) return;
            const detail = event && (event.message || event.code) ? String(event.message || event.code) : '';
            const status = detail.match(/\b(401|403|404|5\d\d)\b/);
            if (status) {
                playerStatus.textContent = 'Provider menolak atau tidak menemukan stream (HTTP ' + status[1] + '). Periksa izin dan URL resmi.';
            } else if (/drm|license|key/i.test(detail)) {
                playerStatus.textContent = 'JW Player gagal memperoleh atau memakai DRM/license. Periksa dukungan browser dan konfigurasi resmi provider.';
            } else {
                playerStatus.textContent = 'JW Player gagal memutar channel. Periksa format, CORS, codec, dan DevTools → Network/Console; browser mungkin menyembunyikan penyebab server menolak playback.';
            }
        });
    }

    function stopPlayback() {
        playbackAttempt++;
        const wrapper = video.closest('.video-wrapper');
        if (wrapper) wrapper.style.removeProperty('aspect-ratio');
        if (jwPlayer) { jwPlayer.remove(); jwPlayer = null; }
        jwContainer.hidden = true;
        video.hidden = false;
        video.pause();
        video.removeAttribute('src');
        video.load();
    }

    async function showChannel(channel, button) {
        let attempt;
        let url;
        try {
            url = new URL(channel.url, window.location.href);
            if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Protocol tidak didukung');
        } catch (error) {
            playerStatus.textContent = 'URL channel tidak valid.';
            return;
        }

        stopPlayback();
        attempt = ++playbackAttempt;
        window.dispatchEvent(new CustomEvent('shuttleflash:prepare-tv'));
        playerStatus.textContent = 'Memuat ' + channel.name + '…';
        channelList.querySelectorAll('.playlist-channel').forEach(function (item) {
            item.classList.toggle('is-playing', item === button);
        });

        const hasHeaderOptions = Object.keys(channel.options).some(function (key) { return key.startsWith('http-'); });
        const unsupportedOptions = ['http-user-agent', 'http-referrer', 'http-referer', 'http-origin'].filter(function (key) { return channel.options[key]; });
        if (unsupportedOptions.length) {
            playerStatus.textContent = 'Konfigurasi meminta ' + unsupportedOptions.join(', ') + '. Browser membatasi header ini; provider harus mendukung playback browser.';
        } else if (hasHeaderOptions) {
            playerStatus.textContent = 'Memuat stream. Header tambahan perlu diizinkan CORS oleh provider dan didukung JW Player.';
        }

        try {
            await playWithJw(url, channel, unsupportedOptions.length > 0 || hasHeaderOptions, attempt);
        } catch (error) {
            if (attempt === playbackAttempt) playerStatus.textContent = error.message || 'JW Player gagal dimuat.';
        }
    }

    window.addEventListener('shuttleflash:stop-tv', stopPlayback);
    function renderChannels(entries) {
        channels = entries;
        channelList.replaceChildren();
        if (!channels.length) {
            playlistStatus.textContent = 'Belum ada channel. Tambahkan channel di LIVE_TV_CHANNELS pada public/live-tv.js.';
            return;
        }
        playlistStatus.textContent = channels.length + ' channel ditemukan.';
        channels.forEach(function (channel) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'playlist-channel';
            const logo = document.createElement('span');
            logo.className = 'channel-logo';
            if (channel.logo) {
                const image = document.createElement('img');
                image.src = channel.logo;
                image.alt = '';
                image.loading = 'lazy';
                logo.appendChild(image);
            } else {
                logo.textContent = 'LIVE';
            }
            const copy = document.createElement('span');
            copy.className = 'channel-copy';
            const name = document.createElement('strong');
            name.textContent = channel.name;
            const group = document.createElement('small');
            group.textContent = channel.group || 'Live TV';
            copy.append(name, group);
            const arrow = document.createElement('span');
            arrow.className = 'channel-arrow';
            arrow.textContent = '›';
            button.append(logo, copy, arrow);
            button.addEventListener('click', function () { showChannel(channel, button); });
            channelList.appendChild(button);
        });
    }

    renderChannels(LIVE_TV_CHANNELS.filter(function (channel) {
        return channel && typeof channel.url === 'string' && channel.url.trim();
    }).map(function (channel) {
        return {
            name: channel.name || 'Live Channel',
            group: channel.group || '',
            logo: channel.logo || '',
            url: channel.url.trim(),
            options: channel.options || {},
            kodi: channel.kodi || {}
        };
    }));
}());