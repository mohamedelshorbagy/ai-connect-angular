import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  board: Array<Array<any>>;
  action;
  constructor() { }
}
