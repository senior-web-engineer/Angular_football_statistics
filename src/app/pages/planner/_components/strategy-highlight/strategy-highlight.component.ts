import { Component, Input, OnInit } from '@angular/core';
import { StateService } from 'src/app/core/services';
import { Subject } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-strategy-highlight',
  templateUrl: './strategy-highlight.component.html',
  styleUrls: ['./strategy-highlight.component.scss']
})
export class StrategyHighlightComponent implements OnInit {

  constructor(private _store: StateService) { }
  @Input() disabled;
  targetStrategy: any;

  gridDisplayConfig: any;

  _highlightConfig = {
    statsDifferenceHighColour: '#ffffff',
    statsDifferenceHighValue: null,
    statsDifferenceMediumColour: '#ffffff',
    statsDifferenceMediumValue: null,
    statsDifferenceLowColour: '#ffffff',
    statsDifferenceLowValue: null,
    attackConversionHighColour: '#ffffff',
    attackConversionHighValue: null,
    attackConversionLowColour: '#ffffff',
    attackConversionLowValue: null,
    shape: 'rect',
  }

  highlightConfig: any;

  ngOnInit(): void {
    this._initValues();
    this._getTargetStrategy();
  }

  private _initValues() {
    this.gridDisplayConfig = {
      RowClickPrimary: '' ,
      RowClickSecondary: '' ,
      RowHoverColour: '' ,
    };
    this.highlightConfig = JSON.parse(
      JSON.stringify(this._highlightConfig)
    );
  }

  private _getTargetStrategy(): void {
    this._store.targetStrategy
      .pipe(
        filter(Boolean),
        tap((strategy) => {
          this.targetStrategy = strategy;
          if (this.targetStrategy.highlightConfig) {
            this.highlightConfig = JSON.parse(
              this.targetStrategy.highlightConfig
            );
          } else {
            this.highlightConfig = JSON.parse(
              JSON.stringify(this._highlightConfig)
            );
          }

          if (this.targetStrategy.gridDisplayConfig) {
            this.gridDisplayConfig = JSON.parse(
              this.targetStrategy.gridDisplayConfig
            );
            delete this.gridDisplayConfig['rowHighlightColour'];
            const { RowClickPrimary, RowClickSecondary, RowHoverColour } = this.gridDisplayConfig;

            if (!RowClickPrimary) {
              this.gridDisplayConfig['RowClickPrimary'] = '';
            }
            if (!RowClickSecondary) {
              this.gridDisplayConfig['RowClickSecondary'] = '';
            }
            if (!RowHoverColour) {
              this.gridDisplayConfig['RowHoverColour'] = '';
            }
          }
        })
      )
      .subscribe(() => {});
  }

  handleChange() {
    this._store.setTargetStrategy({
      ...this.targetStrategy,
      highlightConfig: JSON.stringify(this.highlightConfig)
    })
  }

  updateRowHighlightColour(value, key) {
    this.gridDisplayConfig[key] = value;
    this._store.setTargetStrategy({
      ...this.targetStrategy,
      gridDisplayConfig: JSON.stringify(this.gridDisplayConfig)
    })
  }

  handleChangeShape(value) {
    this.highlightConfig.shape = value;
    this._store.setTargetStrategy({
      ...this.targetStrategy,
      highlightConfig: JSON.stringify(this.highlightConfig)
    })
  }
}
