

window.dict = {};
dict.getSelectionText = function () {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
};




$(document).ready(function () {

    window.dict.url=$("#dictInput").attr('data-url');

    if ($('#dictPopupBlock').length === 0) {
        window.dict.dictPopupBlock = $('<div/>', {id: 'dictPopupBlock', class: 'dict-popup'}).appendTo('body').hide();//''appendTo('#taskContainer');
        //var lnk = $('<a>', {href: "javascript:void(0)", class: 'dict-delete-link'}).html('<span class="glyphicon glyphicon-remove"></span>').click(function () {
        //    window.dict.dictPopupBlock.hide();
        //});
        //window.dict.dictPopupBlock.append(lnk);
        
        window.dict.dictPopupContent=$('<div/>',{class:"dict-popup-block"});
        window.dict.dictPopupBlock.append(window.dict.dictPopupContent);//.append(lnk);
    }

    var dictDrawReply = function(rows){
        if(rows.length===0){
            return "<div class=\"variant\">Nothing found</div><br>";
        }
        var html='';
        for(var i=0; i<rows.length; i++){
            html+="<div class=\"variant\">"+rows[i].tranc.replace(/\n/g,"<br>")+"</div><br>";
        }
        return html;
    };

    var dictQuery = function () {
        $.ajax({
            url: window.dict.url,
            method: "GET",
            dataType:'json',
            data:{'word':$('#dictInput').val()}
        }).done(function (reply) {
            // console.log(reply);
            window.dict.dictPopupContent.html(dictDrawReply(reply.rows));
        });
    };

    var dictStartSearch = function () {
        var dict = $('#dictInput');
        var offset = dict.offset();
        var h = dict.height();
        $('#dictPopupBlock').css({left: offset.left + 'px', top: (offset.top + h + 10) + 'px'}).show();
        dictQuery();
    };
    
    var dictOnKeyup = function () {
        if (window.dictKeyupTimeout) {
            clearTimeout(window.dictKeyupTimeout);
        }
        window.dictKeyupTimeout = setTimeout(dictStartSearch, 1000);
    };

    $('#dictInput').keyup(dictOnKeyup);

    var dictOnMouseSelection = function (e) {
        try {
            s = window.getSelection();
            var range = s.getRangeAt(0);
            var node = s.anchorNode;
            while (range.toString().indexOf(' ') != 0) {
                range.setStart(node, (range.startOffset - 1));
            }
            range.setStart(node, range.startOffset + 1);
            do {
                range.setEnd(node, range.endOffset + 1);
            } while (range.toString().indexOf(' ') == -1 && range.toString().trim() != '');
            var str = range.toString().trim();
            // alert(str);
            document.getElementById('dictInput').value = str;
            // console.log(e);

            window.dict.dictPopupBlock.css({left: e.pageX + 'px', top: (e.pageY + 20) + 'px'}).show();

            dictStartSearch();

        } catch (err) {

        }
    };
    
    $(".textContainer").dblclick(dictOnMouseSelection).mouseup(dictOnMouseSelection);


    $(window).click(function(ev){
        var tgr=$(ev.target);
        // console.log(ev);
        if(tgr.attr('id')=='dictPopupBlock'){
            return;
        }
        if(tgr.parents('#dictPopupBlock').length>0){
            return;
        }
        window.dict.dictPopupBlock.hide();
    });
});
