const events = {

    update: function(ui) {
        updateModelLabels(ui.blocks, 'Block');
        calcBlocks(ui, this);
        filterBlocks(ui, this);

        calcModelTerms(ui, this);
        updateLevelControls(ui, this);
        updateModelLabels(ui.emMeans, 'Term');
    },

    onChange_covs: function(ui) {
        calcBlocks(ui, this);
    },

    onChange_dep:  function(ui) {
        calcModelTerms(ui, this);
    },

    onChange_factors: function(ui) {
        calcBlocks(ui, this);
        calcModelTerms(ui, this);
    },

    onChange_blocks: function(ui) {
        filterBlocks(ui, this);
    },

    onChange_refLevels: function(ui) {
        updateLevelControls(ui, this);
    },

    onEvent_test_listItemsChanged: function(ui) {
        updateModelLabels(ui.blocks, 'Block');
        let blocks = this.cloneArray(ui.blocks.value(), []);
        this.workspace["blocks"] = blocks;
    },

    onEvent_emMeans_listItemsChanged: function(ui) {
        updateModelLabels(ui.emMeans, 'Term');
    }
};

var calcModelTerms = function(ui, context) {
    var variableList = context.cloneArray(ui.factors.value(), []);
    let depVar = ui.dep.value();
    if (depVar)
        variableList.unshift(depVar);

    updateContrasts(ui, variableList, context);
};

var updateLevelControls = function(ui, context) {
    let dlist = ui.refLevels.value();
    let list = ui.refLevels.applyToItems(0, (item, index, column) => {
        if (column === 1) {
            item.setPropertyValue('variable', dlist[index].var );
            checkForValidLevel(dlist[index].var, item, context);
        }
    });
};

let checkForValidLevel = function(columnName, ctrl, context) {
    let promise = context.requestData("column", { columnName: columnName, properties: ["levels"] })
    promise.then(rData => {
        let data = [];
        if (rData.columnFound) {
            let levels = rData.levels;
            if (Array.isArray(levels) && levels.length > 0) {
                let current = ctrl.value();
                if (current === null)
                    ctrl.setValue(levels[0].label);
                else {
                    let found = false;
                    for (let level of levels) {
                        if (level.label === current) {
                            found = true;
                            break;
                        }
                    }
                    if ( ! found)
                        ctrl.setValue(levels[0].label);
                }
            }
            else
                ctrl.setValue(null);
        }
    });
};

var updateContrasts = function(ui, variableList, context) {
    var currentList = context.cloneArray(ui.refLevels.value(), []);

    var list3 = [];
    for (let i = 0; i < variableList.length; i++) {
        let found = null;
        for (let j = 0; j < currentList.length; j++) {
            if (currentList[j].var === variableList[i]) {
                found = currentList[j];
                break;
            }
        }
        if (found === null)
            list3.push({ var: variableList[i], ref: null });
        else
            list3.push(found);
    }

    ui.refLevels.setValue(list3);
};


let updateModelLabels = function(list, blockName) {
    list.applyToItems(0, (item, index) => {
        item.controls[0].setPropertyValue("label", blockName + " " + (index + 1) );
    });
};


let calcBlocks = function(ui, context) {
    let variableList = context.cloneArray(ui.covs.value(), []);
    variableList = variableList.concat(context.cloneArray(ui.factors.value(), []));

    ui.modelSupplier.setValue(context.valuesToItems(variableList, FormatDef.variable));

    if (ui.emMeansSupplier)
        ui.emMeansSupplier.setValue(context.valuesToItems(variableList, FormatDef.variable));

    let varsDiff = context.findChanges("variableList", variableList, true, FormatDef.variable);
    let termsList = context.cloneArray(ui.blocks.value(), []);

    var termsChanged = false;
    for (var i = 0; i < varsDiff.removed.length; i++) {
        for (var j = 0; j < termsList.length; j++) {
            if (termsList[j] === null)
                termsList[j] = [];

            for (var k = 0; k < termsList[j].length; k++) {
                if (FormatDef.term.contains(termsList[j][k], varsDiff.removed[i])) {
                    termsList[j].splice(k, 1);
                    termsChanged = true;
                    k -= 1;
                }
            }
        }
    }

    let selectedRows = ui.blocks.getSelectedRowIndices();
    if (selectedRows.length > 0) {
        if (termsList[selectedRows[selectedRows.length - 1]] === null)
            termsList[selectedRows[selectedRows.length - 1]]  = [];
        for (let i = 0; i < varsDiff.added.length; i++)
            termsList[selectedRows[selectedRows.length - 1]].push([varsDiff.added[i]]);
        //termsList[selectedRows[selectedRows.length - 1]] = context.getCombinations(varsDiff.added, termsList[selectedRows[selectedRows.length - 1]]);
        termsChanged = termsChanged || varsDiff.added.length > 0;
    }


    if (termsChanged)
        ui.blocks.setValue(termsList);
};

let inOtherBlock = function(blocks, value, blockIndex) {
    for (let b = 0; b < blocks.length; b++) {
        if (b === blockIndex)
            continue;

        let block = blocks[b];
        for (let i = 0; i < block.length; i++) {
            if (FormatDef.term.isEqual(block[i], value))
                return true;
        }
    }
    return false;
};

let filterBlocks = function(ui, context) {
    let changed = false;
    let blocks = context.cloneArray(ui.blocks.value(), []);

    let prevBlocks = context.workspace["blocks"];

    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++)  {
        if (blocks[blockIndex] === null)
            blocks[blockIndex] = [];

        let termsList = blocks[blockIndex];

        if (prevBlocks !== undefined && prevBlocks.length === blocks.length) {
            //Remove common terms
            let termsDiff = context.findDifferences(prevBlocks[blockIndex], termsList, FormatDef.term);

            if (termsDiff.removed.length > 0 && termsList !== null) {
                let itemsRemoved = false;
                for (let i = 0; i < termsDiff.removed.length; i++) {
                    let item = termsDiff.removed[i];
                    for (let j = 0; j < termsList.length; j++) {
                        if (FormatDef.term.contains(termsList[j], item)) {
                            termsList.splice(j, 1);
                            j -= 1;
                            itemsRemoved = true;
                        }
                    }
                }

                if (itemsRemoved)
                    changed = true;
            }
            /////////////////////
        }

        //Sort terms
        if (context.sortArraysByLength(termsList))
            changed = true;
        ////////////
    }

    //remove terms that have been added that clash with existing terms
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++)  {
        let termsList = blocks[blockIndex];

        if (prevBlocks !== undefined && prevBlocks.length === blocks.length) {
            let termsDiff = context.findDifferences(prevBlocks[blockIndex], termsList, FormatDef.term);

            if (termsDiff.added.length > 0 && termsList !== null) {
                let itemsRemoved = false;
                for (let i = 0; i < termsDiff.added.length; i++) {
                    let item = termsDiff.added[i];
                    if (inOtherBlock(blocks, item, blockIndex)) {
                        for (let j = 0; j < termsList.length; j++) {
                            if (FormatDef.term.isEqual(termsList[j], item)) {
                                termsList.splice(j, 1);
                                j -= 1;
                                itemsRemoved = true;
                            }
                        }
                    }
                }

                if (itemsRemoved)
                    changed = true;
            }
        }
    }
    /////////////////////////////////////////////////////////////////



    context.workspace["blocks"] = blocks;

    if (changed)
        ui.blocks.setValue(blocks);
};


module.exports = events;