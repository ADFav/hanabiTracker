var HT = angular.module("HT", ["ngCookies"]);

HT.controller("hanabiTracker", ["$scope", "$cookies", function ($scope, $cookies) {
	const noInfo = 0, selected = 1, unselected = 2;
	$scope.colors = "RGWBY".split("");
	$scope.numbers = "12345".split("");
	const propertyTypes = [$scope.colors, $scope.numbers];

	function applyToAllProperties(callback) {
		propertyTypes.forEach(propertyType => propertyType.forEach(callback))
	}

	let states = [];
	let stateIndex = 0;

	function gridPostion(row, column) {
		return { "grid-row": String(row) + " / span 1", "grid-column": String(column) + " / span 1" };
	}

	class StateChange {
		constructor(card, property, previousValue, nextValue) {
			this.card = card;
			this.property = property;
			this.previousValue = previousValue;
			this.nextValue = nextValue;
		}
	}

	class StateChanges {
		constructor(cardPressed, buttonPressed) {
			this.cardPressed = cardPressed.index;
			this.buttonPressed = buttonPressed;
			this.changes = [];
		}
		addStateChange(stateChange) {
			if (stateChange != null) {
				this.changes.push(stateChange);
			}
		}
		undo() {
			this.changes.forEach(function (change) {
				$scope.cards[change.card].state[change.property] = change.previousValue;
			});
			stateIndex += 1;
		}
	}

	class State {
		constructor(card) {
			applyToAllProperties(property => this[property] = noInfo);
			this.card = card.index;
		}
		setStateValue(property, newValue) {
			const oldValue = this[property];
			if (!(newValue == unselected && this[property] == selected)) {
				this[property] = newValue;
				return new StateChange(this.card, property, oldValue, newValue);
			}
			return null;
		};
	}

	class Card {
		constructor(index) {
			this.index = index;
			console.log($cookies.get("HT-card-"+this.index));
			this.state = new State(this);
			if($cookies.get("HT-card-"+this.index)){
				const savedState = JSON.parse($cookies.get("HT-card-"+this.index));
				for(let property in savedState){
					this.state.setStateValue(property, savedState[property]);
				}
			}
			console.log(this.state);
		}
		clear() {
			if (states[stateIndex] && this.index == states[stateIndex].cardPressed && "clear" == states[stateIndex].buttonPressed) {
				states[stateIndex].undo()
			} else {
				stateIndex = 0;
				let stateChanges = new StateChanges(this, "clear");
				applyToAllProperties(property => stateChanges.addStateChange(this.state.setStateValue(property, noInfo)));
				if (stateChanges.changes != []) {
					states.splice(0, stateIndex, stateChanges);
				}
			}
			$scope.cards.forEach( card => $cookies.putObject("HT-card-"+card.index,card.state));
		}; //card.clear
		setProperty(property, value, stateChanges) {
			if (this.state[property] != value) {
				stateChanges.addStateChange(this.state.setStateValue(property, value));
			}
		};
		pushButton(property) {
			if (states[stateIndex] && this.index == states[stateIndex].cardPressed && property == states[stateIndex].buttonPressed) {
				states[stateIndex].undo()
			} else {
				stateIndex = 0;
				let stateChanges = new StateChanges(this, property);
				this.setProperty(property, selected, stateChanges);
				$scope.cards.forEach(card => card.setProperty(property, unselected, stateChanges));
				propertyTypes.forEach(function (propertyType) {
					if (propertyType.indexOf(property) >= 0) {
						propertyType.forEach(prop => this.setProperty(prop, unselected, stateChanges));
					}
				}, this);
				if (stateChanges.changes.length > 0) {
					states.splice(0, stateIndex, stateChanges);
				}
			}
			$scope.cards.forEach( card => $cookies.putObject("HT-card-"+card.index,card.state));
		}; //card.pushButton

		style(property) {
			let col, row;
			if ($scope.colors.indexOf(property) >= 0) {
				col = 1;
				row = 1 + $scope.colors.indexOf(property);
			}
			else if ($scope.numbers.indexOf(property) >= 0) {
				col = 2;
				row = 1 + $scope.numbers.indexOf(property);
			}
			const result = gridPostion(row, col);
			switch (this.state[property]) {
				case selected:
					result["background-color"] = "#CC0";
					result["font-weight"] = "bold";
					break;
				case unselected:
					result["background-color"] = "#888";
					break;
			}
			return result;
		}; // card.style
	}//card
	$scope.cards = [0, 1, 2, 3, 4].map(index => new Card(index));
}]); //controller