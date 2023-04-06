import { Component, OnInit, inject } from '@angular/core';
import { Firestore, addDoc, collection, } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Game } from 'src/models/game';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent implements OnInit {
  firestore: Firestore = inject(Firestore);

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  newGame() {
    //start game
    let game = new Game();

    const itemCollection = collection(this.firestore, 'games');
    addDoc(itemCollection, (game.toJson())).then((gameInfo) => {
      console.log(gameInfo);
      this.router.navigateByUrl('/game/' + gameInfo.id);
    });
  }
}
