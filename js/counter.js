var Counter= Mod.extend({
	date: null,
	currentDays: {
		value:-1,
		change: function(value){
			if (this.inited){

				if (value/100 < 1)
					this.$daysFirst.hide();
				else
					this.$daysFirst.val=Math.floor(value/100);

				this.$daysMiddle.val=Math.floor((value%100)/10);
				this.$daysLast.val=value%10;


			}
		}
	},
	currentMinutes:{
		value:-1,
		change: function(value){
			if (this.inited){
				if (value<0){ value=0;}
				value=value%60;
				this.$minutesLast.val=value%10;
				this.$minutesFirst.val=Math.floor(value/10);
			}
		}
	},
	currentSeconds:{
		value:-1,
		change: function(value){
			if (this.inited){
				value=value%60;
				this.$secondsLast.val=value%10;
				this.$secondsFirst.val=Math.floor(value/10);
			}
		}
	},
	currentHours:{
		value:-1,
		change: function(value){
			if (this.inited){
				value=value%24;
				this.$hoursLast.val=value%10;
				this.$hoursFirst.val=Math.floor(value/10);
			}
		}
	},
	update: function(){

		var currentDate = new Date();
		var diff= this.targetDate- currentDate;
		if (diff<0) { this.timerState="stopped"; return;}
		var seconds_left=(diff/1000);

		this.currentDays = parseInt(seconds_left / 86400);
		seconds_left = seconds_left % 86400;

		this.currentHours = parseInt(seconds_left / 3600);
		seconds_left = seconds_left % 3600;

		this.currentMinutes= parseInt(seconds_left / 60);
		this.currentSeconds= parseInt(seconds_left % 60);

	},
	timerState:{
		value: "init",
		values:{
			init:{
				before: function(){
					console.log("init main");
					if (this.date=="midnight")
					{
						var currentDate=new Date();
						this.targetDate= new Date();
						this.targetDate.setDate(this.targetDate.getDate()+1);
						this.targetDate.setHours(0);
						this.targetDate.setSeconds(0);
						this.targetDate.setMinutes(0);

					}
					else
					this.targetDate=Date.parse(this.date);

					this.timerState="working";
				},
				after: function(){
					this.inited= true;
				}
			},
			working:{
				before: function(){
					console.log("hidden");
					this.update();
					this.removeAttribute("hidden");
					this._intervalId=setInterval(this.update, 1000)
				}
			},
			stopped:{
				before: function(){
					console.log("stopped");
					$(this).hide(); clearInterval(this._intervalId);
				}
			}
		}
	}
});

var EventCounter= Counter.extend({
	currentDays: {
		change: function(value){

			if (this.inited){
				if (value<1){
					console.log(this.$daysAndRelated);
					for(var i=this.$daysAndRelated.length; i--; i>-1)
						this.$daysAndRelated[i].style.display="none";
					return;
				}

				Counter.properties.currentDays.change.apply(this, [value]);
			}
		}
	},
	currentHours:{
		value:-1,
		change: function(value){
			if (this.inited){
				if (value<1 && this.currentDays<1){
					for(var i=this.$hoursAndRelated.length; i--; i>-1)
						this.$hoursAndRelated[i].style.display="none";
					return;
				}
				Counter.properties.currentHours.change.apply(this, [value]);
			}
		}
	},
	timerState:{
		value: "init",
		values:{
			init:{
				before: function(){

					var digits = this.querySelectorAll('.digit');
					this.$daysFirst =  digits[0];
					this.$daysMiddle = digits[1];
					this.$daysLast = digits[2];
					this.$hoursFirst =  digits[3];
					this.$hoursLast =  digits[4];
					this.$minutesFirst =  digits[5];
					this.$minutesLast =  digits[6];
					this.$secondsFirst = digits[7];
					this.$secondsLast = digits[8];

					this.$daysAndRelated= this.querySelectorAll('.days');
					this.$hoursAndRelated= this.querySelectorAll('.hours');
					Counter.properties.timerState.values.init.before.apply(this);


				}
			}
		}
	}
});

var Digit = Mod.extend({
	init: function(){
		this.initialValue = this.innerHTML;
	},
	val:{
		change: function(value){
			if (/[0-9]/.test(value)) this.innerHTML=value;
		}
	},
	hide: function(){
		$(this).hide();
	},
	digitStates:{
			value: "init",
			values:{
				init:{
					before: function(){
					}
				}
			}
		}
	})


Digit.register('digit',{selector: ".digit"});
EventCounter.register('counter',{selector: ".counter"
	});