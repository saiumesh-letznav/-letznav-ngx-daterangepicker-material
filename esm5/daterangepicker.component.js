import * as tslib_1 from "tslib";
import { Component, ElementRef, ViewChild, EventEmitter, Output, Input, forwardRef, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormControl } from '@angular/forms';
import * as _moment from 'moment';
import { LocaleService } from './locale.service';
var moment = _moment;
export var SideEnum;
(function (SideEnum) {
    SideEnum["left"] = "left";
    SideEnum["right"] = "right";
})(SideEnum || (SideEnum = {}));
var DaterangepickerComponent = /** @class */ (function () {
    function DaterangepickerComponent(el, _ref, _localeService) {
        this.el = el;
        this._ref = _ref;
        this._localeService = _localeService;
        this._old = { start: null, end: null };
        this.calendarVariables = { left: {}, right: {} };
        this.timepickerVariables = { left: {}, right: {} };
        this.daterangepicker = { start: new FormControl(), end: new FormControl() };
        this.applyBtn = { disabled: false };
        this.startDate = moment().startOf('day');
        this.endDate = moment().endOf('day');
        this.dateLimit = null;
        // used in template for compile time support of enum values.
        this.sideEnum = SideEnum;
        this.minDate = null;
        this.maxDate = null;
        this.autoApply = false;
        this.singleDatePicker = false;
        this.showDropdowns = false;
        this.showWeekNumbers = false;
        this.showISOWeekNumbers = false;
        this.linkedCalendars = false;
        this.autoUpdateInput = true;
        this.alwaysShowCalendars = false;
        this.maxSpan = false;
        // timepicker variables
        this.timePicker = false;
        this.timePicker24Hour = false;
        this.timePickerIncrement = 1;
        this.timePickerSeconds = false;
        // end of timepicker variables
        this.showClearButton = false;
        this.firstMonthDayClass = null;
        this.lastMonthDayClass = null;
        this.emptyWeekRowClass = null;
        this.firstDayOfNextMonthClass = null;
        this.lastDayOfPreviousMonthClass = null;
        this._locale = {};
        // custom ranges
        this._ranges = {};
        this.showCancel = false;
        this.keepCalendarOpeningWithRange = false;
        this.showRangeLabelOnInput = false;
        this.rangesArray = [];
        // some state information
        this.isShown = false;
        this.inline = true;
        this.leftCalendar = {};
        this.rightCalendar = {};
        this.showCalInRanges = false;
        this.options = {}; // should get some opt from user
        this.choosedDate = new EventEmitter();
        this.rangeClicked = new EventEmitter();
        this.datesUpdated = new EventEmitter();
    }
    DaterangepickerComponent_1 = DaterangepickerComponent;
    Object.defineProperty(DaterangepickerComponent.prototype, "locale", {
        get: function () {
            return this._locale;
        },
        set: function (value) {
            this._locale = tslib_1.__assign({}, this._localeService.config, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DaterangepickerComponent.prototype, "ranges", {
        get: function () {
            return this._ranges;
        },
        set: function (value) {
            this._ranges = value;
            this.renderRanges();
        },
        enumerable: true,
        configurable: true
    });
    DaterangepickerComponent.prototype.ngOnInit = function () {
        this._buildLocale();
        var daysOfWeek = tslib_1.__spread(this.locale.daysOfWeek);
        if (this.locale.firstDay != 0) {
            var iterator = this.locale.firstDay;
            while (iterator > 0) {
                daysOfWeek.push(daysOfWeek.shift());
                iterator--;
            }
        }
        this.locale.daysOfWeek = daysOfWeek;
        if (this.inline) {
            this._old.start = this.startDate.clone();
            this._old.end = this.endDate.clone();
        }
        this.updateMonthsInView();
        this.renderCalendar(SideEnum.left);
        this.renderCalendar(SideEnum.right);
        this.renderRanges();
    };
    DaterangepickerComponent.prototype.renderRanges = function () {
        this.rangesArray = [];
        var start, end;
        if (typeof this.ranges === 'object') {
            for (var range in this.ranges) {
                if (typeof this.ranges[range][0] === 'string') {
                    start = moment(this.ranges[range][0], this.locale.format);
                }
                else {
                    start = moment(this.ranges[range][0]);
                }
                if (typeof this.ranges[range][1] === 'string') {
                    end = moment(this.ranges[range][1], this.locale.format);
                }
                else {
                    end = moment(this.ranges[range][1]);
                }
                // If the start or end date exceed those allowed by the minDate or maxSpan
                // options, shorten the range to the allowable period.
                if (this.minDate && start.isBefore(this.minDate)) {
                    start = this.minDate.clone();
                }
                var maxDate = this.maxDate;
                if (this.maxSpan && maxDate && start.clone().add(this.maxSpan).isAfter(maxDate)) {
                    maxDate = start.clone().add(this.maxSpan);
                }
                if (maxDate && end.isAfter(maxDate)) {
                    end = maxDate.clone();
                }
                // If the end of the range is before the minimum or the start of the range is
                // after the maximum, don't display this range option at all.
                if ((this.minDate && end.isBefore(this.minDate, this.timePicker ? 'minute' : 'day'))
                    || (maxDate && start.isAfter(maxDate, this.timePicker ? 'minute' : 'day'))) {
                    continue;
                }
                //Support unicode chars in the range names.
                var elem = document.createElement('textarea');
                elem.innerHTML = range;
                var rangeHtml = elem.value;
                this.ranges[rangeHtml] = [start, end];
            }
            for (var range in this.ranges) {
                this.rangesArray.push(range);
            }
            if (this.showCustomRangeLabel) {
                this.rangesArray.push(this.locale.customRangeLabel);
            }
            this.showCalInRanges = (!this.rangesArray.length) || this.alwaysShowCalendars;
            if (!this.timePicker) {
                this.startDate = this.startDate.startOf('day');
                this.endDate = this.endDate.endOf('day');
            }
            // can't be used together for now
            if (this.timePicker && this.autoApply) {
                this.autoApply = false;
            }
        }
    };
    DaterangepickerComponent.prototype.renderTimePicker = function (side) {
        if (side == SideEnum.right && !this.endDate) {
            return;
        }
        var selected, minDate;
        var maxDate = this.maxDate;
        if (side === SideEnum.left) {
            selected = this.startDate.clone(),
                minDate = this.minDate;
        }
        else if (side === SideEnum.right) {
            selected = this.endDate.clone(),
                minDate = this.startDate;
        }
        var start = this.timePicker24Hour ? 0 : 1;
        var end = this.timePicker24Hour ? 23 : 12;
        this.timepickerVariables[side] = {
            hours: [],
            minutes: [],
            minutesLabel: [],
            seconds: [],
            secondsLabel: [],
            disabledHours: [],
            disabledMinutes: [],
            disabledSeconds: [],
            selectedHour: 0,
            selectedMinute: 0,
            selectedSecond: 0,
        };
        // generate hours
        for (var i_1 = start; i_1 <= end; i_1++) {
            var i_in_24 = i_1;
            if (!this.timePicker24Hour) {
                i_in_24 = selected.hour() >= 12 ? (i_1 == 12 ? 12 : i_1 + 12) : (i_1 == 12 ? 0 : i_1);
            }
            var time_1 = selected.clone().hour(i_in_24);
            var disabled_1 = false;
            if (minDate && time_1.minute(59).isBefore(minDate)) {
                disabled_1 = true;
            }
            if (maxDate && time_1.minute(0).isAfter(maxDate)) {
                disabled_1 = true;
            }
            this.timepickerVariables[side].hours.push(i_1);
            if (i_in_24 == selected.hour() && !disabled_1) {
                this.timepickerVariables[side].selectedHour = i_1;
            }
            else if (disabled_1) {
                this.timepickerVariables[side].disabledHours.push(i_1);
            }
        }
        // generate minutes
        for (var i = 0; i < 60; i += this.timePickerIncrement) {
            var padded = i < 10 ? '0' + i : i;
            var time = selected.clone().minute(i);
            var disabled = false;
            if (minDate && time.second(59).isBefore(minDate)) {
                disabled = true;
            }
            if (maxDate && time.second(0).isAfter(maxDate)) {
                disabled = true;
            }
            this.timepickerVariables[side].minutes.push(i);
            this.timepickerVariables[side].minutesLabel.push(padded);
            if (selected.minute() == i && !disabled) {
                this.timepickerVariables[side].selectedMinute = i;
            }
            else if (disabled) {
                this.timepickerVariables[side].disabledMinutes.push(i);
            }
        }
        // generate seconds
        if (this.timePickerSeconds) {
            for (var i = 0; i < 60; i++) {
                var padded = i < 10 ? '0' + i : i;
                var time = selected.clone().second(i);
                var disabled = false;
                if (minDate && time.isBefore(minDate)) {
                    disabled = true;
                }
                if (maxDate && time.isAfter(maxDate)) {
                    disabled = true;
                }
                this.timepickerVariables[side].seconds.push(i);
                this.timepickerVariables[side].secondsLabel.push(padded);
                if (selected.second() == i && !disabled) {
                    this.timepickerVariables[side].selectedSecond = i;
                }
                else if (disabled) {
                    this.timepickerVariables[side].disabledSeconds.push(i);
                }
            }
        }
        // generate AM/PM
        if (!this.timePicker24Hour) {
            var am_html = '';
            var pm_html = '';
            if (minDate && selected.clone().hour(12).minute(0).second(0).isBefore(minDate)) {
                this.timepickerVariables[side].amDisabled = true;
            }
            if (maxDate && selected.clone().hour(0).minute(0).second(0).isAfter(maxDate)) {
                this.timepickerVariables[side].pmDisabled = true;
            }
            if (selected.hour() >= 12) {
                this.timepickerVariables[side].ampmModel = 'PM';
            }
            else {
                this.timepickerVariables[side].ampmModel = 'AM';
            }
        }
        this.timepickerVariables[side].selected = selected;
    };
    DaterangepickerComponent.prototype.renderCalendar = function (side) {
        var mainCalendar = (side === SideEnum.left) ? this.leftCalendar : this.rightCalendar;
        var month = mainCalendar.month.month();
        var year = mainCalendar.month.year();
        var hour = mainCalendar.month.hour();
        var minute = mainCalendar.month.minute();
        var second = mainCalendar.month.second();
        var daysInMonth = moment([year, month]).daysInMonth();
        var firstDay = moment([year, month, 1]);
        var lastDay = moment([year, month, daysInMonth]);
        var lastMonth = moment(firstDay).subtract(1, 'month').month();
        var lastYear = moment(firstDay).subtract(1, 'month').year();
        var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
        var dayOfWeek = firstDay.day();
        // initialize a 6 rows x 7 columns array for the calendar
        var calendar = [];
        calendar.firstDay = firstDay;
        calendar.lastDay = lastDay;
        for (var i = 0; i < 6; i++) {
            calendar[i] = [];
        }
        // populate the calendar with date objects
        var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
        if (startDay > daysInLastMonth) {
            startDay -= 7;
        }
        if (dayOfWeek === this.locale.firstDay) {
            startDay = daysInLastMonth - 6;
        }
        var curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);
        for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
            if (i > 0 && col % 7 === 0) {
                col = 0;
                row++;
            }
            calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
            curDate.hour(12);
            if (this.minDate && calendar[row][col].format('YYYY-MM-DD') === this.minDate.format('YYYY-MM-DD') &&
                calendar[row][col].isBefore(this.minDate) && side === 'left') {
                calendar[row][col] = this.minDate.clone();
            }
            if (this.maxDate && calendar[row][col].format('YYYY-MM-DD') === this.maxDate.format('YYYY-MM-DD') &&
                calendar[row][col].isAfter(this.maxDate) && side === 'right') {
                calendar[row][col] = this.maxDate.clone();
            }
        }
        // make the calendar object available to hoverDate/clickDate
        if (side === SideEnum.left) {
            this.leftCalendar.calendar = calendar;
        }
        else {
            this.rightCalendar.calendar = calendar;
        }
        //
        // Display the calendar
        //
        var minDate = side === 'left' ? this.minDate : this.startDate;
        var maxDate = this.maxDate;
        // adjust maxDate to reflect the dateLimit setting in order to
        // grey out end dates beyond the dateLimit
        if (this.endDate === null && this.dateLimit) {
            var maxLimit = this.startDate.clone().add(this.dateLimit, 'day').endOf('day');
            if (!maxDate || maxLimit.isBefore(maxDate)) {
                maxDate = maxLimit;
            }
        }
        this.calendarVariables[side] = {
            month: month,
            year: year,
            hour: hour,
            minute: minute,
            second: second,
            daysInMonth: daysInMonth,
            firstDay: firstDay,
            lastDay: lastDay,
            lastMonth: lastMonth,
            lastYear: lastYear,
            daysInLastMonth: daysInLastMonth,
            dayOfWeek: dayOfWeek,
            // other vars
            calRows: Array.from(Array(6).keys()),
            calCols: Array.from(Array(7).keys()),
            classes: {},
            minDate: minDate,
            maxDate: maxDate,
            calendar: calendar
        };
        if (this.showDropdowns) {
            var currentMonth = calendar[1][1].month();
            var currentYear = calendar[1][1].year();
            var maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
            var minYear = (minDate && minDate.year()) || (currentYear - 50);
            var inMinYear = currentYear === minYear;
            var inMaxYear = currentYear === maxYear;
            var years = [];
            for (var y = minYear; y <= maxYear; y++) {
                years.push(y);
            }
            this.calendarVariables[side].dropdowns = {
                currentMonth: currentMonth,
                currentYear: currentYear,
                maxYear: maxYear,
                minYear: minYear,
                inMinYear: inMinYear,
                inMaxYear: inMaxYear,
                monthArrays: Array.from(Array(12).keys()),
                yearArrays: years
            };
        }
        this._buildCells(calendar, side);
    };
    DaterangepickerComponent.prototype.setStartDate = function (startDate) {
        if (typeof startDate === 'string') {
            this.startDate = moment(startDate, this.locale.format);
        }
        if (typeof startDate === 'object') {
            this.startDate = moment(startDate);
        }
        if (!this.timePicker) {
            this.startDate = this.startDate.startOf('day');
        }
        if (this.timePicker && this.timePickerIncrement) {
            this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
        }
        if (this.minDate && this.startDate.isBefore(this.minDate)) {
            this.startDate = this.minDate.clone();
            if (this.timePicker && this.timePickerIncrement) {
                this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }
        }
        if (this.maxDate && this.startDate.isAfter(this.maxDate)) {
            this.startDate = this.maxDate.clone();
            if (this.timePicker && this.timePickerIncrement) {
                this.startDate.minute(Math.floor(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }
        }
        if (!this.isShown) {
            this.updateElement();
        }
        this.updateMonthsInView();
    };
    DaterangepickerComponent.prototype.setEndDate = function (endDate) {
        if (typeof endDate === 'string') {
            this.endDate = moment(endDate, this.locale.format);
        }
        if (typeof endDate === 'object') {
            this.endDate = moment(endDate);
        }
        if (!this.timePicker) {
            this.endDate = this.endDate.add(1, 'd').startOf('day').subtract(1, 'second');
        }
        if (this.timePicker && this.timePickerIncrement) {
            this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
        }
        if (this.endDate.isBefore(this.startDate)) {
            this.endDate = this.startDate.clone();
        }
        if (this.maxDate && this.endDate.isAfter(this.maxDate)) {
            this.endDate = this.maxDate.clone();
        }
        if (this.dateLimit && this.startDate.clone().add(this.dateLimit, 'day').isBefore(this.endDate)) {
            this.endDate = this.startDate.clone().add(this.dateLimit, 'day');
        }
        if (!this.isShown) {
            // this.updateElement();
        }
        this.updateMonthsInView();
    };
    DaterangepickerComponent.prototype.isInvalidDate = function (date) {
        return false;
    };
    DaterangepickerComponent.prototype.isCustomDate = function (date) {
        return false;
    };
    DaterangepickerComponent.prototype.updateView = function () {
        if (this.timePicker) {
            this.renderTimePicker(SideEnum.left);
            this.renderTimePicker(SideEnum.right);
        }
        this.updateMonthsInView();
        this.updateCalendars();
    };
    DaterangepickerComponent.prototype.updateMonthsInView = function () {
        if (this.endDate) {
            // if both dates are visible already, do nothing
            if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month &&
                ((this.startDate && this.leftCalendar && this.startDate.format('YYYY-MM') === this.leftCalendar.month.format('YYYY-MM')) ||
                    (this.startDate && this.rightCalendar && this.startDate.format('YYYY-MM') === this.rightCalendar.month.format('YYYY-MM')))
                &&
                    (this.endDate.format('YYYY-MM') === this.leftCalendar.month.format('YYYY-MM') ||
                        this.endDate.format('YYYY-MM') === this.rightCalendar.month.format('YYYY-MM'))) {
                return;
            }
            if (this.startDate) {
                this.leftCalendar.month = this.startDate.clone().date(2);
                if (!this.linkedCalendars && (this.endDate.month() !== this.startDate.month() ||
                    this.endDate.year() !== this.startDate.year())) {
                    this.rightCalendar.month = this.endDate.clone().date(2);
                }
                else {
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }
            }
        }
        else {
            if (this.leftCalendar.month.format('YYYY-MM') !== this.startDate.format('YYYY-MM') &&
                this.rightCalendar.month.format('YYYY-MM') !== this.startDate.format('YYYY-MM')) {
                this.leftCalendar.month = this.startDate.clone().date(2);
                this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
            }
        }
        if (this.maxDate && this.linkedCalendars && !this.singleDatePicker && this.rightCalendar.month > this.maxDate) {
            this.rightCalendar.month = this.maxDate.clone().date(2);
            this.leftCalendar.month = this.maxDate.clone().date(2).subtract(1, 'month');
        }
    };
    /**
     *  This is responsible for updating the calendars
     */
    DaterangepickerComponent.prototype.updateCalendars = function () {
        this.renderCalendar(SideEnum.left);
        this.renderCalendar(SideEnum.right);
        if (this.endDate === null) {
            return;
        }
        this.calculateChosenLabel();
    };
    DaterangepickerComponent.prototype.updateElement = function () {
        if (!this.singleDatePicker && this.autoUpdateInput) {
            if (this.startDate && this.endDate) {
                // if we use ranges and should show range label on inpu
                if (this.rangesArray.length && this.showRangeLabelOnInput === true && this.chosenRange &&
                    this.locale.customRangeLabel !== this.chosenRange) {
                    this.chosenLabel = this.chosenRange;
                }
                else {
                    this.chosenLabel = this.startDate.format(this.locale.format) +
                        this.locale.separator + this.endDate.format(this.locale.format);
                }
            }
        }
        else if (this.autoUpdateInput) {
            this.chosenLabel = this.startDate.format(this.locale.format);
        }
    };
    DaterangepickerComponent.prototype.remove = function () {
        this.isShown = false;
    };
    /**
     * this should calculate the label
     */
    DaterangepickerComponent.prototype.calculateChosenLabel = function () {
        if (!this.locale || !this.locale.separator) {
            this._buildLocale();
        }
        var customRange = true;
        var i = 0;
        if (this.rangesArray.length > 0) {
            for (var range in this.ranges) {
                if (this.timePicker) {
                    var format = this.timePickerSeconds ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD HH:mm";
                    //ignore times when comparing dates if time picker seconds is not enabled
                    if (this.startDate.format(format) == this.ranges[range][0].format(format) && this.endDate.format(format) == this.ranges[range][1].format(format)) {
                        customRange = false;
                        this.chosenRange = this.rangesArray[i];
                        break;
                    }
                }
                else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;
                        this.chosenRange = this.rangesArray[i];
                        break;
                    }
                }
                i++;
            }
            if (customRange) {
                if (this.showCustomRangeLabel) {
                    this.chosenRange = this.locale.customRangeLabel;
                }
                else {
                    this.chosenRange = null;
                }
                // if custom label: show calenar
                this.showCalInRanges = true;
            }
        }
        this.updateElement();
    };
    DaterangepickerComponent.prototype.clickApply = function (e) {
        if (!this.singleDatePicker && this.startDate && !this.endDate) {
            this.endDate = this.startDate.clone();
            this.calculateChosenLabel();
        }
        if (this.isInvalidDate && this.startDate && this.endDate) {
            // get if there are invalid date between range
            var d = this.startDate.clone();
            while (d.isBefore(this.endDate)) {
                if (this.isInvalidDate(d)) {
                    this.endDate = d.subtract(1, 'days');
                    this.calculateChosenLabel();
                    break;
                }
                d.add(1, 'days');
            }
        }
        if (this.chosenLabel) {
            this.choosedDate.emit({ chosenLabel: this.chosenLabel, startDate: this.startDate, endDate: this.endDate });
        }
        this.datesUpdated.emit({ startDate: this.startDate, endDate: this.endDate });
        this.hide();
    };
    DaterangepickerComponent.prototype.clickCancel = function (e) {
        this.startDate = this._old.start;
        this.endDate = this._old.end;
        if (this.inline) {
            this.updateView();
        }
        this.hide();
    };
    /**
     * called when month is changed
     * @param monthEvent get value in event.target.value
     * @param side left or right
     */
    DaterangepickerComponent.prototype.monthChanged = function (monthEvent, side) {
        var year = this.calendarVariables[side].dropdowns.currentYear;
        var month = parseInt(monthEvent.target.value, 10);
        this.monthOrYearChanged(month, year, side);
    };
    /**
     * called when year is changed
     * @param yearEvent get value in event.target.value
     * @param side left or right
     */
    DaterangepickerComponent.prototype.yearChanged = function (yearEvent, side) {
        var month = this.calendarVariables[side].dropdowns.currentMonth;
        var year = parseInt(yearEvent.target.value, 10);
        this.monthOrYearChanged(month, year, side);
    };
    /**
     * called when time is changed
     * @param timeEvent  an event
     * @param side left or right
     */
    DaterangepickerComponent.prototype.timeChanged = function (timeEvent, side) {
        var hour = parseInt(this.timepickerVariables[side].selectedHour, 10);
        var minute = parseInt(this.timepickerVariables[side].selectedMinute, 10);
        var second = this.timePickerSeconds ? parseInt(this.timepickerVariables[side].selectedSecond, 10) : 0;
        if (!this.timePicker24Hour) {
            var ampm = this.timepickerVariables[side].ampmModel;
            if (ampm === 'PM' && hour < 12)
                hour += 12;
            if (ampm === 'AM' && hour === 12)
                hour = 0;
        }
        if (side === SideEnum.left) {
            var start = this.startDate.clone();
            start.hour(hour);
            start.minute(minute);
            start.second(second);
            this.setStartDate(start);
            if (this.singleDatePicker) {
                this.endDate = this.startDate.clone();
            }
            else if (this.endDate && this.endDate.format('YYYY-MM-DD') == start.format('YYYY-MM-DD') && this.endDate.isBefore(start)) {
                this.setEndDate(start.clone());
            }
        }
        else if (this.endDate) {
            var end = this.endDate.clone();
            end.hour(hour);
            end.minute(minute);
            end.second(second);
            this.setEndDate(end);
        }
        //update the calendars so all clickable dates reflect the new time component
        this.updateCalendars();
        //re-render the time pickers because changing one selection can affect what's enabled in another
        this.renderTimePicker(SideEnum.left);
        this.renderTimePicker(SideEnum.right);
    };
    /**
     *  call when month or year changed
     * @param month month number 0 -11
     * @param year year eg: 1995
     * @param side left or right
     */
    DaterangepickerComponent.prototype.monthOrYearChanged = function (month, year, side) {
        var isLeft = side === SideEnum.left;
        if (!isLeft) {
            if (year < this.startDate.year() || (year === this.startDate.year() && month < this.startDate.month())) {
                month = this.startDate.month();
                year = this.startDate.year();
            }
        }
        if (this.minDate) {
            if (year < this.minDate.year() || (year === this.minDate.year() && month < this.minDate.month())) {
                month = this.minDate.month();
                year = this.minDate.year();
            }
        }
        if (this.maxDate) {
            if (year > this.maxDate.year() || (year === this.maxDate.year() && month > this.maxDate.month())) {
                month = this.maxDate.month();
                year = this.maxDate.year();
            }
        }
        this.calendarVariables[side].dropdowns.currentYear = year;
        this.calendarVariables[side].dropdowns.currentMonth = month;
        if (isLeft) {
            this.leftCalendar.month.month(month).year(year);
            if (this.linkedCalendars) {
                this.rightCalendar.month = this.leftCalendar.month.clone().add(1, 'month');
            }
        }
        else {
            this.rightCalendar.month.month(month).year(year);
            if (this.linkedCalendars) {
                this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
            }
        }
        this.updateCalendars();
    };
    /**
     * Click on previous month
     * @param side left or right calendar
     */
    DaterangepickerComponent.prototype.clickPrev = function (side) {
        if (side === SideEnum.left) {
            this.leftCalendar.month.subtract(1, 'month');
            if (this.linkedCalendars) {
                this.rightCalendar.month.subtract(1, 'month');
            }
        }
        else {
            this.rightCalendar.month.subtract(1, 'month');
        }
        this.updateCalendars();
    };
    /**
     * Click on next month
     * @param side left or right calendar
     */
    DaterangepickerComponent.prototype.clickNext = function (side) {
        if (side === SideEnum.left) {
            this.leftCalendar.month.add(1, 'month');
        }
        else {
            this.rightCalendar.month.add(1, 'month');
            if (this.linkedCalendars) {
                this.leftCalendar.month.add(1, 'month');
            }
        }
        this.updateCalendars();
    };
    /**
     * When selecting a date
     * @param e event: get value by e.target.value
     * @param side left or right
     * @param row row position of the current date clicked
     * @param col col position of the current date clicked
     */
    DaterangepickerComponent.prototype.clickDate = function (e, side, row, col) {
        if (e.target.tagName === 'TD') {
            if (!e.target.classList.contains('available')) {
                return;
            }
        }
        else if (e.target.tagName === 'SPAN') {
            if (!e.target.parentElement.classList.contains('available')) {
                return;
            }
        }
        if (this.rangesArray.length) {
            this.chosenRange = this.locale.customRangeLabel;
        }
        var date = side === SideEnum.left ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];
        if (this.endDate || date.isBefore(this.startDate, 'day')) { // picking start
            if (this.timePicker) {
                date = this._getDateWithTime(date, SideEnum.left);
            }
            this.endDate = null;
            this.setStartDate(date.clone());
        }
        else if (!this.endDate && date.isBefore(this.startDate)) {
            // special case: clicking the same date for start/end,
            // but the time of the end date is before the start date
            this.setEndDate(this.startDate.clone());
        }
        else { // picking end
            if (this.timePicker) {
                date = this._getDateWithTime(date, SideEnum.right);
            }
            this.setEndDate(date.clone());
            if (this.autoApply) {
                this.calculateChosenLabel();
                this.clickApply();
            }
        }
        if (this.singleDatePicker) {
            this.setEndDate(this.startDate);
            this.updateElement();
            if (this.autoApply) {
                this.clickApply();
            }
        }
        this.updateView();
        // This is to cancel the blur event handler if the mouse was in one of the inputs
        e.stopPropagation();
    };
    /**
     *  Click on the custom range
     * @param e: Event
     * @param label
     */
    DaterangepickerComponent.prototype.clickRange = function (e, label) {
        this.chosenRange = label;
        if (label == this.locale.customRangeLabel) {
            this.isShown = true; // show calendars
            this.showCalInRanges = true;
        }
        else {
            var dates = this.ranges[label];
            this.startDate = dates[0].clone();
            this.endDate = dates[1].clone();
            if (this.showRangeLabelOnInput && label !== this.locale.customRangeLabel) {
                this.chosenLabel = label;
            }
            else {
                this.calculateChosenLabel();
            }
            this.showCalInRanges = (!this.rangesArray.length) || this.alwaysShowCalendars;
            if (!this.timePicker) {
                this.startDate.startOf('day');
                this.endDate.endOf('day');
            }
            if (!this.alwaysShowCalendars) {
                this.isShown = false; // hide calendars
            }
            this.rangeClicked.emit({ label: label, dates: dates });
            if (!this.keepCalendarOpeningWithRange) {
                this.clickApply();
            }
            else {
                this.leftCalendar.month.month(dates[0].month());
                this.leftCalendar.month.year(dates[0].year());
                this.rightCalendar.month.month(dates[1].month());
                this.rightCalendar.month.year(dates[1].year());
                this.updateCalendars();
                if (this.timePicker) {
                    this.renderTimePicker(SideEnum.left);
                    this.renderTimePicker(SideEnum.right);
                }
            }
        }
    };
    ;
    DaterangepickerComponent.prototype.show = function (e) {
        if (this.isShown) {
            return;
        }
        this._old.start = this.startDate.clone();
        this._old.end = this.endDate.clone();
        this.isShown = true;
        this.updateView();
    };
    DaterangepickerComponent.prototype.hide = function (e) {
        if (!this.isShown) {
            return;
        }
        // incomplete date selection, revert to last values
        if (!this.endDate) {
            if (this._old.start) {
                this.startDate = this._old.start.clone();
            }
            if (this._old.end) {
                this.endDate = this._old.end.clone();
            }
        }
        // if a new date range was selected, invoke the user callback function
        if (!this.startDate.isSame(this._old.start) || !this.endDate.isSame(this._old.end)) {
            // this.callback(this.startDate, this.endDate, this.chosenLabel);
        }
        // if picker is attached to a text input, update it
        this.updateElement();
        this.isShown = false;
        this._ref.detectChanges();
    };
    /**
     * handle click on all element in the component, usefull for outside of click
     * @param e event
     */
    DaterangepickerComponent.prototype.handleInternalClick = function (e) {
        e.stopPropagation();
    };
    /**
     * update the locale options
     * @param locale
     */
    DaterangepickerComponent.prototype.updateLocale = function (locale) {
        for (var key in locale) {
            if (locale.hasOwnProperty(key)) {
                this.locale[key] = locale[key];
            }
        }
    };
    /**
     *  clear the daterange picker
     */
    DaterangepickerComponent.prototype.clear = function () {
        this.startDate = moment().startOf('day');
        this.endDate = moment().endOf('day');
        this.choosedDate.emit({ chosenLabel: '', startDate: null, endDate: null });
        this.datesUpdated.emit({ startDate: null, endDate: null });
        this.hide();
    };
    /**
     * Find out if the selected range should be disabled if it doesn't
     * fit into minDate and maxDate limitations.
     */
    DaterangepickerComponent.prototype.disableRange = function (range) {
        var _this = this;
        if (range === this.locale.customRangeLabel) {
            return false;
        }
        var rangeMarkers = this.ranges[range];
        var areBothBefore = rangeMarkers.every(function (date) {
            if (!_this.minDate) {
                return false;
            }
            return date.isBefore(_this.minDate);
        });
        var areBothAfter = rangeMarkers.every(function (date) {
            if (!_this.maxDate) {
                return false;
            }
            return date.isAfter(_this.maxDate);
        });
        return (areBothBefore || areBothAfter);
    };
    /**
     *
     * @param date the date to add time
     * @param side left or right
     */
    DaterangepickerComponent.prototype._getDateWithTime = function (date, side) {
        var hour = parseInt(this.timepickerVariables[side].selectedHour, 10);
        if (!this.timePicker24Hour) {
            var ampm = this.timepickerVariables[side].ampmModel;
            if (ampm === 'PM' && hour < 12)
                hour += 12;
            if (ampm === 'AM' && hour === 12)
                hour = 0;
        }
        var minute = parseInt(this.timepickerVariables[side].selectedMinute, 10);
        var second = this.timePickerSeconds ? parseInt(this.timepickerVariables[side].selectedSecond, 10) : 0;
        return date.clone().hour(hour).minute(minute).second(second);
    };
    /**
     *  build the locale config
     */
    DaterangepickerComponent.prototype._buildLocale = function () {
        this.locale = tslib_1.__assign({}, this._localeService.config, this.locale);
        if (!this.locale.format) {
            if (this.timePicker) {
                this.locale.format = moment.localeData().longDateFormat('lll');
            }
            else {
                this.locale.format = moment.localeData().longDateFormat('L');
            }
        }
    };
    DaterangepickerComponent.prototype._buildCells = function (calendar, side) {
        for (var row = 0; row < 6; row++) {
            this.calendarVariables[side].classes[row] = {};
            var rowClasses = [];
            if (this.emptyWeekRowClass && !this.hasCurrentMonthDays(this.calendarVariables[side].month, calendar[row])) {
                rowClasses.push(this.emptyWeekRowClass);
            }
            for (var col = 0; col < 7; col++) {
                var classes = [];
                // highlight today's date
                if (calendar[row][col].isSame(new Date(), 'day')) {
                    classes.push('today');
                }
                // highlight weekends
                if (calendar[row][col].isoWeekday() > 5) {
                    classes.push('weekend');
                }
                // grey out the dates in other months displayed at beginning and end of this calendar
                if (calendar[row][col].month() !== calendar[1][1].month()) {
                    classes.push('off');
                    // mark the last day of the previous month in this calendar
                    if (this.lastDayOfPreviousMonthClass && (calendar[row][col].month() < calendar[1][1].month() || calendar[1][1].month() === 0) && calendar[row][col].date() === this.calendarVariables[side].daysInLastMonth) {
                        classes.push(this.lastDayOfPreviousMonthClass);
                    }
                    // mark the first day of the next month in this calendar
                    if (this.firstDayOfNextMonthClass && (calendar[row][col].month() > calendar[1][1].month() || calendar[row][col].month() === 0) && calendar[row][col].date() === 1) {
                        classes.push(this.firstDayOfNextMonthClass);
                    }
                }
                // mark the first day of the current month with a custom class
                if (this.firstMonthDayClass && calendar[row][col].month() === calendar[1][1].month() && calendar[row][col].date() === calendar.firstDay.date()) {
                    classes.push(this.firstMonthDayClass);
                }
                // mark the last day of the current month with a custom class
                if (this.lastMonthDayClass && calendar[row][col].month() === calendar[1][1].month() && calendar[row][col].date() === calendar.lastDay.date()) {
                    classes.push(this.lastMonthDayClass);
                }
                // don't allow selection of dates before the minimum date
                if (this.minDate && calendar[row][col].isBefore(this.minDate, 'day')) {
                    classes.push('off', 'disabled');
                }
                // don't allow selection of dates after the maximum date
                if (this.calendarVariables[side].maxDate && calendar[row][col].isAfter(this.calendarVariables[side].maxDate, 'day')) {
                    classes.push('off', 'disabled');
                }
                // don't allow selection of date if a custom function decides it's invalid
                if (this.isInvalidDate(calendar[row][col])) {
                    classes.push('off', 'disabled');
                }
                // highlight the currently selected start date
                if (this.startDate && calendar[row][col].format('YYYY-MM-DD') === this.startDate.format('YYYY-MM-DD')) {
                    classes.push('active', 'start-date');
                }
                // highlight the currently selected end date
                if (this.endDate != null && calendar[row][col].format('YYYY-MM-DD') === this.endDate.format('YYYY-MM-DD')) {
                    classes.push('active', 'end-date');
                }
                // highlight dates in-between the selected dates
                if (this.endDate != null && calendar[row][col] > this.startDate && calendar[row][col] < this.endDate) {
                    classes.push('in-range');
                }
                // apply custom classes for this date
                var isCustom = this.isCustomDate(calendar[row][col]);
                if (isCustom !== false) {
                    if (typeof isCustom === 'string') {
                        classes.push(isCustom);
                    }
                    else {
                        Array.prototype.push.apply(classes, isCustom);
                    }
                }
                // store classes var
                var cname = '', disabled = false;
                for (var i = 0; i < classes.length; i++) {
                    cname += classes[i] + ' ';
                    if (classes[i] === 'disabled') {
                        disabled = true;
                    }
                }
                if (!disabled) {
                    cname += 'available';
                }
                this.calendarVariables[side].classes[row][col] = cname.replace(/^\s+|\s+$/g, '');
            }
            this.calendarVariables[side].classes[row].classList = rowClasses.join(' ');
        }
    };
    /**
     * Find out if the current calendar row has current month days
     * (as opposed to consisting of only previous/next month days)
     */
    DaterangepickerComponent.prototype.hasCurrentMonthDays = function (currentMonth, row) {
        for (var day = 0; day < 7; day++) {
            if (row[day].month() === currentMonth) {
                return true;
            }
        }
        return false;
    };
    var DaterangepickerComponent_1;
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Number)
    ], DaterangepickerComponent.prototype, "dateLimit", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], DaterangepickerComponent.prototype, "minDate", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], DaterangepickerComponent.prototype, "maxDate", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "autoApply", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "singleDatePicker", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "showDropdowns", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "showWeekNumbers", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "showISOWeekNumbers", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "linkedCalendars", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "autoUpdateInput", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "alwaysShowCalendars", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "maxSpan", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "timePicker", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "timePicker24Hour", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Number)
    ], DaterangepickerComponent.prototype, "timePickerIncrement", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "timePickerSeconds", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "showClearButton", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", String)
    ], DaterangepickerComponent.prototype, "firstMonthDayClass", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", String)
    ], DaterangepickerComponent.prototype, "lastMonthDayClass", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", String)
    ], DaterangepickerComponent.prototype, "emptyWeekRowClass", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", String)
    ], DaterangepickerComponent.prototype, "firstDayOfNextMonthClass", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", String)
    ], DaterangepickerComponent.prototype, "lastDayOfPreviousMonthClass", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], DaterangepickerComponent.prototype, "locale", null);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], DaterangepickerComponent.prototype, "ranges", null);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "showCustomRangeLabel", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "showCancel", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "keepCalendarOpeningWithRange", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], DaterangepickerComponent.prototype, "showRangeLabelOnInput", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", String)
    ], DaterangepickerComponent.prototype, "drops", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", String)
    ], DaterangepickerComponent.prototype, "opens", void 0);
    tslib_1.__decorate([
        Output('choosedDate'),
        tslib_1.__metadata("design:type", EventEmitter)
    ], DaterangepickerComponent.prototype, "choosedDate", void 0);
    tslib_1.__decorate([
        Output('rangeClicked'),
        tslib_1.__metadata("design:type", EventEmitter)
    ], DaterangepickerComponent.prototype, "rangeClicked", void 0);
    tslib_1.__decorate([
        Output('datesUpdated'),
        tslib_1.__metadata("design:type", EventEmitter)
    ], DaterangepickerComponent.prototype, "datesUpdated", void 0);
    tslib_1.__decorate([
        ViewChild('pickerContainer'),
        tslib_1.__metadata("design:type", ElementRef)
    ], DaterangepickerComponent.prototype, "pickerContainer", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object]),
        tslib_1.__metadata("design:returntype", void 0)
    ], DaterangepickerComponent.prototype, "isInvalidDate", null);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object]),
        tslib_1.__metadata("design:returntype", void 0)
    ], DaterangepickerComponent.prototype, "isCustomDate", null);
    DaterangepickerComponent = DaterangepickerComponent_1 = tslib_1.__decorate([
        Component({
            selector: 'ngx-daterangepicker-material',
            template: "<div class=\"md-drppicker\" #pickerContainer\n[ngClass]=\"{\n    ltr: locale.direction === 'ltr',\n    rtl: this.locale.direction === 'rtl',\n    'shown': isShown || inline,\n    'hidden': !isShown && !inline,\n    'inline': inline,\n    'double': !singleDatePicker && showCalInRanges,\n    'show-ranges': rangesArray.length\n}\" [class]=\"'drops-' + drops + '-' + opens\">\n    <div class=\"ranges\">\n        <ul>\n          <li *ngFor=\"let range of rangesArray\">\n            <button type=\"button\"\n                    (click)=\"clickRange($event, range)\"\n                    [disabled]=\"disableRange(range)\"\n                    [ngClass]=\"{'active': range === chosenRange}\">{{range}}</button>\n          </li>\n        </ul>\n    </div>\n    <div class=\"calendar\" [ngClass]=\"{right: singleDatePicker, left: !singleDatePicker}\"\n        *ngIf=\"showCalInRanges\">\n        <div class=\"calendar-table\">\n            <table class=\"table-condensed\" *ngIf=\"calendarVariables\">\n                <thead>\n                    <tr>\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\"></th>\n                        <ng-container *ngIf=\"!calendarVariables.left.minDate || calendarVariables.left.minDate.isBefore(calendarVariables.left.calendar.firstDay) && (!this.linkedCalendars || true)\">\n                            <th (click)=\"clickPrev(sideEnum.left)\" class=\"prev available\" >\n                            </th>\n                        </ng-container>\n                        <ng-container *ngIf=\"!(!calendarVariables.left.minDate || calendarVariables.left.minDate.isBefore(calendarVariables.left.calendar.firstDay) && (!this.linkedCalendars || true))\">\n                            <th></th>\n                        </ng-container>\n                        <th colspan=\"5\" class=\"month drp-animate\">\n                            <ng-container *ngIf=\"showDropdowns && calendarVariables.left.dropdowns\">\n                                <div class=\"dropdowns\">\n                                        {{this.locale.monthNames[calendarVariables?.left?.calendar[1][1].month()]}}\n                                        <select class=\"monthselect\" (change)=\"monthChanged($event, sideEnum.left)\">\n                                                <option\n                                                [disabled]=\"(calendarVariables.left.dropdowns.inMinYear && m < calendarVariables.left.minDate.month()) || (calendarVariables.left.dropdowns.inMaxYear && m > calendarVariables.left.maxDate.month())\"\n                                                *ngFor=\"let m of calendarVariables.left.dropdowns.monthArrays\" [value]=\"m\" [selected]=\"calendarVariables.left.dropdowns.currentMonth == m\">\n                                                    {{locale.monthNames[m]}}\n                                                </option>\n                                        </select>\n                                </div>\n                                <div class=\"dropdowns\">\n                                    {{ calendarVariables?.left?.calendar[1][1].format(\" YYYY\")}}\n                                    <select class=\"yearselect\"  (change)=\"yearChanged($event, sideEnum.left)\">\n                                        <option *ngFor=\"let y of calendarVariables.left.dropdowns.yearArrays\" [selected]=\"y === calendarVariables.left.dropdowns.currentYear\">\n                                            {{y}}\n                                        </option>\n                                    </select>\n                                </div>\n                            </ng-container>\n                            <ng-container *ngIf=\"!showDropdowns || !calendarVariables.left.dropdowns\">\n                                    {{this.locale.monthNames[calendarVariables?.left?.calendar[1][1].month()]}}  {{ calendarVariables?.left?.calendar[1][1].format(\" YYYY\")}}\n                            </ng-container>\n                        </th>\n                        <ng-container *ngIf=\"(!calendarVariables.left.maxDate || calendarVariables.left.maxDate.isAfter(calendarVariables.left.calendar.lastDay)) && (!linkedCalendars || singleDatePicker )\">\n                            <th class=\"next available\" (click)=\"clickNext(sideEnum.left)\">\n                            </th>\n                        </ng-container>\n                        <ng-container *ngIf=\"!((!calendarVariables.left.maxDate || calendarVariables.left.maxDate.isAfter(calendarVariables.left.calendar.lastDay)) && (!linkedCalendars || singleDatePicker ))\">\n                            <th></th>\n                        </ng-container>\n                    </tr>\n                    <tr class='week-days'>\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\" class=\"week\"><span>{{this.locale.weekLabel}}</span></th>\n                        <th *ngFor=\"let dayofweek of locale.daysOfWeek\"><span>{{dayofweek}}</span></th>\n                    </tr>\n                </thead>\n                <tbody class=\"drp-animate\">\n                    <tr *ngFor=\"let row of calendarVariables.left.calRows\" [class]=\"calendarVariables.left.classes[row].classList\">\n                        <!-- add week number -->\n                        <td  class=\"week\" *ngIf=\"showWeekNumbers\">\n                            <span>{{calendarVariables.left.calendar[row][0].week()}}</span>\n                        </td>\n                        <td class=\"week\" *ngIf=\"showISOWeekNumbers\">\n                            <span>{{calendarVariables.left.calendar[row][0].isoWeek()}}</span>\n                        </td>\n                        <!-- cal -->\n                        <td *ngFor=\"let col of calendarVariables.left.calCols\" [class]=\"calendarVariables.left.classes[row][col]\" (click)=\"clickDate($event, sideEnum.left, row, col)\">\n                            <span>{{calendarVariables.left.calendar[row][col].date()}}</span>\n                        </td>\n                    </tr>\n                </tbody>\n            </table>\n        </div>\n        <div class=\"calendar-time\" *ngIf=\"timePicker\">\n            <div class=\"select\">\n                <select class=\"hourselect select-item\" [disabled]=\"!endDate\" [(ngModel)]=\"timepickerVariables.left.selectedHour\" (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option *ngFor=\"let i of timepickerVariables.left.hours\"\n                    [value]=\"i\"\n                    [disabled]=\"timepickerVariables.left.disabledHours.indexOf(i) > -1\">{{i}}</option>\n                </select>\n            </div>\n            <div class=\"select\">\n                <select class=\"select-item minuteselect\" [disabled]=\"!endDate\" [(ngModel)]=\"timepickerVariables.left.selectedMinute\" (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option *ngFor=\"let i of timepickerVariables.left.minutes; let index = index;\"\n                    [value]=\"i\"\n                    [disabled]=\"timepickerVariables.left.disabledMinutes.indexOf(i) > -1\">{{timepickerVariables.left.minutesLabel[index]}}</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select class=\"select-item secondselect\" *ngIf=\"timePickerSeconds\" [disabled]=\"!endDate\" [(ngModel)]=\"timepickerVariables.left.selectedSecond\" (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option *ngFor=\"let i of timepickerVariables.left.seconds; let index = index;\"\n                    [value]=\"i\"\n                    [disabled]=\"timepickerVariables.left.disabledSeconds.indexOf(i) > -1\">{{timepickerVariables.left.secondsLabel[index]}}</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select class=\"select-item ampmselect\" *ngIf=\"!timePicker24Hour\" [(ngModel)]=\"timepickerVariables.left.ampmModel\" (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option value=\"AM\" [disabled]=\"timepickerVariables.left.amDisabled\">AM</option>\n                    <option value=\"PM\"  [disabled]=\"timepickerVariables.left.pmDisabled\">PM</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n        </div>\n    </div>\n    <div class=\"calendar right\"\n        *ngIf=\"showCalInRanges && !singleDatePicker\"\n        >\n        <div class=\"calendar-table\">\n            <table class=\"table-condensed\" *ngIf=\"calendarVariables\">\n                <thead>\n                    <tr>\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\"></th>\n                        <ng-container *ngIf=\"(!calendarVariables.right.minDate || calendarVariables.right.minDate.isBefore(calendarVariables.right.calendar.firstDay)) && (!this.linkedCalendars)\">\n                            <th (click)=\"clickPrev(sideEnum.right)\" class=\"prev available\" >\n                            </th>\n                        </ng-container>\n                        <ng-container *ngIf=\"!((!calendarVariables.right.minDate || calendarVariables.right.minDate.isBefore(calendarVariables.right.calendar.firstDay)) && (!this.linkedCalendars))\">\n                            <th></th>\n                        </ng-container>\n                        <th colspan=\"5\" class=\"month\">\n                            <ng-container *ngIf=\"showDropdowns && calendarVariables.right.dropdowns\">\n                                <div class=\"dropdowns\">\n                                    {{this.locale.monthNames[calendarVariables?.right?.calendar[1][1].month()]}}\n                                    <select class=\"monthselect\" (change)=\"monthChanged($event, sideEnum.right)\">\n                                            <option\n                                            [disabled]=\"(calendarVariables.right.dropdowns.inMinYear && m < calendarVariables.right.minDate.month()) || (calendarVariables.right.dropdowns.inMaxYear && m > calendarVariables.right.maxDate.month())\"\n                                            *ngFor=\"let m of calendarVariables.right.dropdowns.monthArrays\" [value]=\"m\" [selected]=\"calendarVariables.right.dropdowns.currentMonth == m\">\n                                                {{locale.monthNames[m]}}\n                                            </option>\n                                    </select>\n                                </div>\n                                <div class=\"dropdowns\">\n                                        {{ calendarVariables?.right?.calendar[1][1].format(\" YYYY\")}}\n                                        <select class=\"yearselect\" (change)=\"yearChanged($event, sideEnum.right)\">\n                                        <option *ngFor=\"let y of calendarVariables.right.dropdowns.yearArrays\" [selected]=\"y === calendarVariables.right.dropdowns.currentYear\">\n                                            {{y}}\n                                        </option>\n                                    </select>\n                                </div>\n                            </ng-container>\n                            <ng-container *ngIf=\"!showDropdowns || !calendarVariables.right.dropdowns\">\n                                    {{this.locale.monthNames[calendarVariables?.right?.calendar[1][1].month()]}}  {{ calendarVariables?.right?.calendar[1][1].format(\" YYYY\")}}\n                            </ng-container>\n                        </th>\n                            <ng-container *ngIf=\"!calendarVariables.right.maxDate || calendarVariables.right.maxDate.isAfter(calendarVariables.right.calendar.lastDay) && (!linkedCalendars || singleDatePicker || true)\">\n                                <th class=\"next available\" (click)=\"clickNext(sideEnum.right)\">\n                                </th>\n                            </ng-container>\n                            <ng-container *ngIf=\"!(!calendarVariables.right.maxDate || calendarVariables.right.maxDate.isAfter(calendarVariables.right.calendar.lastDay) && (!linkedCalendars || singleDatePicker || true))\">\n                                <th></th>\n                            </ng-container>\n                    </tr>\n\n                    <tr>\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\" class=\"week\"><span>{{this.locale.weekLabel}}</span></th>\n                        <th *ngFor=\"let dayofweek of locale.daysOfWeek\"><span>{{dayofweek}}</span></th>\n                    </tr>\n                </thead>\n                <tbody>\n                    <tr *ngFor=\"let row of calendarVariables.right.calRows\" [class]=\"calendarVariables.right.classes[row].classList\">\n                        <td class=\"week\" *ngIf=\"showWeekNumbers\">\n                            <span>{{calendarVariables.right.calendar[row][0].week()}}</span>\n                        </td>\n                        <td class=\"week\" *ngIf=\"showISOWeekNumbers\">\n                            <span>{{calendarVariables.right.calendar[row][0].isoWeek()}}</span>\n                        </td>\n                        <td *ngFor=\"let col of calendarVariables.right.calCols\" [class]=\"calendarVariables.right.classes[row][col]\" (click)=\"clickDate($event, sideEnum.right, row, col)\">\n                            <span>{{calendarVariables.right.calendar[row][col].date()}}</span>\n                        </td>\n                    </tr>\n                </tbody>\n            </table>\n        </div>\n        <div class=\"calendar-time\" *ngIf=\"timePicker\">\n            <div class=\"select\">\n                <select class=\"select-item hourselect\" [disabled]=\"!endDate\" [(ngModel)]=\"timepickerVariables.right.selectedHour\" (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option *ngFor=\"let i of timepickerVariables.right.hours\"\n                    [value]=\"i\"\n                    [disabled]=\"timepickerVariables.right.disabledHours.indexOf(i) > -1\">{{i}}</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select class=\"select-item minuteselect\" [disabled]=\"!endDate\" [(ngModel)]=\"timepickerVariables.right.selectedMinute\" (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option *ngFor=\"let i of timepickerVariables.right.minutes; let index = index;\"\n                    [value]=\"i\"\n                    [disabled]=\"timepickerVariables.right.disabledMinutes.indexOf(i) > -1\">{{timepickerVariables.right.minutesLabel[index]}}</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select *ngIf=\"timePickerSeconds\" class=\"select-item secondselect\" [disabled]=\"!endDate\" [(ngModel)]=\"timepickerVariables.right.selectedSecond\" (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option *ngFor=\"let i of timepickerVariables.right.seconds; let index = index;\"\n                    [value]=\"i\"\n                    [disabled]=\"timepickerVariables.right.disabledSeconds.indexOf(i) > -1\">{{timepickerVariables.right.secondsLabel[index]}}</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select *ngIf=\"!timePicker24Hour\" class=\"select-item ampmselect\" [(ngModel)]=\"timepickerVariables.right.ampmModel\" (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option value=\"AM\" [disabled]=\"timepickerVariables.right.amDisabled\">AM</option>\n                    <option value=\"PM\"  [disabled]=\"timepickerVariables.right.pmDisabled\">PM</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n        </div>\n    </div>\n    <div class=\"buttons\" *ngIf=\"!autoApply && ( !rangesArray.length || (showCalInRanges && !singleDatePicker))\">\n        <div class=\"buttons_input\">\n            <button  *ngIf=\"showClearButton\" class=\"btn btn-default clear\" type=\"button\" (click)=\"clear()\" title=\"clear the date\">\n                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\" viewBox=\"0 -5 24 24\"><path d=\"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z\"/></svg>\n            </button>\n            <button class=\"btn btn-default\" *ngIf=\"showCancel\" type=\"button\" (click)=\"clickCancel($event)\">{{locale.cancelLabel}}</button>\n            <button class=\"btn\"  [disabled]=\"applyBtn.disabled\" type=\"button\" (click)=\"clickApply($event)\">{{locale.applyLabel}}</button>\n        </div>\n    </div>\n</div>\n",
            host: {
                '(click)': 'handleInternalClick($event)',
            },
            encapsulation: ViewEncapsulation.None,
            providers: [{
                    provide: NG_VALUE_ACCESSOR,
                    useExisting: forwardRef(function () { return DaterangepickerComponent_1; }),
                    multi: true
                }],
            styles: [".md-drppicker{position:absolute;font-family:Roboto,sans-serif;color:inherit;border-radius:4px;width:278px;padding:4px;margin-top:-10px;overflow:hidden;z-index:1000;font-size:14px;background-color:#fff;box-shadow:0 2px 4px 0 rgba(0,0,0,.16),0 2px 8px 0 rgba(0,0,0,.12)}.md-drppicker.double{width:auto}.md-drppicker.inline{position:relative;display:inline-block}.md-drppicker:after,.md-drppicker:before{position:absolute;display:inline-block;border-bottom-color:rgba(0,0,0,.2);content:''}.md-drppicker.openscenter:after,.md-drppicker.openscenter:before{left:0;right:0;width:0;margin-left:auto;margin-right:auto}.md-drppicker.single .calendar,.md-drppicker.single .ranges{float:none}.md-drppicker.shown{-webkit-transform:scale(1);transform:scale(1);transition:.1s ease-in-out;-webkit-transform-origin:0 0;transform-origin:0 0;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.md-drppicker.shown.drops-up-left{-webkit-transform-origin:100% 100%;transform-origin:100% 100%}.md-drppicker.shown.drops-up-right{-webkit-transform-origin:0 100%;transform-origin:0 100%}.md-drppicker.shown.drops-down-left{-webkit-transform-origin:100% 0;transform-origin:100% 0}.md-drppicker.shown.drops-down-right{-webkit-transform-origin:0 0;transform-origin:0 0}.md-drppicker.shown.drops-down-center{-webkit-transform-origin:NaN;transform-origin:NaN}.md-drppicker.shown.drops-up-center{-webkit-transform-origin:50%;transform-origin:50%}.md-drppicker.shown .calendar{display:block}.md-drppicker.hidden{transition:.1s;-webkit-transform:scale(0);transform:scale(0);-webkit-transform-origin:0 0;transform-origin:0 0;cursor:default;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.md-drppicker.hidden.drops-up-left{-webkit-transform-origin:100% 100%;transform-origin:100% 100%}.md-drppicker.hidden.drops-up-right{-webkit-transform-origin:0 100%;transform-origin:0 100%}.md-drppicker.hidden.drops-down-left{-webkit-transform-origin:100% 0;transform-origin:100% 0}.md-drppicker.hidden.drops-down-right{-webkit-transform-origin:0 0;transform-origin:0 0}.md-drppicker.hidden.drops-down-center{-webkit-transform-origin:NaN;transform-origin:NaN}.md-drppicker.hidden.drops-up-center{-webkit-transform-origin:50%;transform-origin:50%}.md-drppicker.hidden .calendar{display:none}.md-drppicker .calendar{max-width:270px;margin:4px}.md-drppicker .calendar.single .calendar-table{border:none}.md-drppicker .calendar td,.md-drppicker .calendar th{padding:0;white-space:nowrap;text-align:center;min-width:32px}.md-drppicker .calendar td span,.md-drppicker .calendar th span{pointer-events:none}.md-drppicker .calendar-table{border:1px solid #fff;padding:4px;border-radius:4px;background-color:#fff}.md-drppicker table{width:100%;margin:0}.md-drppicker th{color:#988c8c}.md-drppicker td,.md-drppicker th{text-align:center;border-radius:4px;border:1px solid transparent;white-space:nowrap;cursor:pointer;height:2em;width:2em}.md-drppicker td.available.prev,.md-drppicker th.available.prev{display:block;background-image:url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMy43IDYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMuNyA2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGQ9Ik0zLjcsMC43TDEuNCwzbDIuMywyLjNMMyw2TDAsM2wzLTNMMy43LDAuN3oiLz4NCjwvZz4NCjwvc3ZnPg0K);background-repeat:no-repeat;background-size:.5em;background-position:center;opacity:.8;transition:background-color .2s;border-radius:2em}.md-drppicker td.available.prev:hover,.md-drppicker th.available.prev:hover{margin:0}.md-drppicker td.available.next,.md-drppicker th.available.next{-webkit-transform:rotate(180deg);transform:rotate(180deg);display:block;background-image:url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMy43IDYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMuNyA2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGQ9Ik0zLjcsMC43TDEuNCwzbDIuMywyLjNMMyw2TDAsM2wzLTNMMy43LDAuN3oiLz4NCjwvZz4NCjwvc3ZnPg0K);background-repeat:no-repeat;background-size:.5em;background-position:center;opacity:.8;transition:background-color .2s;border-radius:2em}.md-drppicker td.available.next:hover,.md-drppicker th.available.next:hover{margin:0;-webkit-transform:rotate(180deg);transform:rotate(180deg)}.md-drppicker td.available:hover,.md-drppicker th.available:hover{background-color:#eee;border-color:transparent;color:inherit;background-repeat:no-repeat;background-size:.5em;background-position:center;margin:.25em 0;opacity:.8;border-radius:2em;-webkit-transform:scale(1);transform:scale(1);transition:450ms cubic-bezier(.23,1,.32,1)}.md-drppicker td.week,.md-drppicker th.week{font-size:80%;color:#ccc}.md-drppicker td{margin:.25em 0;opacity:.8;transition:450ms cubic-bezier(.23,1,.32,1);border-radius:2em;-webkit-transform:scale(1);transform:scale(1)}.md-drppicker td.off,.md-drppicker td.off.end-date,.md-drppicker td.off.in-range,.md-drppicker td.off.start-date{background-color:#fff;border-color:transparent;color:#999}.md-drppicker td.in-range{background-color:#dde2e4;border-color:transparent;color:#000;border-radius:0}.md-drppicker td.start-date{border-radius:2em 0 0 2em}.md-drppicker td.end-date{border-radius:0 2em 2em 0}.md-drppicker td.start-date.end-date{border-radius:4px}.md-drppicker td.active{transition:background .3s ease-out;background:rgba(0,0,0,.1)}.md-drppicker td.active,.md-drppicker td.active:hover{background-color:#3f51b5;border-color:transparent;color:#fff}.md-drppicker th.month{width:auto}.md-drppicker option.disabled,.md-drppicker td.disabled{color:#999;cursor:not-allowed;text-decoration:line-through}.md-drppicker .dropdowns{background-repeat:no-repeat;background-size:10px;background-position-y:center;background-position-x:right;width:50px;background-image:url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDI1NSAyNTUiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI1NSAyNTU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8ZyBpZD0iYXJyb3ctZHJvcC1kb3duIj4KCQk8cG9seWdvbiBwb2ludHM9IjAsNjMuNzUgMTI3LjUsMTkxLjI1IDI1NSw2My43NSAgICIgZmlsbD0iIzk4OGM4YyIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=)}.md-drppicker .dropdowns select{display:inline-block;background-color:rgba(255,255,255,.9);width:100%;padding:5px;border:1px solid #f2f2f2;border-radius:2px;height:3rem}.md-drppicker .dropdowns select.ampmselect,.md-drppicker .dropdowns select.hourselect,.md-drppicker .dropdowns select.minuteselect,.md-drppicker .dropdowns select.secondselect{width:50px;margin:0 auto;background:#eee;border:1px solid #eee;padding:2px;outline:0;font-size:12px}.md-drppicker .dropdowns select.monthselect,.md-drppicker .dropdowns select.yearselect{font-size:12px;height:auto;cursor:pointer;opacity:0;position:absolute;top:0;left:0;margin:0;padding:0}.md-drppicker th.month>div{position:relative;display:inline-block}.md-drppicker .calendar-time{text-align:center;margin:4px auto 0;line-height:30px;position:relative}.md-drppicker .calendar-time .select{display:inline}.md-drppicker .calendar-time .select .select-item{display:inline-block;width:auto;position:relative;font-family:inherit;background-color:transparent;padding:10px 10px 10px 0;font-size:18px;border-radius:0;border:none;border-bottom:1px solid rgba(0,0,0,.12)}.md-drppicker .calendar-time .select .select-item:after{position:absolute;top:18px;right:10px;width:0;height:0;padding:0;content:'';border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid rgba(0,0,0,.12);pointer-events:none}.md-drppicker .calendar-time .select .select-item:focus{outline:0}.md-drppicker .calendar-time .select .select-item .select-label{color:rgba(0,0,0,.26);font-size:16px;font-weight:400;position:absolute;pointer-events:none;left:0;top:10px;transition:.2s}.md-drppicker .calendar-time select.disabled{color:#ccc;cursor:not-allowed}.md-drppicker .label-input{border:1px solid #ccc;border-radius:4px;color:#555;height:30px;line-height:30px;display:block;vertical-align:middle;margin:0 auto 5px;padding:0 0 0 28px;width:100%}.md-drppicker .label-input.active{border:1px solid #08c;border-radius:4px}.md-drppicker .md-drppicker_input{position:relative;padding:0 30px 0 0}.md-drppicker .md-drppicker_input i,.md-drppicker .md-drppicker_input svg{position:absolute;left:8px;top:8px}.md-drppicker.rtl .label-input{padding-right:28px;padding-left:6px}.md-drppicker.rtl .md-drppicker_input i,.md-drppicker.rtl .md-drppicker_input svg{left:auto;right:8px}.md-drppicker .show-ranges .drp-calendar.left{border-left:1px solid #ddd}.md-drppicker .ranges{float:none;text-align:left;margin:0}.md-drppicker .ranges ul{list-style:none;margin:0 auto;padding:0;width:100%}.md-drppicker .ranges ul li{font-size:12px}.md-drppicker .ranges ul li button{padding:8px 12px;width:100%;background:0 0;border:none;text-align:left;cursor:pointer}.md-drppicker .ranges ul li button.active{background-color:#3f51b5;color:#fff}.md-drppicker .ranges ul li button[disabled]{opacity:.3}.md-drppicker .ranges ul li button:active{background:0 0}.md-drppicker .ranges ul li:hover{background-color:#eee}.md-drppicker .show-calendar .ranges{margin-top:8px}.md-drppicker [hidden]{display:none}.md-drppicker .buttons{text-align:right;margin:0 5px 5px 0}.md-drppicker .btn{position:relative;overflow:hidden;border-width:0;outline:0;padding:0 6px;cursor:pointer;border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,.6);background-color:#3f51b5;color:#ecf0f1;transition:background-color .4s;height:auto;text-transform:uppercase;line-height:36px;border:none}.md-drppicker .btn:focus,.md-drppicker .btn:hover{background-color:#3f51b5}.md-drppicker .btn>*{position:relative}.md-drppicker .btn span{display:block;padding:12px 24px}.md-drppicker .btn:before{content:\"\";position:absolute;top:50%;left:50%;display:block;width:0;padding-top:0;border-radius:100%;background-color:rgba(236,240,241,.3);-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}.md-drppicker .btn:active:before{width:120%;padding-top:120%;transition:width .2s ease-out,padding-top .2s ease-out}.md-drppicker .btn:disabled{opacity:.5}.md-drppicker .btn.btn-default{color:#000;background-color:#dcdcdc}.md-drppicker .clear{box-shadow:none;background-color:#fff!important}.md-drppicker .clear svg{color:#eb3232;fill:currentColor}@media (min-width:564px){.md-drppicker{width:auto}.md-drppicker.single .calendar.left{clear:none}.md-drppicker.ltr{direction:ltr;text-align:left}.md-drppicker.ltr .calendar.left{clear:left}.md-drppicker.ltr .calendar.left .calendar-table{border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;padding-right:12px}.md-drppicker.ltr .calendar.right{margin-left:0}.md-drppicker.ltr .calendar.right .calendar-table{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}.md-drppicker.ltr .left .md-drppicker_input,.md-drppicker.ltr .right .md-drppicker_input{padding-right:35px}.md-drppicker.ltr .calendar,.md-drppicker.ltr .ranges{float:left}.md-drppicker.rtl{direction:rtl;text-align:right}.md-drppicker.rtl .calendar.left{clear:right;margin-left:0}.md-drppicker.rtl .calendar.left .calendar-table{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}.md-drppicker.rtl .calendar.right{margin-right:0}.md-drppicker.rtl .calendar.right .calendar-table{border-right:none;border-top-right-radius:0;border-bottom-right-radius:0}.md-drppicker.rtl .calendar.left .calendar-table,.md-drppicker.rtl .left .md-drppicker_input{padding-left:12px}.md-drppicker.rtl .calendar,.md-drppicker.rtl .ranges{text-align:right;float:right}.drp-animate{-webkit-transform:translate(0);transform:translate(0);transition:transform .2s,opacity .2s,-webkit-transform .2s}.drp-animate.drp-picker-site-this{transition-timing-function:linear}.drp-animate.drp-animate-right{-webkit-transform:translateX(10%);transform:translateX(10%);opacity:0}.drp-animate.drp-animate-left{-webkit-transform:translateX(-10%);transform:translateX(-10%);opacity:0}}@media (min-width:730px){.md-drppicker .ranges{width:auto}.md-drppicker.ltr .ranges{float:left}.md-drppicker.rtl .ranges{float:right}.md-drppicker .calendar.left{clear:none!important}}"]
        }),
        tslib_1.__metadata("design:paramtypes", [ElementRef,
            ChangeDetectorRef,
            LocaleService])
    ], DaterangepickerComponent);
    return DaterangepickerComponent;
}());
export { DaterangepickerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXJhbmdlcGlja2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC1kYXRlcmFuZ2VwaWNrZXItbWF0ZXJpYWwvIiwic291cmNlcyI6WyJkYXRlcmFuZ2VwaWNrZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUFVLFVBQVUsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUMxSCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsaUJBQWlCLEVBQXdCLE1BQU0sZ0JBQWdCLENBQUM7QUFDekUsT0FBTyxFQUFFLFdBQVcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRzVDLE9BQU8sS0FBSyxPQUFPLE1BQU0sUUFBUSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUM7QUFFdkIsTUFBTSxDQUFOLElBQVksUUFHWDtBQUhELFdBQVksUUFBUTtJQUNoQix5QkFBYSxDQUFBO0lBQ2IsMkJBQWUsQ0FBQTtBQUNuQixDQUFDLEVBSFcsUUFBUSxLQUFSLFFBQVEsUUFHbkI7QUFnQkQ7SUFzR0ksa0NBQ1ksRUFBYyxFQUNkLElBQXVCLEVBQ3ZCLGNBQTZCO1FBRjdCLE9BQUUsR0FBRixFQUFFLENBQVk7UUFDZCxTQUFJLEdBQUosSUFBSSxDQUFtQjtRQUN2QixtQkFBYyxHQUFkLGNBQWMsQ0FBZTtRQXhHakMsU0FBSSxHQUEyQixFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDO1FBRWhFLHNCQUFpQixHQUE0QixFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBQyxDQUFDO1FBQ25FLHdCQUFtQixHQUE0QixFQUFDLElBQUksRUFBRSxF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QVk7a0VBQVM7SUFDN0I7UUFBN0IsU0FBUyxDQUFDLGlCQUFpQixDQUFDOzBDQUFrQixVQUFVO3FFQUFDO0lBdVoxRDtRQURDLEtBQUssRUFBRTs7OztpRUFHUDtJQUVEO1FBREMsS0FBSyxFQUFFOzs7O2dFQUdQO0lBamdCUSx3QkFBd0I7UUFkcEMsU0FBUyxDQUFDO1lBQ1AsUUFBUSxFQUFFLDhCQUE4QjtZQUV4QywrcGlCQUErQztZQUMvQyxJQUFJLEVBQUU7Z0JBQ04sU0FBUyxFQUFFLDZCQUE2QjthQUN2QztZQUNELGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO1lBQ3JDLFNBQVMsRUFBRSxDQUFDO29CQUNSLE9BQU8sRUFBRSxpQkFBaUI7b0JBQzFCLFdBQVcsRUFBRSxVQUFVLENBQUMsY0FBTSxPQUFBLDBCQUF3QixFQUF4QixDQUF3QixDQUFDO29CQUN2RCxLQUFLLEVBQUUsSUFBSTtpQkFDZCxDQUFDOztTQUNMLENBQUM7aURBd0drQixVQUFVO1lBQ1IsaUJBQWlCO1lBQ1AsYUFBYTtPQXpHaEMsd0JBQXdCLENBMm1DcEM7SUFBRCwrQkFBQztDQUFBLEFBM21DRCxJQTJtQ0M7U0EzbUNZLHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ29tcG9uZW50LCBPbkluaXQsIEVsZW1lbnRSZWYsIFZpZXdDaGlsZCwgRXZlbnRFbWl0dGVyLCBPdXRwdXQsIElucHV0LCBmb3J3YXJkUmVmLCBWaWV3RW5jYXBzdWxhdGlvbiwgQ2hhbmdlRGV0ZWN0b3JSZWYsIEluamVjdFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5HX1ZBTFVFX0FDQ0VTU09SLCBDb250cm9sVmFsdWVBY2Nlc3NvciB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IEZvcm1Db250cm9sfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBMb2NhbGVDb25maWcsIExPQ0FMRV9DT05GSUcgfSBmcm9tICcuL2RhdGVyYW5nZXBpY2tlci5jb25maWcnO1xuXG5pbXBvcnQgKiBhcyBfbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgeyBMb2NhbGVTZXJ2aWNlIH0gZnJvbSAnLi9sb2NhbGUuc2VydmljZSc7XG5jb25zdCBtb21lbnQgPSBfbW9tZW50O1xuXG5leHBvcnQgZW51bSBTaWRlRW51bSB7XG4gICAgbGVmdCA9ICdsZWZ0JyxcbiAgICByaWdodCA9ICdyaWdodCdcbn1cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICduZ3gtZGF0ZXJhbmdlcGlja2VyLW1hdGVyaWFsJyxcbiAgICBzdHlsZVVybHM6IFsnLi9kYXRlcmFuZ2VwaWNrZXIuY29tcG9uZW50LnNjc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vZGF0ZXJhbmdlcGlja2VyLmNvbXBvbmVudC5odG1sJyxcbiAgICBob3N0OiB7XG4gICAgJyhjbGljayknOiAnaGFuZGxlSW50ZXJuYWxDbGljaygkZXZlbnQpJyxcbiAgICB9LFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gICAgcHJvdmlkZXJzOiBbe1xuICAgICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gRGF0ZXJhbmdlcGlja2VyQ29tcG9uZW50KSxcbiAgICAgICAgbXVsdGk6IHRydWVcbiAgICB9XVxufSlcbmV4cG9ydCBjbGFzcyBEYXRlcmFuZ2VwaWNrZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIHByaXZhdGUgX29sZDoge3N0YXJ0OiBhbnksIGVuZDogYW55fSA9IHtzdGFydDogbnVsbCwgZW5kOiBudWxsfTtcbiAgICBjaG9zZW5MYWJlbDogc3RyaW5nO1xuICAgIGNhbGVuZGFyVmFyaWFibGVzOiB7bGVmdDogYW55LCByaWdodDogYW55fSA9IHtsZWZ0OiB7fSwgcmlnaHQ6IHt9fTtcbiAgICB0aW1lcGlja2VyVmFyaWFibGVzOiB7bGVmdDogYW55LCByaWdodDogYW55fSA9IHtsZWZ0OiB7fSwgcmlnaHQ6IHt9fTtcbiAgICBkYXRlcmFuZ2VwaWNrZXI6IHtzdGFydDogRm9ybUNvbnRyb2wsIGVuZDogRm9ybUNvbnRyb2x9ID0ge3N0YXJ0OiBuZXcgRm9ybUNvbnRyb2woKSwgZW5kOiBuZXcgRm9ybUNvbnRyb2woKX07XG4gICAgYXBwbHlCdG46IHtkaXNhYmxlZDogYm9vbGVhbn0gPSB7ZGlzYWJsZWQ6IGZhbHNlfTtcbiAgICBzdGFydERhdGUgPSBtb21lbnQoKS5zdGFydE9mKCdkYXknKTtcbiAgICBlbmREYXRlID0gbW9tZW50KCkuZW5kT2YoJ2RheScpO1xuICAgIEBJbnB1dCgpXG4gICAgZGF0ZUxpbWl0OiBudW1iZXIgPSBudWxsO1xuICAgIC8vIHVzZWQgaW4gdGVtcGxhdGUgZm9yIGNvbXBpbGUgdGltZSBzdXBwb3J0IG9mIGVudW0gdmFsdWVzLlxuICAgIHNpZGVFbnVtID0gU2lkZUVudW07XG5cbiAgICBASW5wdXQoKVxuICAgIG1pbkRhdGU6IF9tb21lbnQuTW9tZW50ID0gbnVsbDtcbiAgICBASW5wdXQoKVxuICAgIG1heERhdGU6IF9tb21lbnQuTW9tZW50ID0gbnVsbDtcbiAgICBASW5wdXQoKVxuICAgIGF1dG9BcHBseTogQm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpXG4gICAgc2luZ2xlRGF0ZVBpY2tlcjogQm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpXG4gICAgc2hvd0Ryb3Bkb3duczogQm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpXG4gICAgc2hvd1dlZWtOdW1iZXJzOiBCb29sZWFuID0gZmFsc2U7XG4gICAgQElucHV0KClcbiAgICBzaG93SVNPV2Vla051bWJlcnMgOiBCb29sZWFuPSBmYWxzZTtcbiAgICBASW5wdXQoKVxuICAgIGxpbmtlZENhbGVuZGFyczogQm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpXG4gICAgYXV0b1VwZGF0ZUlucHV0OiBCb29sZWFuID0gdHJ1ZTtcbiAgICBASW5wdXQoKVxuICAgIGFsd2F5c1Nob3dDYWxlbmRhcnM6IEJvb2xlYW4gPSBmYWxzZTtcbiAgICBASW5wdXQoKVxuICAgIG1heFNwYW46IEJvb2xlYW4gPSBmYWxzZTtcbiAgICAvLyB0aW1lcGlja2VyIHZhcmlhYmxlc1xuICAgIEBJbnB1dCgpXG4gICAgdGltZVBpY2tlcjogQm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpXG4gICAgdGltZVBpY2tlcjI0SG91cjogQm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpXG4gICAgdGltZVBpY2tlckluY3JlbWVudDogbnVtYmVyID0gMTtcbiAgICBASW5wdXQoKVxuICAgIHRpbWVQaWNrZXJTZWNvbmRzOiBCb29sZWFuID0gZmFsc2U7XG4gICAgLy8gZW5kIG9mIHRpbWVwaWNrZXIgdmFyaWFibGVzXG4gICAgQElucHV0KClcbiAgICBzaG93Q2xlYXJCdXR0b246IEJvb2xlYW4gPSBmYWxzZTtcbiAgICBASW5wdXQoKVxuICAgIGZpcnN0TW9udGhEYXlDbGFzczogc3RyaW5nID0gbnVsbDtcbiAgICBASW5wdXQoKVxuICAgIGxhc3RNb250aERheUNsYXNzOiBzdHJpbmcgPSBudWxsO1xuICAgIEBJbnB1dCgpXG4gICAgZW1wdHlXZWVrUm93Q2xhc3M6IHN0cmluZyA9IG51bGw7XG4gICAgQElucHV0KClcbiAgICBmaXJzdERheU9mTmV4dE1vbnRoQ2xhc3M6IHN0cmluZyA9IG51bGw7XG4gICAgQElucHV0KClcbiAgICBsYXN0RGF5T2ZQcmV2aW91c01vbnRoQ2xhc3M6IHN0cmluZyA9IG51bGw7XG4gICAgX2xvY2FsZTogTG9jYWxlQ29uZmlnID0ge307XG4gICAgQElucHV0KCkgc2V0IGxvY2FsZSh2YWx1ZSkge1xuICAgICAgdGhpcy5fbG9jYWxlID0gey4uLnRoaXMuX2xvY2FsZVNlcnZpY2UuY29uZmlnLCAuLi52YWx1ZX07XG4gICAgfVxuICAgIGdldCBsb2NhbGUoKTogYW55IHtcbiAgICAgIHJldHVybiB0aGlzLl9sb2NhbGU7XG4gICAgfVxuICAgIC8vIGN1c3RvbSByYW5nZXNcbiAgICBfcmFuZ2VzOiBhbnkgPSB7fTtcblxuICAgIEBJbnB1dCgpIHNldCByYW5nZXModmFsdWUpIHtcbiAgICAgICAgdGhpcy5fcmFuZ2VzID0gdmFsdWU7XG4gICAgICAgIHRoaXMucmVuZGVyUmFuZ2VzKCk7XG4gICAgfVxuICAgIGdldCByYW5nZXMoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JhbmdlcztcbiAgICB9XG5cbiAgICBASW5wdXQoKVxuICAgIHNob3dDdXN0b21SYW5nZUxhYmVsOiBib29sZWFuO1xuICAgIEBJbnB1dCgpXG4gICAgc2hvd0NhbmNlbDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpXG4gICAga2VlcENhbGVuZGFyT3BlbmluZ1dpdGhSYW5nZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpXG4gICAgc2hvd1JhbmdlTGFiZWxPbklucHV0OiBib29sZWFuID0gZmFsc2U7XG4gICAgY2hvc2VuUmFuZ2U6IHN0cmluZztcbiAgICByYW5nZXNBcnJheTogQXJyYXk8YW55PiA9IFtdO1xuXG4gICAgLy8gc29tZSBzdGF0ZSBpbmZvcm1hdGlvblxuICAgIGlzU2hvd246IEJvb2xlYW4gPSBmYWxzZTtcbiAgICBpbmxpbmU6IGJvb2xlYW4gPSB0cnVlO1xuICAgIGxlZnRDYWxlbmRhcjogYW55ID0ge307XG4gICAgcmlnaHRDYWxlbmRhcjogYW55ID0ge307XG4gICAgc2hvd0NhbEluUmFuZ2VzOiBCb29sZWFuID0gZmFsc2U7XG5cbiAgICBvcHRpb25zOiBhbnkgPSB7fSA7IC8vIHNob3VsZCBnZXQgc29tZSBvcHQgZnJvbSB1c2VyXG4gICAgQElucHV0KCkgZHJvcHM6IHN0cmluZztcbiAgICBASW5wdXQoKSBvcGVuczogc3RyaW5nO1xuICAgIEBPdXRwdXQoJ2Nob29zZWREYXRlJykgY2hvb3NlZERhdGU6IEV2ZW50RW1pdHRlcjxPYmplY3Q+O1xuICAgIEBPdXRwdXQoJ3JhbmdlQ2xpY2tlZCcpIHJhbmdlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPE9iamVjdD47XG4gICAgQE91dHB1dCgnZGF0ZXNVcGRhdGVkJykgZGF0ZXNVcGRhdGVkOiBFdmVudEVtaXR0ZXI8T2JqZWN0PjtcbiAgICBAVmlld0NoaWxkKCdwaWNrZXJDb250YWluZXInKSBwaWNrZXJDb250YWluZXI6IEVsZW1lbnRSZWY7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBlbDogRWxlbWVudFJlZixcbiAgICAgICAgcHJpdmF0ZSBfcmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgICAgcHJpdmF0ZSBfbG9jYWxlU2VydmljZTogTG9jYWxlU2VydmljZVxuICAgICkge1xuICAgICAgICB0aGlzLmNob29zZWREYXRlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgICAgICB0aGlzLnJhbmdlQ2xpY2tlZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICAgICAgdGhpcy5kYXRlc1VwZGF0ZWQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgICAgIFxuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICB0aGlzLl9idWlsZExvY2FsZSgpO1xuICAgICAgICBjb25zdCBkYXlzT2ZXZWVrID0gWy4uLnRoaXMubG9jYWxlLmRheXNPZldlZWtdO1xuICAgICAgICBpZiAodGhpcy5sb2NhbGUuZmlyc3REYXkgIT0gMCkge1xuICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5sb2NhbGUuZmlyc3REYXk7XG5cbiAgICAgICAgICAgIHdoaWxlIChpdGVyYXRvciA+IDApIHtcbiAgICAgICAgICAgICAgICBkYXlzT2ZXZWVrLnB1c2goZGF5c09mV2Vlay5zaGlmdCgpKTtcbiAgICAgICAgICAgICAgICBpdGVyYXRvci0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMubG9jYWxlLmRheXNPZldlZWsgPSBkYXlzT2ZXZWVrO1xuICAgICAgICBpZiAodGhpcy5pbmxpbmUpIHtcbiAgICAgICAgICAgIHRoaXMuX29sZC5zdGFydCA9IHRoaXMuc3RhcnREYXRlLmNsb25lKCk7XG4gICAgICAgICAgICB0aGlzLl9vbGQuZW5kID0gdGhpcy5lbmREYXRlLmNsb25lKCk7XG4gICAgICAgIH1cbiAgICAgICBcbiAgICAgICAgdGhpcy51cGRhdGVNb250aHNJblZpZXcoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJDYWxlbmRhcihTaWRlRW51bS5sZWZ0KTtcbiAgICAgICAgdGhpcy5yZW5kZXJDYWxlbmRhcihTaWRlRW51bS5yaWdodCk7XG4gICAgICAgIHRoaXMucmVuZGVyUmFuZ2VzKCk7XG4gICAgfVxuICAgIHJlbmRlclJhbmdlcygpIHtcbiAgICAgICAgdGhpcy5yYW5nZXNBcnJheSA9IFtdO1xuICAgICAgICBsZXQgc3RhcnQsIGVuZDtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJhbmdlcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmFuZ2UgaW4gdGhpcy5yYW5nZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucmFuZ2VzW3JhbmdlXVswXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBtb21lbnQodGhpcy5yYW5nZXNbcmFuZ2VdWzBdLCB0aGlzLmxvY2FsZS5mb3JtYXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gbW9tZW50KHRoaXMucmFuZ2VzW3JhbmdlXVswXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJhbmdlc1tyYW5nZV1bMV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IG1vbWVudCh0aGlzLnJhbmdlc1tyYW5nZV1bMV0sIHRoaXMubG9jYWxlLmZvcm1hdCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gbW9tZW50KHRoaXMucmFuZ2VzW3JhbmdlXVsxXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHN0YXJ0IG9yIGVuZCBkYXRlIGV4Y2VlZCB0aG9zZSBhbGxvd2VkIGJ5IHRoZSBtaW5EYXRlIG9yIG1heFNwYW5cbiAgICAgICAgICAgICAgICAvLyBvcHRpb25zLCBzaG9ydGVuIHRoZSByYW5nZSB0byB0aGUgYWxsb3dhYmxlIHBlcmlvZC5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5taW5EYXRlICYmIHN0YXJ0LmlzQmVmb3JlKHRoaXMubWluRGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSB0aGlzLm1pbkRhdGUuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF4RGF0ZSA9IHRoaXMubWF4RGF0ZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXhTcGFuICYmIG1heERhdGUgJiYgc3RhcnQuY2xvbmUoKS5hZGQodGhpcy5tYXhTcGFuKS5pc0FmdGVyKG1heERhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIG1heERhdGUgPSBzdGFydC5jbG9uZSgpLmFkZCh0aGlzLm1heFNwYW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWF4RGF0ZSAmJiBlbmQuaXNBZnRlcihtYXhEYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBtYXhEYXRlLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGVuZCBvZiB0aGUgcmFuZ2UgaXMgYmVmb3JlIHRoZSBtaW5pbXVtIG9yIHRoZSBzdGFydCBvZiB0aGUgcmFuZ2UgaXNcbiAgICAgICAgICAgICAgICAvLyBhZnRlciB0aGUgbWF4aW11bSwgZG9uJ3QgZGlzcGxheSB0aGlzIHJhbmdlIG9wdGlvbiBhdCBhbGwuXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLm1pbkRhdGUgJiYgZW5kLmlzQmVmb3JlKHRoaXMubWluRGF0ZSwgdGhpcy50aW1lUGlja2VyID8gJ21pbnV0ZScgOiAnZGF5JykpXG4gICAgICAgICAgICAgICAgfHwgKG1heERhdGUgJiYgc3RhcnQuaXNBZnRlcihtYXhEYXRlLCB0aGlzLnRpbWVQaWNrZXIgPyAnbWludXRlJyA6ICdkYXknKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy9TdXBwb3J0IHVuaWNvZGUgY2hhcnMgaW4gdGhlIHJhbmdlIG5hbWVzLlxuICAgICAgICAgICAgICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICAgICAgICAgICAgICBlbGVtLmlubmVySFRNTCA9IHJhbmdlO1xuICAgICAgICAgICAgICAgIHZhciByYW5nZUh0bWwgPSBlbGVtLnZhbHVlO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yYW5nZXNbcmFuZ2VIdG1sXSA9IFtzdGFydCwgZW5kXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgcmFuZ2UgaW4gdGhpcy5yYW5nZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlc0FycmF5LnB1c2gocmFuZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd0N1c3RvbVJhbmdlTGFiZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlc0FycmF5LnB1c2godGhpcy5sb2NhbGUuY3VzdG9tUmFuZ2VMYWJlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNob3dDYWxJblJhbmdlcyA9ICghdGhpcy5yYW5nZXNBcnJheS5sZW5ndGgpIHx8IHRoaXMuYWx3YXlzU2hvd0NhbGVuZGFycztcbiAgICAgICAgICAgIGlmICghdGhpcy50aW1lUGlja2VyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydERhdGUgPSB0aGlzLnN0YXJ0RGF0ZS5zdGFydE9mKCdkYXknKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZERhdGUgPSB0aGlzLmVuZERhdGUuZW5kT2YoJ2RheScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY2FuJ3QgYmUgdXNlZCB0b2dldGhlciBmb3Igbm93XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lUGlja2VyICYmIHRoaXMuYXV0b0FwcGx5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvQXBwbHkgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHJlbmRlclRpbWVQaWNrZXIoc2lkZTogU2lkZUVudW0pIHtcbiAgICAgICAgaWYgKHNpZGUgPT0gU2lkZUVudW0ucmlnaHQgJiYgIXRoaXMuZW5kRGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzZWxlY3RlZCwgbWluRGF0ZTtcbiAgICAgICAgbGV0IG1heERhdGUgPSB0aGlzLm1heERhdGVcbiAgICAgICAgaWYgKHNpZGUgPT09IFNpZGVFbnVtLmxlZnQpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkID0gdGhpcy5zdGFydERhdGUuY2xvbmUoKSxcbiAgICAgICAgICAgIG1pbkRhdGUgPSB0aGlzLm1pbkRhdGVcbiAgICAgICAgfSBlbHNlIGlmIChzaWRlID09PSBTaWRlRW51bS5yaWdodCkge1xuICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGlzLmVuZERhdGUuY2xvbmUoKSxcbiAgICAgICAgICAgIG1pbkRhdGUgPSB0aGlzLnN0YXJ0RGF0ZVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy50aW1lUGlja2VyMjRIb3VyID8gMCA6IDE7XG4gICAgICAgIGNvbnN0IGVuZCA9IHRoaXMudGltZVBpY2tlcjI0SG91ciA/IDIzIDogMTI7XG4gICAgICAgIHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXSA9IHtcbiAgICAgICAgICAgIGhvdXJzOiBbXSxcbiAgICAgICAgICAgIG1pbnV0ZXM6IFtdLFxuICAgICAgICAgICAgbWludXRlc0xhYmVsOiBbXSxcbiAgICAgICAgICAgIHNlY29uZHM6IFtdLFxuICAgICAgICAgICAgc2Vjb25kc0xhYmVsOiBbXSxcbiAgICAgICAgICAgIGRpc2FibGVkSG91cnM6IFtdLFxuICAgICAgICAgICAgZGlzYWJsZWRNaW51dGVzOiBbXSxcbiAgICAgICAgICAgIGRpc2FibGVkU2Vjb25kczogW10sXG4gICAgICAgICAgICBzZWxlY3RlZEhvdXI6IDAsXG4gICAgICAgICAgICBzZWxlY3RlZE1pbnV0ZTogMCxcbiAgICAgICAgICAgIHNlbGVjdGVkU2Vjb25kOiAwLFxuICAgICAgICB9O1xuICAgICAgICAvLyBnZW5lcmF0ZSBob3Vyc1xuICAgICAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPD0gZW5kOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBpX2luXzI0ID0gaTtcbiAgICAgICAgICAgIGlmICghdGhpcy50aW1lUGlja2VyMjRIb3VyKSB7XG4gICAgICAgICAgICAgICAgaV9pbl8yNCA9IHNlbGVjdGVkLmhvdXIoKSA+PSAxMiA/IChpID09IDEyID8gMTIgOiBpICsgMTIpIDogKGkgPT0gMTIgPyAwIDogaSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCB0aW1lID0gc2VsZWN0ZWQuY2xvbmUoKS5ob3VyKGlfaW5fMjQpO1xuICAgICAgICAgICAgbGV0IGRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAobWluRGF0ZSAmJiB0aW1lLm1pbnV0ZSg1OSkuaXNCZWZvcmUobWluRGF0ZSkpIHtcbiAgICAgICAgICAgICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWF4RGF0ZSAmJiB0aW1lLm1pbnV0ZSgwKS5pc0FmdGVyKG1heERhdGUpKSB7XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0uaG91cnMucHVzaChpKTtcbiAgICAgICAgICAgIGlmIChpX2luXzI0ID09IHNlbGVjdGVkLmhvdXIoKSAmJiAhZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0uc2VsZWN0ZWRIb3VyID0gaTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0uZGlzYWJsZWRIb3Vycy5wdXNoKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGdlbmVyYXRlIG1pbnV0ZXNcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2MDsgaSArPSB0aGlzLnRpbWVQaWNrZXJJbmNyZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBwYWRkZWQgPSBpIDwgMTAgPyAnMCcgKyBpIDogaTtcbiAgICAgICAgICAgIHZhciB0aW1lID0gc2VsZWN0ZWQuY2xvbmUoKS5taW51dGUoaSk7XG5cbiAgICAgICAgICAgIHZhciBkaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKG1pbkRhdGUgJiYgdGltZS5zZWNvbmQoNTkpLmlzQmVmb3JlKG1pbkRhdGUpKSB7XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1heERhdGUgJiYgdGltZS5zZWNvbmQoMCkuaXNBZnRlcihtYXhEYXRlKSkge1xuICAgICAgICAgICAgICAgIGRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5taW51dGVzLnB1c2goaSk7XG4gICAgICAgICAgICB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0ubWludXRlc0xhYmVsLnB1c2gocGFkZGVkKTtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZC5taW51dGUoKSA9PSBpICYmICFkaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5zZWxlY3RlZE1pbnV0ZSA9IGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLmRpc2FibGVkTWludXRlcy5wdXNoKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGdlbmVyYXRlIHNlY29uZHNcbiAgICAgICAgaWYgKHRoaXMudGltZVBpY2tlclNlY29uZHMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjA7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBwYWRkZWQgPSBpIDwgMTAgPyAnMCcgKyBpIDogaTtcbiAgICAgICAgICAgICAgICB2YXIgdGltZSA9IHNlbGVjdGVkLmNsb25lKCkuc2Vjb25kKGkpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKG1pbkRhdGUgJiYgdGltZS5pc0JlZm9yZShtaW5EYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtYXhEYXRlICYmIHRpbWUuaXNBZnRlcihtYXhEYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLnNlY29uZHMucHVzaChpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0uc2Vjb25kc0xhYmVsLnB1c2gocGFkZGVkKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQuc2Vjb25kKCkgPT0gaSAmJiAhZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLnNlbGVjdGVkU2Vjb25kID0gaTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5kaXNhYmxlZFNlY29uZHMucHVzaChpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gZ2VuZXJhdGUgQU0vUE1cbiAgICAgICAgaWYgKCF0aGlzLnRpbWVQaWNrZXIyNEhvdXIpIHtcblxuICAgICAgICAgICAgdmFyIGFtX2h0bWwgPSAnJztcbiAgICAgICAgICAgIHZhciBwbV9odG1sID0gJyc7XG5cbiAgICAgICAgICAgIGlmIChtaW5EYXRlICYmIHNlbGVjdGVkLmNsb25lKCkuaG91cigxMikubWludXRlKDApLnNlY29uZCgwKS5pc0JlZm9yZShtaW5EYXRlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5hbURpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1heERhdGUgJiYgc2VsZWN0ZWQuY2xvbmUoKS5ob3VyKDApLm1pbnV0ZSgwKS5zZWNvbmQoMCkuaXNBZnRlcihtYXhEYXRlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5wbURpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZC5ob3VyKCkgPj0gMTIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0uYW1wbU1vZGVsID0gJ1BNJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLmFtcG1Nb2RlbCA9ICdBTSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLnNlbGVjdGVkID0gc2VsZWN0ZWQ7XG4gICAgfVxuICAgIHJlbmRlckNhbGVuZGFyKHNpZGU6IFNpZGVFbnVtKSB7IC8vIHNpZGUgZW51bVxuICAgICAgICBsZXQgbWFpbkNhbGVuZGFyOiBhbnkgPSAoIHNpZGUgPT09IFNpZGVFbnVtLmxlZnQgKSA/IHRoaXMubGVmdENhbGVuZGFyIDogdGhpcy5yaWdodENhbGVuZGFyO1xuICAgICAgICBjb25zdCBtb250aCA9IG1haW5DYWxlbmRhci5tb250aC5tb250aCgpO1xuICAgICAgICBjb25zdCB5ZWFyID0gbWFpbkNhbGVuZGFyLm1vbnRoLnllYXIoKTtcbiAgICAgICAgY29uc3QgaG91ciA9IG1haW5DYWxlbmRhci5tb250aC5ob3VyKCk7XG4gICAgICAgIGNvbnN0IG1pbnV0ZSA9IG1haW5DYWxlbmRhci5tb250aC5taW51dGUoKTtcbiAgICAgICAgY29uc3Qgc2Vjb25kID0gbWFpbkNhbGVuZGFyLm1vbnRoLnNlY29uZCgpO1xuICAgICAgICBjb25zdCBkYXlzSW5Nb250aCA9IG1vbWVudChbeWVhciwgbW9udGhdKS5kYXlzSW5Nb250aCgpO1xuICAgICAgICBjb25zdCBmaXJzdERheSA9IG1vbWVudChbeWVhciwgbW9udGgsIDFdKTtcbiAgICAgICAgY29uc3QgbGFzdERheSA9IG1vbWVudChbeWVhciwgbW9udGgsIGRheXNJbk1vbnRoXSk7XG4gICAgICAgIGNvbnN0IGxhc3RNb250aCA9IG1vbWVudChmaXJzdERheSkuc3VidHJhY3QoMSwgJ21vbnRoJykubW9udGgoKTtcbiAgICAgICAgY29uc3QgbGFzdFllYXIgPSBtb21lbnQoZmlyc3REYXkpLnN1YnRyYWN0KDEsICdtb250aCcpLnllYXIoKTtcbiAgICAgICAgY29uc3QgZGF5c0luTGFzdE1vbnRoID0gbW9tZW50KFtsYXN0WWVhciwgbGFzdE1vbnRoXSkuZGF5c0luTW9udGgoKTtcbiAgICAgICAgY29uc3QgZGF5T2ZXZWVrID0gZmlyc3REYXkuZGF5KCk7XG4gICAgICAgIC8vIGluaXRpYWxpemUgYSA2IHJvd3MgeCA3IGNvbHVtbnMgYXJyYXkgZm9yIHRoZSBjYWxlbmRhclxuICAgICAgICBsZXQgY2FsZW5kYXI6IGFueSA9IFtdO1xuICAgICAgICBjYWxlbmRhci5maXJzdERheSA9IGZpcnN0RGF5O1xuICAgICAgICBjYWxlbmRhci5sYXN0RGF5ID0gbGFzdERheTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICAgICAgY2FsZW5kYXJbaV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBvcHVsYXRlIHRoZSBjYWxlbmRhciB3aXRoIGRhdGUgb2JqZWN0c1xuICAgICAgICBsZXQgc3RhcnREYXkgPSBkYXlzSW5MYXN0TW9udGggLSBkYXlPZldlZWsgKyB0aGlzLmxvY2FsZS5maXJzdERheSArIDE7XG4gICAgICAgIGlmIChzdGFydERheSA+IGRheXNJbkxhc3RNb250aCkge1xuICAgICAgICAgICAgc3RhcnREYXkgLT0gNztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKGRheU9mV2VlayA9PT0gdGhpcy5sb2NhbGUuZmlyc3REYXkpIHtcbiAgICAgICAgICAgIHN0YXJ0RGF5ID0gZGF5c0luTGFzdE1vbnRoIC0gNjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjdXJEYXRlID0gbW9tZW50KFtsYXN0WWVhciwgbGFzdE1vbnRoLCBzdGFydERheSwgMTIsIG1pbnV0ZSwgc2Vjb25kXSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGNvbCA9IDAsIHJvdyA9IDA7IGkgPCA0MjsgaSsrLCBjb2wrKywgY3VyRGF0ZSA9IG1vbWVudChjdXJEYXRlKS5hZGQoMjQsICdob3VyJykpIHtcbiAgICAgICAgICAgIGlmIChpID4gMCAmJiBjb2wgJSA3ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29sID0gMDtcbiAgICAgICAgICAgICAgICByb3crKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGVuZGFyW3Jvd11bY29sXSA9IGN1ckRhdGUuY2xvbmUoKS5ob3VyKGhvdXIpLm1pbnV0ZShtaW51dGUpLnNlY29uZChzZWNvbmQpO1xuICAgICAgICAgICAgY3VyRGF0ZS5ob3VyKDEyKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMubWluRGF0ZSAmJiBjYWxlbmRhcltyb3ddW2NvbF0uZm9ybWF0KCdZWVlZLU1NLUREJykgPT09IHRoaXMubWluRGF0ZS5mb3JtYXQoJ1lZWVktTU0tREQnKSAmJlxuICAgICAgICAgICAgY2FsZW5kYXJbcm93XVtjb2xdLmlzQmVmb3JlKHRoaXMubWluRGF0ZSkgJiYgc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICAgICAgY2FsZW5kYXJbcm93XVtjb2xdID0gdGhpcy5taW5EYXRlLmNsb25lKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm1heERhdGUgJiYgY2FsZW5kYXJbcm93XVtjb2xdLmZvcm1hdCgnWVlZWS1NTS1ERCcpID09PSB0aGlzLm1heERhdGUuZm9ybWF0KCdZWVlZLU1NLUREJykgJiZcbiAgICAgICAgICAgIGNhbGVuZGFyW3Jvd11bY29sXS5pc0FmdGVyKHRoaXMubWF4RGF0ZSkgJiYgc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgICAgIGNhbGVuZGFyW3Jvd11bY29sXSA9IHRoaXMubWF4RGF0ZS5jbG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWFrZSB0aGUgY2FsZW5kYXIgb2JqZWN0IGF2YWlsYWJsZSB0byBob3ZlckRhdGUvY2xpY2tEYXRlXG4gICAgICAgIGlmIChzaWRlID09PSBTaWRlRW51bS5sZWZ0KSB7XG4gICAgICAgICAgICB0aGlzLmxlZnRDYWxlbmRhci5jYWxlbmRhciA9IGNhbGVuZGFyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yaWdodENhbGVuZGFyLmNhbGVuZGFyID0gY2FsZW5kYXI7XG4gICAgICAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgLy8gRGlzcGxheSB0aGUgY2FsZW5kYXJcbiAgICAgICAgLy9cbiAgICAgICAgY29uc3QgbWluRGF0ZSA9IHNpZGUgPT09ICdsZWZ0JyA/IHRoaXMubWluRGF0ZSA6IHRoaXMuc3RhcnREYXRlO1xuICAgICAgICBsZXQgbWF4RGF0ZSA9IHRoaXMubWF4RGF0ZTtcbiAgICAgICAgLy8gYWRqdXN0IG1heERhdGUgdG8gcmVmbGVjdCB0aGUgZGF0ZUxpbWl0IHNldHRpbmcgaW4gb3JkZXIgdG9cbiAgICAgICAgLy8gZ3JleSBvdXQgZW5kIGRhdGVzIGJleW9uZCB0aGUgZGF0ZUxpbWl0XG4gICAgICAgIGlmICh0aGlzLmVuZERhdGUgPT09IG51bGwgJiYgdGhpcy5kYXRlTGltaXQpIHtcbiAgICAgICAgICAgIGNvbnN0IG1heExpbWl0ID0gdGhpcy5zdGFydERhdGUuY2xvbmUoKS5hZGQodGhpcy5kYXRlTGltaXQsICdkYXknKS5lbmRPZignZGF5Jyk7XG4gICAgICAgICAgICAgICAgaWYgKCFtYXhEYXRlIHx8IG1heExpbWl0LmlzQmVmb3JlKG1heERhdGUpKSB7XG4gICAgICAgICAgICAgICAgbWF4RGF0ZSA9IG1heExpbWl0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FsZW5kYXJWYXJpYWJsZXNbc2lkZV0gPSB7XG4gICAgICAgICAgICBtb250aDogbW9udGgsXG4gICAgICAgICAgICB5ZWFyOiB5ZWFyLFxuICAgICAgICAgICAgaG91cjogaG91cixcbiAgICAgICAgICAgIG1pbnV0ZTogbWludXRlLFxuICAgICAgICAgICAgc2Vjb25kOiBzZWNvbmQsXG4gICAgICAgICAgICBkYXlzSW5Nb250aDogZGF5c0luTW9udGgsXG4gICAgICAgICAgICBmaXJzdERheTogZmlyc3REYXksXG4gICAgICAgICAgICBsYXN0RGF5OiBsYXN0RGF5LFxuICAgICAgICAgICAgbGFzdE1vbnRoOiBsYXN0TW9udGgsXG4gICAgICAgICAgICBsYXN0WWVhcjogbGFzdFllYXIsXG4gICAgICAgICAgICBkYXlzSW5MYXN0TW9udGg6IGRheXNJbkxhc3RNb250aCxcbiAgICAgICAgICAgIGRheU9mV2VlazogZGF5T2ZXZWVrLFxuICAgICAgICAgICAgLy8gb3RoZXIgdmFyc1xuICAgICAgICAgICAgY2FsUm93czogQXJyYXkuZnJvbShBcnJheSg2KS5rZXlzKCkpLFxuICAgICAgICAgICAgY2FsQ29sczogQXJyYXkuZnJvbShBcnJheSg3KS5rZXlzKCkpLFxuICAgICAgICAgICAgY2xhc3Nlczoge30sXG4gICAgICAgICAgICBtaW5EYXRlOiBtaW5EYXRlLFxuICAgICAgICAgICAgbWF4RGF0ZTogbWF4RGF0ZSxcbiAgICAgICAgICAgIGNhbGVuZGFyOiBjYWxlbmRhclxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5zaG93RHJvcGRvd25zKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50TW9udGggPSBjYWxlbmRhclsxXVsxXS5tb250aCgpO1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFllYXIgPSBjYWxlbmRhclsxXVsxXS55ZWFyKCk7XG4gICAgICAgICAgICBjb25zdCBtYXhZZWFyID0gKG1heERhdGUgJiYgbWF4RGF0ZS55ZWFyKCkpIHx8IChjdXJyZW50WWVhciArIDUpO1xuICAgICAgICAgICAgY29uc3QgbWluWWVhciA9IChtaW5EYXRlICYmIG1pbkRhdGUueWVhcigpKSB8fCAoY3VycmVudFllYXIgLSA1MCk7XG4gICAgICAgICAgICBjb25zdCBpbk1pblllYXIgPSBjdXJyZW50WWVhciA9PT0gbWluWWVhcjtcbiAgICAgICAgICAgIGNvbnN0IGluTWF4WWVhciA9IGN1cnJlbnRZZWFyID09PSBtYXhZZWFyO1xuICAgICAgICAgICAgY29uc3QgeWVhcnMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSBtaW5ZZWFyOyB5IDw9IG1heFllYXI7IHkrKykge1xuICAgICAgICAgICAgICAgIHllYXJzLnB1c2goeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNhbGVuZGFyVmFyaWFibGVzW3NpZGVdLmRyb3Bkb3ducyA9IHtcbiAgICAgICAgICAgICAgICBjdXJyZW50TW9udGg6IGN1cnJlbnRNb250aCxcbiAgICAgICAgICAgICAgICBjdXJyZW50WWVhcjogY3VycmVudFllYXIsXG4gICAgICAgICAgICAgICAgbWF4WWVhcjogbWF4WWVhcixcbiAgICAgICAgICAgICAgICBtaW5ZZWFyOiBtaW5ZZWFyLFxuICAgICAgICAgICAgICAgIGluTWluWWVhcjogaW5NaW5ZZWFyLFxuICAgICAgICAgICAgICAgIGluTWF4WWVhcjogaW5NYXhZZWFyLFxuICAgICAgICAgICAgICAgIG1vbnRoQXJyYXlzOiBBcnJheS5mcm9tKEFycmF5KDEyKS5rZXlzKCkpLFxuICAgICAgICAgICAgICAgIHllYXJBcnJheXM6IHllYXJzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9idWlsZENlbGxzKGNhbGVuZGFyLCBzaWRlKVxuICAgIH1cbiAgICBzZXRTdGFydERhdGUoc3RhcnREYXRlKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhcnREYXRlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhpcy5zdGFydERhdGUgPSBtb21lbnQoc3RhcnREYXRlLCB0aGlzLmxvY2FsZS5mb3JtYXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzdGFydERhdGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0RGF0ZSA9IG1vbWVudChzdGFydERhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy50aW1lUGlja2VyKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0RGF0ZSA9IHRoaXMuc3RhcnREYXRlLnN0YXJ0T2YoJ2RheScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudGltZVBpY2tlciAmJiB0aGlzLnRpbWVQaWNrZXJJbmNyZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnREYXRlLm1pbnV0ZShNYXRoLnJvdW5kKHRoaXMuc3RhcnREYXRlLm1pbnV0ZSgpIC8gdGhpcy50aW1lUGlja2VySW5jcmVtZW50KSAqIHRoaXMudGltZVBpY2tlckluY3JlbWVudCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmICh0aGlzLm1pbkRhdGUgJiYgdGhpcy5zdGFydERhdGUuaXNCZWZvcmUodGhpcy5taW5EYXRlKSkge1xuICAgICAgICAgICAgdGhpcy5zdGFydERhdGUgPSB0aGlzLm1pbkRhdGUuY2xvbmUoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVQaWNrZXIgJiYgdGhpcy50aW1lUGlja2VySW5jcmVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydERhdGUubWludXRlKE1hdGgucm91bmQodGhpcy5zdGFydERhdGUubWludXRlKCkgLyB0aGlzLnRpbWVQaWNrZXJJbmNyZW1lbnQpICogdGhpcy50aW1lUGlja2VySW5jcmVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubWF4RGF0ZSAmJiB0aGlzLnN0YXJ0RGF0ZS5pc0FmdGVyKHRoaXMubWF4RGF0ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnREYXRlID0gdGhpcy5tYXhEYXRlLmNsb25lKCk7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lUGlja2VyICYmIHRoaXMudGltZVBpY2tlckluY3JlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnREYXRlLm1pbnV0ZShNYXRoLmZsb29yKHRoaXMuc3RhcnREYXRlLm1pbnV0ZSgpIC8gdGhpcy50aW1lUGlja2VySW5jcmVtZW50KSAqIHRoaXMudGltZVBpY2tlckluY3JlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNTaG93bikge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVFbGVtZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZU1vbnRoc0luVmlldygpO1xuICAgIH1cblxuICAgIHNldEVuZERhdGUoZW5kRGF0ZSkge1xuICAgICAgICBpZiAodHlwZW9mIGVuZERhdGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aGlzLmVuZERhdGUgPSBtb21lbnQoZW5kRGF0ZSwgdGhpcy5sb2NhbGUuZm9ybWF0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgZW5kRGF0ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRoaXMuZW5kRGF0ZSA9IG1vbWVudChlbmREYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMudGltZVBpY2tlcikge1xuICAgICAgICAgICAgdGhpcy5lbmREYXRlID0gdGhpcy5lbmREYXRlLmFkZCgxLCdkJykuc3RhcnRPZignZGF5Jykuc3VidHJhY3QoMSwnc2Vjb25kJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy50aW1lUGlja2VyICYmIHRoaXMudGltZVBpY2tlckluY3JlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5lbmREYXRlLm1pbnV0ZShNYXRoLnJvdW5kKHRoaXMuZW5kRGF0ZS5taW51dGUoKSAvIHRoaXMudGltZVBpY2tlckluY3JlbWVudCkgKiB0aGlzLnRpbWVQaWNrZXJJbmNyZW1lbnQpO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAodGhpcy5lbmREYXRlLmlzQmVmb3JlKHRoaXMuc3RhcnREYXRlKSkge1xuICAgICAgICAgICAgdGhpcy5lbmREYXRlID0gdGhpcy5zdGFydERhdGUuY2xvbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1heERhdGUgJiYgdGhpcy5lbmREYXRlLmlzQWZ0ZXIodGhpcy5tYXhEYXRlKSkge1xuICAgICAgICAgICAgdGhpcy5lbmREYXRlID0gdGhpcy5tYXhEYXRlLmNsb25lKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5kYXRlTGltaXQgJiYgdGhpcy5zdGFydERhdGUuY2xvbmUoKS5hZGQodGhpcy5kYXRlTGltaXQsICdkYXknKS5pc0JlZm9yZSh0aGlzLmVuZERhdGUpKSB7XG4gICAgICAgICAgICB0aGlzLmVuZERhdGUgPSB0aGlzLnN0YXJ0RGF0ZS5jbG9uZSgpLmFkZCh0aGlzLmRhdGVMaW1pdCwgJ2RheScpO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoIXRoaXMuaXNTaG93bikge1xuICAgICAgICAgICAgLy8gdGhpcy51cGRhdGVFbGVtZW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVNb250aHNJblZpZXcoKTtcbiAgICB9XG4gICAgQElucHV0KClcbiAgICBpc0ludmFsaWREYXRlKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBASW5wdXQoKVxuICAgIGlzQ3VzdG9tRGF0ZShkYXRlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB1cGRhdGVWaWV3KCkge1xuICAgICAgICBpZiAodGhpcy50aW1lUGlja2VyKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclRpbWVQaWNrZXIoU2lkZUVudW0ubGVmdCk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclRpbWVQaWNrZXIoU2lkZUVudW0ucmlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlTW9udGhzSW5WaWV3KCk7XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsZW5kYXJzKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlTW9udGhzSW5WaWV3KCkge1xuICAgICAgICBpZiAodGhpcy5lbmREYXRlKSB7XG4gICAgICAgICAgICAvLyBpZiBib3RoIGRhdGVzIGFyZSB2aXNpYmxlIGFscmVhZHksIGRvIG5vdGhpbmdcbiAgICAgICAgICAgIGlmICghdGhpcy5zaW5nbGVEYXRlUGlja2VyICYmIHRoaXMubGVmdENhbGVuZGFyLm1vbnRoICYmIHRoaXMucmlnaHRDYWxlbmRhci5tb250aCAmJlxuICAgICAgICAgICAgICAgICgodGhpcy5zdGFydERhdGUgJiYgdGhpcy5sZWZ0Q2FsZW5kYXIgJiYgdGhpcy5zdGFydERhdGUuZm9ybWF0KCdZWVlZLU1NJykgPT09IHRoaXMubGVmdENhbGVuZGFyLm1vbnRoLmZvcm1hdCgnWVlZWS1NTScpKSB8fFxuICAgICAgICAgICAgICAgICh0aGlzLnN0YXJ0RGF0ZSAmJiB0aGlzLnJpZ2h0Q2FsZW5kYXIgJiYgdGhpcy5zdGFydERhdGUuZm9ybWF0KCdZWVlZLU1NJykgPT09IHRoaXMucmlnaHRDYWxlbmRhci5tb250aC5mb3JtYXQoJ1lZWVktTU0nKSkpXG4gICAgICAgICAgICAgICAgJiZcbiAgICAgICAgICAgICAgICAodGhpcy5lbmREYXRlLmZvcm1hdCgnWVlZWS1NTScpID09PSB0aGlzLmxlZnRDYWxlbmRhci5tb250aC5mb3JtYXQoJ1lZWVktTU0nKSB8fFxuICAgICAgICAgICAgICAgIHRoaXMuZW5kRGF0ZS5mb3JtYXQoJ1lZWVktTU0nKSA9PT0gdGhpcy5yaWdodENhbGVuZGFyLm1vbnRoLmZvcm1hdCgnWVlZWS1NTScpKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXJ0RGF0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubGVmdENhbGVuZGFyLm1vbnRoID0gdGhpcy5zdGFydERhdGUuY2xvbmUoKS5kYXRlKDIpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5saW5rZWRDYWxlbmRhcnMgJiYgKHRoaXMuZW5kRGF0ZS5tb250aCgpICE9PSB0aGlzLnN0YXJ0RGF0ZS5tb250aCgpIHx8XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW5kRGF0ZS55ZWFyKCkgIT09IHRoaXMuc3RhcnREYXRlLnllYXIoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yaWdodENhbGVuZGFyLm1vbnRoID0gdGhpcy5lbmREYXRlLmNsb25lKCkuZGF0ZSgyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yaWdodENhbGVuZGFyLm1vbnRoID0gdGhpcy5zdGFydERhdGUuY2xvbmUoKS5kYXRlKDIpLmFkZCgxLCAnbW9udGgnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxlZnRDYWxlbmRhci5tb250aC5mb3JtYXQoJ1lZWVktTU0nKSAhPT0gdGhpcy5zdGFydERhdGUuZm9ybWF0KCdZWVlZLU1NJykgJiZcbiAgICAgICAgICAgIHRoaXMucmlnaHRDYWxlbmRhci5tb250aC5mb3JtYXQoJ1lZWVktTU0nKSAhPT0gdGhpcy5zdGFydERhdGUuZm9ybWF0KCdZWVlZLU1NJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnRDYWxlbmRhci5tb250aCA9IHRoaXMuc3RhcnREYXRlLmNsb25lKCkuZGF0ZSgyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0Q2FsZW5kYXIubW9udGggPSB0aGlzLnN0YXJ0RGF0ZS5jbG9uZSgpLmRhdGUoMikuYWRkKDEsICdtb250aCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm1heERhdGUgJiYgdGhpcy5saW5rZWRDYWxlbmRhcnMgJiYgIXRoaXMuc2luZ2xlRGF0ZVBpY2tlciAmJiB0aGlzLnJpZ2h0Q2FsZW5kYXIubW9udGggPiB0aGlzLm1heERhdGUpIHtcbiAgICAgICAgICAgIHRoaXMucmlnaHRDYWxlbmRhci5tb250aCA9IHRoaXMubWF4RGF0ZS5jbG9uZSgpLmRhdGUoMik7XG4gICAgICAgICAgICB0aGlzLmxlZnRDYWxlbmRhci5tb250aCA9IHRoaXMubWF4RGF0ZS5jbG9uZSgpLmRhdGUoMikuc3VidHJhY3QoMSwgJ21vbnRoJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogIFRoaXMgaXMgcmVzcG9uc2libGUgZm9yIHVwZGF0aW5nIHRoZSBjYWxlbmRhcnNcbiAgICAgKi9cbiAgICB1cGRhdGVDYWxlbmRhcnMoKSB7XG4gICAgICAgIHRoaXMucmVuZGVyQ2FsZW5kYXIoU2lkZUVudW0ubGVmdCk7XG4gICAgICAgIHRoaXMucmVuZGVyQ2FsZW5kYXIoU2lkZUVudW0ucmlnaHQpO1xuXG4gICAgICAgIGlmICh0aGlzLmVuZERhdGUgPT09IG51bGwpIHsgcmV0dXJuOyB9XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQ2hvc2VuTGFiZWwoKTtcbiAgICB9XG4gICAgdXBkYXRlRWxlbWVudCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNpbmdsZURhdGVQaWNrZXIgJiYgdGhpcy5hdXRvVXBkYXRlSW5wdXQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXJ0RGF0ZSAmJiB0aGlzLmVuZERhdGUpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSB1c2UgcmFuZ2VzIGFuZCBzaG91bGQgc2hvdyByYW5nZSBsYWJlbCBvbiBpbnB1XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmFuZ2VzQXJyYXkubGVuZ3RoICYmIHRoaXMuc2hvd1JhbmdlTGFiZWxPbklucHV0ID09PSB0cnVlICYmIHRoaXMuY2hvc2VuUmFuZ2UgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2NhbGUuY3VzdG9tUmFuZ2VMYWJlbCAhPT0gdGhpcy5jaG9zZW5SYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNob3NlbkxhYmVsID0gdGhpcy5jaG9zZW5SYW5nZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNob3NlbkxhYmVsID0gdGhpcy5zdGFydERhdGUuZm9ybWF0KHRoaXMubG9jYWxlLmZvcm1hdCkgK1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2FsZS5zZXBhcmF0b3IgKyB0aGlzLmVuZERhdGUuZm9ybWF0KHRoaXMubG9jYWxlLmZvcm1hdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLmF1dG9VcGRhdGVJbnB1dCkge1xuICAgICAgICAgICAgdGhpcy5jaG9zZW5MYWJlbCA9IHRoaXMuc3RhcnREYXRlLmZvcm1hdCh0aGlzLmxvY2FsZS5mb3JtYXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlKCkge1xuICAgICAgICB0aGlzLmlzU2hvd24gPSBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogdGhpcyBzaG91bGQgY2FsY3VsYXRlIHRoZSBsYWJlbFxuICAgICAqL1xuICAgIGNhbGN1bGF0ZUNob3NlbkxhYmVsICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxvY2FsZSB8fCAhdGhpcy5sb2NhbGUuc2VwYXJhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLl9idWlsZExvY2FsZSgpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjdXN0b21SYW5nZSA9IHRydWU7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgaWYgKHRoaXMucmFuZ2VzQXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCByYW5nZSBpbiB0aGlzLnJhbmdlcykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZvcm1hdCA9IHRoaXMudGltZVBpY2tlclNlY29uZHMgPyBcIllZWVktTU0tREQgSEg6bW06c3NcIiA6IFwiWVlZWS1NTS1ERCBISDptbVwiO1xuICAgICAgICAgICAgICAgICAgICAvL2lnbm9yZSB0aW1lcyB3aGVuIGNvbXBhcmluZyBkYXRlcyBpZiB0aW1lIHBpY2tlciBzZWNvbmRzIGlzIG5vdCBlbmFibGVkXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXJ0RGF0ZS5mb3JtYXQoZm9ybWF0KSA9PSB0aGlzLnJhbmdlc1tyYW5nZV1bMF0uZm9ybWF0KGZvcm1hdCkgJiYgdGhpcy5lbmREYXRlLmZvcm1hdChmb3JtYXQpID09IHRoaXMucmFuZ2VzW3JhbmdlXVsxXS5mb3JtYXQoZm9ybWF0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tUmFuZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hvc2VuUmFuZ2UgPSB0aGlzLnJhbmdlc0FycmF5W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvL2lnbm9yZSB0aW1lcyB3aGVuIGNvbXBhcmluZyBkYXRlcyBpZiB0aW1lIHBpY2tlciBpcyBub3QgZW5hYmxlZFxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGFydERhdGUuZm9ybWF0KCdZWVlZLU1NLUREJykgPT0gdGhpcy5yYW5nZXNbcmFuZ2VdWzBdLmZvcm1hdCgnWVlZWS1NTS1ERCcpICYmIHRoaXMuZW5kRGF0ZS5mb3JtYXQoJ1lZWVktTU0tREQnKSA9PSB0aGlzLnJhbmdlc1tyYW5nZV1bMV0uZm9ybWF0KCdZWVlZLU1NLUREJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVJhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNob3NlblJhbmdlID0gdGhpcy5yYW5nZXNBcnJheVtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN1c3RvbVJhbmdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hvd0N1c3RvbVJhbmdlTGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaG9zZW5SYW5nZSA9IHRoaXMubG9jYWxlLmN1c3RvbVJhbmdlTGFiZWw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaG9zZW5SYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGlmIGN1c3RvbSBsYWJlbDogc2hvdyBjYWxlbmFyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Q2FsSW5SYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVFbGVtZW50KCk7XG4gICAgfVxuXG4gICAgY2xpY2tBcHBseShlPykge1xuICAgICAgICBpZiAoIXRoaXMuc2luZ2xlRGF0ZVBpY2tlciAmJiB0aGlzLnN0YXJ0RGF0ZSAmJiAhdGhpcy5lbmREYXRlKSB7XG4gICAgICAgICAgICB0aGlzLmVuZERhdGUgPSB0aGlzLnN0YXJ0RGF0ZS5jbG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVDaG9zZW5MYWJlbCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzSW52YWxpZERhdGUgJiYgdGhpcy5zdGFydERhdGUgJiYgdGhpcy5lbmREYXRlKSB7XG4gICAgICAgICAgICAvLyBnZXQgaWYgdGhlcmUgYXJlIGludmFsaWQgZGF0ZSBiZXR3ZWVuIHJhbmdlXG4gICAgICAgICAgICBsZXQgZCA9IHRoaXMuc3RhcnREYXRlLmNsb25lKCk7XG4gICAgICAgICAgICB3aGlsZShkLmlzQmVmb3JlKHRoaXMuZW5kRGF0ZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0ludmFsaWREYXRlKGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW5kRGF0ZSA9IGQuc3VidHJhY3QoMSwgJ2RheXMnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVDaG9zZW5MYWJlbCgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZC5hZGQoMSwgJ2RheXMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jaG9zZW5MYWJlbCkge1xuICAgICAgICAgICAgdGhpcy5jaG9vc2VkRGF0ZS5lbWl0KHtjaG9zZW5MYWJlbDogdGhpcy5jaG9zZW5MYWJlbCwgc3RhcnREYXRlOiB0aGlzLnN0YXJ0RGF0ZSwgZW5kRGF0ZTogdGhpcy5lbmREYXRlfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRhdGVzVXBkYXRlZC5lbWl0KHtzdGFydERhdGU6IHRoaXMuc3RhcnREYXRlLCBlbmREYXRlOiB0aGlzLmVuZERhdGV9KTtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgfVxuXG4gICAgY2xpY2tDYW5jZWwoZSkge1xuICAgICAgICB0aGlzLnN0YXJ0RGF0ZSA9IHRoaXMuX29sZC5zdGFydDtcbiAgICAgICAgdGhpcy5lbmREYXRlID0gdGhpcy5fb2xkLmVuZDtcbiAgICAgICAgaWYodGhpcy5pbmxpbmUpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBjYWxsZWQgd2hlbiBtb250aCBpcyBjaGFuZ2VkXG4gICAgICogQHBhcmFtIG1vbnRoRXZlbnQgZ2V0IHZhbHVlIGluIGV2ZW50LnRhcmdldC52YWx1ZVxuICAgICAqIEBwYXJhbSBzaWRlIGxlZnQgb3IgcmlnaHRcbiAgICAgKi9cbiAgICBtb250aENoYW5nZWQobW9udGhFdmVudDogYW55LCBzaWRlOiBTaWRlRW51bSkge1xuICAgICAgICBjb25zdCB5ZWFyID0gdGhpcy5jYWxlbmRhclZhcmlhYmxlc1tzaWRlXS5kcm9wZG93bnMuY3VycmVudFllYXI7XG4gICAgICAgIGNvbnN0IG1vbnRoID0gcGFyc2VJbnQobW9udGhFdmVudC50YXJnZXQudmFsdWUsIDEwKTtcbiAgICAgICAgdGhpcy5tb250aE9yWWVhckNoYW5nZWQobW9udGgsIHllYXIsIHNpZGUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBjYWxsZWQgd2hlbiB5ZWFyIGlzIGNoYW5nZWRcbiAgICAgKiBAcGFyYW0geWVhckV2ZW50IGdldCB2YWx1ZSBpbiBldmVudC50YXJnZXQudmFsdWVcbiAgICAgKiBAcGFyYW0gc2lkZSBsZWZ0IG9yIHJpZ2h0XG4gICAgICovXG4gICAgeWVhckNoYW5nZWQoeWVhckV2ZW50OiBhbnksIHNpZGU6IFNpZGVFbnVtKSB7XG4gICAgICAgIGNvbnN0IG1vbnRoID0gdGhpcy5jYWxlbmRhclZhcmlhYmxlc1tzaWRlXS5kcm9wZG93bnMuY3VycmVudE1vbnRoO1xuICAgICAgICBjb25zdCB5ZWFyID0gcGFyc2VJbnQoeWVhckV2ZW50LnRhcmdldC52YWx1ZSwgMTApO1xuICAgICAgICB0aGlzLm1vbnRoT3JZZWFyQ2hhbmdlZChtb250aCwgeWVhciwgc2lkZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIGNhbGxlZCB3aGVuIHRpbWUgaXMgY2hhbmdlZFxuICAgICAqIEBwYXJhbSB0aW1lRXZlbnQgIGFuIGV2ZW50XG4gICAgICogQHBhcmFtIHNpZGUgbGVmdCBvciByaWdodFxuICAgICAqL1xuICAgIHRpbWVDaGFuZ2VkKHRpbWVFdmVudDogYW55LCBzaWRlOiBTaWRlRW51bSkge1xuXG4gICAgICAgIHZhciBob3VyID0gcGFyc2VJbnQodGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLnNlbGVjdGVkSG91ciwgMTApO1xuICAgICAgICB2YXIgbWludXRlID0gcGFyc2VJbnQodGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLnNlbGVjdGVkTWludXRlLCAxMCk7XG4gICAgICAgIHZhciBzZWNvbmQgPSB0aGlzLnRpbWVQaWNrZXJTZWNvbmRzID8gcGFyc2VJbnQodGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLnNlbGVjdGVkU2Vjb25kLCAxMCkgOiAwO1xuXG4gICAgICAgIGlmICghdGhpcy50aW1lUGlja2VyMjRIb3VyKSB7XG4gICAgICAgICAgICB2YXIgYW1wbSA9IHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5hbXBtTW9kZWw7XG4gICAgICAgICAgICBpZiAoYW1wbSA9PT0gJ1BNJyAmJiBob3VyIDwgMTIpXG4gICAgICAgICAgICAgICAgaG91ciArPSAxMjtcbiAgICAgICAgICAgIGlmIChhbXBtID09PSAnQU0nICYmIGhvdXIgPT09IDEyKVxuICAgICAgICAgICAgICAgIGhvdXIgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNpZGUgPT09IFNpZGVFbnVtLmxlZnQpIHtcbiAgICAgICAgICAgIHZhciBzdGFydCA9IHRoaXMuc3RhcnREYXRlLmNsb25lKCk7XG4gICAgICAgICAgICBzdGFydC5ob3VyKGhvdXIpO1xuICAgICAgICAgICAgc3RhcnQubWludXRlKG1pbnV0ZSk7XG4gICAgICAgICAgICBzdGFydC5zZWNvbmQoc2Vjb25kKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhcnREYXRlKHN0YXJ0KTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNpbmdsZURhdGVQaWNrZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZERhdGUgPSB0aGlzLnN0YXJ0RGF0ZS5jbG9uZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmVuZERhdGUgJiYgdGhpcy5lbmREYXRlLmZvcm1hdCgnWVlZWS1NTS1ERCcpID09IHN0YXJ0LmZvcm1hdCgnWVlZWS1NTS1ERCcpICYmIHRoaXMuZW5kRGF0ZS5pc0JlZm9yZShzdGFydCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVuZERhdGUoc3RhcnQuY2xvbmUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5lbmREYXRlKSB7XG4gICAgICAgICAgICB2YXIgZW5kID0gdGhpcy5lbmREYXRlLmNsb25lKCk7XG4gICAgICAgICAgICBlbmQuaG91cihob3VyKTtcbiAgICAgICAgICAgIGVuZC5taW51dGUobWludXRlKTtcbiAgICAgICAgICAgIGVuZC5zZWNvbmQoc2Vjb25kKTtcbiAgICAgICAgICAgIHRoaXMuc2V0RW5kRGF0ZShlbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy91cGRhdGUgdGhlIGNhbGVuZGFycyBzbyBhbGwgY2xpY2thYmxlIGRhdGVzIHJlZmxlY3QgdGhlIG5ldyB0aW1lIGNvbXBvbmVudFxuICAgICAgICB0aGlzLnVwZGF0ZUNhbGVuZGFycygpO1xuXG4gICAgICAgIC8vcmUtcmVuZGVyIHRoZSB0aW1lIHBpY2tlcnMgYmVjYXVzZSBjaGFuZ2luZyBvbmUgc2VsZWN0aW9uIGNhbiBhZmZlY3Qgd2hhdCdzIGVuYWJsZWQgaW4gYW5vdGhlclxuICAgICAgICB0aGlzLnJlbmRlclRpbWVQaWNrZXIoU2lkZUVudW0ubGVmdCk7XG4gICAgICAgIHRoaXMucmVuZGVyVGltZVBpY2tlcihTaWRlRW51bS5yaWdodCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBjYWxsIHdoZW4gbW9udGggb3IgeWVhciBjaGFuZ2VkXG4gICAgICogQHBhcmFtIG1vbnRoIG1vbnRoIG51bWJlciAwIC0xMVxuICAgICAqIEBwYXJhbSB5ZWFyIHllYXIgZWc6IDE5OTVcbiAgICAgKiBAcGFyYW0gc2lkZSBsZWZ0IG9yIHJpZ2h0XG4gICAgICovXG4gICAgbW9udGhPclllYXJDaGFuZ2VkKG1vbnRoOiBudW1iZXIsIHllYXI6IG51bWJlciwgc2lkZTogU2lkZUVudW0pIHtcbiAgICAgICAgY29uc3QgaXNMZWZ0ID0gc2lkZSA9PT0gU2lkZUVudW0ubGVmdDtcblxuICAgICAgICBpZiAoIWlzTGVmdCkge1xuICAgICAgICAgICAgaWYgKHllYXIgPCB0aGlzLnN0YXJ0RGF0ZS55ZWFyKCkgfHwgKHllYXIgPT09IHRoaXMuc3RhcnREYXRlLnllYXIoKSAmJiBtb250aCA8IHRoaXMuc3RhcnREYXRlLm1vbnRoKCkpKSB7XG4gICAgICAgICAgICAgICAgbW9udGggPSB0aGlzLnN0YXJ0RGF0ZS5tb250aCgpO1xuICAgICAgICAgICAgICAgIHllYXIgPSB0aGlzLnN0YXJ0RGF0ZS55ZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5taW5EYXRlKSB7XG4gICAgICAgICAgICBpZiAoeWVhciA8IHRoaXMubWluRGF0ZS55ZWFyKCkgfHwgKHllYXIgPT09IHRoaXMubWluRGF0ZS55ZWFyKCkgJiYgbW9udGggPCB0aGlzLm1pbkRhdGUubW9udGgoKSkpIHtcbiAgICAgICAgICAgICAgICBtb250aCA9IHRoaXMubWluRGF0ZS5tb250aCgpO1xuICAgICAgICAgICAgICAgIHllYXIgPSB0aGlzLm1pbkRhdGUueWVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubWF4RGF0ZSkge1xuICAgICAgICAgICAgaWYgKHllYXIgPiB0aGlzLm1heERhdGUueWVhcigpIHx8ICh5ZWFyID09PSB0aGlzLm1heERhdGUueWVhcigpICYmIG1vbnRoID4gdGhpcy5tYXhEYXRlLm1vbnRoKCkpKSB7XG4gICAgICAgICAgICAgICAgbW9udGggPSB0aGlzLm1heERhdGUubW9udGgoKTtcbiAgICAgICAgICAgICAgICB5ZWFyID0gdGhpcy5tYXhEYXRlLnllYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGVuZGFyVmFyaWFibGVzW3NpZGVdLmRyb3Bkb3ducy5jdXJyZW50WWVhciA9IHllYXI7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJWYXJpYWJsZXNbc2lkZV0uZHJvcGRvd25zLmN1cnJlbnRNb250aCA9IG1vbnRoO1xuICAgICAgICBpZiAoaXNMZWZ0KSB7XG4gICAgICAgICAgICB0aGlzLmxlZnRDYWxlbmRhci5tb250aC5tb250aChtb250aCkueWVhcih5ZWFyKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmxpbmtlZENhbGVuZGFycykge1xuICAgICAgICAgICAgICAgIHRoaXMucmlnaHRDYWxlbmRhci5tb250aCA9IHRoaXMubGVmdENhbGVuZGFyLm1vbnRoLmNsb25lKCkuYWRkKDEsICdtb250aCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yaWdodENhbGVuZGFyLm1vbnRoLm1vbnRoKG1vbnRoKS55ZWFyKHllYXIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubGlua2VkQ2FsZW5kYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sZWZ0Q2FsZW5kYXIubW9udGggPSB0aGlzLnJpZ2h0Q2FsZW5kYXIubW9udGguY2xvbmUoKS5zdWJ0cmFjdCgxLCAnbW9udGgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUNhbGVuZGFycygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsaWNrIG9uIHByZXZpb3VzIG1vbnRoXG4gICAgICogQHBhcmFtIHNpZGUgbGVmdCBvciByaWdodCBjYWxlbmRhclxuICAgICAqL1xuICAgIGNsaWNrUHJldihzaWRlOiBTaWRlRW51bSkge1xuICAgICAgICBpZiAoc2lkZSA9PT0gU2lkZUVudW0ubGVmdCkge1xuICAgICAgICAgICAgdGhpcy5sZWZ0Q2FsZW5kYXIubW9udGguc3VidHJhY3QoMSwgJ21vbnRoJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5saW5rZWRDYWxlbmRhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0Q2FsZW5kYXIubW9udGguc3VidHJhY3QoMSwgJ21vbnRoJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q2FsZW5kYXIubW9udGguc3VidHJhY3QoMSwgJ21vbnRoJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVDYWxlbmRhcnMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xpY2sgb24gbmV4dCBtb250aFxuICAgICAqIEBwYXJhbSBzaWRlIGxlZnQgb3IgcmlnaHQgY2FsZW5kYXJcbiAgICAgKi9cbiAgICBjbGlja05leHQoc2lkZTogU2lkZUVudW0pIHtcbiAgICAgICAgaWYgKHNpZGUgPT09IFNpZGVFbnVtLmxlZnQpIHtcbiAgICAgICAgICAgIHRoaXMubGVmdENhbGVuZGFyLm1vbnRoLmFkZCgxLCAnbW9udGgnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmlnaHRDYWxlbmRhci5tb250aC5hZGQoMSwgJ21vbnRoJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5saW5rZWRDYWxlbmRhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnRDYWxlbmRhci5tb250aC5hZGQoMSwgJ21vbnRoJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVDYWxlbmRhcnMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogV2hlbiBzZWxlY3RpbmcgYSBkYXRlXG4gICAgICogQHBhcmFtIGUgZXZlbnQ6IGdldCB2YWx1ZSBieSBlLnRhcmdldC52YWx1ZVxuICAgICAqIEBwYXJhbSBzaWRlIGxlZnQgb3IgcmlnaHRcbiAgICAgKiBAcGFyYW0gcm93IHJvdyBwb3NpdGlvbiBvZiB0aGUgY3VycmVudCBkYXRlIGNsaWNrZWRcbiAgICAgKiBAcGFyYW0gY29sIGNvbCBwb3NpdGlvbiBvZiB0aGUgY3VycmVudCBkYXRlIGNsaWNrZWRcbiAgICAgKi9cbiAgICBjbGlja0RhdGUoZSwgc2lkZTogU2lkZUVudW0sIHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xuICAgICAgICBpZiAoZS50YXJnZXQudGFnTmFtZSA9PT0gJ1REJykge1xuICAgICAgICAgICAgaWYgKCFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2F2YWlsYWJsZScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGUudGFyZ2V0LnRhZ05hbWUgPT09ICdTUEFOJykge1xuICAgICAgICAgICAgaWYgKCFlLnRhcmdldC5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnYXZhaWxhYmxlJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmFuZ2VzQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmNob3NlblJhbmdlID0gdGhpcy5sb2NhbGUuY3VzdG9tUmFuZ2VMYWJlbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkYXRlID0gc2lkZSA9PT0gIFNpZGVFbnVtLmxlZnQgPyB0aGlzLmxlZnRDYWxlbmRhci5jYWxlbmRhcltyb3ddW2NvbF0gOiB0aGlzLnJpZ2h0Q2FsZW5kYXIuY2FsZW5kYXJbcm93XVtjb2xdO1xuXG4gICAgICAgIGlmICh0aGlzLmVuZERhdGUgfHwgZGF0ZS5pc0JlZm9yZSh0aGlzLnN0YXJ0RGF0ZSwgJ2RheScpKSB7IC8vIHBpY2tpbmcgc3RhcnRcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgICAgICBkYXRlID0gdGhpcy5fZ2V0RGF0ZVdpdGhUaW1lKGRhdGUsIFNpZGVFbnVtLmxlZnQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmVuZERhdGUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGFydERhdGUoZGF0ZS5jbG9uZSgpKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5lbmREYXRlICYmIGRhdGUuaXNCZWZvcmUodGhpcy5zdGFydERhdGUpKSB7XG4gICAgICAgICAgICAvLyBzcGVjaWFsIGNhc2U6IGNsaWNraW5nIHRoZSBzYW1lIGRhdGUgZm9yIHN0YXJ0L2VuZCxcbiAgICAgICAgICAgIC8vIGJ1dCB0aGUgdGltZSBvZiB0aGUgZW5kIGRhdGUgaXMgYmVmb3JlIHRoZSBzdGFydCBkYXRlXG4gICAgICAgICAgICB0aGlzLnNldEVuZERhdGUodGhpcy5zdGFydERhdGUuY2xvbmUoKSk7XG4gICAgICAgIH0gZWxzZSB7IC8vIHBpY2tpbmcgZW5kXG4gICAgICAgICAgICBpZiAodGhpcy50aW1lUGlja2VyKSB7XG4gICAgICAgICAgICAgICAgZGF0ZSA9IHRoaXMuX2dldERhdGVXaXRoVGltZShkYXRlLCBTaWRlRW51bS5yaWdodClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0RW5kRGF0ZShkYXRlLmNsb25lKCkpO1xuICAgICAgICAgICAgaWYgKHRoaXMuYXV0b0FwcGx5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVDaG9zZW5MYWJlbCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tBcHBseSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc2luZ2xlRGF0ZVBpY2tlcikge1xuICAgICAgICAgICAgdGhpcy5zZXRFbmREYXRlKHRoaXMuc3RhcnREYXRlKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRWxlbWVudCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuYXV0b0FwcGx5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja0FwcGx5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcblxuICAgICAgICAvLyBUaGlzIGlzIHRvIGNhbmNlbCB0aGUgYmx1ciBldmVudCBoYW5kbGVyIGlmIHRoZSBtb3VzZSB3YXMgaW4gb25lIG9mIHRoZSBpbnB1dHNcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIH1cbiAgICAvKipcbiAgICAgKiAgQ2xpY2sgb24gdGhlIGN1c3RvbSByYW5nZVxuICAgICAqIEBwYXJhbSBlOiBFdmVudFxuICAgICAqIEBwYXJhbSBsYWJlbFxuICAgICAqL1xuICAgIGNsaWNrUmFuZ2UoZSwgbGFiZWwpIHtcbiAgICAgICAgdGhpcy5jaG9zZW5SYW5nZSA9IGxhYmVsO1xuICAgICAgICBpZiAobGFiZWwgPT0gdGhpcy5sb2NhbGUuY3VzdG9tUmFuZ2VMYWJlbCkge1xuICAgICAgICAgICAgdGhpcy5pc1Nob3duICA9IHRydWU7IC8vIHNob3cgY2FsZW5kYXJzXG4gICAgICAgICAgICB0aGlzLnNob3dDYWxJblJhbmdlcyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgZGF0ZXMgPSB0aGlzLnJhbmdlc1tsYWJlbF07XG4gICAgICAgICAgICB0aGlzLnN0YXJ0RGF0ZSA9IGRhdGVzWzBdLmNsb25lKCk7XG4gICAgICAgICAgICB0aGlzLmVuZERhdGUgPSBkYXRlc1sxXS5jbG9uZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd1JhbmdlTGFiZWxPbklucHV0ICYmIGxhYmVsICE9PSB0aGlzLmxvY2FsZS5jdXN0b21SYW5nZUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaG9zZW5MYWJlbCA9IGxhYmVsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZUNob3NlbkxhYmVsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNob3dDYWxJblJhbmdlcyA9ICghdGhpcy5yYW5nZXNBcnJheS5sZW5ndGgpIHx8IHRoaXMuYWx3YXlzU2hvd0NhbGVuZGFycztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCF0aGlzLnRpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0RGF0ZS5zdGFydE9mKCdkYXknKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZERhdGUuZW5kT2YoJ2RheScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMuYWx3YXlzU2hvd0NhbGVuZGFycykge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTaG93biAgPSBmYWxzZTsgLy8gaGlkZSBjYWxlbmRhcnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucmFuZ2VDbGlja2VkLmVtaXQoe2xhYmVsOiBsYWJlbCwgZGF0ZXM6IGRhdGVzfSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMua2VlcENhbGVuZGFyT3BlbmluZ1dpdGhSYW5nZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tBcHBseSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnRDYWxlbmRhci5tb250aC5tb250aChkYXRlc1swXS5tb250aCgpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnRDYWxlbmRhci5tb250aC55ZWFyKGRhdGVzWzBdLnllYXIoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yaWdodENhbGVuZGFyLm1vbnRoLm1vbnRoKGRhdGVzWzFdLm1vbnRoKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMucmlnaHRDYWxlbmRhci5tb250aC55ZWFyKGRhdGVzWzFdLnllYXIoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYWxlbmRhcnMoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50aW1lUGlja2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVGltZVBpY2tlcihTaWRlRW51bS5sZWZ0KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclRpbWVQaWNrZXIoU2lkZUVudW0ucmlnaHQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9O1xuXG5cblxuICAgIHNob3coZT8pIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTaG93bikgeyByZXR1cm47IH1cbiAgICAgICAgdGhpcy5fb2xkLnN0YXJ0ID0gdGhpcy5zdGFydERhdGUuY2xvbmUoKTtcbiAgICAgICAgdGhpcy5fb2xkLmVuZCA9IHRoaXMuZW5kRGF0ZS5jbG9uZSgpO1xuICAgICAgICB0aGlzLmlzU2hvd24gPSB0cnVlO1xuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcbiAgICB9XG5cbiAgICBoaWRlKGU/KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1Nob3duKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gaW5jb21wbGV0ZSBkYXRlIHNlbGVjdGlvbiwgcmV2ZXJ0IHRvIGxhc3QgdmFsdWVzXG4gICAgICAgIGlmICghdGhpcy5lbmREYXRlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fb2xkLnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydERhdGUgPSB0aGlzLl9vbGQuc3RhcnQuY2xvbmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9vbGQuZW5kKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmREYXRlID0gdGhpcy5fb2xkLmVuZC5jbG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgYSBuZXcgZGF0ZSByYW5nZSB3YXMgc2VsZWN0ZWQsIGludm9rZSB0aGUgdXNlciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICBpZiAoIXRoaXMuc3RhcnREYXRlLmlzU2FtZSh0aGlzLl9vbGQuc3RhcnQpIHx8ICF0aGlzLmVuZERhdGUuaXNTYW1lKHRoaXMuX29sZC5lbmQpKSB7XG4gICAgICAgICAgIC8vIHRoaXMuY2FsbGJhY2sodGhpcy5zdGFydERhdGUsIHRoaXMuZW5kRGF0ZSwgdGhpcy5jaG9zZW5MYWJlbCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBwaWNrZXIgaXMgYXR0YWNoZWQgdG8gYSB0ZXh0IGlucHV0LCB1cGRhdGUgaXRcbiAgICAgICAgdGhpcy51cGRhdGVFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuaXNTaG93biA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9yZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBoYW5kbGUgY2xpY2sgb24gYWxsIGVsZW1lbnQgaW4gdGhlIGNvbXBvbmVudCwgdXNlZnVsbCBmb3Igb3V0c2lkZSBvZiBjbGlja1xuICAgICAqIEBwYXJhbSBlIGV2ZW50XG4gICAgICovXG4gICAgaGFuZGxlSW50ZXJuYWxDbGljayhlKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICB9XG4gICAgLyoqXG4gICAgICogdXBkYXRlIHRoZSBsb2NhbGUgb3B0aW9uc1xuICAgICAqIEBwYXJhbSBsb2NhbGVcbiAgICAgKi9cbiAgICB1cGRhdGVMb2NhbGUobG9jYWxlKSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGxvY2FsZSkge1xuICAgICAgICAgIGlmIChsb2NhbGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgdGhpcy5sb2NhbGVba2V5XSA9IGxvY2FsZVtrZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiAgY2xlYXIgdGhlIGRhdGVyYW5nZSBwaWNrZXJcbiAgICAgKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5zdGFydERhdGUgPSBtb21lbnQoKS5zdGFydE9mKCdkYXknKTtcbiAgICAgICAgdGhpcy5lbmREYXRlID0gbW9tZW50KCkuZW5kT2YoJ2RheScpO1xuICAgICAgICB0aGlzLmNob29zZWREYXRlLmVtaXQoe2Nob3NlbkxhYmVsOiAnJywgc3RhcnREYXRlOiBudWxsLCBlbmREYXRlOiBudWxsfSk7XG4gICAgICAgIHRoaXMuZGF0ZXNVcGRhdGVkLmVtaXQoe3N0YXJ0RGF0ZTogbnVsbCwgZW5kRGF0ZTogbnVsbH0pO1xuICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIG91dCBpZiB0aGUgc2VsZWN0ZWQgcmFuZ2Ugc2hvdWxkIGJlIGRpc2FibGVkIGlmIGl0IGRvZXNuJ3RcbiAgICAgKiBmaXQgaW50byBtaW5EYXRlIGFuZCBtYXhEYXRlIGxpbWl0YXRpb25zLlxuICAgICAqL1xuICAgIGRpc2FibGVSYW5nZShyYW5nZSkge1xuICAgICAgaWYgKHJhbmdlID09PSB0aGlzLmxvY2FsZS5jdXN0b21SYW5nZUxhYmVsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJhbmdlTWFya2VycyA9IHRoaXMucmFuZ2VzW3JhbmdlXTtcbiAgICAgIGNvbnN0IGFyZUJvdGhCZWZvcmUgPSByYW5nZU1hcmtlcnMuZXZlcnkoIGRhdGUgPT4ge1xuICAgICAgICBpZiAoIXRoaXMubWluRGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRlLmlzQmVmb3JlKHRoaXMubWluRGF0ZSlcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBhcmVCb3RoQWZ0ZXIgPSByYW5nZU1hcmtlcnMuZXZlcnkoIGRhdGUgPT4ge1xuICAgICAgICBpZiAoIXRoaXMubWF4RGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRlLmlzQWZ0ZXIodGhpcy5tYXhEYXRlKVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gKGFyZUJvdGhCZWZvcmUgfHwgYXJlQm90aEFmdGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIGRhdGUgdGhlIGRhdGUgdG8gYWRkIHRpbWVcbiAgICAgKiBAcGFyYW0gc2lkZSBsZWZ0IG9yIHJpZ2h0XG4gICAgICovXG4gICAgcHJpdmF0ZSBfZ2V0RGF0ZVdpdGhUaW1lKGRhdGUsIHNpZGU6IFNpZGVFbnVtKTogX21vbWVudC5Nb21lbnQge1xuICAgICAgICBsZXQgaG91ciA9IHBhcnNlSW50KHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5zZWxlY3RlZEhvdXIsIDEwKTtcbiAgICAgICAgaWYgKCF0aGlzLnRpbWVQaWNrZXIyNEhvdXIpIHtcbiAgICAgICAgICAgIHZhciBhbXBtID0gdGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLmFtcG1Nb2RlbDtcbiAgICAgICAgICAgIGlmIChhbXBtID09PSAnUE0nICYmIGhvdXIgPCAxMilcbiAgICAgICAgICAgICAgICBob3VyICs9IDEyO1xuICAgICAgICAgICAgaWYgKGFtcG0gPT09ICdBTScgJiYgaG91ciA9PT0gMTIpXG4gICAgICAgICAgICAgICAgaG91ciA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1pbnV0ZSA9IHBhcnNlSW50KHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5zZWxlY3RlZE1pbnV0ZSwgMTApO1xuICAgICAgICB2YXIgc2Vjb25kID0gdGhpcy50aW1lUGlja2VyU2Vjb25kcyA/IHBhcnNlSW50KHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5zZWxlY3RlZFNlY29uZCwgMTApIDogMDtcbiAgICAgICAgcmV0dXJuIGRhdGUuY2xvbmUoKS5ob3VyKGhvdXIpLm1pbnV0ZShtaW51dGUpLnNlY29uZChzZWNvbmQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgYnVpbGQgdGhlIGxvY2FsZSBjb25maWdcbiAgICAgKi9cbiAgICBwcml2YXRlIF9idWlsZExvY2FsZSgpIHtcbiAgICAgICAgdGhpcy5sb2NhbGUgPSB7Li4udGhpcy5fbG9jYWxlU2VydmljZS5jb25maWcsIC4uLnRoaXMubG9jYWxlfTtcbiAgICAgICAgIGlmICghdGhpcy5sb2NhbGUuZm9ybWF0KSB7IFxuICAgICAgICAgICAgaWYgKHRoaXMudGltZVBpY2tlcikge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxlLmZvcm1hdCA9IG1vbWVudC5sb2NhbGVEYXRhKCkubG9uZ0RhdGVGb3JtYXQoJ2xsbCcpO1xuICAgICAgICAgICAgfSBlbHNlIHsgXG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbGUuZm9ybWF0ID0gbW9tZW50LmxvY2FsZURhdGEoKS5sb25nRGF0ZUZvcm1hdCgnTCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgX2J1aWxkQ2VsbHMoY2FsZW5kYXIsIHNpZGU6IFNpZGVFbnVtKSB7XG4gICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IDY7IHJvdysrKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGVuZGFyVmFyaWFibGVzW3NpZGVdLmNsYXNzZXNbcm93XSA9IHt9O1xuICAgICAgICAgICAgY29uc3Qgcm93Q2xhc3NlcyA9IFtdO1xuICAgICAgICAgICAgaWYodGhpcy5lbXB0eVdlZWtSb3dDbGFzcyAmJiAhdGhpcy5oYXNDdXJyZW50TW9udGhEYXlzKHRoaXMuY2FsZW5kYXJWYXJpYWJsZXNbc2lkZV0ubW9udGgsIGNhbGVuZGFyW3Jvd10pKSB7XG4gICAgICAgICAgICAgICAgcm93Q2xhc3Nlcy5wdXNoKHRoaXMuZW1wdHlXZWVrUm93Q2xhc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgNzsgY29sKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gW107XG4gICAgICAgICAgICAgICAgLy8gaGlnaGxpZ2h0IHRvZGF5J3MgZGF0ZVxuICAgICAgICAgICAgICAgIGlmIChjYWxlbmRhcltyb3ddW2NvbF0uaXNTYW1lKG5ldyBEYXRlKCksICdkYXknKSkge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2goJ3RvZGF5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGhpZ2hsaWdodCB3ZWVrZW5kc1xuICAgICAgICAgICAgICAgIGlmIChjYWxlbmRhcltyb3ddW2NvbF0uaXNvV2Vla2RheSgpID4gNSkge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2goJ3dlZWtlbmQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZ3JleSBvdXQgdGhlIGRhdGVzIGluIG90aGVyIG1vbnRocyBkaXNwbGF5ZWQgYXQgYmVnaW5uaW5nIGFuZCBlbmQgb2YgdGhpcyBjYWxlbmRhclxuICAgICAgICAgICAgICAgIGlmIChjYWxlbmRhcltyb3ddW2NvbF0ubW9udGgoKSAhPT0gY2FsZW5kYXJbMV1bMV0ubW9udGgoKSkge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2goJ29mZicpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIG1hcmsgdGhlIGxhc3QgZGF5IG9mIHRoZSBwcmV2aW91cyBtb250aCBpbiB0aGlzIGNhbGVuZGFyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMubGFzdERheU9mUHJldmlvdXNNb250aENsYXNzICYmIChjYWxlbmRhcltyb3ddW2NvbF0ubW9udGgoKSA8IGNhbGVuZGFyWzFdWzFdLm1vbnRoKCkgfHwgY2FsZW5kYXJbMV1bMV0ubW9udGgoKSA9PT0gMCkgJiYgY2FsZW5kYXJbcm93XVtjb2xdLmRhdGUoKSA9PT0gdGhpcy5jYWxlbmRhclZhcmlhYmxlc1tzaWRlXS5kYXlzSW5MYXN0TW9udGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaCh0aGlzLmxhc3REYXlPZlByZXZpb3VzTW9udGhDbGFzcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBtYXJrIHRoZSBmaXJzdCBkYXkgb2YgdGhlIG5leHQgbW9udGggaW4gdGhpcyBjYWxlbmRhclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmZpcnN0RGF5T2ZOZXh0TW9udGhDbGFzcyAmJiAoY2FsZW5kYXJbcm93XVtjb2xdLm1vbnRoKCkgPiBjYWxlbmRhclsxXVsxXS5tb250aCgpIHx8IGNhbGVuZGFyW3Jvd11bY29sXS5tb250aCgpID09PSAwKSAmJiBjYWxlbmRhcltyb3ddW2NvbF0uZGF0ZSgpID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2godGhpcy5maXJzdERheU9mTmV4dE1vbnRoQ2xhc3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIG1hcmsgdGhlIGZpcnN0IGRheSBvZiB0aGUgY3VycmVudCBtb250aCB3aXRoIGEgY3VzdG9tIGNsYXNzXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmlyc3RNb250aERheUNsYXNzICYmIGNhbGVuZGFyW3Jvd11bY29sXS5tb250aCgpID09PSBjYWxlbmRhclsxXVsxXS5tb250aCgpICYmIGNhbGVuZGFyW3Jvd11bY29sXS5kYXRlKCkgPT09IGNhbGVuZGFyLmZpcnN0RGF5LmRhdGUoKSkge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2godGhpcy5maXJzdE1vbnRoRGF5Q2xhc3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBtYXJrIHRoZSBsYXN0IGRheSBvZiB0aGUgY3VycmVudCBtb250aCB3aXRoIGEgY3VzdG9tIGNsYXNzXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFzdE1vbnRoRGF5Q2xhc3MgJiYgY2FsZW5kYXJbcm93XVtjb2xdLm1vbnRoKCkgPT09IGNhbGVuZGFyWzFdWzFdLm1vbnRoKCkgJiYgY2FsZW5kYXJbcm93XVtjb2xdLmRhdGUoKSA9PT0gY2FsZW5kYXIubGFzdERheS5kYXRlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKHRoaXMubGFzdE1vbnRoRGF5Q2xhc3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBkb24ndCBhbGxvdyBzZWxlY3Rpb24gb2YgZGF0ZXMgYmVmb3JlIHRoZSBtaW5pbXVtIGRhdGVcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5taW5EYXRlICYmIGNhbGVuZGFyW3Jvd11bY29sXS5pc0JlZm9yZSh0aGlzLm1pbkRhdGUsICdkYXknKSkge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2goJ29mZicsICdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBkb24ndCBhbGxvdyBzZWxlY3Rpb24gb2YgZGF0ZXMgYWZ0ZXIgdGhlIG1heGltdW0gZGF0ZVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNhbGVuZGFyVmFyaWFibGVzW3NpZGVdLm1heERhdGUgJiYgY2FsZW5kYXJbcm93XVtjb2xdLmlzQWZ0ZXIodGhpcy5jYWxlbmRhclZhcmlhYmxlc1tzaWRlXS5tYXhEYXRlLCAnZGF5JykpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCdvZmYnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZG9uJ3QgYWxsb3cgc2VsZWN0aW9uIG9mIGRhdGUgaWYgYSBjdXN0b20gZnVuY3Rpb24gZGVjaWRlcyBpdCdzIGludmFsaWRcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0ludmFsaWREYXRlKGNhbGVuZGFyW3Jvd11bY29sXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCdvZmYnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gaGlnaGxpZ2h0IHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgc3RhcnQgZGF0ZVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXJ0RGF0ZSAmJiBjYWxlbmRhcltyb3ddW2NvbF0uZm9ybWF0KCdZWVlZLU1NLUREJykgPT09IHRoaXMuc3RhcnREYXRlLmZvcm1hdCgnWVlZWS1NTS1ERCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaCgnYWN0aXZlJywgJ3N0YXJ0LWRhdGUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gaGlnaGxpZ2h0IHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZW5kIGRhdGVcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lbmREYXRlICE9IG51bGwgJiYgY2FsZW5kYXJbcm93XVtjb2xdLmZvcm1hdCgnWVlZWS1NTS1ERCcpID09PSB0aGlzLmVuZERhdGUuZm9ybWF0KCdZWVlZLU1NLUREJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCdhY3RpdmUnLCAnZW5kLWRhdGUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gaGlnaGxpZ2h0IGRhdGVzIGluLWJldHdlZW4gdGhlIHNlbGVjdGVkIGRhdGVzXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZW5kRGF0ZSAhPSBudWxsICYmIGNhbGVuZGFyW3Jvd11bY29sXSA+IHRoaXMuc3RhcnREYXRlICYmIGNhbGVuZGFyW3Jvd11bY29sXSA8IHRoaXMuZW5kRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2goJ2luLXJhbmdlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGFwcGx5IGN1c3RvbSBjbGFzc2VzIGZvciB0aGlzIGRhdGVcbiAgICAgICAgICAgICAgICBjb25zdCBpc0N1c3RvbSA9IHRoaXMuaXNDdXN0b21EYXRlKGNhbGVuZGFyW3Jvd11bY29sXSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzQ3VzdG9tICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlzQ3VzdG9tID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKGlzQ3VzdG9tKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGNsYXNzZXMsIGlzQ3VzdG9tKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBzdG9yZSBjbGFzc2VzIHZhclxuICAgICAgICAgICAgICAgIGxldCBjbmFtZSA9ICcnLCBkaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjbmFtZSArPSBjbGFzc2VzW2ldICsgJyAnO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2xhc3Nlc1tpXSA9PT0gJ2Rpc2FibGVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY25hbWUgKz0gJ2F2YWlsYWJsZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY2FsZW5kYXJWYXJpYWJsZXNbc2lkZV0uY2xhc3Nlc1tyb3ddW2NvbF0gPSBjbmFtZS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNhbGVuZGFyVmFyaWFibGVzW3NpZGVdLmNsYXNzZXNbcm93XS5jbGFzc0xpc3QgPSByb3dDbGFzc2VzLmpvaW4oJyAnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbmQgb3V0IGlmIHRoZSBjdXJyZW50IGNhbGVuZGFyIHJvdyBoYXMgY3VycmVudCBtb250aCBkYXlzXG4gICAgICogKGFzIG9wcG9zZWQgdG8gY29uc2lzdGluZyBvZiBvbmx5IHByZXZpb3VzL25leHQgbW9udGggZGF5cylcbiAgICAgKi9cbiAgICBoYXNDdXJyZW50TW9udGhEYXlzKGN1cnJlbnRNb250aCwgcm93KSB7XG4gICAgICAgIGZvciAobGV0IGRheSA9IDA7IGRheSA8IDc7IGRheSsrKSB7XG4gICAgICAgICAgICBpZihyb3dbZGF5XS5tb250aCgpID09PSBjdXJyZW50TW9udGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIl19