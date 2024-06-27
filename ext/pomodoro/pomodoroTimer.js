export class PomodoroTimer {
    constructor(updateCallback) {
        this.updateCallback = updateCallback;
        this.currentSeconds = 0;
        this.intervalCount = 0;
        this.state = 'STOPPED';  // 'WORK', 'SHORT_BREAK', 'LONG_BREAK', 'STOPPED'
        this.workDuration = 25 * 60;  // Default 25 minutes
        this.shortBreakDuration = 5 * 60;  // Default 5 minutes
        this.longBreakDuration = 15 * 60;  // Default 15 minutes
        this.intervalsBeforeLongBreak = 4;
    }

    start() {
        if (this.state === 'STOPPED') {
            this.state = 'WORK';
            this.currentSeconds = this.workDuration;
        }
        this.timer = setInterval(() => this.tick(), 1000);
    }

    stop() {
        clearInterval(this.timer);
        this.state = 'STOPPED';
    }

    tick() {
        if (this.currentSeconds > 0) {
            this.currentSeconds--;
            this.updateCallback(this.formatTime(this.currentSeconds));
        } else {
            this.nextPhase();
        }
    }

    nextPhase() {
        if (this.state === 'WORK') {
            this.intervalCount++;
            if (this.intervalCount % this.intervalsBeforeLongBreak === 0) {
                this.state = 'LONG_BREAK';
                this.currentSeconds = this.longBreakDuration;
            } else {
                this.state = 'SHORT_BREAK';
                this.currentSeconds = this.shortBreakDuration;
            }
        } else {
            this.state = 'WORK';
            this.currentSeconds = this.workDuration;
        }
        this.updateCallback(this.formatTime(this.currentSeconds));
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
}
