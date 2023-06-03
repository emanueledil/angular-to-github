import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SynthServiceService {
  private context: AudioContext;
  private oscillator: OscillatorNode | null;
  private gainNode: GainNode;

  constructor() {
    this.context = new AudioContext();
    this.oscillator = null;
    this.gainNode = this.context.createGain();
  }

  play(frequency: number) {
    this.stop(); // ensure we're not playing anything else
    this.oscillator = this.context.createOscillator();
    this.oscillator.frequency.value = frequency; // set initial frequency
    this.oscillator.connect(this.gainNode).connect(this.context.destination);
    this.oscillator.start();
  }

  changeFrequency(frequency: number, time = 0.1) {
    if (this.oscillator !== null) {
      const now = this.context.currentTime;
      this.oscillator.frequency.cancelScheduledValues(now);
      this.oscillator.frequency.setValueAtTime(this.oscillator.frequency.value, now);
      this.oscillator.frequency.linearRampToValueAtTime(frequency, now + time);
    }
  }

  changeVolume(volume: number, time = 0.1) {
    const now = this.context.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(volume, now + time);
  }

  stop() {
    if (this.oscillator !== null) {
      this.oscillator.disconnect(this.gainNode);
      this.oscillator.stop();
      this.oscillator = null;
    }
  }
}
