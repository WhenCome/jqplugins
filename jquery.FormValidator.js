/**
 * Form Validator.
 * 
 * @author Eric Tao
 * @time 2015-08-06
 * @usage:
 * 1. use default tip type
 * $('#queryForm').FormValidator({
 *      rules : {
 *          uid : ['integer',{'gt':0}],
 *          name : ['required']
 *      },
 *      tipShowTime : 5
 *  });
 *  2. use your custom tip method
 *  $('#queryForm').FormValidator({
 *      rules : {
 *          uid : ['integer',{'gt':0}],
 *          name : ['required']
 *      },
 *      tipShowTime : 5
 *  }, function(elementId, errorMessage) {
 *     alert(errorMessage);
 * });
*/
;(function($) {
    $.fn.FormValidator = function(options, validateFailedFunc){
        if (this.size() != 1 || this.get(0).tagName.toLowerCase() != 'form') {
            return false;
        }
        // show time
        var tipShowTime = 3; 
        if (options.tipShowTime != null && typeof(options.tipShowTime) == 'number') {
            tipShowTime = parseInt(options.tipShowTime);
            if (tipShowTime <= 0) {
                tipShowTime = 3;
            }
        }
        // intercept the default form actions
        var oldSubmitFunc = this.attr('onsubmit');
        this.attr('onsubmit', '');
        this.bind('submit', function(){
            // add form validation
            if (options.rules != null) {
                if (!validateFormElements(this, options.rules) ) {
                    return false;
                }
            }
            // execute the old submit logic
            if (oldSubmitFunc) {
                return eval(oldSubmitFunc);
            }
        });

        // validate form elements
        function validateFormElements (form, rules) {
            if (rules == null) {
                return true;
            }
            for (var elementId in rules) {
                // use customized validations（elementId should be "__custom__", and rule must bu a function, no validation rules）
                if (elementId == '__custom__') {
                    if (typeof(rules[elementId]) == 'function') {
                        return rules[elementId].apply(this);
                    } else {
                        return true;
                    }
                } else {
                    // validate form elements use predefined rules, you can extend them
                    var result = validateElementRules(elementId, rules[elementId]);
                    if (!result) {
                        return false;
                    }
                }
            }
            return true;
        }

        // show failed message, if validateFailedFunc is not provided or is not a function, use the predefined way
        function showValidateFailTip(elementId, errorMessage) {
            if (typeof(validateFailedFunc) == 'function') {
                validateFailedFunc.call(this, elementId, errorMessage);
            } else {
                $.FormValidator.showError(elementId, errorMessage, tipShowTime);
            }
            return false;
        }

        // validation rules
        function validateElementRules(elementId, rules) {
            var length = rules.length;
            if (length == 0) {
                return true;
            }
            for (var i = 0; i < length; i++) {
                if (!validateRule(elementId, rules[i], '')) {
                    return false;
                }
            }
            return true;
        }
        function validateRule(elementId, rule, value) {
            if (typeof(rule) == 'object') {
                for (var ruleName in rule) {
                    return validateRule(elementId, ruleName, rule[ruleName]);
                }
            } else {
                switch (rule) {
                    case 'integer':
                        return validateInteger(elementId);
                    case 'gt':
                        return validateGreaterThan(elementId, value);
                    case 'ge':
                        return validateGreaterEqual(elementId, value);
                    case 'lt':
                        return validateLessThan(elementId, value);
                    case 'le':
                        return validateLessEqual(elementId, value);
                    case 'required':
                        return validateRequired(elementId);
                }
            }
        }
        // check whether the element's value is an integer
        function validateInteger(elementId){
            var val = $.trim($('#'+elementId).val());
            if (val == '') {
                return true;
            }
            if (!/^\-?(0|[1-9]\d*)$/.test(val)){
                showValidateFailTip(elementId, 'Invalid value, an integer wanted!');
                return false;
            }
            return true;
        }

        function validateGreaterThan(elementId, value){
            var val = $('#'+elementId).val();
            if (val == '') {
                return true;
            }
            if (val <= value) {
                showValidateFailTip(elementId, 'The value must greater than '+value+'!');
                return false;
            }
            return true;
        }
 
        function validateGreaterEqual(elementId, value) {
            var val = $('#'+elementId).val();
            if (val == '') {
                return true;
            }
            if (val < value) {
                showValidateFailTip(elementId, 'The value must greater than or equals to '+value+'!');
                return false;
            }
            return true;
        }

        function validateLessThan(elementId, value){
            var val = $('#'+elementId).val();
            if (val == '') {
                return true;
            }
            if (val >= value) {
                showValidateFailTip(elementId, 'The value must less than '+value+'!');
                return false;
            }
            return true
        }

        function validateLessEqual(elementId, value){
            var val = $('#'+elementId).val();
            if (val == '') {
                return true;
            }
            if (val > value) {
                showValidateFailTip(elementId, 'The value must less than or equals to '+value+'!');
                return false;
            }
            return true
        }

        function validateRequired(elementId){
            var val = $.trim($('#'+elementId).val());
            if (val == '') {
                showValidateFailTip(elementId, 'The value should not be empty!');
                return false;
            }
            return true;
        }

    };
    // Tip plugins
    $.extend({FormValidator:{
        timer : 0,
        showError: function(elementId, errorMessage, tipShowTime) {
            $('#'+elementId).focus().css({
                'border' : '1px solid #ff0000',
                'color' : '#ff0000'
            });
            $.FormValidator.locateAndShowElementError(elementId, errorMessage, tipShowTime);
        },
        // locate and show error messages
        locateAndShowElementError : function(elementId, errorMessage, tipShowTime) {
            if ($('#JM_F_V_BOX').size() == 0) {
                var html = '<div id="JM_F_V_BOX" style="border: 1px solid #ff0000; background-color: rgb(246,244,233); color: #ff0000; padding: 3px; line-height: 20px; display: none;"></div>';
                $('body').append(html);
            }
            // clear the timer
            clearTimeout($.FormValidator.timer);
            if (!tipShowTime) {
                tipShowTime = 3;
            }
            // build the tip box
            var box = $('#JM_F_V_BOX');
            var target = $('#'+elementId);
            box.html(errorMessage);
            // calculate positions
            var top = target.offset().top - box.height() - 9;
            var left = target.offset().left;
            box.css({
                'position' : 'absolute',
                'display' : 'inline-table',
                'top' : top+'px',
                'left' : left+'px',
                'z-index' : 999999
            });
            box.fadeIn();
            $.FormValidator.timer = setTimeout(function(){
                box.fadeOut();
            }, tipShowTime * 1000);
        }
    }});
})(jQuery);