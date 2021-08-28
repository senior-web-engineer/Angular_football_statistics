import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-score-grid-progressbar',
  templateUrl: './score-grid-progressbar.component.html',
  styleUrls: ['./score-grid-progressbar.component.scss']
})
export class ScoreGridProgressbarComponent implements OnInit {

  @Input()
  str;
  @Input()
  valHome;
  @Input()
  valAway;
  @Input()
  opacity;

  max: number;
  width: number;
  opt: number;

  constructor() { }

  ngOnInit(): void {
    this.max = Number(this.valHome) + Number(this.valAway);
    this.width = this.valHome / this.max * 100;
    this.opt = (this.opacity)? .2:1;

  }

}
