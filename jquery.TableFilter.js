/**
 * HTML Table Filter Plugin.
 * Use Tips:
 * 1) Just apply to simple tables, which the first row is the heads(<th>);
 * 2) Only used to do frontend table filters, which means this plugin do not have interact with the backend server;
 * 3) All filters based on the data you saw, and the data be filtered will not be removed, just be hidden;
 * 4) All actions to the filtered result should make sure that the hidden data won't be affected.
 * 
 * @author Eric Tao
 * @usage
 * $('#table').TableFilter({
 *     'head_cell_tag': 'th', // if you use <td> as the head row, change 'th' to 'td'
 * });
 */
;(function($){
    $.fn.TableFilter = function(options) {
        // just support one table each time
        if (this.size() != 1) {
            return false;
        }
        var filterContainerId = 'TableFilter_container';
        var filterFormId = 'TableFilter_form';
        var headCellTag = 'th';
        if (this.find('tr').size() == 0) {
            return false;
        }
        if (options && options.head_cell_tag && options.head_cell_tag == 'td') {
            headCellTag = 'td';
        }
        _buildFilterTables(this);
        
        
        // get table heads and row|column index
        function _getHeads(tblObj) {
            var heads = {};
            var idx = 0;
            tblObj.find('tr:first '+headCellTag).each(function(){
                var _headText = $.trim($(this).text());
                if (_headText) {
                    heads[_headText] = idx;
                }
                idx++;
            });
            return heads;
        }
        // build filter tables
        function _buildFilterTables(tblObj) {
            if ($('#'+filterContainerId).size() > 0) {
                _showMasks();
                return true;
            }
            var heads = _getHeads(tblObj);
            var options = ['All','=','>','>=','<','<=','Include'];
            var containerHtml = '<div id="'+filterContainerId+'" style="display: none; position: fixed; display: block; width: 600px; border: 1px solid silver; padding: 10px; border-radius: 5px ! important; background-color: rgb(250, 250, 250); z-index: 9999; font-size: 120%;">'
                + '<div class="title">'
                + '<h3 style="height: 40px; line-height: 40px; margin: 0px; padding: 0px;">Table Filter</h3>'
                + '</div>'
                + '<div class="wrapper">'
                + '<p>'
                + '<select id="TableFilter_form_head" style="height: 30px; margin-right: 10px;"></select>'
                + '<select id="TableFilter_form_opt" style="height: 30px; margin-right: 10px;"></select>'
                + '<input type="text" id="TableFilter_form_input"  style="height: 30px;"/>'
                + '</p>'
                + '<p style="text-align: right; padding: 0px 20px;">'
                + '<button id="TableFilter_form_btn_close">Close</button>&nbsp;&nbsp;&nbsp;&nbsp;'
                + '<button id="TableFilter_form_btn_filter">Filter</button>'
                + '</p>'
                + '</div>'
                + '</div>';
            $('body').append(containerHtml);
            for (var head in heads) {
                $('#TableFilter_form_head').append('<option value="'+head+'" idx="'+heads[head]+'">'+head+'</option>');
            }
            for (var idx in options) {
                $('#TableFilter_form_opt').append('<option value="'+options[idx]+'">'+options[idx]+'</option>');
            }
            // register events
            $('#TableFilter_form_btn_close').click(function(){
                $('#'+filterContainerId).fadeOut(function(){
                    _hideMasks();
                });
            });
            $('#TableFilter_form_btn_filter').click(function(){
                var option = $('#TableFilter_form_opt').val();
                var head = $('#TableFilter_form_head').val();
                var headIdx = $('#TableFilter_form_head option:selected').attr('idx');
                var input = $.trim($('#TableFilter_form_input').val());
                var trIndex = 0;
                tblObj.find('tr').each(function(){
                    if(trIndex++ == 0) {
                        return;
                    }
                    var tds = $(this).find('td');
                    var tdIdx = 0;
                    var cellValue = '';
                    $(this).find('td').each(function(){
                        if ($(this).index() == headIdx) {
                            cellValue = $.trim($(this).text());
                        }
                    });
                    if (_isDisplayable(cellValue, headIdx, option, input)) {
                        $(this).fadeIn();
                    } else {
                        $(this).fadeOut();
                    }
                });
            });
            // show filters
            _showMasks();
            _adjustPos();
            $(window).resize(function(){
                _adjustPos();
            });
        }
        // check whether a row|column should show or hidden
        function _isDisplayable(cellValue, idx, option, filterValue){
            function _checkOp(op, firstVal, secondVal) {
                switch (op) {
                    case '==':
                        if (/^\d+(\.\d+)?$/.test(firstVal) && /^\d+(\.\d+)?$/.test(secondVal)) {
                            return eval(firstVal + ' ' + op + ' ' + secondVal);
                        }
                        return firstVal == secondVal;
                    case '>':
                    case '>=':
                    case '<':
                    case '<=':
                        if (!/^\d+(\.\d+)?$/.test(firstVal) || !/^\d+(\.\d+)?$/.test(secondVal)) {
                            return false;
                        }
                        return eval(firstVal + ' ' + op + ' ' + secondVal);
                }
            }
            
            var isDisplayable = true;
            switch (option) {
                case 'All':
                    isDisplayable = true;
                    break;
                case '=':
                    isDisplayable = _checkOp('==', cellValue, filterValue);
                    break;
                case '>':
                    isDisplayable = _checkOp('>', cellValue, filterValue);
                    break;
                case '>=':
                    isDisplayable = _checkOp('>=', cellValue, filterValue);
                    break;
                case '<':
                    isDisplayable = _checkOp('<', cellValue, filterValue);
                    break;
                case '<=':
                    isDisplayable = _checkOp('<=', cellValue, filterValue);
                    break;
                case 'Include':
                    isDisplayable = cellValue.indexOf(filterValue) >= 0;
                    break;
            }
            return isDisplayable;
        }
        // show mask layer
        function _showMasks(func) {
            if($('#TableFilter_mask').size() <= 0) {
                $('body').append('<div id="TableFilter_mask" '
                    + 'style="position: absolute; left: 0px; top: 0px; right: 0px; height:'+$(document).height()+'px;'
                    + ' z-index: 9900; filter: Alpha(opacity=50); opacity: 0.5; background-color: #333;"></div>');
            }
            $('#TableFilter_mask').fadeIn(function(){
                if ($('#'+filterContainerId).size() > 0) {
                    $('#'+filterContainerId).fadeIn();
                }
            });
        }
        // hide mask layer
        function _hideMasks() {
            if($('#TableFilter_mask').size() > 0) {
                $('#TableFilter_mask').hide();
            }
        }
        function _adjustPos(){
            if ($('#'+filterContainerId).size() <= 0) {
                return false;
            }
            var winHeight = $(window).height();
            var winWidth = $(window).width();
            var boxWidth = $('#'+filterContainerId).width();
            var boxHeight = $('#'+filterContainerId).height();
            var left = (winWidth - boxWidth) / 2;
            var top = (winHeight - boxHeight) / 2;
            if (top > 200) {
                top = 200;
            }
            top = $(document).scrollTop() + top;
            $('#'+filterContainerId).css({
                'left' : left+'px',
                'top' : '150px'
            });
        };
    }
})(jQuery);
