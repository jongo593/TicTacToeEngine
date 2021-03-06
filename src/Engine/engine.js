'use strict';

var q = require('q');
var _ = require('lodash');

var engine = function(){

	var WINNING_BOARDS = {
		vertical: [
			[{x: 0, y: 0},
			{x: 1, y: 0},
			{x: 2, y: 0}],

			[{x: 0, y: 1},
			{x: 1, y: 1},
			{x: 2, y: 1}],

			[{x: 0, y: 2},
			{x: 1, y: 2},
			{x: 2, y: 2}]
		],

		horizontal: [
			[{x: 0, y: 0},
			{x: 0, y: 1},
			{x: 0, y: 2}],

			[{x: 1, y: 0},
			{x: 1, y: 1},
			{x: 1, y: 2}],

			[{x: 2, y: 0},
			{x: 2, y: 1},
			{x: 2, y: 2}]
		],

		diagonal: [
			[{x: 0, y: 0},
			{x: 1, y: 1},
			{x: 2, y: 2}],

			[{x: 0, y: 2},
			{x: 1, y: 1},
			{x: 2, y: 0}]
		]
	};

	var emptyBoard = [[0,0,0],
					  [0,0,0],
					  [0,0,0]];

	function isWin (board, cases){
		var player = 0;
		var bot = 0;
		var win = {win: false};

		_.forEach(cases, function (win_case){
			var player = 0;
			var bot = 0;
			if(win.win){
				return
			} else {
				_.forEach(win_case, function (coords){
					var pos = board[coords.x][coords.y];
					console.log('x: '+coords.x + ', y: '+coords.y +', pos: ' +pos);
					if(pos === 1){
						player++;
					} else if (pos === 2){
						bot++;
					}

					if(player === 3){
						win = {win: true, winner: 'player'};
						return;
					} else if(bot ===3){
						win = {win: true, winner: 'bot'};
						return
					} else {
						win = {win: false};
					}
				});	
			}
		});
		return win;
	}

	this.boardState = emptyBoard;

	var self = this;
	this.StartNewGame = function (){
		self.boardState = emptyBoard;
		return emptyBoard;
	};

	this.SubmitMove = function (coords, player_num){
		var deferred = q.defer();

		if(coords.x <= 2 && coords.y <= 2){
			if(self.boardState[coords.x][coords.y] === 0){
				self.boardState[coords.x][coords.y] = player_num;
				deferred.resolve(self.boardState);
			} else {
				deferred.reject({err: 'Space Taken'});
			}	
		} else {
			deferred.reject({err: 'Invalid Coordinates'});
		}

		return deferred.promise;
	};

	this.CheckBoardState = function (){
		var deferred = q.defer();
		var case_outcome = {};
		_.forEach(WINNING_BOARDS, function (win_cases){
			case_outcome = isWin(self.boardState, win_cases);
			console.log(case_outcome);
			if(case_outcome.win){
				deferred.resolve(case_outcome);
				return;
			}
		});

		deferred.reject(case_outcome);

		return deferred.promise;
	};

	//TODO implement min-max algorithm to determine the bots move.
	this.botMove = function (){
		var deferred = q.defer();

		var availableMoves = [];

		_.forEach(this.boardState, function (row, index){
			_.forEach(row, function (cell, index2){
				if(cell === 0){
					availableMoves.push({x:index, y:index2});
				}
			});
		});

		if(availableMoves.length){
			deferred.resolve(_.shuffle(availableMoves)[0]);
		}
		else {
			deferred.reject();
		}

		return deferred.promise;
	};

};

module.exports = engine;
