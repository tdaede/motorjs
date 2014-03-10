var scope = {
	scopeData: [],
	last_theta: 0
};


scope.draw = function() {
  this.scopeData.push([motor.state.e_theta,motor.motor_t]);
  if (motor.state.e_theta < this.last_theta) {
    $.plot($("#scope-chart"),[this.scopeData], {
      xaxis: {
        min: 0,
        max: Math.PI*2
      }
    });
    this.scopeData = [];
  }
  this.last_theta = motor.state.e_theta;
};
