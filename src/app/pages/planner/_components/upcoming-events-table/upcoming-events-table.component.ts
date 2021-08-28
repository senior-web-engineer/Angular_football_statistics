import { ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
// import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
// import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
// import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

import { filter, tap } from 'rxjs/operators';

import * as moment from 'moment';

import { StateService } from 'src/app/core/services';
// import { userInfo } from 'os';
import { PlannerService } from 'src/app/core/services';
import { MatTableDataSource } from '@angular/material/table';
import { getCode } from 'country-list';

declare const $: any;

export interface IUpcomingMatch {
  kickOffTime: any;
  // country: any;
  // league: any;
  colon:string;
  home: any;
  homeId: any;
  homeImg?: any;
  away: any;
  awayId: any;
  awayImg?: any;
  matchId: any;
  upcomingMatchId: any;
}

const ELEMENT_DATA: IUpcomingMatch[] = [];

@Component({
  selector: 'app-upcoming-events-table',
  templateUrl: './upcoming-events-table.component.html',
  styleUrls: ['./upcoming-events-table.component.scss'],
})
export class UpcomingEventsTableComponent implements OnInit, AfterViewInit {
  matches: any[];
  teamImages: any[];

  // material-table variables
  displayedColumns: string[] = [
    'kick-off',
    // 'country',
    // 'league',
    'home',
    'colon',
    'away',
    'predictions',
    'favourites',
    'notes',
    'strategies'
  ];
  // dataSource = new MatTableDataSource<IUpcomingMatch>(ELEMENT_DATA);
  toppings = new FormControl();
  strategies = [];
  strategyMatches = [];
  favouriteMatches = [];
  countries = [];

  // @ViewChild('containerTable') containerTable: CdkVirtualScrollViewport;
  // @ViewChild(MatSort) sort: MatSort;
  @BlockUI() blockUI: NgBlockUI;

  constructor(
    private readonly _cdRef: ChangeDetectorRef,
    private readonly _store: StateService,
    private readonly plannerService: PlannerService
  ) { }

  ngOnInit(): void {
    this.blockUI.start('Loading...'); // Start blocking
    this.getTeamImages();
    this.getMatches();
    this.getStrategies();
    this.getStrategyMatches();
    this.getFavouriteMatches();
  }
  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    // this.setDatasourceSort();
    // this.onResize();
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
    setTimeout(() => {
      this.blockUI.stop();
    }, 2500);
  }

  getStrategies() {
    this._store.strategies
      .pipe(
        filter(Boolean),
        tap((strategies: any) => {
          this.strategies = strategies;
          this._cdRef.detectChanges();
        })
      )
      .subscribe(() => { })
  }

  getStrategyMatches() {
    this._store.strategyMatches
      .subscribe((strategyMatches) => {
        if (strategyMatches)
          this.strategyMatches = strategyMatches;
      })
  }

  getFavouriteMatches() {
    this._store.favouriteMatches
      .subscribe((favouriteMatches) => {
        if(favouriteMatches)
          this.favouriteMatches = favouriteMatches;
      })
  }

  getMatches(): void {
    this._store.upcomingMatches
      .pipe(
        filter(Boolean),
        tap((matches: any) => {
          this.matches = matches;
          this._cdRef.detectChanges();
          //getCountries
          this.matches.forEach(match => {
            const country = this.countries.find(item => item.country == match.country);

            if (country) {
              const { leagues } = country;
              const league = leagues.find(item => item.league == match.league);

              if (league) {
                league.matches.push(match);
              } else {
                leagues.push({
                  league: match.league,
                  matches: [match]
                });
              }
            } else {
              this.countries.push({
                country: match.country,
                countrycode:getCode(match.country),

                leagues: [{
                  league: match.league,
                  matches: [match]
                }]
              });
            }
          });
          this.generateDatasource();
        })
      )
      .subscribe(() => { });
  }

  generateDatasource() {

    const countries = this.countries;
    let sortedCountries= countries.sort(function(a, b) {
      return a.country.localeCompare(b.country);
   })

    sortedCountries.forEach(country => {
      const { leagues } = country;
      let sortedLeagues= leagues.sort(function(a, b) {
        return a.league.localeCompare(b.league);
     })

     sortedLeagues.forEach(league => {
        // set upcoming events table data
        const data = league.matches.map((match) => ({
          kickOffTime: moment(match.kickOffTime).format('MM/DD HH:mm'),
          // country: match.country,
          // league: match.league,
          colon: ":",
          home: match.homeName,
          homeId: match.homeId,
          homeImg: this.teamImages.find((el) => el.teamId === match.homeId)
            ?.imageUrl,
          away: match.awayName,
          awayId: match.awayId,
          awayImg: this.teamImages.find((el) => el.teamId === match.awayId)
            ?.imageUrl,
          matchId: match.matchId,
          upcomingMatchId: match.upcomingMatchId,
        }));
        // debugger;
        const dataSource = new MatTableDataSource<IUpcomingMatch>(ELEMENT_DATA);

        dataSource.data = data;
        league.dataSource = dataSource;

      });
    })
  }

  // setDatasourceSort() {
  //   this.countries.forEach(country => {
  //     country.leagues.forEach(league => {
  //       league.dataSource.sort = this.sort;
  //       // break;
  //     });
  //   })
  // }

  getTeamImages() {
    this._store.teamImages
      .pipe(
        filter(Boolean),
        tap((images: any) => {
          this.teamImages = images;
        })
      )
      .subscribe(() => { });
  }

  onAddPredictions(event, match): void {
    event.preventDefault();
    this._store.setTargetMatch(match);
    $('#predictions-market-selection-dialog').modal('show');
  }

  handleAddFavourites(event, match): void {
    event.preventDefault();
    const result = this.isFavourite(match);

    if(!result) {
      this.plannerService
        .addFavouriteMatch(match)
        .subscribe(() => {
          this.getFavouriteMatches();
        });
      this.favouriteMatches.push({
        favouriteMatchId: -1, matchId: match.matchId
      });
    } else {
      this.plannerService
        .deleteFavouriteMatch(result.favouriteMatchId)
        .subscribe(() => {
          this.getFavouriteMatches();
        });
      const index = this.favouriteMatches.findIndex(
        favourite => favourite.matchId === match.matchId
      );
      this.favouriteMatches.splice(index, 1);
    }
  }

  onAddNotes(event, match): void {
    event.preventDefault();
    this._store.setTargetMatch(match);
    $('#note-dialog').modal('show');
  }

  onChangeStrategyMatch(event, strategy, match): void {
    const strategyMatchId = this.getStrategyMatchId(strategy, match);
    if (event.target.checked === true) {
      this.plannerService.addStrategyMatch({
        strategyId: strategy.strategyId,
        matchId: match.matchId
      })
        .subscribe(
          () => {
            this.getStrategyMatches();
          }
        );
    } else {
      if (strategyMatchId == -1) {
        alert('Not found the strategy Match Id');
        return;
      }
      this.plannerService
        .deleteStrategyMatch(strategyMatchId)
        .subscribe(() => { });
    }
  }

  getStrategyMatchId(strategy, match): number {
    const length = this.strategyMatches.length;
    let index;
    for (index = 0; index < length; index++) {
      const strategyMatch = this.strategyMatches[index];
      if (
        strategyMatch &&
        strategyMatch.strategyId == strategy.strategyId &&
        strategyMatch.matchId == match.matchId
      )
        return strategyMatch.strategyMatchId;
    }
    return -1;
  }

  isLinked(strategy, match): Boolean {
    return this.getStrategyMatchId(strategy, match) != -1;
  }

  isFavourite(match) {
    const result = this.favouriteMatches.find((favouriteMatch) => {
      return favouriteMatch.matchId == match.matchId;
    });
    return result;
  }

  isItemInArray(array, item) {
    for (var i = 0; i < array.length; i++) {
        // This if statement depends on the format of your array
        if (array[i][0] == item[0] && array[i][1] == item[1]) {
            return true;   // Found it
        }
    }
    return false;   // Not found
}

  // @HostListener('window:resize')
  // onResize() {
  //   const dom: any = this.containerTable.elementRef.nativeElement;
  //   const boundRect: any = dom.getBoundingClientRect();
  //   const availHeight = window.innerHeight;
  //   const footer: any = document.querySelector('footer');
  //   const footerHeight = footer.offsetHeight;

  //   dom.style.height = (availHeight - boundRect.top - footerHeight) + 'px';
  // }
}
