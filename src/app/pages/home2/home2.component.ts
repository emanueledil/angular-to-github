import {Component, ElementRef, OnInit, ViewChild, AfterViewInit} from '@angular/core';

import * as handTrack from 'handtrackjs';

@Component({
  selector: 'app-home2',
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.css']
})
export class Home2Component implements OnInit, AfterViewInit {
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;
  audioContext!: AudioContext;

  distFingersDx: number = 0;
  distFingersSx: number = 0;
  videoWidth = 0;
  videoHeight = 0;
  leftHand: CenterHandPos = {x:0, y:0}
  rightHand: CenterHandPos = {x:0, y:0}


  modelParams = {
    flipHorizontal: true,
    maxNumBoxes: 2,
    iouThreshold: 0.5,
    scoreThreshold: 0.7,
  };

  private model: any;
  private context!: CanvasRenderingContext2D;

  constructor() {
    this.audioContext = new AudioContext();
  }

  ngOnInit() {
    handTrack.load(this.modelParams).then((lmodel: any) => {
      this.model = lmodel;
      this.startVideo();
    });
  }

  ngAfterViewInit() {
   this.videoWidth = this.videoElement.nativeElement.videoWidth;
    this.videoHeight = this.videoElement.nativeElement.videoHeight;
    this.context = this.canvasElement.nativeElement.getContext('2d');
  }

  private startVideo() {
    handTrack.startVideo(this.videoElement.nativeElement).then((status: any) => {
      if (status) {
        this.runDetection();
      }
    });
  }

  private runDetection() {
    this.model.detect(this.videoElement.nativeElement).then((predictions: any) => {
      this.model.renderPredictions(predictions, this.canvasElement.nativeElement, this.context, this.videoElement.nativeElement);
      if (predictions.length > 0) {
        this.updateHandPositions(predictions);
      }
      requestAnimationFrame(() => {
        this.runDetection();
      });
    });
  }

  private updateHandPositions(predictions: any[]) {
    this.videoWidth = this.videoElement.nativeElement.videoWidth;
    this.videoHeight = this.videoElement.nativeElement.videoHeight;
    predictions.forEach((prediction: any)=>{

      const [x, y, w, h ] = prediction.bbox // x, y left corner
      const centerHand: CenterHandPos = {x: x +w/2, y: y-h/2}
      if(x>(this.videoWidth/2)){
        this.leftHand = centerHand;
      }else{
        this.rightHand = centerHand;
      }

    })
    if(this.videoHeight >0 && this.videoWidth > 0){
      this.playSound(this.rightHand.y/this.videoHeight * 1000 , this.leftHand.y/this.videoWidth);
    }
  }


  createOscillator(frequency: number): OscillatorNode {
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine'; // Sine wave
    oscillator.frequency.value = frequency; // Frequency in Hz
    return oscillator;
  }

  createGainNode(volume: number): GainNode {
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;
    return gainNode;
  }

  playSound(frequency: number, volume: number) {
    const oscillator = this.createOscillator(frequency);
    const gainNode = this.createGainNode(volume);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
  }

}

interface CenterHandPos {
  x: number,
  y: number
}
