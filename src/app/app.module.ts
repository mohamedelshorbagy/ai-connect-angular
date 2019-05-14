import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameBoardComponent } from './components/game-board/game-board.component';
import { BoardColumnComponent } from './components/board-column/board-column.component';
import { BoardCheckerComponent } from './components/board-checker/board-checker.component';
import { BoardContainerComponent } from './components/board-container/board-container.component';
import { ObjectValuesPipe } from './object-values.pipe';

@NgModule({
  declarations: [
    AppComponent,
    GameBoardComponent,
    BoardColumnComponent,
    BoardCheckerComponent,
    BoardContainerComponent,
    ObjectValuesPipe
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
