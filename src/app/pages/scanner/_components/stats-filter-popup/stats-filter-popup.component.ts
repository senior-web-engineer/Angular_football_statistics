import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, QueryList, ViewChildren } from '@angular/core';
import {
  MAIN_COLUMN_VISIBILITY_FIELD,
  STATS_FILTER_STAT_TYPE_OPTIONS,
  STAT_FILTER_COMPARARISON_TYPES,
} from './../config/grid-settings-config';
import { MessageService } from '../../message.service';
import { environment } from 'src/environments/environment';
import { StrategyFiltersOperandComponent } from 'src/app/shared/strategy-filters-operand/strategy-filters-operand.component';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';

import {
  Val,
  Operand,
  Filter
} from 'src/app/shared/strategy-filters-operand/filters';

@Component({
  selector: 'app-stats-filter-popup',
  templateUrl: './stats-filter-popup.component.html',
  styleUrls: ['./stats-filter-popup.component.scss'],
})
export class StatsFilterPopupComponent implements OnInit, OnChanges {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('leftOperand') leftOperand: StrategyFiltersOperandComponent;
  @ViewChild('rightOperand') rightOperand: StrategyFiltersOperandComponent;
  @ViewChildren(MatExpansionPanel) panels: QueryList<MatExpansionPanel>;

  type_left = 'left';
  type_right = 'right';
  selectedStatFilterType: string;

  selectedStatValue;
  selectedFilterType;
  value;

  // filterTypes = STAT_FILTER_COMPARARISON_TYPES;
  filterTypes: any;

  homeFilterCount = 0;
  awayFilterCount = 0;

  @Input()
  modal;

  @Input()
  gridNumber;

  statTypes;

  goalNumbers;

  @Input()
  filters = [];
  _filters = [];

  @Input()
  scoreFilters = [];
  _scoreFilters = [];
  homeGoal;
  awayGoal;

  @Input()
  additionalFilters = [];
  _additionalFilters = [];

  saveOption = "1";
  lVal1: Val;
  lVal2: Val;
  rVal1: Val;
  rVal2: Val;
  leftObject: Operand;
  rightObject: Operand;
  filterdata: Filter;

  leftVal1_pre1(){return};
  leftVal1_pre2(){return};
  leftVal1_pre3(){return};
  leftVal2_pre1(){return};
  leftVal2_pre2(){return};
  leftVal2_pre3(){return};

  rightVal1_pre1(){return};
  rightVal1_pre2(){return};
  rightVal1_pre3(){return};
  rightVal2_pre1(){return};
  rightVal2_pre2(){return};
  rightVal2_pre3(){return};

  leftVal1(){return };
  leftVal2(){return };
  leftOperator(){return};
  rightVal1(){return };
  rightVal2(){return };
  rightOperator(){return};

  constructor(private messageService: MessageService) {
    this.statTypes = JSON.parse(JSON.stringify(STATS_FILTER_STAT_TYPE_OPTIONS));
    this.statTypes = this.statTypes.filter((stat) => {
      return stat != null;
    });
    this.statTypes.sort(function (a, b) {
      var x = a.value.toLowerCase();
      var y = b.value.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });
  }

  ngOnInit(): void {
    this.calculateLength();
    this.goalNumbers = this.generate(25);
    this.filterTypes = ['≥', '>', '≤', '<', '=', '≠'];
    this.selectedStatFilterType = this.filterTypes[0];
  }

  ngOnChanges(changes: SimpleChanges): void {
    this._filters = JSON.parse(
      JSON.stringify(this.filters)
    );
    this._scoreFilters = JSON.parse(
      JSON.stringify(this.scoreFilters)
    );
    this._additionalFilters = JSON.parse(
      JSON.stringify(this.additionalFilters)
    );
  }

  ngAfterViewInit(): void {

    // bind operand data from child component
    setTimeout(() => {
      this.leftVal1 = ()=> this.leftOperand.Val1;
      this.leftVal1_pre1 = ()=>this.leftOperand.Val1.previewStr1!=''?this.leftOperand.Val1.previewStr1:'?';
      this.leftVal1_pre2 = ()=>this.leftOperand.Val1.previewStr2;
      this.leftVal1_pre3 = ()=>this.leftOperand.Val1.previewStr3;
      this.leftVal2 = ()=> this.leftOperand.Val2;
      this.leftVal2_pre1 = ()=>this.leftOperand.Val2.previewStr1;
      this.leftVal2_pre2 = ()=>this.leftOperand.Val2.previewStr2;
      this.leftVal2_pre3 = ()=>this.leftOperand.Val2.previewStr3;
      this.leftOperator = ()=> this.leftOperand.operator;

      this.rightVal1 = ()=> this.rightOperand.Val1;
      this.rightVal1_pre1 = ()=>this.rightOperand.Val1.previewStr1!=''?this.rightOperand.Val1.previewStr1:'?';
      this.rightVal1_pre2 = ()=>this.rightOperand.Val1.previewStr2;
      this.rightVal1_pre3 = ()=>this.rightOperand.Val1.previewStr3;
      this.rightVal2 = ()=> this.rightOperand.Val2;
      this.rightVal2_pre1 = ()=>this.rightOperand.Val2.previewStr1;
      this.rightVal2_pre2 = ()=>this.rightOperand.Val2.previewStr2;
      this.rightVal2_pre3 = ()=>this.rightOperand.Val2.previewStr3;
      this.rightOperator = ()=> this.rightOperand.operator;
    }, 0);
  }

  generate(number) {
    let num = [];
    for (var i = 0; i < number; i++) {
      num.push(i);
    }
    return num;
  }

  selectHomeGoal(value) {
    this.homeGoal = value;
  }

  selectAwayGoal(value) {
    this.awayGoal = value;
  }

  calculateLength() {
    if (this.filters && this.filters.length) {
      let home = this.filters.filter(
        (value) => value.statType.appliesOn == 'Home'
      );
      let away = this.filters.filter(
        (value) => value.statType.appliesOn == 'Away'
      );
      this.homeFilterCount = home ? home.length : 0;
      this.awayFilterCount = away ? away.length : 0;
    }
  }

  addFilter() {
    if (!this.selectedStatValue || !this.selectedFilterType || !this.value) {
      return;
    }

    if (this.addFilterEnabled()) {
      this._filters.push({
        statType: this.selectedStatValue,
        filterType: this.selectedFilterType,
        filterValue: this.value,
      });
      this.calculateLength();
      this.clear();
    }
  }

  addFilterEnabled() {
    return this.selectedStatValue && this.selectedStatValue && this.value;
  }

  clearFilters() {
    this._filters = [];
    this.homeFilterCount = 0;
    this.awayFilterCount = 0;
  }

  removeFilter(index) {
    this._filters.splice(index, 1);
    this.calculateLength();
  }


  removeAdditionalFilter(index) {
    this._additionalFilters.splice(index, 1);
  }

  clear() {
    this.selectedStatValue = null;
    this.selectedStatValue = null;
    this.value = null;
  }

  selectDropdownValue(value) {
    this.selectedStatValue = value;
  }

  selectFilterType(value) {
    this.selectedFilterType = value;
  }

  applyFilters() {
    this.messageService.applyStatsFilters({
      filters: this._filters,
      scoreFilters: this._scoreFilters,
      additionalFilters: this._additionalFilters,
      gridNumber: this.gridNumber,
      saveOption: this.saveOption,
    });
  }

  isLight() {
    return environment.theme == 'light';
  }

  addScoreFilter() {
    this._scoreFilters.push(this.homeGoal + '-' + this.awayGoal);
    this.clearScoreFilter();
  }

  addScoreFilterEnabled() {
    return this.homeGoal >= 0 && this.awayGoal >= 0;
  }

  clearScoreFilter() {
    this.homeGoal = undefined;
    this.awayGoal = undefined;
  }

  removeScoreFilters(index) {
    this._scoreFilters.splice(index, 1);
  }

  clearAllFilters() {
    this._filters = [];
    this._scoreFilters = [];
    this._additionalFilters = [];
  }

  saveFilters() {
    this.applyFilters();
    this.modal.dismiss('Cross click');
  }

  // for new filter

  closeOtherPanels(openPanel: MatExpansionPanel) {
    this.panels.forEach(panel => {
        if (panel !== openPanel) {
            panel.close();
        }
    });
  }

  private _processFiltersConfig(value):Val {
    let returnVal:Val = {reference:''};
    if(value.reference!='') {
      returnVal.reference = value.reference;
      if(value.team!='') {
        returnVal.team = value.team;
        switch(value.rangeValue){
          case 'offset':
            returnVal.timerOffset = value.timerOffset;
            break;
          case 'fh':
          case 'sh':
          case 'ht':
          case 'ft':
          case 'disablied':
            returnVal.timerPeriod = value.timerPeriod;
            break;
          case 'range':
            returnVal.timeRangeFrom = value.timeRangeFrom;
            returnVal.timeRangeTo = value.timeRangeTo;
            break;
          default:
            returnVal[value.rangeValue] = value[value.rangeValue];
            break;
        }
      }
    }
    else{
      returnVal.constant = value.constant;
    }

    return returnVal;
  }

  onSaveRule():void {
    this.lVal1 = this._processFiltersConfig(this.leftOperand.Val1);
    this.lVal2 = this._processFiltersConfig(this.leftOperand.Val2);
    this.rVal1 = this._processFiltersConfig(this.rightOperand.Val1);
    this.rVal2 = this._processFiltersConfig(this.rightOperand.Val2);

    if(!this.lVal1.constant && !this.lVal1.reference) return;
    if(!this.rVal1.constant && !this.rVal1.reference) return;
    this.leftObject = {
      Operator:this.leftOperand.operator,
      Val1: this.lVal1,
      Val2: this.lVal2,
    }
    this.rightObject = {
      Operator:this.rightOperand.operator,
      Val1: this.rVal1,
      Val2: this.rVal2,
    }
    let filterString = `${this.leftVal1_pre1()}${this.leftVal1_pre2()}${this.leftVal1_pre3()}
      ${this.leftOperator()}
      ${this.leftVal2_pre1()}${this.leftVal2_pre2()}${this.leftVal2_pre3()}
      ${this.selectedStatFilterType}
      ${this.rightVal1_pre1()}${this.rightVal1_pre2()}${this.rightVal1_pre3()}
      ${this.rightOperator()}
      ${this.rightVal2_pre1()}${this.rightVal2_pre2()}${this.rightVal2_pre3()}`;
    filterString = filterString.replace(/undefined/g,'');
      this.filterdata = {
      Comparator: this.selectedStatFilterType,
      Left: this.leftObject,
      Right: this.rightObject,
      filterString: filterString,
    }
    // let ffiltersConfig = this.strategy.filtersConfig?JSON.parse(this.strategy.filtersConfig):[];
    // if ([...(ffiltersConfig || [])].some((el) => JSON.stringify(this.filterdata) == JSON.stringify(el))) return;
    // this.filters = [
    //   ...(this.filters || []),
    //   filterString,
    // ];
    // this._store.setTargetStrategy({
    //   ...this.strategy,
    //   filtersConfig: JSON.stringify([
    //     ...(ffiltersConfig || []),
    //     this.filterdata,
    //   ]),
    // });

    this._additionalFilters.push(this.filterdata)
    this.accordion.closeAll();

  }

  onCancelRule(): void {
    this.accordion.closeAll();
  }

  // end new filter
}
