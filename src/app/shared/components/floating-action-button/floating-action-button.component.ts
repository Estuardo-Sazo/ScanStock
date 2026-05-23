import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-floating-action-button',
  templateUrl: './floating-action-button.component.html',
  styleUrls: ['./floating-action-button.component.scss'],
  standalone: true,
})
export class FloatingActionButtonComponent implements OnInit {
  @Output() clickFab = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}

  onClick() {
    this.clickFab.emit();
  }
}
