"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponderAssignmentStatus = exports.QuoteRequestStatus = void 0;
var QuoteRequestStatus;
(function (QuoteRequestStatus) {
    QuoteRequestStatus["DRAFT"] = "DRAFT";
    QuoteRequestStatus["PENDING"] = "PENDING";
    QuoteRequestStatus["RESPONDED"] = "RESPONDED";
    QuoteRequestStatus["ACCEPTED"] = "ACCEPTED";
    QuoteRequestStatus["REJECTED"] = "REJECTED";
    QuoteRequestStatus["CANCELLED"] = "CANCELLED";
})(QuoteRequestStatus = exports.QuoteRequestStatus || (exports.QuoteRequestStatus = {}));
var ResponderAssignmentStatus;
(function (ResponderAssignmentStatus) {
    ResponderAssignmentStatus["PENDING"] = "PENDING";
    ResponderAssignmentStatus["RESPONDED"] = "RESPONDED";
    ResponderAssignmentStatus["ACCEPTED"] = "ACCEPTED";
    ResponderAssignmentStatus["REJECTED"] = "REJECTED";
})(ResponderAssignmentStatus = exports.ResponderAssignmentStatus || (exports.ResponderAssignmentStatus = {}));
