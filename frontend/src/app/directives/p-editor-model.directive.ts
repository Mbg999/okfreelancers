import { Directive, Input, OnChanges, SimpleChange, ElementRef } from "@angular/core";

@Directive({
    selector: '[p-editor-model]'
})
/**
 * AUTOFOCUS BUG on NGPrime editor
 * https://stackoverflow.com/a/53724952/9764641
 */
export class PEditorModelDirective implements OnChanges {
  @Input("p-editor-model") content: string;

  ngOnChanges(changes: { [property: string]: SimpleChange }) {
      let change = changes["content"];
      let elemPosition = this.element.nativeElement.getBoundingClientRect().top + document.body.scrollTop;
      let clientHeight = document.documentElement.clientHeight;

      if (change.isFirstChange() || elemPosition > clientHeight)
      {
          this.element.nativeElement.style.display = 'none';
          setTimeout(() => {
              this.element.nativeElement.style.display = '';
          },20);
      }
  }

  constructor(private element: ElementRef) {
  }
}
