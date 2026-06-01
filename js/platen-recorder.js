// PLATEN RECORDER · Browser-Native Video Capture
// by douglxss · Records the WebGL animation canvas to WebM/MP4.
// Uses MediaRecorder API with canvas.captureStream().

var PlatenRecorder = (function () {
    'use strict';

    var _mediaRecorder = null;
    var _chunks = [];
    var _recording = false;
    var _startTime = 0;

    // Check browser support
    function isSupported() {
        return !!(
            typeof MediaRecorder !== 'undefined' &&
            HTMLCanvasElement.prototype.captureStream
        );
    }

    // Determine best supported MIME type
    function getBestMime() {
        var candidates = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
            'video/mp4'
        ];
        for (var i = 0; i < candidates.length; i++) {
            if (MediaRecorder.isTypeSupported(candidates[i])) {
                return candidates[i];
            }
        }
        return 'video/webm'; // fallback
    }

    function getExtension(mime) {
        if (mime.indexOf('mp4') !== -1) return 'mp4';
        return 'webm';
    }

    function start(fps) {
        if (_recording) {
            console.warn('[PlatenRecorder] Already recording');
            return false;
        }

        if (!isSupported()) {
            alert('Video recording is not supported in this browser. Please use Chrome or Firefox.');
            return false;
        }

        // Get the animation canvas
        var canvas = PlatenKeyAnim.getRecordingCanvas();
        if (!canvas) {
            // If animation isn't running yet, start it first
            PlatenKeyAnim.start();
            // Wait a moment for the texture to load
            setTimeout(function () {
                canvas = PlatenKeyAnim.getRecordingCanvas();
                if (!canvas) {
                    alert('No animation canvas available. Please ensure a piece is rendered first.');
                    return;
                }
                _beginCapture(canvas, fps);
            }, 500);
            return true;
        }

        _beginCapture(canvas, fps);
        return true;
    }

    function _beginCapture(canvas, fps) {
        fps = fps || 24;
        var stream = canvas.captureStream(fps);
        var mime = getBestMime();

        console.log('[PlatenRecorder] Starting capture: ' + mime + ' @ ' + fps + 'fps');

        _chunks = [];
        _mediaRecorder = new MediaRecorder(stream, {
            mimeType: mime,
            videoBitsPerSecond: 8000000 // 8 Mbps for quality
        });

        _mediaRecorder.ondataavailable = function (e) {
            if (e.data && e.data.size > 0) {
                _chunks.push(e.data);
            }
        };

        _mediaRecorder.onstop = function () {
            var ext = getExtension(mime);
            var blob = new Blob(_chunks, { type: mime });
            _chunks = [];

            // Build filename from current state
            var seed = typeof RENDER_SEED !== 'undefined' ? RENDER_SEED : 'unknown';
            var filename = 'platen-' + seed + '-animated.' + ext;

            // Download
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () { URL.revokeObjectURL(url); }, 5000);

            var duration = ((performance.now() - _startTime) / 1000).toFixed(1);
            console.log('[PlatenRecorder] Saved ' + filename + ' (' + duration + 's, ' + (blob.size / 1024 / 1024).toFixed(1) + 'MB)');

            _recording = false;
            _updateUI();
        };

        _mediaRecorder.onerror = function (e) {
            console.error('[PlatenRecorder] Error:', e);
            _recording = false;
            _updateUI();
        };

        _mediaRecorder.start(100); // Collect data every 100ms
        _recording = true;
        _startTime = performance.now();
        _updateUI();
    }

    function stop() {
        if (!_recording || !_mediaRecorder) {
            console.warn('[PlatenRecorder] Not recording');
            return;
        }

        _mediaRecorder.stop();
        console.log('[PlatenRecorder] Stopping capture...');
    }

    function toggle(fps) {
        if (_recording) stop();
        else start(fps);
        return _recording;
    }

    function isRecording() {
        return _recording;
    }

    function _updateUI() {
        var btn = document.getElementById('btn-record');
        if (!btn) return;
        if (_recording) {
            btn.classList.add('recording');
            btn.textContent = '⏹ Stop';
        } else {
            btn.classList.remove('recording');
            btn.textContent = '⏺ Record';
        }
    }

    return {
        start: start,
        stop: stop,
        toggle: toggle,
        isRecording: isRecording,
        isSupported: isSupported
    };
})();
