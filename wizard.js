var magnetThickness;
var gapLength = 0.001;
var statorThickness = 0.005;
var magnetMass;

function updateMass() {
	var outerRadius = parseFloat($('#mw-or').val());
	var innerRadius = parseFloat($('#mw-ir').val());
	magnetThickness = parseFloat($('#mw-magnet-thickness').val());
	var rotorThickness = 0.005;
	var rotorVolume = Math.PI*outerRadius*outerRadius*rotorThickness;
	var steelDensity = 8050;
	var rotorMass = rotorVolume * steelDensity;
	var numRotors = 2;
	
	var copperDensity = 8960;
	var numStators = 1;
	var statorVolume = Math.PI*outerRadius*outerRadius*statorThickness;
	var statorMass = statorVolume * copperDensity;
	
	var magnetDensity = 7500;
	var magnetVolume = (Math.PI*outerRadius*outerRadius-Math.PI*innerRadius*innerRadius)*magnetThickness;
	magnetMass = magnetVolume * magnetDensity;
	
	$('#mw-mass').html(rotorMass*numRotors + statorMass*numStators + magnetMass*numRotors);
}

function updateFlux() {
	updateMass();
	var outerRadius = parseFloat($('#mw-or').val());
	var innerRadius = parseFloat($('#mw-ir').val());
	
	var Br = 1.45;
	var Hc = 891300;
	var area = (Math.PI*outerRadius*outerRadius-Math.PI*innerRadius*innerRadius)
	$('#mw-area').html(area);
	var Fm = Hc*magnetThickness;
	var Rm = magnetThickness/((Br/Hc)*area);
	var Rg = (gapLength*2+statorThickness)/(1.257e-6*area);
	
	var flux = Fm*2/(Rm*2+Rg);
	$('#mw-flux').html(flux);
	
	var field = flux / area;
	$('#mw-field').html(field);
	
	var cost = magnetMass * 300;
	$('#mw-magnet-cost').html(cost);
}
