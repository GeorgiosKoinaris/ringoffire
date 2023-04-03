import { Component, inject, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Observable } from 'rxjs';
import { addDoc, collection, collectionData, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  pickCardAnimation = false;
  currentCard: string;
  game: Game;
  games$: Observable<any[]>;
  firestore: Firestore = inject(Firestore);

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {
    const itemCollection = collection(this.firestore, 'games');
    this.games$ = collectionData(itemCollection);
  }

  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe((params) => {
      console.log(params['id']);

      this.games$.subscribe((game) => {
        console.log('Game Update:', game);
      });
    });
  }

  newGame() {
    this.game = new Game();
    // const itemCollection = collection(this.firestore, 'games');
    // addDoc(itemCollection, { game: this.game.toJson() });
    // setDoc(doc(itemCollection), this.game.toJson());
  }

  takeCard() {
    if (!this.pickCardAnimation) {
      this.currentCard = this.game.stack.pop();
      this.pickCardAnimation = true;

      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;

      setTimeout(() => {
        this.game.playedCards.push(this.currentCard);
        this.pickCardAnimation = false;
      }, 1000);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
      }
    });
  }

}
