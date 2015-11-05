'use strict';
var _ = require('lodash');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var engine = require('./src/Engine/engine');


io.on('connection', function (socket){
	console.log('a user has connected');

	socket.on('startGame', function (user){
		console.log(user);
		var game = new engine();
		var currentBoard = game.StartNewGame();
		var players_turn = true;
		socket.emit('game:start', currentBoard);

		socket.on('submit:move', function (coords){
			console.log(coords);
			if(_.has(coords, 'x') && _.has(coords, 'y')){
				players_turn = false;
				game.SubmitMove(coords, 1).done(function (res){

					currentBoard = res;
					socket.emit('submit:accepted', currentBoard);
					players_turn = false;
					game.CheckBoardState().done(function (res){
						socket.emit('game:end', res);
					}, function (err){
						game.botMove().done(function (botCoords){
							game.SubmitMove(botCoords, 2).done(function (res){
								currentBoard = res;
								socket.emit('submit:accepted', currentBoard);
								game.CheckBoardState().done(function (res){
									socket.emit('game:end', res);
								}, function (err){
									players_turn = true;
								});							
							});
						});
					});
				}, function (err){
					socket.emit('submit:rejected', err);
				});
			} else {
				console.log('improper coordinates');
			}
		});
	});

	socket.on('disconnect', function (){
		console.log('a user has disconnected');
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});







