var scope = {
	scopeData: [],
	last_theta: 0
};


scope.draw = function() {
  var data;
  if ($("#yaxis").val() == "motor_t") {
    data = motor.motor_t;
  } else {
    data = a.dot(a_ref);
  }
  if (motor.state.e_theta < this.last_theta) {
    $.plot($("#scope-chart"),[this.scopeData], {
      xaxis: {
        min: 0,
        max: Math.PI*2
      },
    });
    this.scopeData = [];
  } else {
    this.scopeData.push([motor.state.e_theta,data]);
  }
  this.last_theta = motor.state.e_theta;
};
