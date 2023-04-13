import { Component, inject, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Observable } from 'rxjs';
import { collection, collectionData, docData, Firestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { EditPlayerComponent } from '../edit-player/edit-player.component';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})

export class GameComponent implements OnInit {
  game: Game;
  games$: Observable<any[]>;
  firestore: Firestore = inject(Firestore);
  gameId: string;
  gameOver = false;

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {
    const itemCollection = collection(this.firestore, 'games');
    this.games$ = collectionData(itemCollection);
  }

  ngOnInit(): void {
    this.newGame();

    this.route.params.subscribe((params) => {
      // console.log(params['id']);
      this.gameId = params['id'];

      this.loadGame(this.gameId);
    });
  }

  loadGame(gameId) {
    const gameRef: any = doc(this.firestore, 'games', gameId);
    this.games$ = docData(gameRef);

    this.games$.subscribe((game: any) => {
      // console.log('Game Update:', game);
      this.game.currentPlayer = game.currentPlayer;
      this.game.playedCards = game.playedCards;
      this.game.players = game.players;
      this.game.player_images = game.player_images;
      this.game.stack = game.stack;
      this.game.pickCardAnimation = game.pickCardAnimation;
      this.game.currentCard = game.currentCard;
    });
  }

  newGame() {
    this.game = new Game();
  }

  takeCard() {
    if (this.game.stack.length == 0) {
      this.gameOver = true;
    }
    else if (!this.game.pickCardAnimation) {
      this.game.currentCard = this.game.stack.pop();
      this.game.pickCardAnimation = true;

      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      this.saveGame();

      setTimeout(() => {
        this.game.playedCards.push(this.game.currentCard);
        this.game.pickCardAnimation = false;
        this.saveGame();
      }, 1000);
    }
  }

  editPlayer(playerId: number) {
    console.log('Edit Player', playerId);
    const dialogRef = this.dialog.open(EditPlayerComponent);

    dialogRef.afterClosed().subscribe((change: string) => {
      console.log('Received change', change);
      if (change) {
        if (change == 'DELETE') {
          this.game.player_images.splice(playerId, 1);
          this.game.players.splice(playerId, 1);
        } else {
          this.game.player_images[playerId] = change;
          this.saveGame();
        }
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
        this.game.player_images.push('1.png');
        this.saveGame();
      }
    });
  }

  saveGame() {
    const db = getFirestore();
    const docRef = doc(db, "games", this.gameId);

    updateDoc(docRef, this.game.toJson()).then((res) => {
      console.log('Speichern erfolgreich! ', res);
    });
  }
}
