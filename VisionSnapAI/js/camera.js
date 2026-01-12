export class CameraManager {
    constructor(videoElement, onCapture) {
        this.video = videoElement;
        this.stream = null;
        this.onCapture = onCapture;
        this.facingMode = 'environment';
        this.flashOn = false;
        this.track = null;
    }

    async start() {
        if (this.stream) return;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.facingMode }
            });
            this.video.srcObject = this.stream;
            this.track = this.stream.getVideoTracks()[0];
        } catch (err) {
            console.error("Camera access denied or error:", err);
            alert("Could not access camera. Please allow permissions or use upload.");
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.video.srcObject = null;
            this.track = null;
        }
    }

    async toggleFlash() {
        if (!this.track) return;

        this.flashOn = !this.flashOn;

        try {
            await this.track.applyConstraints({
                advanced: [{ torch: this.flashOn }]
            });
        } catch (err) {
            console.warn("Flash toggle failed or not supported:", err);
            // Revert state if failed
            if (err.name !== 'OverconstrainedError') {
                // For some errors we might not want to revert immediately if it's just a query issue, but safest is to revert
            }
        }
    }

    switchCamera() {
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        this.flashOn = false; // Reset flash on switch
        this.stop();
        this.start();
    }

    capture() {
        if (!this.stream) return;

        const canvas = document.createElement('canvas');
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0);

        canvas.toBlob((blob) => {
            if (this.onCapture) this.onCapture(blob);
        }, 'image/jpeg', 0.9);
    }
}
