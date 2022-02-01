var peer = new Peer(); // create Peer object with predefined ID
var otherPeer = null;
var conn = null;

var challenged; //se 1 sono stato sfidato e parto col bianco
				//se 0 ho sfidato io e parto col nero
var oppCol, myCol;
var rivincitaBtn = document.getElementById("rivincita");

rivincita.addEventListener("click", rematch);

class Piece{
	constructor(coord){
		this._coord = coord;
    	this._color = null;
		this._icon = null;
		this._style = null;
    }
	
	set coord(coord){
		this._coord = coord;
	}
	
	get coord(){
		return this._coord;
	}
	
	set color(c){
		this._color = c;
	}
	
	get color(){
		return this._color;
	}
	
	set icon(i){
		this._icon = i;
	}
	
	get icon(){
		return this._icon;
	}
	
	set style(s){
		this._style = s;
	}
	
	get style(){
		return this._style;
	}
	
	movesPossible(board, check){
	}		
}

class King extends Piece{
	constructor(coord, color){
		super(coord);
		this._color = color;
		if(color == "white")	this._icon = "♔";
		else					this._icon = "♚";
    }
    
    movesPossible(board, check){
    	var listMovesPoss = [];
		var moves = [-1, +1, -7, -8, -9, +7, +8, +9] //lista movimenti possibili re
													 //i primi due sono dx e sx
													 //i successivi 3 sono i movimenti verso l'alto
													 //gli ultimi 3, quelli verso il basso
		var listLine = [[0, 7], [8, 15], [16, 23], [24, 31], [32, 39], [40, 47], [48, 55], [56, 63]];
		var line = 0;
		var c = 0;
		for(let j = 0; j < listLine.length; j++){
			if(this._coord >= listLine[j][0] && this._coord <= listLine[j][1]){
				line = j; //trovo la riga in cui si trova il re
				break;
			}
		}
		for(let i = 0; i < moves.length; i++){
			if(((this._coord + moves[i]) >= 0) && ((this._coord + moves[i]) <= 63)  // mossa possibile, è nella scacchiera
				&& (board[this._coord + moves[i]].color != this._color)){ //non c'è già un pezzo del giocatore
				if(this._coord == listLine[line][0]){//controllo se è in uno dei due lati, perchè in questo caso alcune mosse sono proibite
					if(moves[i] != -9 && moves[i] != -1 && moves[i] != +7){
						listMovesPoss[c] = this._coord + moves[i];
						c++;
					}
				}
				else if(this._coord == listLine[line][1]){
					if(moves[i] != -7 && moves[i] != +1 && moves[i] != 9){
						listMovesPoss[c] = this._coord + moves[i];
						c++;
					}
				}
				else{
					listMovesPoss[c] = this._coord + moves[i];
					c++;
				}			
			}
		}
		
		if(check == 0){
			//controllo se le mosse creano uno scacco al mio re, in quel caso elimino la mossa
			for(let i = 0; i < listMovesPoss.length; i++){
				if(checkIfMoveCreatesCheckMateToMyKing(board, this, listMovesPoss[i])){
					//console.log("MOSSA: " + listMovesPoss[i]);
					listMovesPoss.splice(i, 1);//rimuovo la mossa
					i--;
				}
			}
		}
					
		return listMovesPoss;
		
    }
}

class Queen extends Piece{
	constructor(coord, color){
    	super(coord);
		this._color = color;
		if(color == "white")	this._icon = "♕";
		else					this._icon = "♛";
    }
    
    movesPossible(board, check){
		var listMovesPoss = [];
		var listLine = [[0, 7], [8, 15], [16, 23], [24, 31], [32, 39], [40, 47], [48, 55], [56, 63]];
		var line = 0;
		var c = 0;
		
		//trovo gli spostamenti in verticale verso l'alto
		var spost = this._coord - 8;
		while(spost >= 0){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost - 8;
		}
		
		//trovo gli spostamenti in verticale verso il basso
		spost = this._coord + 8;
		while(spost <= 63){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost + 8;
		}
		
		//trovo gli spostamenti in diagonale verso l'alto a sx
		spost = this._coord - 9;
		while(spost >= 0 && isNotASquareSide(listLine, spost)){ //continuo finchè non arrivo alla fine di una riga
																//oppure finchè non vado oltre la scacchiera
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost - 9;
		}
		if(spost >= 0){//se sono "dentro" la scacchiera, se sono uscito perchè
					   //sono arrivato alla fine di una riga, aggiungo quella casella
			if(isNotASquareSide(listLine, this._coord)){
				if(board[spost].color != this._color){
					listMovesPoss[c] = spost;
					c++;
				}
			}
		}
		
		//trovo gli spostamenti in diagonale verso il basso a dx
		spost = this._coord + 9;
		while(spost <= 63 && isNotASquareSide(listLine, spost)){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost + 9;
		}
		if(spost <= 63){
			if(isNotASquareSide(listLine, this._coord)){
				if(board[spost].color != this._color){
					listMovesPoss[c] = spost;
					c++;
				}
			}
		}
		
		//trovo gli spostamenti in diagonale verso l'alto a dx
		spost = this._coord - 7;
		while(spost >= 0 && isNotASquareSide(listLine, spost)){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost - 7;
		}
		if(spost >= 0){
			if(isNotASquareSide(listLine, this._coord)){
				if(board[spost].color != this._color){
					listMovesPoss[c] = spost;
					c++;
				}
			}
		}

		//trovo gli spostamenti in diagonale verso il basso a sx
		spost = this._coord + 7;
		while(spost <= 63 && isNotASquareSide(listLine, spost)){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost + 7;
		}
		if(spost <= 63){
			if(isNotASquareSide(listLine, this._coord)){
				if(board[spost].color != this._color){
					listMovesPoss[c] = spost;
					c++;
				}
			}
		}
	
		//spostamento in orizzontale
		for(let j = 0; j < listLine.length; j++){
			if(this._coord >= listLine[j][0] && this._coord <= listLine[j][1]){
				line = j; //trovo la riga in cui si trova la regina
				break;
			}
		}
		
		//spostamento orizzontale a sx
		spost = this._coord - 1;
		while(spost >= listLine[line][0]){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost - 1;
		}
		
		//spostamento orizzontale a dx
		spost = this._coord + 1;
		while(spost <= listLine[line][1]){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost + 1;
		}
		
		if(check == 0){
			for(let i = 0; i < listMovesPoss.length; i++){
				if(checkIfMoveCreatesCheckMateToMyKing(board, this, listMovesPoss[i])){
					listMovesPoss.splice(i, 1);//rimuovo la mossa
					i--;
				}
			}
		}
		
		
		
		return listMovesPoss;
    }
	
	
}

class Bishop extends Piece{
	constructor(coord, color){
    	super(coord);
		this._color = color;
		if(color == "white")	this._icon = "♗";
		else					this._icon = "♝";
    }
	
	movesPossible(board, check){
		var listMovesPoss = [];
		var c = 0;
		var listLine = [[0, 7], [8, 15], [16, 23], [24, 31], [32, 39], [40, 47], [48, 55], [56, 63]];
		
		//trovo gli spostamenti in diagonale verso l'alto a sx
		var spost = this._coord - 9;
		while(spost >= 0 && isNotASquareSide(listLine, spost)){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost - 9;
		}
		if(spost >= 0){
			if(isNotASquareSide(listLine, this._coord)){
				if(board[spost].color != this._color){
					listMovesPoss[c] = spost;
					c++;
				}
			}
		}
		
		//trovo gli spostamenti in diagonale verso il basso a dx
		spost = this._coord + 9;
		while(spost <= 63 && isNotASquareSide(listLine, spost)){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost + 9;
		}
		if(spost <= 63){
			if(isNotASquareSide(listLine, this._coord)){
				if(board[spost].color != this._color){
					listMovesPoss[c] = spost;
					c++;
				}
			}
		}
		
		//trovo gli spostamenti in diagonale verso l'alto a dx
		spost = this._coord - 7;
		while(spost >= 0 && isNotASquareSide(listLine, spost)){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost - 7;
		}
		if(spost >= 0){
			if(isNotASquareSide(listLine, this._coord)){
				if(board[spost].color != this._color){
					listMovesPoss[c] = spost;
					c++;
				}
			}
		}

		//trovo gli spostamenti in diagonale verso il basso a sx
		spost = this._coord + 7;
		while(spost <= 63 && isNotASquareSide(listLine, spost)){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost + 7;
		}
		if(spost <= 63){
			if(isNotASquareSide(listLine, this._coord)){
				if(board[spost].color != this._color){
					listMovesPoss[c] = spost;
					c++;
				}
			}
		}
		
		if(check == 0){
			for(let i = 0; i < listMovesPoss.length; i++){
				if(checkIfMoveCreatesCheckMateToMyKing(board, this, listMovesPoss[i])){
					listMovesPoss.splice(i, 1);//rimuovo la mossa
					i--;
				}
			}
		}
		
		return listMovesPoss;
    }

}

class Rook extends Piece{
	constructor(coord, color){
    	super(coord);
		this._color = color;
		if(color == "white")	this._icon = "♖";
		else					this._icon = "♜";
    }
	
	movesPossible(board, check){
		var listMovesPoss = [];
		var listLine = [[0, 7], [8, 15], [16, 23], [24, 31], [32, 39], [40, 47], [48, 55], [56, 63]];
		var line = 0;
		var c = 0;
		
		//trovo gli spostamenti in verticale verso l'alto
		var spost = this._coord - 8;
		while(spost >= 0){
			if(board[spost].color == null){
				listMovesPoss[c] = spost;
				c++;
			}
			else if(board[spost].color == this._color){
				break;
			}
			else{
				listMovesPoss[c] = spost;
				c++;
				break;
			}
			spost = spost - 8;
		}
		
		//trovo gli spostamenti in verticale verso il basso
		spost = this._coord + 8;
		while(spost <= 63){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost + 8;
		}
		//spostamento in orizzontale
		for(let j = 0; j < listLine.length; j++){
			if(this._coord >= listLine[j][0] && this._coord <= listLine[j][1]){
				line = j; //trovo la riga in cui si trova la regina
				break;
			}
		}
		
		//spostamento orizzontale a sx
		spost = this._coord - 1;
		while(spost >= listLine[line][0]){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost - 1;
		}
		
		//spostamento orizzontale a dx
		spost = this._coord + 1;
		while(spost <= listLine[line][1]){
			if(check == 0){//se voglio la lista delle mosse da fare, allora continuo a prendere le mosse nella direzione finchè non c'è nessun pezzo
				if(board[spost].color == null){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){//se trovo un pezzo del mio stesso colore, mi fermo
					break;
				}
				else{//se trovo un pezzo del colore avversario, prendo quella posizione e mi fermo
					listMovesPoss[c] = spost;
					c++;
					break;
				}
			}
			else if(check == 1){//se è per controllare lo scacco, prendo tutte le mosse finchè non trovo un pezzo del mio colore,
								//oppure finchè non trovo un pezzo avversario diverso dal re, se è il re il pezzo che trovo
								//continuo a prendere anche le caselle dopo perchè non si potrà muovere neanche in quelle successive
				if(board[spost].color == null || board[spost].color instanceof King){
					listMovesPoss[c] = spost;
					c++;
				}
				else if(board[spost].color == this._color){
					break;
				}
				else{
					listMovesPoss[c] = spost;
					c++;
					break;
				}
					
			}
			spost = spost + 1;
		}
		
		if(check == 0){
			for(let i = 0; i < listMovesPoss.length; i++){
				if(checkIfMoveCreatesCheckMateToMyKing(board, this, listMovesPoss[i])){
					listMovesPoss.splice(i, 1);//rimuovo la mossa
					i--;
				}
			}
		}
		return listMovesPoss;
    }
	
}

class Knight extends Piece{
	constructor(coord, color){
    	super(coord);
		this._color = color;
		if(color == "white")	this._icon = "♘";
		else					this._icon = "♞";
    }
	
	movesPossible(board, check){
		var listLine = [[0, 7], [8, 15], [16, 23], [24, 31], [32, 39], [40, 47], [48, 55], [56, 63]];
		var listMovesPoss = []
		var moves = [-15, -17, -6, -10, +6, +10, +15, +17] //lista di tutti i movimenti
		var c = 0;
		var line = 0;
		
		for(let j = 0; j < listLine.length; j++){
			if(this._coord >= listLine[j][0] && this._coord <= listLine[j][1]){
				line = j; //trovo la riga in cui si trova il cavallo
				break;
			}
		}
		
		for(let i = 0; i < moves.length; i++){
			//console.log(i);
			if((this._coord + moves[i]) >= 0 && (this._coord + moves[i]) <= 63){//controllo che il movimento faccia rimanere il cavallo dentro la scacchiera
				if(board[this._coord + moves[i]].color != this._color){//controllo che non ci sia già un pezzo dello stesso colore
					if((moves[i] ==  -15 || moves[i] ==  -17) && line - 2 >= 0){//controllo per evitare che un cavallo che si trova vicino ad un lato,
																				//vada a finire in una riga troppo in "basso"
						if(this._coord + moves[i] >= listLine[line - 2][0] && this._coord + moves[i] <= listLine[line - 2][1]){
							listMovesPoss[c] = this._coord + moves[i];
							c++;
						}
					}
					else if((moves[i] ==  -10 || moves[i] == -6) && line - 1 >= 0){ 
						if(this._coord + moves[i] >= listLine[line - 1][0] && this._coord + moves[i] <= listLine[line - 1][1]){
							listMovesPoss[c] = this._coord + moves[i];
							c++;
						}
					}
					else if((moves[i] == +6 || moves[i] == +10) && line + 1 <= listLine.length){
						if(this._coord + moves[i] >= listLine[line + 1][0] && this._coord + moves[i] <= listLine[line + 1][1]){
							listMovesPoss[c] = this._coord + moves[i];
							c++;
						}
					}
					else if((moves[i] ==  +15 || moves[i] ==  +17) && line + 2 <= listLine.length){ 
						if(this._coord + moves[i] >= listLine[line + 2][0] && this._coord + moves[i] <= listLine[line + 2][1]){
							listMovesPoss[c] = this._coord + moves[i];
							c++;
						}
					}
				}
			}
		}
		
		if(check == 0){
			for(let i = 0; i < listMovesPoss.length; i++){
				if(checkIfMoveCreatesCheckMateToMyKing(board, this, listMovesPoss[i])){
					listMovesPoss.splice(i, 1);//rimuovo la mossa
					i--;
				}
			}
		}
		
		
		return listMovesPoss;
	}

}

class Pawn extends Piece{
	constructor(coord, color){
    	super(coord)
		this._color = color;
		if(color === "white")	this._icon = "♙";
		else					this._icon = "♟";
		if(myCol == color) //per sapere in che direzione può andare e in quale riga si può trasformare
						   //in un nuovo pezzo
			this._initPos = "bottom";
		else
			this._initPos = "top";
    }
	set initPos(initPos){
		this._coord = initPos;
	}
	
	get initPos(){
		return this._initPos;
	}
	
	movesPossible(board, check){
		var listMovesPoss = [];
		var c = 0;
		var listLine = [[0, 7], [8, 15], [16, 23], [24, 31], [32, 39], [40, 47], [48, 55], [56, 63]];
		var line = 0;
		
		if(this._initPos == "top"){
			if(this._coord >= 8 && this._coord <= 15){
				if(board[this._coord + 8].color == null){
					listMovesPoss[0] = this._coord + 8;
					c++;
					if(board[this._coord + 16].color == null){
						listMovesPoss[1] = this._coord + 16;
						c++;
					}
				}
				
			}
			else{
				if(this._coord + 8 <= 63){
					if(board[this._coord + 8].color == null){
						listMovesPoss[0] = this._coord + 8;
						c++;
					}
				}
			}
			
			var no7 = false, no9 = false;
			
			//controllo diagonali se il pedone può mangiare
			for(let i = 0; i < listLine.length; i++){
				if(this._coord == listLine[i][0]){//se è un pedone sulla colonna a sx non può mangiare a sx
					no7 = true;
					break;
				}
				else if(this._coord == listLine[i][1]){//se è un pedone sulla colonna a dx non può mangiare a dx
					no9 = true;
				}
			}
			
			if(!no7){
				//se può mangiare, allora controllo che andando a sx rimanga nella scacchiera
				if(this._coord + 7 <= 63){
					//controllo che ci sia un pedone nemico nella cella davanti a sx
					if(board[this._coord + 7].color != null && board[this._coord + 7].color != this._color) {
						listMovesPoss[c] = this._coord + 7;
						c++;
					}
				}
			}
			if(!no9){
				//se può mangiare, allora controllo che andando a dx rimanga nella scacchiera
				if(this._coord + 9 <= 63){
					//controllo che ci sia un pedone nemico nella cella davanti a dx
					if(board[this._coord + 9].color != null && board[this._coord + 9].color != this._color) {
						listMovesPoss[c] = this._coord + 9;
						c++;
					}
				}
			}
		}
		else{
			if(this._coord >= 48 && this._coord <= 55){
				if(board[this._coord - 8].color == null){
					listMovesPoss[0] = this._coord - 8;
					c++;
					if(board[this._coord - 16].color == null){
						listMovesPoss[1] = this._coord - 16;
						c++;
					}
				}
				
			}
			else{
				if(this._coord - 8 >= 0){
					if(board[this._coord - 8].color == null){
						listMovesPoss[0] = this._coord - 8;
						c++;
					}
				}
			}
			
			var no7 = false, no9 = false;
			
			//controllo diagonali se il pedone può mangiare
			for(let i = 0; i < listLine.length; i++){
				if(this._coord == listLine[i][0]){
					no9 = true;
					break;
				}
				else if(this._coord == listLine[i][1]){
					no7 = true;
				}
			}
			
			if(!no7){
				if(this._coord -7 >= 0){
					if(board[this._coord - 7].color != null && board[this._coord - 7].color != this._color) {
						listMovesPoss[c] = this._coord - 7;
						c++;
					}
				}
			}
			if(!no9){
				if(this._coord - 9 >= 0){
					if(board[this._coord - 9].color != null && board[this._coord - 9].color != this._color) {
						listMovesPoss[c] = this._coord - 9;
						c++;
					}
				}
			}
		}
		
		if(check == 0){
			for(let i = 0; i < listMovesPoss.length; i++){
				if(checkIfMoveCreatesCheckMateToMyKing(board, this, listMovesPoss[i])){
					listMovesPoss.splice(i, 1);//rimuovo la mossa
					i--;
				}
			}
		}
		
		return listMovesPoss;
		
	}

}

//funzione per controllare durante il calcolo delle mosse, se arrivo alla fine di una riga
//e quindi mi devo fermare a prendere le mosse in diagonale, altrimenti ricomincerebbe dal lato
//opposto a prendere le mosse
function isNotASquareSide(listLine, spost){
	for(let i = 0; i < listLine.length; i++){
		if(spost == listLine[i][0] || spost == listLine[i][1])
			return false;
	}
	return true;
}

function checkIfMoveCreatesCheckMateToMyKing(board, piece, newCoord){
	//muovo momentaneamente il pezzo e poi controllo se si crea uno scacco
	var oldCoord = piece.coord;
	var pieceInNewCoord = board[newCoord];
	
	//board[newCoord].color == null ? console.log("NULLO"): console.log(board[newCoord].color)
	
	board[newCoord] = piece;
	board[newCoord].coord = newCoord;
	board[oldCoord] = new Piece(oldCoord);
	
	//console.log(newCoord + " " + oldCoord);
	
	var king;
	
	//trovo il re del colore color
	for(let i = 0; i < 64; i++){
		if(board[i] instanceof King && board[i].color == piece.color){
			king = board[i];
			break;
		}
	}
	
	
	for(let i = 0; i < 64; i++){
		
		if(board[i].color != piece.color){
			//console.log(i + board[i].color + piece.color);
			var moves = board[i].movesPossible(board, 1);
			if(moves != undefined){
				for(let j = 0; j < moves.length; j++){
					if(moves[j] == king.coord){
						//non è possibile fare la mossa perchè crea uno scacco
						//ripristino la situazione precedente
						board[oldCoord] = board[newCoord];
						board[oldCoord].coord = oldCoord;
						board[newCoord] = pieceInNewCoord;
						return true;
					}
				}
			}
		}
	}
		
	//è possibile fare la mossa, non crea nessuno scacco al proprio re
	board[oldCoord] = board[newCoord];
	board[oldCoord].coord = oldCoord;
	board[newCoord] = pieceInNewCoord;
	return false;
}

//inizializzo la scacchiera appena il gioco parte
function initBoard(myColor, opponentColor){
	const squares = Array(64).fill(null);
    
    for(let i = 8; i < 16; i++){
    	squares[i] = new Pawn(i, opponentColor);
		squares[i + 40] = new Pawn(i + 40, myColor);
    }
	
	squares[0] = new Rook(0, opponentColor);
	squares[7] = new Rook(7, opponentColor);
	squares[56] = new Rook(56, myColor);
	squares[63] = new Rook(63, myColor);
	
	squares[1] = new Knight(1, opponentColor);
	squares[6] = new Knight(6, opponentColor);
	squares[57] = new Knight(57, myColor);
	squares[62] = new Knight(62, myColor);
	
	squares[2] = new Bishop(2, opponentColor);
	squares[5] = new Bishop(5, opponentColor);
	squares[58] = new Bishop(58, myColor);
	squares[61] = new Bishop(61, myColor);
	
	if(myColor == "white"){
		squares[3] = new Queen(3, opponentColor);
		squares[59] = new Queen(59, myColor);
		
		squares[4] = new King(4, opponentColor);
		squares[60] = new King(60, myColor);
	}
	else{
		squares[4] = new Queen(4, opponentColor);
		squares[60] = new Queen(60, myColor);
		
		squares[3] = new King(3, opponentColor);
		squares[59] = new King(59, myColor);
	}
	
	for(let i = 0; i < 64; i++){
		if(squares[i] == null)
			squares[i] = new Piece(i);
	}
	
	return squares;
}

//inizializzazione del colore
function initMyColor(){
	var myColor;
	
	if(challenged == 1)//se sono stato sfidato, parto per primo
		myColor = "white";
	else
		myColor = "black";
	
	myCol = myColor;
	return myColor;
}

function initOpponentColor(){
	var opponentColor;
	
	if(challenged == 1)//se l'avversario ha sfidato, allora partirà per secondo
		opponentColor = "black";
	else
		opponentColor = "white";
	
	oppCol = opponentColor;
	return opponentColor;
}

function Square(props) {
  return (
	props.style==null?//se lo style è nullo, allora non devo illuminare di giallo/verde/rosso
					  //la cella e quindi lascio il suo colore originale (grigio o bianco)
		<button className={"square " + props.color} onClick={props.onClick}>
			{props.icon} 
		</button>
	:
		<button className={"square " + props.style} onClick={props.onClick}>
			{props.icon}
		</button>
  );
}

class Board extends React.Component{
	renderSquare(i, squareColor){
		return (
			<Square
				piece = {this.props.squares[i]} //prendo il pezzo associato alla cella
				icon = {this.props.squares[i].icon} //prendo l'icona del pezzo
				style = {this.props.squares[i].style} //stile della casella, nel caso debba essere illuminata
				color = {squareColor} //colore della cella (grigio o bianca)
				onClick = {() => this.props.onClick(i)}
			/>
		);
	}
	
	render() {
		const board = [];
		var squareColor = "#EAF0CE";
		for(let i = 0; i < 8; i++){
			//creo riga per riga le celle, impostando a modo alterno il colore della cella
			const rows = [];
			for(let j = 0; j < 8; j++){
				if((i % 2 == 0 && j % 2 == 0) || (i % 2 == 1 && j % 2 == 1))
					squareColor = "white";
				else
					squareColor = "black";
				rows.push(this.renderSquare((i * 8) + j, squareColor));
			}
			board.push(<div className = "board-row"> {rows} </div>);
		}
		
		return (
			<div> {board} </div>
		);
	}	
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
		opponentColor: initOpponentColor(), //imposto il colore dell'avversario
		myColor: initMyColor(),				//imposto il mio colore
    	squares: initBoard(myCol, oppCol),	//inizializzo la scacchiera
		turn: "white",						//imposto il primo turno
		src: -1,							//variabile usata per mantenere in memoria la posizione del 
											//pezzo che si vuole muovere
		lastMovesOpponentSrc: -1,			//per poter "spegnere" la cella illuminata che indica 
		lastMovesOpponentDest: -1			//l'ultima mossa fatta dall'avversario
    }
  }
  
  handleClick(i){//i mi indica la cella premuta
	  const squares = this.state.squares.slice();
	  //se è il mio turno permetto il click sulla scacchiera
	  if(this.state.turn == this.state.myColor){
		  //se src è -1 allora la cella premuta indica il pezzo che si vuole muovere
		  if(this.state.src == -1){
			if(squares[i] != null){
				//se c'è un mio pezzo, allora illumino la cella premuta e anche le mosse possibili
				if(squares[i].color == this.state.myColor){
					squares[i].style = "green";				
					const moves = squares[i].movesPossible(squares, 0);
					showMoves(moves, squares, "yellow");
					this.setState({
						squares: squares,
						src: i //mi salvo la posizione del pezzo premuto
					});
				}
			}
		  }
		  else{//se src != -1, allora vuol dire che voglio muovere il pezzo che è in posizione src
			const moves = squares[this.state.src].movesPossible(squares, 0);
			var j;
			for(j = 0; j < moves.length; j++){
				if(moves[j] == i){
					break;
				}
			}
			//se la cella premuta non è tra le mosse disponibili
			if(moves[j] != i){
				//errore il pezzo non si può muovere lì
				squares[this.state.src].style = null;
				this.setState({
					src: -1
				});
				showMoves(moves, squares, null);
			}
			else{//se la cella premuta è tra le mosse disponibili
				squares[i] = squares[this.state.src]; //sposto il pezzo
				squares[i].coord = i; //aggiorno la coordinata
				squares[this.state.src] = new Piece(this.state.src); //"elimino" il pezzo dalla posizione
																	 //avuta in precedenza
				
				if(squares[i] instanceof Pawn){ // trasformo il pedone se arriva al lato opposto
					if(squares[i].coord >= 0 && squares[i].coord <= 7){
						//trasformo il pedone
						do{
							var trasf = prompt("in cosa vuoi trasformare il pedone?[queen, rook, bishop, knight]", "queen");
							if(trasf == "queen"){
								squares[i] = new Queen(i, this.state.myColor);
							}
							else if(trasf == "rook"){
								squares[i] = new Rook(i, this.state.myColor);
							}
							else if(trasf == "knight"){
								squares[i] = new Knight(i, this.state.myColor);
							}
							else if(trasf == "bishop"){
								squares[i] = new Bishop(i, this.state.myColor);
							}
						}while(trasf != "queen" && trasf != "rook" && trasf != "knight" && trasf != "bishop");
					}
				}
				
				//se non è il primo turno e quindi in precedenza ho illuminato la mossa fatta
				//dall'avversario, la spengo
				if(this.state.lastMovesOpponentSrc != -1){
					var moves2 = []
					moves2[0] = this.state.lastMovesOpponentSrc;
					moves2[1] = this.state.lastMovesOpponentDest;
					showMoves(moves2, squares, null);
				}
				
				squares[this.state.src].style = null;//tolgo il colore verde dalla posizione							 
				showMoves(moves, squares, null);	 //di aprtenza del pezzo mosso
				
				var source = this.state.src;//mi salvo la mossa fatta per poterla inviare 
				var dest = i;				//all'avversario e poterla illuminare di rosso
				
				this.state.turn = this.state.opponentColor; //cambio il turno
				this.setState({
					squares: squares,
					src: -1,
				});

				
				//imposto la nuova scacchiera da inviare all'avversario per potergliela aggiornare
				var newSquares = [];
				
				for(let j = 0; j < squares.length; j++){
					if(squares[j] instanceof King){
						if(squares[j].color == "white")
							newSquares[j] = ["King", "white"];
						else
							newSquares[j] = ["King", "black"];		
					}
					else if(squares[j] instanceof Queen){
						if(squares[j].color == "white")
							newSquares[j] = ["Queen", "white"];
						else
							newSquares[j] = ["Queen", "black"];	
					}
					else if(squares[j] instanceof Bishop){
						if(squares[j].color == "white")
							newSquares[j] = ["Bishop", "white"];
						else
							newSquares[j] = ["Bishop", "black"];	
					}
					else if(squares[j] instanceof Rook){
						if(squares[j].color == "white")
							newSquares[j] = ["Rook", "white"];
						else
							newSquares[j] = ["Rook", "black"];	
					}
					else if(squares[j] instanceof Knight){
						if(squares[j].color == "white")
							newSquares[j] = ["Knight", "white"];
						else
							newSquares[j] = ["Knight", "black"];	
					}
					else if(squares[j] instanceof Pawn){
						if(squares[j].color == "white")
							newSquares[j] = ["Pawn", "white"];
						else
							newSquares[j] = ["Pawn", "black"];	
					}
					else{
						newSquares[j] = ["Piece", "None"];
					}
				}
				//invio all'avversario la nuova scacchiera, la posizione in cui si è mosso il pezzo e il turno
				var sendNewSquare = {squares: newSquares, source: source, dest: dest, src: 1, turn: this.state.opponentColor};
			
				conn.send(sendNewSquare);
				
				//controllo se ho dato scacco/scacco matto o se c'è uno stallo
				checkmateOrStalemate(this.state.opponentColor, this.state.squares);
				
			}		
		  }
	  }
  }
  
  
  render() {
	  if(this.props.src != -1){
		  if(this.props.src == -2){//rematch iniziata da me, resetto tutte le variabili ai valori di default
			this.state.turn = "white";
			this.state.src = -1;
			this.state.lastMovesOpponentSrc = -1;
			this.state.lastMovesOpponentDest = -1;
			challenged = 0; //ho sfidato, quindi aprto per secondo
			this.state.myColor = initMyColor();
			this.state.opponentColor = initOpponentColor();
			this.state.squares = initBoard(myCol, oppCol);
			$("#rivincita").hide();
		  }
		  else if(this.props.src == -3){//rematch avvenuto da parte dell'avversario
			this.state.turn = "white";
			this.state.src = -1;
			this.state.lastMovesOpponentSrc = -1;
			this.state.lastMovesOpponentDest = -1;
			challenged = 1;
			this.state.myColor = initMyColor();
			this.state.opponentColor = initOpponentColor();
			this.state.squares = initBoard(myCol, oppCol);
			$("#rivincita").hide();
		  }
		  else{//ho ricevuto la nuova mossa dell'avversario e aggiorno la scacchiera
			  for(let i = 0; i < this.state.squares.length; i++){
				  if(this.props.squares[i][0] == "King" && this.props.squares[i][1] == "white"){
					this.state.squares[63 - i] = new King(63 - i, "white");
				  }
				  else if(this.props.squares[i][0] == "King" && this.props.squares[i][1] == "black"){
					this.state.squares[63 - i] = new King(63 - i, "black");
				  }
				  else if(this.props.squares[i][0] == "Queen" && this.props.squares[i][1] == "white"){
					this.state.squares[63 - i] = new Queen(63 - i, "white");
				  }
				  else if(this.props.squares[i][0] == "Queen" && this.props.squares[i][1] == "black"){
					this.state.squares[63 - i] = new Queen(63 - i, "black");
				  }
				  else if(this.props.squares[i][0] == "Bishop" && this.props.squares[i][1] == "white"){
					this.state.squares[63 - i] = new Bishop(63 - i, "white");
				  }
				  else if(this.props.squares[i][0] == "Bishop" && this.props.squares[i][1] == "black"){
					this.state.squares[63 - i] = new Bishop(63 - i, "black");
				  }
				  else if(this.props.squares[i][0] == "Rook" && this.props.squares[i][1] == "white"){
					this.state.squares[63 - i] = new Rook(63 - i, "white");
				  }
				  else if(this.props.squares[i][0] == "Rook" && this.props.squares[i][1] == "black"){
					this.state.squares[63 - i] = new Rook(63 - i, "black");
				  }
				  else if(this.props.squares[i][0] == "Knight" && this.props.squares[i][1] == "white"){
					this.state.squares[63 - i] = new Knight(63 - i, "white");
				  }
				  else if(this.props.squares[i][0] == "Knight" && this.props.squares[i][1] == "black"){
					this.state.squares[63 - i] = new Knight(63 - i, "black");
				  }
				  else if(this.props.squares[i][0] == "Pawn" && this.props.squares[i][1] == "white"){
					this.state.squares[63 - i] = new Pawn(63 - i, "white");
				  }
				  else if(this.props.squares[i][0] == "Pawn" && this.props.squares[i][1] == "black"){
					this.state.squares[63 - i] = new Pawn(63 - i, "black");
				  }
				  else{
					this.state.squares[63 - i] = new Piece(63 - i);
				  }	  
			  }
			  
			  //illumino la mossa effettuata
			  var moves = [];
			  moves[0] = 63 - this.props.source;
			  moves[1] = 63 - this.props.dest;
			  showMoves(moves, this.state.squares, "red");
			  this.state.lastMovesOpponentSrc = 63 - this.props.source;
			  this.state.lastMovesOpponentDest = 63 - this.props.dest;
			  
			  this.state.turn = this.state.myColor;
			  this.props.src = -1;
			  //controllo se l'avversario mi ha dato scacco/scacco matto o se c'è uno stallo
			  checkmateOrStalemate(this.state.myColor, this.state.squares);
		  }
	}	
    return (
		<div>
			<div class = "board" style={{
				position: 'absolute', left: '50%', top: '480px',
				transform: 'translate(-50%, -50%)'
			}}>
				<Board
					squares = {this.state.squares}
					onClick = {(i) => this.handleClick(i)}
				/>
			</div>				
			
			
		</div>
    );
  }
}

function checkmateOrStalemate(color, board){
	var movesPossible = []; //lista delle mosse disponibili che può fare l'avversario o che posso fare io
							//se è vuota e il re è sotto scacco, allora il giocatore ha perso
							//se è vuota, ma il re non è sotto scacco, allora la partita è in stallo
	//console.log("COLORE: " + color);
	for(let i = 0; i < 64; i++){
		if(board[i].color == color){
			movesPossible = movesPossible.concat(board[i].movesPossible(board, 0));
				
		}
	}	
	//console.log("lunghezza: " + movesPossible.length);
	//console.log(movesPossible[0])
	if(movesPossible.length == 0){
		if(check(color, board)){
			//scacco matto
			if(color == myCol){
				//perso
				window.alert("Hai Perso");
				console.log("HAI PERSO");
				//$("#remote").show();
				$("#rivincita").show();
			}
			else{
				//vinto
				window.alert("Hai Vinto");
				console.log("HAI VINTO");
				$("#rivincita").show();
				
				//$("#remote").show();
			}
		}
		else{
			//stallo
			window.alert("Stallo");
			console.log("STALLO");
			//$("#remote").show();
		}		
	}		
}

function rematch(){
	ReactDOM.render(<Game squares = {-1} src = {-2} turn = {"white"}/>, document.getElementById("root"));
	conn.send("rematch");
}

function check(color, board){
	var king;
	
	//trovo il re del colore color
	for(let i = 0; i < 64; i++){
		if(board[i] instanceof King && board[i].color == color){
			king = board[i];
		}
	}

	//controllo se è attaccato da qualche pezzo nemico
	for(let i = 0; i < 64; i++){
		if(board[i].color != null && board[i].color != color){
			var moves = board[i].movesPossible(board, 1);
			if(moves != undefined){
				for(let j = 0; j < moves.length; j++){
					if(moves[j] == king.coord)
						return true; //c'è almeno uno scacco
				}
			}
		}
	}
	//console.log("PROVA");
	return false; //niente scacco
}

//funzione per illuminare il pezzo che si vuole muovere di verde
//le mosse possibili per un pezzo cliccato di giallo/verde/rosso
//e la mossa effettuata dall'avversario di rosso
function showMoves(moves, squares, color){
	for(let i = 0; i < moves.length; i++){
		//console.log(moves[i]);
		squares[moves[i]].style = color;
	}
}

$(document).ready(function(){
	$("#rivincita").hide();
  peer.on('open', function(id) {
    $("#para").text('My peer ID is: ' + id);
	
  });

  peer.on('error', function (err) {
    console.log(err);
    alert('' + err);
  });

  peer.on('connection', function(c) {
	conn = c;
	challenged = 1;
	myCol = "white";
	oppCol = "black";
	$("#remote").hide();
	ReactDOM.render(<Game squares = {-1} src = {-1} turn = {"white"}/>, document.getElementById("root"));
    
	c.on('data', function(data){ 
		if(data == "rematch")
			ReactDOM.render(<Game squares = {-1} src = {-3} turn = {"white"}/>, document.getElementById("root"));
		else
			ReactDOM.render(<Game squares = {data.squares} source = {data.source} dest = {data.dest} src = {data.src} turn = {data.turn}/>, document.getElementById("root"));  
    });
	
  });

  $("#connect").on('click', function() {
    if ( $("#otherPeer").val() != null ) {
      $("#remote").hide();
      conn = peer.connect($("#otherPeer").val());
      conn.on('open', function() {
        otherPeer = conn.peer;
		challenged = 0;
		oppCol = "white";
		myCol = "black";
		ReactDOM.render(<Game squares = {-1} src = {-1} turn = {"white"}/>, document.getElementById("root"));
        
      });
	  
	  conn.on('data', function(data){  
		if(data == "rematch")
			ReactDOM.render(<Game squares = {-1} src = {-3} turn = {"white"}/>, document.getElementById("root"));
		else
			ReactDOM.render(<Game squares = {data.squares} source = {data.source} dest = {data.dest} src = {data.src} turn = {data.turn}/>, document.getElementById("root"));
	  
	  });
	  
    };
  });

});


