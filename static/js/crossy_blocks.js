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

Blockly.Blocks['repeat_loop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("repeat")
        .appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "times")
        .appendField("times");
    this.appendStatementInput("code_to_loop")
        .appendField("do");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(345);
  }
};

Blockly.JavaScript['repeat_loop'] = function(block) {
  var dropdown_times = block.getFieldValue('times');
  var times = parseInt(dropdown_times);
  var statements_code_to_loop = Blockly.JavaScript.statementToCode(block, 'code_to_loop');
  var code = 'for(var i = 0; i < ' + times + '; i++) {\n' + statements_code_to_loop + '}\n';
  return code;
};