function updateMass() {
	var outerRadius = parseFloat($('#mw-or').val());
	var thickness = 0.005;
	var rotorVolume = Math.PI*outerRadius*outerRadius*thickness;
	var steelDensity = 8050;
	var rotorMass = rotorVolume * steelDensity;
	var numRotors = 2;
	$('#mw-mass').val(rotorMass*numRotors);
}
