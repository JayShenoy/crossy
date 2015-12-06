var numLevels = 7;

var setupLevels = function() {
  // Level navigator area
  var $levelNavigator = $('#levelNavigator');

  for(var i = 0; i < numLevels; i++) {
    	var $node = $('<a class="node" href="/crossy/' + (i + 1) + '" style="margin-right:5px" title><svg width="30px" height="30px"><circle id="circle' + (i + 1) + '" fill="#FFF" stroke="#E6C35A" stroke-width="3" cx="15" cy="15" r="12"/></svg></a>');
      $levelNavigator.append($node);
  }

  // Fill in circles that have been completed
  if(sessionStorage.progress) {
    var progress = JSON.parse(sessionStorage.progress);
    var completedLevels = progress.completedLevels;
    for(var i = 0; i < completedLevels.length; i++) {
      var $circle = $('#circle' + completedLevels[i]);
      $circle.attr('fill', '#E6C35A');
    }
  }
};

setupLevels();