var HT = angular.module("HT",[]);

HT.controller("hanabiTracker",["$scope",function($scope){
	$scope.colors = "RGWBY".split("");
	$scope.numbers = "12345".split("");
	

	$scope.states = [];

	function gridPostion(row,column){
		return {"grid-row":String(row) + " / span 1","grid-column":String(column) + " / span 1"};
	}
	
	// function State (){
	// 	this.writeState(card){
	// 		return Object.keys(card.state).forEach( key => result[key] = card[key]);
	// 	}

	// 	this.printState(card){

	// 	}
	// };

	function Card (){
		this.state = {};
		
		this.clear = function(){
			this.state = {};
		}
		
		this.setProperty = function(property,value){
			if(this.state[property] != "selected"){
				this.state[property] = value;
			}
		};
		
		this.pushButton = function(property){
			this.setProperty(property,"selected");
			$scope.cards.forEach(card => card.setProperty(property, "unselected"));
			
			if($scope.colors.indexOf(property) >= 0){
				$scope.colors.forEach( color => this.setProperty(color, "unselected"));
			}
			if($scope.numbers.indexOf(property) >= 0){
				$scope.numbers.forEach( number => this.setProperty(number, "unselected"));
			}
			
		};
		
		this.style = function(property){
			let col, row;
			if($scope.colors.indexOf(property) >= 0){
				col = 1;
				row = 1 + $scope.colors.indexOf(property);
			} else if ($scope.numbers.indexOf(property) >= 0){
				col = 2;
				row = 1 + $scope.numbers.indexOf(property);
			}
			const result = gridPostion(row,col);
			switch(this.state[property]){
				case "selected":
					result["background-color" ] = "#CC0";
					result["font-weight"] = "bold";
					break;
				case "unselected":
					result["background-color"] = "#888";
					break;
			}
			return result;
		};
		
	};
	
	$scope.cards = [0,1,2,3,4].map( () => new Card() );
	
}]);


