var magnetThickness;
var gapLength = 0.001;
var statorThickness = 0.005;
var magnetMass;

function updateMass() {
	var outerRadius = parseFloat($('#mw-or').val());
	var innerRadius = parseFloat($('#mw-ir').val());
	magnetThickness = parseFloat($('#mw-magnet-thickness').val());
	gapLength = parseFloat($('#mw-airgap').val());
	statorThickness = parseFloat($('#mw-stator-thickness').val());
	var rotorThickness = 0.005;
	var rotorVolume = Math.PI*(outerRadius*outerRadius - innerRadius*innerRadius)*rotorThickness;
	var steelDensity = 8050;
	var rotorMass = rotorVolume * steelDensity;
	motor.rotorMass = rotorMass;
	var numRotors = 2;
	
	var copperDensity = 8960;
	var numStators = 1;
	var statorVolume = Math.PI*outerRadius*outerRadius*statorThickness;
	var statorMass = statorVolume * copperDensity;
	motor.statorMass = statorMass;
	
	var magnetDensity = 7500;
	var magnetVolume = (Math.PI*outerRadius*outerRadius-Math.PI*innerRadius*innerRadius)*magnetThickness;
	magnetMass = magnetVolume * magnetDensity;
	motor.magnetMass = magnetMass;
	
	$('#mw-mass').html(rotorMass*numRotors + statorMass*numStators + magnetMass*numRotors);
}

function updateFlux() {
	updateMass();
	var outerRadius = parseFloat($('#mw-or').val());
	var innerRadius = parseFloat($('#mw-ir').val());
	var turns = motor.params.turns;
	
	var Br = 1.45;
	var Hc = 891300;
	var area = (Math.PI*outerRadius*outerRadius-Math.PI*innerRadius*innerRadius)*Math.PI/motor.params.magnetArc;
	$('#mw-area').html(area);
	var Fm = Hc*magnetThickness;
	var Rm = magnetThickness/((Br/Hc)*area);
	var Rg = (gapLength*2+statorThickness)/(1.257e-6*area);
	
	var flux = Fm*2/(Rm*2+Rg);
	$('#mw-flux').html(flux);
	motor.airgapFluxDensity = flux / area;
	
	var field = flux / area;
	$('#mw-field').html(field);
	
	var cost = magnetMass * 300;
	$('#mw-magnet-cost').html(cost);
	
	// calculate ke
	var kw = 0.933; // winding factor, calculate via winding pattern?
	var magnetPoleArc = Math.PI;
	var p = motor.params.polePairs;
	var fluxPerPole = flux/p/2;
	var ke = 2/3*kw*turns*fluxPerPole*p/magnetPoleArc;
	$('#mw-ke').html(ke);
}
