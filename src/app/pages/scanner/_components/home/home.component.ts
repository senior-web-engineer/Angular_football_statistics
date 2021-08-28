import { Component, OnInit, AfterViewInit, Input, HostListener, ChangeDetectorRef } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';

import * as moment from 'moment'; // add this 1 of 4

import { environment } from 'src/environments/environment';
import { PlayService } from './../../play.service';
import { MessageService } from '../../message.service';
import { StateService } from 'src/app/core/services/state.service';
import { ScannerStoreService } from 'src/app/pages/scanner/scanner-store.service';

import { pre_result, userPredictions } from './result';
import { data } from './data';
import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
import { filter, tap } from 'rxjs/operators';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          // style({transform: 'translateY(0)', opacity: 0.8}),
          // animate('500ms', style({transform: 'translateY(100%)', opacity: 1}))
          style({ height: '0px', opacity: 0 }),
          animate('500ms', style({ height: '*', opacity: 1 }))
        ]),
        transition(':leave', [
          // style({transform: 'translateY(0)', opacity: 1}),
          // animate('500ms', style({transform: 'translateX(100%)', opacity: 0}))
          // style({transform: 'translateX(0)', opacity: 1}),
          // animate('500ms', style({transform: 'translateX(100%)', opacity: 1}))
          style({ height: '*', opacity: 1 }),
          animate('500ms', style({ height: '0px', opacity: 0 }))
        ])
      ]
    )
  ],
})
export class HomeComponent implements OnInit, AfterViewInit {


  currentDate = new Date();
  results;
  momentumValue;
  grids = [];
  loaded = false;
  matches = null;
  userPredictions = [];
  preMatchFlag = false;
  preHeight = 0;

  preMatchOddsData = {
    homeOdds: '0',
    drawOdds: '0',
    awayOdds: '0'
  };
  strategies = [];
  strategyMatches = [];
  gridOptions:any;
  favouriteMatches = [];
  layouts: any[] = [];


  constructor(
    private service: PlayService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private _rootStore: StateService,
    private _localStore: ScannerStoreService,
    private readonly _cdRef: ChangeDetectorRef,
  ) {
    this.getCustomLayouts();
    this.getStrategies();
    this.getStartupData();
    this.getMatches();

  }

  getCustomLayouts(): void {
    this._rootStore.scannerLayouts.subscribe(layouts => this.layouts = layouts);
  }

  getStartupData(): void {
    // this._localStore.strategies.subscribe(strategies => {
    //   this.strategies = strategies;
    // });
    this._localStore.strategyMatches.subscribe(strategyMatches => this.strategyMatches = strategyMatches);
  }

  getStrategies(): void {
    this._localStore.strategies.subscribe(strategies => this.strategies = strategies);
  }

  getMatches(): void {
    // this._localStore.matches.subscribe(matches => this.matches = matches);
    this._localStore.matches
    .pipe(
      filter(Boolean),
      tap((matches: any) => {
        this.matches = matches;
        this._cdRef.detectChanges();
      }),
    )
    .subscribe(() => { });
  }

  isLight(): boolean {
    return environment.theme == 'light';
  }

  addNewGrid(nameString = '', strategy = null, linkedMatches = []) {
    let name = nameString;

    if (strategy) {
      name = strategy.name;
    } else if (0 !== this.grids.length) {
      name = "Grid Example " + (this.grids.length + 1);
    }

    let grid = {
      name: name,
      matches: this.matches,
      strategy: strategy,
      linkedMatches: linkedMatches,
    }

    this.grids.push(grid);
  }

  getGridName(i) {
    return "Grid Example " + i;
  }

  getMomentumValueForSpline(graphData) {
    let data = graphData;
    let array = [];
    if (data) {
      let jsonGraph = JSON.parse(data.replace("/\/g", ""));

      for (var key of Object.keys(jsonGraph)) {
        array.push(jsonGraph[key])
      }
    }

    return array;
  }

  getLabel(graphData) {
    let data = graphData;
    let array = [];
    if (data) {
      let jsonGraph = JSON.parse(data.replace("/\/g", ""));

      for (var key of Object.keys(jsonGraph)) {
        if (jsonGraph[key] >= 0) {
          array.push((parseInt(key + '') + 1) + '')
        }
      }
    }

    return array;
  }

  getMomentumValue(inMatch) {
    let data = inMatch.momentumGraph.graphData;
    let array = [];
    if (data) {
      let jsonGraph = JSON.parse(data.replace("/\/g", ""));

      for (var key of Object.keys(jsonGraph)) {
          array.push(jsonGraph[key])
      }
    }
    return array;
  }

  showPredictionTable() {
    this.preMatchFlag = !this.preMatchFlag;
  }

  parseStatisticsTimings(data: any): any {
    let result = {
      awayCorners: [],
      awayGoals: [],
      awayRedCards: [],
      awayYellowCards: [],
      awayShotsOffTarget: [],
      awayShotsOnTarget: [],
      homeCorners: [],
      homeGoals: [],
      homeRedCards: [],
      homeYellowCards: [],
      homeShotsOffTarget: [],
      homeShotsOnTarget: []
    };

    for (let key in result) {
      if (data[key] && data[key].length >= 2) {
        result[key] = JSON.parse(data[key]);
      }
    }
    result['matchId'] = data.matchId;
    result['statisticsTimingsId'] = data.statisticsTimingsId;
    result['statsId'] = data.statsId;
    return result;
  }

  setResultVar(result: any, count?:any): void {
    this.results = result;
    let matches = this.results.filter(match => {
      match['aa_count'] = count;
      match['kickOffTime'] = moment(match['kickOffTime']);
      if (environment.fullGridLoad) {
        return true;
      }
      if (match['kickOffTime'].toDate() > moment().subtract({ days: environment.gridLoadBeforeDays }).toDate()) {
        return true;
      }
      return false;
    });

    matches.forEach(inMatch => {
      inMatch.splineGraphDataHome1 = this.getMomentumValueForSpline(
        inMatch.attackingPressureGraphs[0].graphData);
      inMatch.splineGraphDataAway1 = this.getMomentumValueForSpline(
        inMatch.attackingPressureGraphs[2].graphData);
      inMatch.splineGraphDataHome2 = this.getMomentumValueForSpline(
        inMatch.attackingPressureGraphs[1].graphData);
      inMatch.splineGraphDataAway2 = this.getMomentumValueForSpline(
        inMatch.attackingPressureGraphs[3].graphData);


      inMatch.graphicalData1 = { home: [], away: [] }
      inMatch.graphicalData1.home = inMatch.splineGraphDataHome1
      inMatch.graphicalData1.away = inMatch.splineGraphDataAway1
      inMatch.graphicalData1.homeName = inMatch.homeName
      inMatch.graphicalData1.awayName = inMatch.awayName

      inMatch.graphicalData2 = { home: [], away: [] }
      inMatch.graphicalData2.home = inMatch.splineGraphDataHome2
      inMatch.graphicalData2.away = inMatch.splineGraphDataAway2
      inMatch.splineGraphLabel = this.getLabel(inMatch.attackingPressureGraphs[1].graphData)
      inMatch.graphicalData2.homeName = inMatch.homeName
      inMatch.graphicalData2.awayName = inMatch.awayName

      inMatch.barGraphData = { chart: this.getMomentumValue(inMatch) };
      inMatch.battleWith = inMatch.homeName + " vs " + inMatch.awayName;
      inMatch.bell = false;

      if( inMatch.preMatchOdds == null ) {
        inMatch.preMatchOdds = this.preMatchOddsData;
      }

      const statisticsTimings = this.parseStatisticsTimings(inMatch.statisticsTimings);

      inMatch.barGraphData.statsTimeInfo = statisticsTimings;
      inMatch.graphicalData1.statsTimeInfo = statisticsTimings;
      inMatch.graphicalData2.statsTimeInfo = statisticsTimings;
      inMatch.barGraphData.gameTime = inMatch.gameTime;
    });
    // this.matches = matches;
    this._localStore.setMatches(matches);
    this.loaded = true;
  }

  addGridForStrategies(): void {
    if (this.strategies) {
      this.strategies.forEach(strategy => {
        const linkedMatches = this.strategyMatches.reduce((total, current) => {
          if(current.strategyId == strategy.strategyId)
            total.push(current)
          return total;
        }, []);
        this.addNewGrid('',strategy, linkedMatches);
      });
    } else {
      setTimeout(() => {
        this.addGridForStrategies();
      }, 500);
    }
  }

  addGridForLayout(structure: any[]): void {
    structure.forEach(element => {
      const strategy = this.strategies.find(strategy => strategy.strategyId == element.StrategyId);

      if (strategy && element.Visible) {
        this.addNewGrid('',strategy);
      }
    });
  }

  async _getPlayResults(count?:any) {
    const response = await this.service.getPlayResults();
    this.setResultVar(response['matches'],count);
  }

  async initializeGrids() {
    if(!this.matches) {
      await this._getPlayResults();
      // const response = await this.service.getPlayResults();
      // this.setResultVar(response['matches']);
    }
    switch(this.gridOptions.gridtype) {
      case 'default':
        this.loaded = true;
        this.addNewGrid('Default');
        break;
      case 'favourites':
        this.service.getFavouriteMatches().subscribe(response => {
          this.favouriteMatches = response;
          this.loaded = true;
          this.addNewGrid('Favourites');
        });
        break;
      case 'strategy':
        this.service.getStartupData().subscribe(response => {
          this.loaded = true;
          this.addGridForStrategies();
        });
        break;
      case 'custom':
        this.loaded = true;
      default:
        const layoutId = this.gridOptions.gridtype;
        const currrentLayout = this.layouts.find(layout => layout.layoutId == layoutId);
        this.loaded = true;

        if (currrentLayout) {
          this.addGridForLayout(currrentLayout.structure);
        }
        break;
    }
  }

  ngOnInit(): void {
    this._init();
  }

  ngAfterViewInit(): void {
    let count = 0;
    setInterval(() => {
      this._getPlayResults(count);
      count++;
    }, 5000);
  }

  _init(): void {
    let env = 'test1';

    if (env == 'test') {
      this.loaded = true;
      this.matches = data;
      this.matches.forEach(match => {
        match.barGraphData.gameTime = match.gameTime;
      });
    }

    this.service.getPredictionsManagerResults().subscribe(response => {
      this.userPredictions = response['result']['userPredictions'];
      this.preHeight = this.userPredictions.length * 48;
    });
    this.service.getFavouriteMatches().subscribe(response => {
      this.favouriteMatches = response;
    });
    this.route.params.subscribe(params => {
      this.gridOptions = params;
      this.grids = [];
      this.initializeGrids();
    });
    this.messageService.removeGridEvent.subscribe(value => {
      if (value > -1 && this.grids.length) {
        this.grids.splice(value, 1);
      }
    })
  }
}
/*
{
    "layouts": {
        "layouts": [
            {
                "layoutId": 1,
                "userId": 123,
                "name": "Example layout",
                "structure": "[{\"StrategyId\":27,\"Order\":0},{\"StrategyId\":28,\"Order\":1},{\"StrategyId\":35,\"Order\":2},{\"StrategyId\":36,\"Order\":3},{\"StrategyId\":37,\"Order\":4},{\"StrategyId\":38,\"Order\":5}]",
                "hidden": false,
                "menuPosition": "1"
            }
        ]
    }
}
*/
