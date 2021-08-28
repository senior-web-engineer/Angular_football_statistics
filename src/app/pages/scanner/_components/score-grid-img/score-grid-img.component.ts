import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-score-grid-img',
  templateUrl: './score-grid-img.component.html',
  styleUrls: ['./score-grid-img.component.scss']
})
export class ScoreGridImgComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  @ViewChild('screen') screen: ElementRef;

  @Input()
  selectedRow;
  awayName: string;
  homeName: string;
  homeLast20: any;
  awayLast20: any;
  homeTds: any[];
  homeTds20: any[];
  awayTds: any[];
  awayTds20: any[];
  fullTime: any;
  awayGoalsList: any[];
  homeGoalsList: any[];
  gameTime: any;
  possession: any;

  constructor() { }

  ngOnInit(): void {
    this.getRowData();
    this.setData();
  }

  getRowData(): void {
    const rowData = this.selectedRow[0];

    this.awayName = rowData.awayName;
    this.homeName = rowData.homeName;
    this.fullTime = rowData.statistics;
    this.homeLast20 = rowData.homeLast20;
    this.awayLast20 = rowData.awayLast20;
    this.awayGoalsList = JSON.parse(rowData.statisticsTimings.awayGoals);
    this.homeGoalsList = JSON.parse(rowData.statisticsTimings.homeGoals);
    this.gameTime = rowData.statistics.currentGameTime;
    this.possession = rowData.statistics.totalHomePossession;
  }

  setData(): void {
    // get goals in last 20 min
    var awayCount = 0;
    var homeCount = 0;
    if(this.awayGoalsList.length>0){
    this.awayGoalsList.forEach(element => {
      if(this.gameTime - element <= 20 && this.gameTime - element >= 0){
        awayCount++;
      }
    });}
    if(this.homeGoalsList.length>0){
    this.homeGoalsList.forEach(element => {
      if(this.gameTime - element <= 20 && this.gameTime - element >= 0){
        homeCount++;
      }
    });}

    this.homeTds = [
      this.fullTime.totalHomeOnTarget,
      this.fullTime.totalHomeOffTarget,
      this.fullTime.totalHomeAttacks,
      this.fullTime.totalHomeDangerousAttacks,
      // this.fullTime.totalHomeGoals,
      this.fullTime.totalHomeCorners,
    ];
    this.homeTds20 = [
      this.homeLast20.shotsOnTarget,
      this.homeLast20.shotsOffTarget,
      this.homeLast20.attacks,
      this.homeLast20.dangerousAttacks,
      // homeCount,
      this.homeLast20.corners,
    ];
    this.awayTds = [
      this.fullTime.totalAwayOnTarget,
      this.fullTime.totalAwayOffTarget,
      this.fullTime.totalAwayAttacks,
      this.fullTime.totalAwayDangerousAttacks,
      // this.fullTime.totalAwayGoals,
      this.fullTime.totalAwayCorners,
    ];
    this.awayTds20 = [
      this.awayLast20.shotsOnTarget,
      this.awayLast20.shotsOffTarget,
      this.awayLast20.attacks,
      this.awayLast20.dangerousAttacks,
      // awayCount,
      this.awayLast20.corners,
    ];
  }

  downloadImage(){
    this.blockUI.start('Generating Image...');
    var height1 = $("#content").height();
    var height2 = $("#btn_shot").height();
    html2canvas(this.screen.nativeElement,{
      height: height1-height2,
      scrollX: 0,
      scrollY: -window.scrollY
    }).then(canvas => {
      var a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = this.homeName+' vs '+this.awayName+'.png';
      a.click();
    });
    setTimeout(() => {
      this.blockUI.stop();
    }, 1000);
  }
}
