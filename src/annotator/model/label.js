"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({__proto__: []} instanceof Array && function (d, b) {
            d.__proto__ = b;
        }) ||
        function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
    return function (d, b) {
        extendStatics(d, b);

        function __() {
            this.constructor = d;
        }

        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var EventBase_1 = require("../../library/EventBase");
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);

    function Label(belongTo, category, startIndexInSentence, endIndexInSentence) {
        var _this = _super.call(this) || this;
        _this.belongTo = belongTo;
        _this.category = category;
        _this.startIndexInSentence = startIndexInSentence;
        _this.endIndexInSentence = endIndexInSentence;
        belongTo.onCreateLabel(_this);
        _this.emit("label_created", _this);
        return _this;
    }

    Label.prototype.stringContent = function () {
        return this.belongTo.slice(this.startIndexInSentence, this.endIndexInSentence);
    };
    return Label;
}(EventBase_1.EventBase));
exports.Label = Label;