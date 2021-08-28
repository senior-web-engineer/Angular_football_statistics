import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent implements OnInit {

  @Input() label: string;
  @Input() color;
  @Input() disabled: boolean;
  @Output() colorChange = new EventEmitter();
  constructor() {
  }

  ngOnInit(): void {
  }

  handleChangeColor(value) {
    this.colorChange.emit(value);
  }
}
