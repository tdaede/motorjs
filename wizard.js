function updateMass() {
	var outerRadius = parseFloat($('#mw-or').val());
	var innerRadius = parseFloat($('#mw-ir').val());
	var rotorThickness = 0.005;
	var rotorVolume = Math.PI*outerRadius*outerRadius*rotorThickness;
	var steelDensity = 8050;
	var rotorMass = rotorVolume * steelDensity;
	var numRotors = 2;
	
	var statorThickness = 0.005;
	var copperDensity = 8960;
	var numStators = 1;
	var statorVolume = Math.PI*outerRadius*outerRadius*statorThickness;
	var statorMass = statorVolume * copperDensity;
	
	var magnetThickness = 0.005;
	var magnetDensity = 7500;
	var magnetVolume = (Math.PI*outerRadius*outerRadius-Math.PI*innerRadius*innerRadius)*magnetThickness;
	var magnetMass = magnetVolume * magnetDensity;
	
	$('#mw-mass').val(rotorMass*numRotors + statorMass*numStators + magnetMass*numRotors);
}
