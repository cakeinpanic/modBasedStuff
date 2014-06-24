var Slideshow= Mod.extend({
	smallImgArray: [],
	bigImgArray: [],
	sourceInfo: null,
	'document click:delegate(.item-slideshow-nav.left)': function(e){this.removeQueue(); e.stopPropagation();},
	'document click:delegate(.item-slideshow-nav.right)': function(e){this.addQueue();  e.stopPropagation();},
	'document click:delegate(.item-slideshow-image)': function(e){ if (this.numImages>1) this.addQueue();  e.stopPropagation();},
	'document click:delegate(.item-slideshow-fs-button)': function(e){this.toggleFullscreen();  e.stopPropagation();},
	'document click:delegate(.item-slideshow-background)': function(e){if (this._fsMode) this.toggleFullscreen(); e.stopPropagation();},

	currentImg: {
		value: 0,
		change: function(value){
			this.currentImg= (this.bigImgArray.length+value)%this.bigImgArray.length;
			
			if (this.working){
				this.slideshowState="loading";
			}
		}
	},
	addQueue:function(){
		this.queue++;
	},
	removeQueue:function(){
		this.queue--;
	},
	queue: {
		value: null,
		change: function(value){
			if (value!=0 && this.working) {
				if (this.slideshowState =="ready") {
					if (value>0)
						this.next();
					else
						this.prev();
				}
			}
		}
	},
	next: function(){
		clearTimeout(this._nextTimeout);
		this.currentImg=this.currentImg+1;
		this.queue--;
	},
	prev: function(){
		clearTimeout(this._nextTimeout);
		this.currentImg--;
		this.queue++;
	},
	toggleFullscreen: function(){

			if (this.$fsMode==null)
				this.$fsMode=document.createElement("div");

			if (!this._fsMode){
				this.screenState="fs";
				this.$fsMode.appendChild(this.$container);
				document.body.appendChild(this.$fsMode);
				this.$fsMode.classList.add("item-slideshow-fs-mode");
				this.$fsButton.classList.add("minimize");
			}
			else
			{
				this.screenState="nofs";
				this.$firstImg.src=this.getImg(this.currentImg);
				document.body.removeChild(this.$fsMode);
				this.appendChild(this.$container);
				this.$fsButton.classList.remove("minimize");


			}
			this.slideshowState="loading";



	},
	setImageInfo: function(imgId){
		var info=this.sourceInfo[imgId];
		
		if (info!=null){
			this.$sourceInfo.innerHTML=info;
		}

		this.$sourceInfo.style.opacity="";

	},
	slideshowState:{
		value:"init",
		values:{
			init: {
				before: function(){

					this._animationLength=.5;
					this._animateTimeout=null;
					this._nextTimeout=null;
					this.numImages=this.bigImgArray.length;

					this.$container=document.createElement("div");
					this.$container.setAttribute("class", "item-slideshow-inner-container");
					this.appendChild(this.$container);

					this.$preloader=document.createElement("div");
					this.$preloader.setAttribute("class", "item-slideshow-preloader");
					this.$container.appendChild(this.$preloader);
					this.$preloader.style.opacity=0;

					var background=document.createElement("div");
					background.setAttribute("class", "item-slideshow-background");
					this.$container.appendChild(background);

					this.$fsButton=document.createElement("div");
					this.$fsButton.setAttribute("class", "item-slideshow-fs-button");
					this.$container.appendChild(this.$fsButton);

					this.$secondImg=document.createElement("img");
					this.$secondImg.setAttribute("class", "item-slideshow-image second");
					this.$container.appendChild(this.$secondImg);

					this.$firstImg=document.createElement("img");
					this.$firstImg.setAttribute("class", "item-slideshow-image first");
					this.$container.appendChild(this.$firstImg);


					if (this.numImages>1){
						this.$rightArrow=document.createElement("div");
						this.$rightArrow.setAttribute("class", "item-slideshow-nav right");
						this.$container.appendChild(this.$rightArrow);

						this.$leftArrow=document.createElement("div");
						this.$leftArrow.setAttribute("class", "item-slideshow-nav left");
						this.$container.appendChild(this.$leftArrow);
					}

					this.$sourceInfo=document.createElement("div");
					this.$sourceInfo.setAttribute("class", "item-slideshow-source-info");
					this.$container.appendChild(this.$sourceInfo);

					this.sourceInfo=this.sourceInfo.split("|");

					this.slideshowState="loading";

				},
			},
			ready: {
				before:function(){
					this.working=true;
					clearTimeout(this._animateTimeout);

					this.$firstImg.style.opacity=0;
					this.$firstImg.src="";

					this.$container.insertBefore(this.$secondImg, this.$firstImg);

					var temp=this.$firstImg;
					this.$firstImg=this.$secondImg;
					this.$secondImg=temp;

					if (this.queue > 0) {
						this._nextTimeout= setTimeout(function() {this.next()}.bind(this), .1*1000);
					}

					if (this.queue < 0) {
						this._nextTimeout= setTimeout(function() {this.prev()}.bind(this), .1*1000);
					}
				}
			},
			loading: {
				before: function(){
					this.$firstImg.style.opacity=0;
					this.$secondImg.style.opacity=0;

					this.$sourceInfo.style.opacity=0;

					var imgLoaded = function(img){
						this.$preloader.style.opacity=0;
						this.slideshowState="animating";
					}.bind(this);

					this.$preloader.style.opacity=1;

					(this.$secondImg).onload = function () {
						imgLoaded();
					}.bind(this);

					this.$secondImg.src=this.getImg(this.currentImg);

				}
			},
			animating:{
				before: function(){
					this.$secondImg.style.opacity="1";
					this.setImageInfo(this.currentImg);
					this._animateTimeout= setTimeout(function() {this.slideshowState="ready"}.bind(this),
					this._animationLength*1000);


				}
			}

		}
	},
	getImg: function(id){return this.smallImgArray[id];},
	screenState:{
		value: "nofs",
		values:{
			nofs: {
				before: function(){this._fsMode=false;},
				getImg:function(id){
					return this.smallImgArray[id];
					}
			},
			fs:{
				before: function(){this._fsMode=true;},
				getImg:function(id){return this.bigImgArray[id]}
			},
			_: function(){return false}
		}
	}

});

Slideshow.register('item-slideshow',{selector: ".item-slideshow"});