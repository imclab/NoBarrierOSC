
(function(){
	var OSC = require('../lib/osc');

	Demo.ServerApp = function() {
		return this;
	};

	Demo.ServerApp.prototype = {
		gameClockReal  			: 0,											// Actual time via "new Date().getTime();"
		gameClock				: 0,											// Seconds since start
		gameTick				: 0,											// Ticks/frames since start

		speedFactor				: 1,											// Used to create Framerate Independent Motion (FRIM) - 1.0 means running at exactly the correct speed, 0.5 means half-framerate. (otherwise faster machines which can update themselves more accurately will have an advantage)
		targetFramerate			: 60,											// Try to call our tick function this often, intervalFramerate, is used to determin how often to call settimeout - we can set to lower numbers for slower computers
		intervalGameTick		: null,											// setInterval reference

		netChannel				: null,
		oscClient				: null,
		cmdMap					: {},					// Map the CMD constants to functions
		nextEntityID			: 0,					// Incremented for everytime a new object is created

		startGameClock: function() {

			this.fieldController = new RealtimeMultiplayerGame.Controller.FieldController();
			this.setupNetChannel();
			this.oscClient = new OSC.Client(Demo.Constants.OSC_CONFIG.PORT, Demo.Constants.OSC_CONFIG.ADDRESS);
			var that = this;
			this.gameClockReal = new Date().getTime();
			this.intervalGameTick = setInterval( function(){ that.update() }, Math.floor( 1000/this.intervalFramerate ));
		},

		// Methods
		setupNetChannel: function() {
			this.netChannel = new RealtimeMultiplayerGame.network.ServerNetChannel( this );
		},

		/**
		 * Map RealtimeMultiplayerGame.Constants.CMDS to functions
		 * If ServerNetChannel does not contain a function, it will check to see if it is a special function which the delegate wants to catch
		 * If it is set, it will call that CMD on its delegate
		 */
		setupCmdMap: function() {
//			this.cmdMap[RealtimeMultiplayerGame.Constants.CMDS.PLAYER_UPDATE] = this.shouldUpdatePlayer;
			// These are left in as an example
//			this.cmdMap[RealtimeMultiplayerGame.Constants.CMDS.PLAYER_JOINED] = this.onPlayerJoined;
//			this.cmdMap[RealtimeMultiplayerGame.Constants.CMDS.PLAYER_DISCONNECT] = this.onPlayerDisconnect;
		},

		/**
		 * Updates the gameworld
		 * Creates a WorldEntityDescription which it sends to NetChannel
		 */
		update: function() {
			this.updateClock();

			// Allow all entities to update their position
			this.fieldController.getEntities().forEach( function(key, entity){
				entity.updatePosition(this.speedFactor, this.gameClock, this.gameTick );
			}, this );

			// Create a new world-entity-description,
			var worldEntityDescription = new RealtimeMultiplayerGame.model.WorldEntityDescription( this, this.fieldController.getEntities() );
			this.netChannel.tick( this.gameClock, worldEntityDescription );
//
//			if( this.gameClock > this.gameDuration ) {
//				this.shouldEndGame();
//			}
		},

		/**
		 * Updates the gameclock and sets the current
		 */
		updateClock: function() {
			// Store previous time and update current
			var oldTime = this.gameClockReal;
			this.gameClockReal = new Date().getTime();

			// Our clock is zero based, so if for example it says 10,000 - that means the game started 10 seconds ago
			var delta = this.gameClockReal - oldTime;
			this.gameClock += delta;
			this.gameTick++;

			// Framerate Independent Motion -
			// 1.0 means running at exactly the correct speed, 0.5 means half-framerate. (otherwise faster machines which can update themselves more accurately will have an advantage)
			this.speedFactor = delta / ( 1000/this.targetFramerate );
			if (this.speedFactor <= 0) this.speedFactor = 1;
		},


		shouldAddPlayer: function( aClientid, data ) {
		},

		shouldUpdatePlayer: function( client, data ) {
			console.log("(DemoApp)::onPlayerUpdate");
		},

		shouldRemovePlayer: function( clientid ) {
//			this.fieldController.removePlayer( clientid );
		},

		shouldEndGame: function() {
			console.log("(DemoApp)::shouldEndGame");
		},

	   	log: function() { console.log.apply(console, arguments); },

		///// Accessors
		getNextEntityID: function() {
			return ++this.nextEntityID;
		},
		getGameClock: function() {
			return this.gameClock;
		},
		getGameTick: function() {
			return this.gameTick;
		}
	};
})();