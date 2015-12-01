Blockly.Blocks['start'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("when run");
    this.setNextStatement(true);
    this.setColour(285);
  }
};

Blockly.JavaScript['start'] = function(block) {
  // Block does not do anything
  return '';
};

Blockly.Blocks['hop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("hop")
        .appendField(new Blockly.FieldDropdown([["forward", "Forward"], ["back", "Back"], ["left", "Left"], ["right", "Right"]]), "direction");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(165);
  }
};

Blockly.JavaScript['hop'] = function(block) {
  var dropdown_direction = block.getFieldValue('direction');
  // Capitalize first letter if necessary
  dropdown_direction = dropdown_direction[0].toUpperCase() + dropdown_direction.slice(1);
  var code = 'hop' + dropdown_direction + '();\n';
  return code;
};