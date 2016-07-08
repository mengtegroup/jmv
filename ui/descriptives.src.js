'use strict';

var options = require("./descriptives.options");


var descriptivesLayout = LayoutDef.extend({

    label: "Descriptives",
    type: "root",
    controls: [
        {
            type: "supplier",
            persistentItems: false,
            useVariables: true,
            stretchFactor: 1,
            controls: [
                {
                    type:"targetlistbox",
                    name: "vars",
                    showColumnHeaders: false,
                    columns: [
                        { name: 'column1', label: "", readOnly: true, format: FormatDef.variable, stretchFactor: 1 }
                    ]
                }
            ]
        },
        {
            type: "groupbox",
            stretchFactor: 1,
            controls : [
                {type:"checkbox",  name: "plots", label: "Display Plots" },
                { type:"checkbox", name: "plotCorr", label: "Display Correlation Plot" },
                { type:"checkbox", name: "freq", label: "Display Frequency Tables (nominal and ordinal variables)" }
            ]
        },
        {
            type: "groupbox",
            label: "Statistics",
            type: "groupbox",
            collapsed: true,
            stretchFactor: 1,
            controls : [
                {
                    type: "groupbox",
                    label: "Percentile Values",
                    cell: [0, 0],
                    controls : [
                        { type:"checkbox", name: "quart", label: "Quartiles" },
                        {
                            type:"checkbox", name: "pcEqGr", label: "Cut points for",
                            style: "inline",
                            controls : [
                                { type:"textbox", name: "pcNEqGr", label: "", suffix : "equal groups", format: FormatDef.number, inputPattern: "[0-9]+" }
                            ]
                        }
                    ],
                },
                {
                    type: "groupbox",
                    label: "Central Tendency",
                    cell: [1, 0],
                    controls: [
                        { type:"checkbox", name: "mean", label: "Mean" },
                        { type:"checkbox", name: "median", label: "Median" },
                        { type:"checkbox", name: "mode", label: "Mode" },
                        { type:"checkbox", name: "sum", label: "Sum" }
                    ]
                },
                {
                    type: "groupbox",
                    label: "Dispersion",
                    cell: [0, 1],
                    controls: [
                        {
                            cell: [0, 0],
                            controls : [
                                { type:"checkbox", name: "sd", label: "Std. deviation" },
                                { type:"checkbox", name: "variance", label: "Variance" },
                                { type:"checkbox", name: "range", label: "Range" }
                            ]
                        },
                        {
                            cell: [1, 0],
                            controls : [
                                { type:"checkbox", name: "min", label: "Minimum" },
                                { type:"checkbox", name: "max", label: "Maximum" },
                                { type:"checkbox", name: "se", label: "S. E. Mean" }
                            ]
                        }
                    ]
                },
                {
                    type: "groupbox",
                    label: "Distribution",
                    cell: [1, 1],
                    controls : [
                        { type:"checkbox", name: "skew", label: "Skewness" },
                        { type:"checkbox", name: "kurt", label: "Kurtosis" }
                    ],
                }
            ]
        }
    ],

    actions: [
        {
            onChange : "pcEqGr", execute : function(context) {
                var disabled = context.getValue("pcEqGr") === false;
                context.set("pcNEqGr", "disabled", disabled);
            }
        }
    ]
});

module.exports = { LayoutDef : descriptivesLayout, options: options };