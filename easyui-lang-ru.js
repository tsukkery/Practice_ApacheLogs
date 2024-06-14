function myformatter(p_date){
        var y = p_date.getFullYear();
        var m = p_date.getMonth()+1;
        var d = p_date.getDate();
        return (d<10?('0'+d):d) + '.' + (m<10?('0'+m):m) + '.' + y;
}		
function myparser(s){
        if (!s) return new Date();
        var ss = (s.split('.'));
        var d = parseInt(ss[0],10);
        var m = parseInt(ss[1],10);
        var y = parseInt(ss[2],10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)){
            return new Date(y,m-1,d);
        } else {
            return new Date();
        }
}
Number.prototype.format = function(n, x, s, c) {
    if (this) {
	var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
	num = this.toFixed(Math.max(0, ~~n));
	return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    }
    else return '';
};
Date.prototype.addDays = function (pDays) {
    var mDate = new Date(this.valueOf());
    mDate.setDate(mDate.getDate() + pDays);
    return mDate;
};
Date.prototype.startOfWeek = function (pStartOfWeek) {
    var mDifference = this.getDay() - pStartOfWeek;

    if (mDifference < 0) {
        mDifference += 7;
    }

    return new Date(this.addDays(mDifference * -1));
}
if ($.fn.pagination){
	$.fn.pagination.defaults.beforePageText = 'Страница';
	$.fn.pagination.defaults.afterPageText = 'из {pages}';
	$.fn.pagination.defaults.displayMsg = 'Просмотр {from} до {to} из {total} записей';
}
if ($.fn.datagrid){
	$.fn.datagrid.defaults.loadMsg = 'Обрабатывается, пожалуйста ждите ...';
}
if ($.fn.treegrid && $.fn.datagrid){
	$.fn.treegrid.defaults.loadMsg = $.fn.datagrid.defaults.loadMsg;
}
if ($.messager){
	$.messager.defaults.ok = 'Ок';
	$.messager.defaults.cancel = 'Закрыть';
}
$.map(['validatebox','textbox','passwordbox','filebox','searchbox',
		'combo','combobox','combogrid','combotree',
		'datebox','datetimebox','numberbox',
		'spinner','numberspinner','timespinner','datetimespinner'], function(plugin){
	if ($.fn[plugin]){
		$.fn[plugin].defaults.missingMessage = 'Это поле необходимо.';
	}
});
if ($.fn.validatebox){
	$.fn.validatebox.defaults.rules.email.message = 'Пожалуйста введите корректный e-mail адрес.';
	$.fn.validatebox.defaults.rules.url.message = 'Пожалуйста введите корректный URL.';
	$.fn.validatebox.defaults.rules.length.message = 'Пожалуйста введите зачение между {0} и {1}.';
	$.fn.validatebox.defaults.rules.remote.message = 'Пожалуйста исправте это поле.';
}
if ($.fn.calendar){
	$.fn.calendar.defaults.firstDay = 1;
	$.fn.calendar.defaults.weeks  = ['В','П','В','С','Ч','П','С'];
	$.fn.calendar.defaults.months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
}
if ($.fn.datebox){
	$.fn.datebox.defaults.currentText = 'Сегодня';
	$.fn.datebox.defaults.closeText = 'Закрыть';
	$.fn.datebox.defaults.okText    = 'Ок';
	$.fn.datebox.defaults.formatter = myformatter;
       	$.fn.datebox.defaults.parser    = myparser;
}
if ($.fn.datetimebox && $.fn.datebox){
	$.extend($.fn.datetimebox.defaults,{
		currentText: $.fn.datebox.defaults.currentText,
		closeText: $.fn.datebox.defaults.closeText,
		okText: $.fn.datebox.defaults.okText
	});
}
if ($.fn.numberbox){
	$.fn.numberbox.defaults.precision = 2;
	$.fn.numberbox.defaults.groupSeparator = ' ';
}
/*
	var buttons = $.extend([], $.fn.datebox.defaults.buttons);
	buttons.splice(1, 0, {
		text: 'Clear',
		handler: function(target){
			$(target).datebox('clear');
		}
	});
*/        
