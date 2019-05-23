import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'filter-checkbox',
  templateUrl: './filter-checkbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => FilterCheckboxComponent),
    }
  ]
})
export class FilterCheckboxComponent implements ControlValueAccessor {
  @Input()
  public label: string;

  public get value(): boolean {
    return this._value;
  }
  public set value(newVal: boolean) {
    this._value = newVal;
    this.onChange(this._value);
    this.onTouch();
  }

  private _value = false;

  private onChange = (_: boolean) => {};
  private onTouch = () => {};

  public writeValue(obj: boolean): void {
    this.value = obj;
    this.onChange(this.value);
    this.onTouch();
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

}
