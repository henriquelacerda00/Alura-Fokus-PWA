import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioTracks: Map<string, Howl> = new Map();

  constructor() {
    this.initializeTracks();
  }

  private initializeTracks() {
    this.audioTracks.set('environment', new Howl({
      src: ['./assets/sounds/luna-rise-part-one.mp3']
    }));

    this.audioTracks.set('play', new Howl({
      src: ['./assets/sounds/play.wav']
    }));

    this.audioTracks.set('pause', new Howl({
      src: ['./assets/sounds/pause.mp3']
    }));

    this.audioTracks.set('beep', new Howl({
      src: ['./assets/sounds/beep.mp3']
    }));
  }

  play(trackName: string) {
    const track = this.audioTracks.get(trackName);
    track?.play();
  }

  pause(trackName: string) {
    const track = this.audioTracks.get(trackName);
    track?.pause();
  }

  stop(trackName: string) {
    const track = this.audioTracks.get(trackName);
    track?.stop();
  }
}
