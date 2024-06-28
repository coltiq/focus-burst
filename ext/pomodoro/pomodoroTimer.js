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
        this.timer = null; // Store Interval ID
    }

    start() {
        if (this.state === 'STOPPED') {
            this.state = 'WORK';
            this.currentSeconds = this.workDuration;  // Reset to work duration only if stopped
        }
        if (!this.timer) {  // Check if timer is not already running
            this.timer = setInterval(() => this.tick(), 1000);
            console.log('Timer started...');
        }
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;  // Clear the interval ID
            console.log('Timer paused...');
        }
    }
    reset(work, shortBreak, longBreak, intervals) {
        this.workDuration = work * 60; // Convert minutes to seconds
        this.shortBreakDuration = shortBreak * 60;
        this.longBreakDuration = longBreak * 60;
        this.intervalsBeforeLongBreak = intervals;
        this.currentSeconds = this.workDuration; // Reset to the new work duration
        this.intervalCount = 0; // Reset interval count
        this.state = 'STOPPED'; // Reset the state to start from a work period
        this.stop(); // Stop any existing timer
        this.updateCallback(this.formatTime(this.currentSeconds)); // Update UI to Show Reset but 'STOPPED'
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
        this.intervalCount++;
        if (this.state === 'WORK') {
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
