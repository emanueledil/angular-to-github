import {Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy} from '@angular/core';

import * as handTrack from 'handtrackjs';
import {SynthServiceService} from "../../services/synth-service.service";

@Component({
  selector: 'app-home2',
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.css']
})
export class Home2Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;
  videoWidth = 0;
  videoHeight = 0;
  leftHand: CenterHandPos = {x: 0, y: 0}
  rightHand: CenterHandPos = {x: 0, y: 0}
  singleHand: CenterHandPos = {x: 0, y: 0}
  oneHandMode = true;


  modelParams = {
    flipHorizontal: true,
    maxNumBoxes: 2,
    iouThreshold: 0.5,
    scoreThreshold: 0.7,
  };

  private model: any;
  private context!: CanvasRenderingContext2D;

  constructor(
    private synthService: SynthServiceService
  ) {
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
    this.synthService.play(220);
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
    if (this.oneHandMode) {
      this.oneHandModePlay(predictions)
    } else {
      this.twoHandsModePlay(predictions)
    }
  }

  oneHandModePlay(predictions: any[]) {
    this.videoWidth = this.videoElement.nativeElement.videoWidth;
    this.videoHeight = this.videoElement.nativeElement.videoHeight;
    let noHands = true;
    predictions.forEach((prediction: any) => {
      if (prediction.label == "open" || prediction.label == "closed" || prediction.label == "pinch") {
        const [x, y, w, h] = prediction.bbox // x, y left corner
        const centerHand: CenterHandPos = {x: x + w / 2, y: y + h} // i take the maximum height
        this.singleHand = centerHand;
        if (prediction.label == "open") {
          noHands = false;
        }
      }

    })
    if (this.videoHeight > 0 && this.videoWidth > 0) {
      let volume = 1 - this.singleHand.y / this.videoHeight;
      const frequency = this.singleHand.x / this.videoWidth * 1000;
      if (volume > 1) {
        volume = 1
      }
      if (volume < 0) {
        volume = 0
      }
      if (noHands) {
        volume = 0;
      }
      console.debug('hand', this.singleHand)
      console.debug('freq ', frequency, 'vol ', volume)
      this.synthService.changeFrequency(frequency);
      this.synthService.changeVolume(volume)
    }
    // this.videoWidth = this.videoElement.nativeElement.videoWidth;
    // this.videoHeight = this.videoElement.nativeElement.videoHeight;
    // let action = '';
    // predictions.forEach((prediction: any)=>{
    //   if(prediction.label == "open" || prediction.label == "closed" || prediction.label=="pinch"){
    //     const [x, y, w, h ] = prediction.bbox // x, y left corner
    //     const centerHand: CenterHandPos = {x: x +w/2, y: y-h/2}
    //     this.singleHand = centerHand;
    //     action = prediction.label;
    //   }
    // })
    // if(this.videoHeight >0 && this.videoWidth > 0){
    //   const frequency = this.singleHand.x/this.videoWidth * 1000;
    //   let volume =  this.singleHand.y/this.videoHeight ;
    //   if(volume<0){
    //     volume = 0
    //   }
    //   if(volume>1){
    //     volume = 1
    //   }
    //   if(action == "pinch" || action == "closed"){
    //     volume = 0
    //   }
    //   this.synthService.changeFrequency(frequency);
    //   this.synthService.changeVolume(volume)
    //   console.debug('hand ', this.singleHand)
    //   console.debug('frequency ', frequency, 'volume ', volume)
    //
    //   //this.playSound(this.rightHand.y/this.videoHeight * 1000 , this.leftHand.y/this.videoWidth);
    // }
  }

  twoHandsModePlay(predictions: any[]) {
    this.videoWidth = this.videoElement.nativeElement.videoWidth;
    this.videoHeight = this.videoElement.nativeElement.videoHeight;
    predictions.forEach((prediction: any) => {

      const [x, y, w, h] = prediction.bbox // x, y left corner
      const centerHand: CenterHandPos = {x: x + w / 2, y: y - h / 2}
      if (centerHand.x > (this.videoWidth / 2)) {
        this.leftHand = centerHand;
      } else {
        this.rightHand = centerHand;
      }

    })
    if (this.videoHeight > 0 && this.videoWidth > 0) {
      const frequency = this.rightHand.y / this.videoHeight * 1000;
      const volume = this.leftHand.y / this.videoHeight;
      this.synthService.changeFrequency(frequency);
      this.synthService.changeVolume(volume)
      //this.playSound(this.rightHand.y/this.videoHeight * 1000 , this.leftHand.y/this.videoWidth);
    }
  }


  play(frequency: number) {
    this.synthService.play(frequency);
  }

  stop() {
    this.synthService.stop();
  }

  ngOnDestroy() {
    this.synthService.stop()
  }

  // createOscillator(frequency: number): OscillatorNode {
  //   const oscillator = this.audioContext.createOscillator();
  //   oscillator.type = 'sine'; // Sine wave
  //   oscillator.frequency.value = frequency; // Frequency in Hz
  //   return oscillator;
  // }
  //
  // createGainNode(volume: number): GainNode {
  //   const gainNode = this.audioContext.createGain();
  //   gainNode.gain.value = volume;
  //   return gainNode;
  // }
  //
  // playSound(frequency: number, volume: number) {
  //   const oscillator = this.createOscillator(frequency);
  //   const gainNode = this.createGainNode(volume);
  //
  //   oscillator.connect(gainNode);
  //   gainNode.connect(this.audioContext.destination);
  //
  //   oscillator.start(this.audioContext.currentTime);
  // }

}

interface CenterHandPos {
  x: number,
  y: number
}
